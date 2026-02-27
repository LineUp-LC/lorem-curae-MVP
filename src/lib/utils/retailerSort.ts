import type { Retailer, RetailerSortKey } from '../../types/retailer';

export const RETAILER_SORT_OPTIONS: { value: RetailerSortKey; label: string; icon: string }[] = [
  { value: 'trust', label: 'Trust Score', icon: 'ri-shield-star-line' },
  { value: 'price-low', label: 'Price: Low to High', icon: 'ri-arrow-up-line' },
  { value: 'price-high', label: 'Price: High to Low', icon: 'ri-arrow-down-line' },
  { value: 'delivery', label: 'Fastest Delivery', icon: 'ri-truck-line' },
];

export function sortRetailers(retailers: Retailer[], sortBy: RetailerSortKey): Retailer[] {
  return [...retailers].sort((a, b) => {
    if (a.isSponsored && !b.isSponsored) return -1;
    if (!a.isSponsored && b.isSponsored) return 1;

    switch (sortBy) {
      case 'trust':
        return b.trustScore - a.trustScore;
      case 'price-low':
        return a.totalPrice - b.totalPrice;
      case 'price-high':
        return b.totalPrice - a.totalPrice;
      case 'delivery':
        return parseInt(a.deliveryDays) - parseInt(b.deliveryDays);
      default:
        return 0;
    }
  });
}

export function getPriceRange(retailers: Retailer[]): { min: number; max: number } {
  if (retailers.length === 0) return { min: 0, max: 0 };
  const prices = retailers.map(r => r.totalPrice);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}
