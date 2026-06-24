/**
 * Review Environment Insight
 *
 * Filters reviews from similar-skin-profile users that mention weather,
 * environment, texture, feel, or wear patterns, then generates a short
 * rule-based summary. Used by the Learn More popup's unified
 * "What people like you noticed" section.
 */

import type { ScoredReviewEntry } from './environmentFit';
import type { ConditionKey } from '../environment/productKnowledge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FilterCategory = 'all' | 'climate' | 'feel' | 'wear_behavior';

/** Display labels for each filter category. */
export const FILTER_LABELS: Record<FilterCategory, string> = {
  all: 'All',
  climate: 'Climate fit',
  feel: 'How it feels',
  wear_behavior: 'How it wears',
};

export interface ReviewEnvironmentInsight {
  summary: string;
  matchCount: number;
  avgRating: number;
  topKeywords: string[];
  matchedReviews: ScoredReviewEntry[];
  /** True when the result is a soft fallback from the "all" pool. */
  isFallback?: boolean;
}

export interface FilterChipCounts {
  all: number;
  climate: number;
  feel: number;
  wear_behavior: number;
}

// ---------------------------------------------------------------------------
// Keyword sets (exported for chip derivation)
// ---------------------------------------------------------------------------

export const WEATHER_KEYWORDS = [
  'cold', 'hot', 'humid', 'humidity', 'dry air', 'wind', 'windy',
  'winter', 'summer', 'spring', 'fall', 'autumn',
  'weather', 'uv', 'sun', 'heat', 'temperature', 'climate',
  'freezing', 'warm', 'rainy', 'snow',
] as const;

export const TEXTURE_KEYWORDS = [
  'lightweight', 'heavy', 'greasy', 'matte', 'dewy',
  'thick', 'rich', 'silky', 'smooth', 'sticky',
  'watery', 'gel', 'creamy', 'oily', 'moisturizing',
  'thin', 'light', 'velvety', 'buttery',
] as const;

export const WEAR_KEYWORDS = [
  'absorbs', 'absorbed', 'pills', 'pilling',
  'sits well', 'under makeup', 'makeup',
  'wears', 'lasts', 'fades', 'dries down', 'dried down',
  'sinks in', 'sank in', 'layers', 'settles',
  'residue', 'tacky', 'finish',
] as const;

/** Map category to its keyword set. */
const CATEGORY_KEYWORDS: Record<Exclude<FilterCategory, 'all'>, readonly string[]> = {
  climate: WEATHER_KEYWORDS,
  feel: TEXTURE_KEYWORDS,
  wear_behavior: WEAR_KEYWORDS,
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Count how many keywords from a set appear in lowercased text. */
function countKeywordHits(text: string, keywords: readonly string[]): number {
  let count = 0;
  for (const kw of keywords) {
    if (text.includes(kw)) count++;
  }
  return count;
}

/** Find which keywords actually matched in the text. */
function findMatchedKeywords(text: string, keywords: readonly string[]): string[] {
  return keywords.filter(kw => text.includes(kw));
}

/** Get similar-profile reviews (full, strong, or partial tier). */
function getSimilarReviews(reviews: ScoredReviewEntry[]): ScoredReviewEntry[] {
  return reviews.filter(
    r => r.matchTier === 'full' || r.matchTier === 'strong' || r.matchTier === 'partial',
  );
}

/** Check if a review's content matches any keyword in the given sets. */
function reviewMatchesKeywords(text: string, keywordSets: readonly string[][]): boolean {
  return keywordSets.some(set => countKeywordHits(text, set) > 0);
}

// ---------------------------------------------------------------------------
// Filter chip counts
// ---------------------------------------------------------------------------

/**
 * Returns how many similar-profile reviews mention keywords in each category.
 * Used to populate chip badge counts.
 */
export function getFilterChipCounts(reviews: ScoredReviewEntry[]): FilterChipCounts {
  const similar = getSimilarReviews(reviews);

  let climate = 0;
  let feel = 0;
  let wear_behavior = 0;
  let all = 0;

  for (const r of similar) {
    const text = r.review.content.toLowerCase();
    const hasClimate = countKeywordHits(text, WEATHER_KEYWORDS) > 0;
    const hasFeel = countKeywordHits(text, TEXTURE_KEYWORDS) > 0;
    const hasWear = countKeywordHits(text, WEAR_KEYWORDS) > 0;
    if (hasClimate) climate++;
    if (hasFeel) feel++;
    if (hasWear) wear_behavior++;
    if (hasClimate || hasFeel || hasWear) all++;
  }

  return { all, climate, feel, wear_behavior };
}

// ---------------------------------------------------------------------------
// Smart default filter
// ---------------------------------------------------------------------------

/**
 * Returns the most relevant default filter based on environment conditions.
 * Hot/humid → feel (texture reviews most relevant).
 * Cold/dry → climate (weather-aware reviews most relevant).
 * Otherwise → all.
 */
export function getSmartDefaultFilter(conditions: ConditionKey[]): FilterCategory {
  if (conditions.includes('hot') || conditions.includes('humid')) return 'feel';
  if (conditions.includes('cold') || conditions.includes('dry_air')) return 'climate';
  return 'all';
}

// ---------------------------------------------------------------------------
// Preference boost
// ---------------------------------------------------------------------------

/**
 * Parses free-text user preference and returns bonus relevance points
 * for a review based on how many preference keywords match.
 */
function computePreferenceBoost(reviewText: string, preferenceText: string): number {
  if (!preferenceText) return 0;
  const prefLower = preferenceText.toLowerCase();
  // Extract meaningful words (3+ chars) from the preference
  const prefWords = prefLower.split(/\s+/).filter(w => w.length >= 3);
  let boost = 0;
  for (const word of prefWords) {
    if (reviewText.includes(word)) boost += 8;
  }
  // Also check against all keyword sets for broader matching
  for (const set of [WEATHER_KEYWORDS, TEXTURE_KEYWORDS, WEAR_KEYWORDS]) {
    for (const kw of set) {
      if (prefLower.includes(kw) && reviewText.includes(kw)) boost += 5;
    }
  }
  return boost;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Generates a short, rule-based summary of what similar-profile reviewers
 * noticed about the product in relation to weather, texture, or wear.
 *
 * When `activeFilter` is set to a specific category, only that category's
 * keywords are used for filtering. When `'all'` (default), all categories apply.
 *
 * When a specific filter returns no results, falls back to "all" results
 * with a `isFallback: true` flag so the UI can show softer messaging.
 *
 * `preferenceText` (optional) boosts reviews matching the user's expressed
 * preference from the warm-prompt input.
 *
 * Returns `null` when no qualifying reviews exist (even with fallback).
 */
export function generateReviewEnvironmentInsight(
  reviews: ScoredReviewEntry[],
  season?: string | null,
  userSkinType?: string,
  activeFilter: FilterCategory = 'all',
  preferenceText?: string,
): ReviewEnvironmentInsight | null {
  // Step 1: Filter by similarity tier (full, strong, or partial — score >= 30)
  const similarReviews = getSimilarReviews(reviews);
  if (similarReviews.length === 0) return null;

  // Determine which keyword sets to use
  const keywordSets: readonly string[][] =
    activeFilter === 'all'
      ? [[...WEATHER_KEYWORDS], [...TEXTURE_KEYWORDS], [...WEAR_KEYWORDS]]
      : [[...CATEGORY_KEYWORDS[activeFilter]]];

  // Step 2: Filter by content keywords (at least 1 match from active sets)
  const qualifying: { entry: ScoredReviewEntry; relevance: number; keywords: string[] }[] = [];
  const prefTrimmed = (preferenceText || '').trim();

  for (const entry of similarReviews) {
    const text = entry.review.content.toLowerCase();
    let totalHits = 0;
    const matched: string[] = [];

    for (const set of keywordSets) {
      const hits = countKeywordHits(text, set);
      totalHits += hits;
      if (hits > 0) matched.push(...findMatchedKeywords(text, set));
    }

    if (totalHits > 0) {
      const prefBoost = computePreferenceBoost(text, prefTrimmed);
      qualifying.push({
        entry,
        relevance: entry.score + totalHits * 5 + prefBoost,
        keywords: matched,
      });
    }
  }

  // Fallback: if a specific filter returned nothing, re-run with "all"
  if (qualifying.length === 0 && activeFilter !== 'all') {
    const fallbackResult = generateReviewEnvironmentInsight(
      reviews, season, userSkinType, 'all', preferenceText,
    );
    if (fallbackResult) {
      return { ...fallbackResult, isFallback: true };
    }
    return null;
  }

  if (qualifying.length === 0) return null;

  // Step 3: Rank by relevance, take top 5
  qualifying.sort((a, b) => b.relevance - a.relevance);
  const top = qualifying.slice(0, 5);

  // Step 4: Compute aggregate stats
  const matchCount = top.length;
  const avgRating = top.reduce((sum, q) => sum + q.entry.review.rating, 0) / matchCount;

  // Collect top keywords by frequency
  const keywordFreq: Record<string, number> = {};
  for (const q of top) {
    for (const kw of q.keywords) {
      keywordFreq[kw] = (keywordFreq[kw] || 0) + 1;
    }
  }
  const topKeywords = Object.entries(keywordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([kw]) => kw);

  // Detect which categories were mentioned in the top results
  const allText = top.map(q => q.entry.review.content.toLowerCase()).join(' ');
  const hasWeather = WEATHER_KEYWORDS.some(kw => allText.includes(kw));
  const hasTexture = TEXTURE_KEYWORDS.some(kw => allText.includes(kw));
  const hasWear = WEAR_KEYWORDS.some(kw => allText.includes(kw));

  // Step 5: Build summary sentences
  const sentences: string[] = [];

  // Sentence 1: Count + context
  const skinLabel = userSkinType ? `${userSkinType} skin` : 'a similar skin profile';
  const conditionLabel = season || 'similar conditions';
  sentences.push(
    matchCount === 1
      ? `One person with ${skinLabel} shared their experience in ${conditionLabel}.`
      : `${matchCount} people with ${skinLabel} shared their experiences in ${conditionLabel}.`,
  );

  // Sentence 2: Sentiment
  if (avgRating >= 4.0) {
    sentences.push('They generally had a positive experience with this product.');
  } else if (avgRating >= 3.0) {
    sentences.push('Their experiences were mixed but leaned positive overall.');
  } else {
    sentences.push('Their experiences were mixed, with some noting areas for improvement.');
  }

  // Sentence 3: Texture/feel insight (if relevant)
  if (hasTexture) {
    const textureMatches = findMatchedKeywords(allText, TEXTURE_KEYWORDS);
    if (textureMatches.length > 0) {
      const topTexture = textureMatches[0];
      sentences.push(`Several noted the product feels ${topTexture} on their skin.`);
    }
  }

  // Sentence 4: Wear/behavior insight (if relevant, and only if we haven't hit 4 yet)
  if (hasWear && sentences.length < 4) {
    const wearMatches = findMatchedKeywords(allText, WEAR_KEYWORDS);
    if (wearMatches.length > 0) {
      const topWear = wearMatches[0];
      if (['absorbs', 'absorbed', 'sinks in', 'sank in'].includes(topWear)) {
        sentences.push('Users mentioned it absorbs well into the skin.');
      } else if (['under makeup', 'makeup'].includes(topWear)) {
        sentences.push('Users mentioned it works well under makeup.');
      } else if (['lasts', 'wears'].includes(topWear)) {
        sentences.push('Users mentioned the effects last throughout the day.');
      }
    }
  }

  // Weather context (if no texture or wear, add a weather note)
  if (!hasTexture && !hasWear && hasWeather && sentences.length < 4) {
    sentences.push(`They specifically mentioned how the product performs in ${conditionLabel} weather.`);
  }

  return {
    summary: sentences.slice(0, 4).join(' '),
    matchCount,
    avgRating: Math.round(avgRating * 10) / 10,
    topKeywords,
    matchedReviews: top.map(q => q.entry),
  };
}
