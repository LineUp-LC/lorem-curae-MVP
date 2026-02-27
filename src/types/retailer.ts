export interface Retailer {
  id: number;
  name: string;
  logo: string;
  price: number;
  shipping: number;
  estimatedTax: number;
  totalPrice: number;
  trustScore: number;
  deliveryDays: string;
  inStock: boolean;
  url: string;
  features: string[];
  isAffiliate?: boolean;
  isSponsored?: boolean;
  secureCheckout?: boolean;
}

export type RetailerSortKey = 'trust' | 'price-low' | 'price-high' | 'delivery';
