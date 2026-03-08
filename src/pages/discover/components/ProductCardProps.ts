import type { Product } from '../../../types/product';

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
}
