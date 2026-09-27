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
  slug?: string; // SEO-friendly URL slug
  name: string;
  nameJapanese?: string; // Japanese name
  address: string;
  city: string;
  neighborhood?: string;
  country: string;
  latitude: number;
  longitude: number;
  mainCategory?: MainCategory; // Optional until migration runs
  category?: string; // Primary subcategory
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
  checkin_count?: number; // GPS-verified Radar check-ins — populated once RPC returns this column
  google_place_id?: string; // Optional - for photo fetching
  kurb_vendor_id?: number | null; // Kurb API vendor ID — null/undefined means no inventory feed
  // ── Three-Tier Store Map ──────────────────────────────────────────────────
  /** 'curated' = hand-edited; 'chain' = known chain locator; 'general' = OSM/Overpass */
  sourceType?: 'curated' | 'chain' | 'general';
}

export interface StoreSuggestion {
  id?: string;
  submitterName?: string;
  /** Only present for source: 'public_form' — discovery_bot rows have no submitter. */
  submitterEmail?: string;
  storeName: string;
  city: string;
  country?: string;
  address?: string;
  neighborhood?: string;
  /** The submitter's or bot's stated reason (public_form) — separate from `notes`. */
  reason?: string;
  /** Free-text context, mainly populated by discovery_bot. */
  notes?: string;
  instagram?: string;
  website?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  // ── Phase 1/2: discovery-pipeline fields (discovery_bot rows only) ──────
  source: 'public_form' | 'discovery_bot';
  sourceRef?: string;
  categoryHint?: string;
  mainCategory?: MainCategory;
  googlePlaceId?: string;
  geocodeConfidence?: 'high' | 'low' | 'none';
  possibleDuplicateOf?: string;
  timesSeen: number;
  lastSeenAt?: string;
  lat?: number;
  lng?: number;
  googlePhotoNames?: string[];
  oembedHtml?: string;
  oembedThumbnailUrl?: string;
  oembedAuthorName?: string;
  oembedFetchedAt?: string;
  followerCount?: number;
  /** Set once this suggestion has been promoted into a real store row. A
   *  suggestion with status 'approved' and promotedStoreId still undefined
   *  is an orphan — approved but never actually published. */
  promotedStoreId?: string;
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
  /** When true: only show curated stores (sourceType === 'curated'). Chain + general hidden. */
  curatedOnly?: boolean;
}

export type SortOption = 'name' | 'city' | 'recent' | 'category';


