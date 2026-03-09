/**
 * highlightRelevantKeywords — shared utility for all AI insight surfaces
 *
 * Highlights keywords in AI-generated text that match the user's profile:
 * skin type, concerns, sensitivity, and ingredient relevance.
 *
 * Supports:
 * - Multi-word phrases ("dark spots", "uneven tone")
 * - Concern synonyms (hyperpigmentation → dark spots)
 * - Ingredient synonyms (niacinamide → vitamin B3)
 * - Category synonyms (brightening → radiance)
 * - Case-insensitive matching
 */

import React from 'react';

// ---------------------------------------------------------------------------
// Synonym maps — bidirectional matching
// ---------------------------------------------------------------------------

const CONCERN_SYNONYMS: Record<string, string[]> = {
  'hyperpigmentation': ['dark spots', 'uneven tone', 'discoloration', 'sun spots', 'age spots', 'melasma'],
  'dark spots': ['hyperpigmentation', 'discoloration', 'sun spots', 'age spots'],
  'uneven tone': ['hyperpigmentation', 'discoloration', 'dullness'],
  'acne': ['breakouts', 'blemishes', 'pimples'],
  'breakouts': ['acne', 'blemishes', 'pimples'],
  'aging': ['fine lines', 'wrinkles', 'anti-aging', 'mature skin'],
  'fine lines': ['wrinkles', 'aging', 'anti-aging'],
  'wrinkles': ['fine lines', 'aging', 'anti-aging'],
  'dryness': ['dehydration', 'dry skin', 'flaking', 'flaky'],
  'dehydration': ['dryness', 'dry skin'],
  'oiliness': ['excess oil', 'oily skin', 'shine', 'sebum'],
  'redness': ['irritation', 'rosacea', 'inflammation', 'sensitive'],
  'sensitivity': ['sensitive skin', 'reactive skin', 'irritation'],
  'pores': ['large pores', 'enlarged pores', 'pore size', 'minimizing pores'],
  'dullness': ['lack of glow', 'radiance', 'brightening', 'luminosity'],
  'textural irregularities': ['rough texture', 'uneven texture', 'bumpy skin', 'texture'],
};

const INGREDIENT_SYNONYMS: Record<string, string[]> = {
  'niacinamide': ['vitamin b3', 'nicotinamide'],
  'vitamin b3': ['niacinamide', 'nicotinamide'],
  'retinol': ['vitamin a', 'retinoid', 'retinal'],
  'retinoid': ['retinol', 'retinal', 'vitamin a'],
  'vitamin c': ['ascorbic acid', 'l-ascorbic acid'],
  'ascorbic acid': ['vitamin c', 'l-ascorbic acid'],
  'hyaluronic acid': ['ha', 'sodium hyaluronate'],
  'salicylic acid': ['bha', 'beta hydroxy acid'],
  'bha': ['salicylic acid', 'beta hydroxy acid'],
  'glycolic acid': ['aha', 'alpha hydroxy acid'],
  'aha': ['glycolic acid', 'alpha hydroxy acid', 'lactic acid'],
  'lactic acid': ['aha', 'alpha hydroxy acid'],
  'ceramides': ['ceramide', 'barrier repair'],
  'squalane': ['squalene'],
  'peptides': ['peptide', 'collagen peptide'],
  'zinc oxide': ['mineral sunscreen', 'mineral spf'],
  'azelaic acid': ['azelaic'],
  'tranexamic acid': ['tranexamic'],
  'kojic acid': ['kojic'],
  'arbutin': ['alpha arbutin'],
  'bakuchiol': ['retinol alternative'],
};

const CATEGORY_SYNONYMS: Record<string, string[]> = {
  'brightening': ['radiance', 'glow', 'luminosity'],
  'hydrating': ['moisturizing', 'moisture', 'hydration'],
  'anti-aging': ['aging', 'mature skin', 'fine lines'],
  'soothing': ['calming', 'gentle', 'sensitive'],
  'exfoliating': ['exfoliation', 'resurfacing'],
  'protective': ['protection', 'spf', 'sunscreen', 'sun protection'],
};

const POSITIVE_SENTIMENT = new Set([
  'positively', 'positive', 'highly rated', 'well-reviewed', 'effective',
]);

const NEGATIVE_SENTIMENT = new Set([
  'negatively', 'negative', 'poorly rated', 'ineffective',
]);

const SENTIMENT_WORDS = [...POSITIVE_SENTIMENT, ...NEGATIVE_SENTIMENT];

// ---------------------------------------------------------------------------
// Profile type
// ---------------------------------------------------------------------------

export interface HighlightProfile {
  skinType?: string;
  concerns?: string[];
  sensitivity?: string;
  ingredients?: string[];
  /** Product names to exclude from highlighting (prevents highlighting keywords inside names) */
  excludeNames?: string[];
  /** When true, also highlight sentiment words (positively, negatively, etc.) */
  highlightSentiment?: boolean;
}

// ---------------------------------------------------------------------------
// Core utility
// ---------------------------------------------------------------------------

/**
 * Build the full set of keywords to highlight, including synonyms.
 */
function buildKeywordSet(profile: HighlightProfile): string[] {
  const keywords = new Set<string>();

  // Skin type
  if (profile.skinType) {
    keywords.add(profile.skinType.toLowerCase());
  }

  // Sensitivity
  if (profile.sensitivity) {
    keywords.add(profile.sensitivity.toLowerCase());
    const synList = CONCERN_SYNONYMS[profile.sensitivity.toLowerCase()];
    if (synList) synList.forEach(s => keywords.add(s));
  }

  // Concerns + their synonyms
  for (const concern of profile.concerns ?? []) {
    const lower = concern.toLowerCase();
    keywords.add(lower);
    // Add synonyms from concern map
    const synList = CONCERN_SYNONYMS[lower];
    if (synList) synList.forEach(s => keywords.add(s));
    // Check category synonyms too
    const catSynList = CATEGORY_SYNONYMS[lower];
    if (catSynList) catSynList.forEach(s => keywords.add(s));
  }

  // Always highlight well-known skincare ingredients from the synonym map
  for (const [key, synonyms] of Object.entries(INGREDIENT_SYNONYMS)) {
    keywords.add(key);
    for (const s of synonyms) keywords.add(s);
  }

  // Additional product-specific ingredients (if provided)
  for (const ingredient of profile.ingredients ?? []) {
    const lower = ingredient.toLowerCase();
    keywords.add(lower);
  }

  // Sentiment words (opt-in via highlightSentiment flag)
  if (profile.highlightSentiment) {
    for (const word of SENTIMENT_WORDS) {
      keywords.add(word);
    }
  }

  return Array.from(keywords).filter(k => k.length > 1);
}

/**
 * Check if a matched keyword falls inside a product name in the original text.
 * Prevents "Brightening" being highlighted when it's part of "Brightening Vitamin C Serum".
 */
function isInsideProductName(text: string, matchIndex: number, matchLength: number, names: string[]): boolean {
  const textLower = text.toLowerCase();
  for (const name of names) {
    const nameStart = textLower.indexOf(name.toLowerCase());
    if (nameStart !== -1) {
      const nameEnd = nameStart + name.length;
      if (matchIndex >= nameStart && matchIndex + matchLength <= nameEnd) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Returns the highlight CSS class for a matched keyword.
 * Sentiment words get distinct colors (sage for positive, warm amber for negative).
 * All other keywords use the default primary brand highlight.
 */
function getHighlightClass(matchedText: string): string {
  const lower = matchedText.toLowerCase();
  if (POSITIVE_SENTIMENT.has(lower)) {
    return 'bg-sage/15 text-sage font-medium rounded px-0.5';
  }
  if (NEGATIVE_SENTIMENT.has(lower)) {
    return 'bg-yellow-500/15 text-yellow-700 font-medium rounded px-0.5';
  }
  return 'bg-primary/15 text-primary font-medium rounded px-0.5';
}

/**
 * Highlight relevant keywords in AI insight text based on user profile.
 *
 * Returns React nodes with matching keywords wrapped in branded <mark> elements.
 * Returns plain text when profile is empty or no matches are found.
 * Product names listed in excludeNames are protected from highlighting.
 */
export function highlightRelevantKeywords(
  text: string,
  profile: HighlightProfile,
): React.ReactNode {
  const keywords = buildKeywordSet(profile);
  if (keywords.length === 0) return text;

  // Sort by length descending so longer phrases match first ("dark spots" before "dark")
  const sorted = keywords.sort((a, b) => b.length - a.length);

  // Escape for regex and wrap in word boundaries to prevent partial-word matches
  const escaped = sorted.map(k => `\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);

  // Build pattern — case-insensitive, word-boundary-aware
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');

  const excludeNames = profile.excludeNames ?? [];

  // If we have product names to exclude, use index-aware matching
  if (excludeNames.length > 0) {
    const result: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    // Reset
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text)) !== null) {
      const matchStart = match.index;
      const matchText = match[0];
      // Push text before match
      if (matchStart > lastIndex) {
        result.push(text.slice(lastIndex, matchStart));
      }
      // Check if match is inside a product name
      if (isInsideProductName(text, matchStart, matchText.length, excludeNames)) {
        result.push(matchText);
      } else {
        result.push(
          <mark key={matchStart} className={getHighlightClass(matchText)}>
            {matchText}
          </mark>,
        );
      }
      lastIndex = matchStart + matchText.length;
    }
    // Push remaining text
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }
    return result.length > 0 ? result : text;
  }

  // Simple path — no product names to exclude
  const parts = text.split(pattern);
  if (parts.length <= 1) return text;

  return parts.map((part, i) => {
    if (pattern.test(part)) {
      pattern.lastIndex = 0;
      return (
        <mark key={i} className={getHighlightClass(part)}>
          {part}
        </mark>
      );
    }
    pattern.lastIndex = 0;
    return part;
  });
}
