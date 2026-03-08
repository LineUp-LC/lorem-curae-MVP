/**
 * Review Summary AI Context Builder
 *
 * Assembles deterministic inputs from scored reviews, user profile, and
 * environment context into a structured prompt for AI review summarization.
 *
 * Uses existing `product_detail` AIMode with a specialized question —
 * no new AIMode needed.
 *
 * Governance: CLAUDE_PRODUCT.md Section 20 (AI-Assisted Review Summaries)
 */

import type { ScoredReviewEntry } from './environmentFit';
import type { ReviewEnvironmentInsight } from './reviewEnvironmentInsight';
import type { EnvironmentContext } from '../environment/context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReviewExcerpt {
  content: string;
  rating: number;
  skinType: string;
  matchTier: string;
}

export interface ReviewSummaryAIInput {
  skinType: string | null;
  concerns: string[];
  season: string | null;
  location: string | null;
  productName: string;
  matchCount: number;
  avgRating: number;
  topKeywords: string[];
  reviewExcerpts: ReviewExcerpt[];
  hasClimateReviews: boolean;
  hasTextureReviews: boolean;
  hasWearReviews: boolean;
  sentimentLabel: string;
}

// ---------------------------------------------------------------------------
// Context builder
// ---------------------------------------------------------------------------

/**
 * Assembles a ReviewSummaryAIInput from data already computed in
 * ProductReviews.tsx. All inputs are deterministic — no fetching.
 */
export function buildReviewSummaryContext(
  scoredReviews: ScoredReviewEntry[],
  reviewInsight: ReviewEnvironmentInsight | null,
  env: EnvironmentContext | null,
  skinType: string | null,
  concerns: string[],
  productName: string,
): ReviewSummaryAIInput {
  // Select top 5 reviews by score for AI input
  const topReviews = [...scoredReviews]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Truncate each review to 200 chars (token budget management)
  const reviewExcerpts: ReviewExcerpt[] = topReviews.map(r => ({
    content: r.review.content.length > 200
      ? r.review.content.slice(0, 197) + '...'
      : r.review.content,
    rating: r.review.rating,
    skinType: r.review.skinType,
    matchTier: r.matchTier,
  }));

  // Derive sentiment label from average rating
  const avgRating = reviewInsight?.avgRating ?? (
    topReviews.length > 0
      ? Math.round(topReviews.reduce((sum, r) => sum + r.review.rating, 0) / topReviews.length * 10) / 10
      : 0
  );
  let sentimentLabel = 'mixed';
  if (avgRating >= 4.0) sentimentLabel = 'positive';
  else if (avgRating < 3.0) sentimentLabel = 'mixed with concerns';

  // Location string
  const location = env?.location?.city
    ? `${env.location.city}${env.location.region ? `, ${env.location.region}` : ''}`
    : null;

  return {
    skinType,
    concerns,
    season: env?.season ?? null,
    location,
    productName,
    matchCount: reviewInsight?.matchCount ?? topReviews.length,
    avgRating,
    topKeywords: reviewInsight?.topKeywords ?? [],
    reviewExcerpts,
    hasClimateReviews: reviewInsight?.topKeywords.some(kw =>
      ['cold', 'hot', 'humid', 'dry air', 'winter', 'summer', 'weather', 'sun', 'heat'].includes(kw)
    ) ?? false,
    hasTextureReviews: reviewInsight?.topKeywords.some(kw =>
      ['lightweight', 'heavy', 'greasy', 'smooth', 'rich', 'gel', 'creamy', 'oily'].includes(kw)
    ) ?? false,
    hasWearReviews: reviewInsight?.topKeywords.some(kw =>
      ['absorbs', 'under makeup', 'lasts', 'sinks in', 'layers', 'finish'].includes(kw)
    ) ?? false,
    sentimentLabel,
  };
}

// ---------------------------------------------------------------------------
// Prompt formatter
// ---------------------------------------------------------------------------

/**
 * Converts a ReviewSummaryAIInput into a structured user message
 * for the AI. Follows CLAUDE_PRODUCT.md Section 20 output rules.
 */
export function formatReviewSummaryPrompt(input: ReviewSummaryAIInput): string {
  const lines: string[] = [];

  lines.push('Summarize what similar-profile reviewers said about this product.');
  lines.push('');

  // User profile block
  lines.push('USER PROFILE:');
  if (input.skinType) lines.push(`- Skin type: ${input.skinType}`);
  if (input.concerns.length > 0) lines.push(`- Concerns: ${input.concerns.join(', ')}`);
  if (input.season && input.location) {
    lines.push(`- Current conditions: ${input.season} in ${input.location}`);
  } else if (input.season) {
    lines.push(`- Current season: ${input.season}`);
  }
  lines.push('');

  // Review data block
  lines.push('REVIEW DATA:');
  lines.push(`- Product: ${input.productName}`);
  lines.push(`- ${input.matchCount} similar-profile reviews, average rating ${input.avgRating}`);
  lines.push(`- Overall sentiment: ${input.sentimentLabel}`);
  if (input.topKeywords.length > 0) {
    lines.push(`- Top mentioned keywords: ${input.topKeywords.join(', ')}`);
  }
  const categories: string[] = [];
  if (input.hasClimateReviews) categories.push('climate/weather');
  if (input.hasTextureReviews) categories.push('texture/feel');
  if (input.hasWearReviews) categories.push('wear/application');
  if (categories.length > 0) {
    lines.push(`- Categories covered: ${categories.join(', ')}`);
  }
  lines.push('');

  // Review excerpts
  if (input.reviewExcerpts.length > 0) {
    lines.push('SELECTED REVIEW EXCERPTS:');
    input.reviewExcerpts.forEach((r, i) => {
      lines.push(`${i + 1}. [${r.skinType}, rating ${r.rating}/5, ${r.matchTier} match] "${r.content}"`);
    });
    lines.push('');
  }

  // Output rules (Section 20 compliance)
  lines.push('RULES:');
  lines.push('- Synthesize into 3-4 natural sentences, no headers or bullet points');
  lines.push('- Reference what reviewers actually said — do not generalize');
  lines.push('- Use "people with similar skin" framing — never "users", never cite review counts');
  lines.push('- If reviews mention weather or climate, connect to the user\'s current season');
  lines.push('- Acknowledge conflicting opinions if present');
  lines.push('- No statistics, no review counts, no raw scores in the output');
  lines.push('- No ingredient names unless explaining what they do');
  lines.push('- Use conditional language: "found", "noticed", "mentioned" — not absolutes');

  return lines.join('\n');
}
