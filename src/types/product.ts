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

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  skinTypes: string[];
  concerns: string[];
  keyIngredients: string[];
  inStock: boolean;
  /** Product size/volume information */
  size?: ProductSize;
  /** Active ingredients with concentration data */
  activeIngredients?: ActiveIngredient[];
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