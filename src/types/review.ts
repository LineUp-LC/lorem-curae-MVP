/**
 * Canonical type for product_reviews table rows.
 * Used across ReviewForm, ReviewsList, and product detail surfaces.
 */

export interface ProductReview {
  id: string;
  user_id: string;
  product_id: number;
  rating: number;
  title: string | null;
  content: string;
  skin_type: string | null;
  skin_concerns: string[];
  pros: string[];
  cons: string[];
  would_recommend: boolean | null;
  usage_duration_weeks: number | null;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

/** Shape for submitting a new review (server-generated fields omitted) */
export type ProductReviewInput = Omit<
  ProductReview,
  'id' | 'created_at' | 'updated_at' | 'helpful_count'
>;

/** Usage duration options for the review form */
export const USAGE_DURATION_OPTIONS = [
  { label: 'Less than 1 week', weeks: 1 },
  { label: '1-4 weeks', weeks: 4 },
  { label: '1-3 months', weeks: 12 },
  { label: '3-6 months', weeks: 24 },
  { label: '6+ months', weeks: 26 },
] as const;
