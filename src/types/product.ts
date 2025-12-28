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