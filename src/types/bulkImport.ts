import type { ParsedStoreRow } from '../utils/csvParser';
import type { EnhancedPlaceData } from '../utils/aiPlaceEnhancer';
import type { MainCategory, SubCategory } from './store';

/**
 * Queue item status
 */
export type QueueItemStatus =
  | 'pending'        // Not yet processed
  | 'searching'      // Searching for Place ID
  | 'enhancing'      // Running AI enhancement
  | 'ready'          // Ready for approval
  | 'approved'       // User approved, saving to DB
  | 'saving'         // Migrating photos + saving
  | 'completed'      // Successfully saved
  | 'skipped'        // User skipped
  | 'failed'         // Error occurred
  | 'duplicate';     // Already exists in DB

/**
 * Single queue item representing one store
 */
export interface BulkImportQueueItem {
  // Original CSV data
  csvData: ParsedStoreRow;

  // Fetched data
  placeId?: string;
  placeName?: string;
  placeAddress?: string;
  placeDetails?: any; // Full PlaceDetails from Google

  // AI-enhanced data
  enhancedData?: EnhancedPlaceData;

  // User selections
  mainCategory?: MainCategory;
  subCategories: SubCategory[];
  customDescription?: string; // If user edits description

  // Status tracking
  status: QueueItemStatus;
  error?: string;
  duplicateId?: string; // If duplicate, ID of existing store

  // Processing metadata
  attemptCount: number;
  lastAttemptTime?: Date;
}

/**
 * Overall queue state
 */
export interface BulkImportState {
  // Queue data
  items: BulkImportQueueItem[];
  currentIndex: number;

  // Processing state
  isProcessing: boolean;
  isPaused: boolean;

  // Statistics
  stats: {
    total: number;
    pending: number;
    completed: number;
    skipped: number;
    failed: number;
    duplicates: number;
  };

  // Metadata
  uploadedFileName?: string;
  uploadedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * Actions for queue management
 */
export type BulkImportAction =
  | { type: 'LOAD_CSV'; payload: { items: BulkImportQueueItem[]; fileName: string } }
  | { type: 'START_PROCESSING' }
  | { type: 'PAUSE_PROCESSING' }
  | { type: 'RESUME_PROCESSING' }
  | { type: 'UPDATE_ITEM'; payload: { index: number; updates: Partial<BulkImportQueueItem> } }
  | { type: 'APPROVE_ITEM'; payload: { index: number; mainCategory: MainCategory; subCategories: SubCategory[]; customDescription?: string } }
  | { type: 'SKIP_ITEM'; payload: { index: number } }
  | { type: 'MARK_FAILED'; payload: { index: number; error: string } }
  | { type: 'MOVE_TO_NEXT' }
  | { type: 'RESET' };

/**
 * Store creation data ready for Supabase insert
 */
export interface StoreInsertData {
  name: string;
  address: string;
  city: string;
  neighborhood?: string;
  country: string;
  latitude: number;
  longitude: number;
  mainCategory: MainCategory;
  categories: string[]; // SubCategories as strings
  priceRange?: string;
  description?: string;
  photos: string[]; // Supabase Storage URLs
  website?: string;
  instagram?: string;
  hours?: string;
  verified: boolean;
  google_place_id?: string;
}
