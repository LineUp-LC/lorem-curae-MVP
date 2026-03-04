/**
 * Reviewer Evidence Aggregator
 *
 * Bridges the reviewer similarity system with the environment-fit engine.
 * Scores mock reviews against the user's profile and returns a summary
 * usable by generateEnvironmentFitExplanation().
 */

import { getReviewsForProduct } from '../../mocks/reviews';
import { calculateSimilarityWeight } from './reviewSimilarity';
import type { ReviewerEnvironmentInsight, ScoredReviewEntry } from './environmentFit';

interface AggregateUserProfile {
  skinType: string;
  primaryConcerns: string[];
  complexion: string;
  sensitivity: string;
  lifestyle: string[];
  age: number;
}

/**
 * Aggregate reviewer evidence for a product by scoring each review
 * against the user's profile.
 *
 * Returns undefined when no reviews meet the similarity threshold,
 * allowing the environment-fit engine to degrade gracefully.
 */
export function aggregateReviewerEvidence(
  productId: number,
  userProfile: AggregateUserProfile,
): ReviewerEnvironmentInsight | undefined {
  const reviews = getReviewsForProduct(productId);
  if (reviews.length === 0) return undefined;

  // Score each review against the user's profile
  const scored = reviews
    .map(review => {
      const result = calculateSimilarityWeight(
        {
          skinType: review.skinType,
          skinConcerns: review.skinConcerns,
          complexion: review.complexion,
          lifestyle: review.lifestyle,
          age: review.age,
        },
        userProfile,
      );
      return { review, score: result.score, matchTier: result.matchTier, matchDetails: result.matchDetails };
    })
    .filter(entry => entry.score >= 30) // Partial match threshold
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return undefined;

  // Compute average rating of matched reviews
  const avgRating =
    scored.reduce((sum, entry) => sum + entry.review.rating, 0) / scored.length;

  const sentiment: 'positive' | 'mixed' = avgRating >= 4.0 ? 'positive' : 'mixed';

  const detail =
    sentiment === 'positive'
      ? `gave this a ${avgRating.toFixed(1)}-star average — they found it worked well for their skin`
      : `had mixed results with this one (${avgRating.toFixed(1)}-star average) — your experience may differ`;

  // Top 3 scored reviews for modal rendering
  const scoredReviews: ScoredReviewEntry[] = scored.slice(0, 3).map(entry => ({
    review: {
      id: entry.review.id,
      userName: entry.review.userName,
      userAvatar: entry.review.userAvatar,
      rating: entry.review.rating,
      content: entry.review.content,
      skinType: entry.review.skinType,
      usageDurationWeeks: entry.review.usageDurationWeeks,
      verified: entry.review.verified,
    },
    score: entry.score,
    matchTier: entry.matchTier,
    matchDetails: entry.matchDetails,
  }));

  return {
    count: scored.length,
    sentiment,
    detail,
    scoredReviews,
  };
}
