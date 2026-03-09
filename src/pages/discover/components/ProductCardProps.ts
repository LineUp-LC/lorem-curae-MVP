import type { Product } from '../../../types/product';
import type { MatchTier } from '../../../lib/discovery/types';

export interface ProductCardProps {
  product: Product;
  highlightCompare?: boolean;
  isRecommended: boolean;
  isSelected: boolean;
  isProductSaved: boolean;
  compareCount: number;
  safeUserConcerns: string[];
  onProductClick: (id: number) => void;
  onToggleSave: (e: React.MouseEvent) => void;
  onAddToCompare: (e: React.MouseEvent) => void;
  /** Discovery match tier (shown when sorting by Best Match with profile data) */
  matchTier?: MatchTier;
  /** Top reasons for the match (shown in tooltip on hover) */
  matchReasons?: string[];
}
