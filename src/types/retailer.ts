export interface Retailer {
  id: number;
  name: string;
  logo: string;
  price: number;
  shipping: number;
  estimatedTax?: number;
  totalPrice: number;
  trustScore: number;
  deliveryDays: string;
  inStock: boolean;
  url: string;
  features: string[];
  isAffiliate?: boolean;
  isSponsored?: boolean;
  secureCheckout?: boolean;
  shippingLabel?: string;
  taxIncluded?: boolean;
  deepLink?: string;
  source?: 'affiliate_feed' | 'retailer_api' | 'manual';
  lastUpdated?: string;
}

export type RetailerSortKey = 'trust' | 'price-low' | 'price-high' | 'delivery';
