/**
 * Represents the size/volume of a product
 */
export interface ProductSize {
  value: number;
  unit: 'ml' | 'oz' | 'g' | 'fl oz';
}

/**
 * Represents an active ingredient with optional concentration data
 */
export interface ActiveIngredient {
  name: string;
  /** Concentration value (e.g., 10 for 10%) */
  concentration?: number;
  /** Unit of concentration measurement */
  concentrationUnit?: '%' | 'mg' | 'IU';
  /** Whether this is a key active ingredient for this product */
  isKeyActive?: boolean;
}

/**
 * Product source - where the product is available
 * - marketplace: Available for purchase on Lorem Curae Marketplace
 * - discovery: Available for research/discovery, links to external retailers
 */
export type ProductSource = 'marketplace' | 'discovery';

import type { ProductCategory } from '../lib/utils/categoryRegistry';

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  skinTypes: string[];
  concerns: string[];
  keyIngredients: string[];
  inStock: boolean;
  /** Where the product is available: marketplace or discovery */
  source?: ProductSource;
  /** Product size/volume information */
  size?: ProductSize;
  /** Active ingredients with concentration data */
  activeIngredients?: ActiveIngredient[];
  /** When this product is typically used in a routine */
  timeOfDay?: ('am' | 'pm')[];
  /** Product texture (optional — inferred if absent) */
  texture?: 'gel' | 'cream' | 'lotion' | 'balm' | 'oil' | 'liquid' | 'foam' | 'paste' | 'emulsion' | 'mist' | 'serum';
  /** Formulation type (optional — future enrichment) */
  formulation?: 'water-based' | 'oil-based' | 'silicone-based' | 'anhydrous' | 'emulsion';
  preferences?: {
    vegan?: boolean;
    crueltyFree?: boolean;
    fragranceFree?: boolean;
    glutenFree?: boolean;
    alcoholFree?: boolean;
    siliconeFree?: boolean;
    plantBased?: boolean;
    chemicalFree?: boolean;
  };
}