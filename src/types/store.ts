import type { STORE_CATEGORIES, PRICE_RANGES, MAIN_CATEGORIES, FASHION_SUB_CATEGORIES, FOOD_SUB_CATEGORIES, COFFEE_SUB_CATEGORIES, HOME_GOODS_SUB_CATEGORIES, SPOTS_SUB_CATEGORIES } from '../lib/constants';

export type StoreCategory = typeof STORE_CATEGORIES[number];
export type PriceRange = typeof PRICE_RANGES[number];
export type MainCategory = typeof MAIN_CATEGORIES[number];
export type FashionSubCategory = typeof FASHION_SUB_CATEGORIES[number];
export type FoodSubCategory = typeof FOOD_SUB_CATEGORIES[number];
export type CoffeeSubCategory = typeof COFFEE_SUB_CATEGORIES[number];
export type HomeGoodsSubCategory = typeof HOME_GOODS_SUB_CATEGORIES[number];
export type SpotsSubCategory = typeof SPOTS_SUB_CATEGORIES[number];
export type SubCategory = FashionSubCategory | FoodSubCategory | CoffeeSubCategory | HomeGoodsSubCategory | SpotsSubCategory;

export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  neighborhood?: string;
  country: string;
  latitude: number;
  longitude: number;
  mainCategory?: MainCategory; // Optional until migration runs
  categories: StoreCategory[];
  priceRange?: PriceRange;
  description?: string;
  photos: string[];
  website?: string;
  instagram?: string;
  hours?: string;
  verified: boolean;
  submittedBy?: string;
  createdAt: string;
  updatedAt: string;
  haulCount: number;
  saveCount: number;
  google_place_id?: string; // Optional - for photo fetching
}

export interface StoreSuggestion {
  id?: string;
  submitterName?: string;
  submitterEmail: string;
  storeName: string;
  city: string;
  country: string;
  address: string;
  reason: string;
  instagram?: string;
  website?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

export interface StoreFilters {
  countries: string[];
  cities: string[];
  mainCategories?: MainCategory[]; // Main categories (Food, Fashion, Coffee, etc)
  categories: StoreCategory[]; // Subcategories (Ramen, Sushi, Vintage, etc)
  priceRanges: PriceRange[];
  verified?: boolean;
  searchQuery?: string;
  selectedCity?: string | null;
  selectedNeighborhood?: string | null;
  selectedCategory?: string | null;
  selectedPrice?: string | null;
}

export type SortOption = 'name' | 'city' | 'recent' | 'category';


