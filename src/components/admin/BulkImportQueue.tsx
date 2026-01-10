import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { searchPlaceId, autoSelectBestMatch } from '../../utils/placeIdFetcher';
import { enhancePlaceDetailsWithAI } from '../../utils/aiPlaceEnhancer';
import { migrateStorePhotosViaEdge } from '../../utils/edgePhotoFetcher';
import { BulkImportApprovalCard } from './BulkImportApprovalCard';
import type { BulkImportQueueItem } from '../../types/bulkImport';
import type { MainCategory, SubCategory } from '../../types/store';
import type { PlaceDetails } from './FetchPlaceIdButton';
import { Loader, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface BulkImportQueueProps {
  items: BulkImportQueueItem[];
  currentIndex: number;
  isProcessing: boolean;
  onUpdateItem: (index: number, updates: Partial<BulkImportQueueItem>) => void;
  onSkip: (index: number) => void;
  onMarkFailed: (index: number, error: string) => void;
  onMoveToNext: () => void;
}

export function BulkImportQueue({
  items,
  currentIndex,
  isProcessing,
  onUpdateItem,
  onSkip,
  onMarkFailed,
  onMoveToNext,
}: BulkImportQueueProps) {
  const [isSaving, setIsSaving] = useState(false);

  const currentItem = items[currentIndex];

  // Auto-process current item when it changes
  useEffect(() => {
    if (!isProcessing || !currentItem) return;
    if (currentItem.status !== 'pending') return;

    processItem(currentItem, currentIndex);
  }, [currentIndex, isProcessing]);

  /**
   * Process a single item: Search → Fetch → Enhance → Ready for approval
   */
  const processItem = async (item: BulkImportQueueItem, index: number) => {
    try {
      console.log(`🔄 Processing item ${index + 1}/${items.length}: ${item.csvData.title}`);

      // Step 1: Check for duplicates
      const isDuplicate = await checkDuplicate(item);
      if (isDuplicate) {
        onUpdateItem(index, {
          status: 'duplicate',
          duplicateId: isDuplicate,
        });
        setTimeout(() => onMoveToNext(), 1000); // Auto-skip duplicates after 1s
        return;
      }

      // Step 2: Search for Place ID if not provided
      if (!item.placeId) {
        onUpdateItem(index, { status: 'searching' });

        const searchResults = await searchPlaceId(item.csvData.title);

        if (searchResults.length === 0) {
          throw new Error('No Place ID found - store may not exist on Google Maps');
        }

        // Auto-select best match
        const bestMatch = autoSelectBestMatch(searchResults);

        if (!bestMatch) {
          // Manual selection required - pause for user input
          onUpdateItem(index, {
            status: 'failed',
            error: 'Multiple matches found - manual selection required',
          });
          return;
        }

        onUpdateItem(index, {
          placeId: bestMatch.placeId,
          placeName: bestMatch.name,
          placeAddress: bestMatch.address,
        });

        // Update the item reference with the new placeId
        item.placeId = bestMatch.placeId;
      }

      // Step 3: Fetch place details (check if placeId exists)
      if (!item.placeId) {
        throw new Error('No Place ID available - cannot fetch details');
      }

      const placeDetails = await fetchPlaceDetails(item.placeId);

      onUpdateItem(index, {
        placeDetails,
        placeName: placeDetails.name,
        placeAddress: placeDetails.address,
      });

      // Step 4: AI Enhancement
      onUpdateItem(index, { status: 'enhancing' });

      // Detect category based on place types
      const category = detectCategoryFromTypes(placeDetails.types || []);

      const enhanced = await enhancePlaceDetailsWithAI(placeDetails, category);

      onUpdateItem(index, {
        enhancedData: enhanced,
        status: 'ready',
      });

      console.log(`✅ Item ${index + 1} ready for approval`);
    } catch (error) {
      console.error(`❌ Error processing item ${index + 1}:`, error);
      onMarkFailed(index, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  /**
   * Detect category from Google place types
   */
  const detectCategoryFromTypes = (types: string[]): 'Fashion' | 'Food' | 'Coffee' => {
    const typesLower = types.map(t => t.toLowerCase());

    // Check for coffee-related types
    if (typesLower.some(t => t.includes('cafe') || t.includes('coffee'))) {
      return 'Coffee';
    }

    // Check for food-related types
    const foodTypes = ['restaurant', 'food', 'bar', 'meal_takeaway', 'meal_delivery', 'bakery'];
    if (typesLower.some(t => foodTypes.some(ft => t.includes(ft)))) {
      return 'Food';
    }

    // Check for fashion-related types
    const fashionTypes = ['clothing_store', 'shoe_store', 'store', 'shopping'];
    if (typesLower.some(t => fashionTypes.some(ft => t.includes(ft)))) {
      return 'Fashion';
    }

    // Default to Food (since that's the current bulk import focus)
    return 'Food';
  };

  /**
   * Check if store already exists in database
   */
  const checkDuplicate = async (item: BulkImportQueueItem): Promise<string | null> => {
    if (!item.placeId) return null;

    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id')
        .eq('google_place_id', item.placeId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = not found (which is good)
        console.error('Duplicate check error:', error);
      }

      return data?.id || null;
    } catch (error) {
      console.error('Duplicate check failed:', error);
      return null;
    }
  };

  /**
   * Fetch place details via serverless function (bypasses referrer restrictions)
   */
  const fetchPlaceDetails = async (placeId: string): Promise<PlaceDetails> => {
    // Clean up placeId - remove 'places/' prefix if present
    const cleanPlaceId = placeId.replace('places/', '');

    console.log(`🔍 Fetching place details via serverless for: ${cleanPlaceId}`);

    const response = await fetch('/api/fetch-place-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ placeId: cleanPlaceId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ Place details API error (${response.status}):`, errorData);
      throw new Error(errorData.error || `Failed to fetch place details: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch place details');
    }

    console.log(`✅ Place details fetched: ${result.placeDetails.name}`);

    return result.placeDetails;
  };

  /**
   * Handle approval - save store to database
   */
  const handleApprove = async (
    mainCategory: MainCategory,
    subCategories: SubCategory[],
    customDescription?: string,
    manualCity?: string,
    manualNeighborhood?: string
  ) => {
    if (!currentItem) return;

    setIsSaving(true);

    try {
      console.log(`💾 Saving store: ${currentItem.placeName}`);

      // Use manual city/neighborhood if provided, otherwise extract from address
      const city = manualCity || extractCity(currentItem.placeAddress || '');
      const neighborhood = manualNeighborhood || extractNeighborhood(currentItem.placeAddress || '');

      // Prepare store data
      const latitude = currentItem.placeDetails?.latitude || 0;
      const longitude = currentItem.placeDetails?.longitude || 0;

      const storeData: any = {
        name: currentItem.placeName || currentItem.csvData.title,
        address: currentItem.placeAddress || currentItem.csvData.address || '',
        city: city || 'Tokyo', // Fallback to Tokyo
        neighborhood: neighborhood || currentItem.csvData.neighborhood || null,
        country: 'Japan',
        location: `POINT(${longitude} ${latitude})`, // PostGIS format
        main_category: mainCategory, // Use snake_case for DB
        categories: subCategories, // Sub-categories go here
        description: customDescription || currentItem.enhancedData?.description || null,
        photos: [], // Will be populated after photo migration
        website: currentItem.placeDetails?.website || currentItem.csvData.website || null,
        instagram: currentItem.enhancedData?.instagram || currentItem.csvData.instagram || null,
        hours: currentItem.placeDetails?.hours || null,
        verified: false,
        google_place_id: currentItem.placeId || null, // Add as extra field
      };

      // Insert store
      const { data: store, error: insertError } = await supabase
        .from('stores')
        .insert([storeData])
        .select()
        .single();

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      console.log(`✅ Store inserted with ID: ${store.id}`);

      // Migrate photos - always try if we have a placeId (serverless function fetches from Google directly)
      if (currentItem.placeId) {
        console.log(`📸 Fetching photos from Google for place: ${currentItem.placeId}...`);

        try {
          const photoUrls = await migrateStorePhotosViaEdge(
            store.id,
            currentItem.placeId,
            false // Not a dry run
          );

          if (photoUrls.length > 0) {
            // Update store with photo URLs
            await supabase
              .from('stores')
              .update({ photos: photoUrls })
              .eq('id', store.id);

            console.log(`✅ Photos uploaded: ${photoUrls.length} URLs`);
          } else {
            console.log('ℹ️ No photos found for this place');
          }
        } catch (photoError) {
          console.error('⚠️ Photo fetch failed (continuing anyway):', photoError);
        }
      }

      // Mark as completed
      onUpdateItem(currentIndex, { status: 'completed' });

      // Move to next (with delay to avoid API rate limits)
      setTimeout(() => onMoveToNext(), 3000); // 3 second delay between items
    } catch (error) {
      console.error('❌ Save failed:', error);
      onMarkFailed(currentIndex, error instanceof Error ? error.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Extract city from formatted address
   */
  const extractCity = (address: string): string => {
    // Japanese addresses format: "Country, 〒Postal Code City, Ward/Area, Street"
    const parts = address.split(',');

    // Look for major cities
    const majorCities = ['Tokyo', 'Osaka', 'Kyoto', 'Fukuoka', 'Nagoya', 'Sapporo', 'Yokohama'];

    for (const part of parts) {
      for (const city of majorCities) {
        if (part.includes(city)) {
          return city;
        }
      }
    }

    // Fallback: return second part (usually city)
    return parts[1]?.trim() || 'Tokyo';
  };

  /**
   * Extract neighborhood from formatted address
   */
  const extractNeighborhood = (address: string): string | undefined => {
    // Try to extract ward/neighborhood from address
    const parts = address.split(',');

    // Third part is usually ward/neighborhood
    if (parts.length >= 3) {
      const neighborhood = parts[2].trim();
      // Clean up postal codes and extra text
      return neighborhood.replace(/〒\d+-\d+\s*/g, '').trim();
    }

    return undefined;
  };

  // Render current item
  if (!currentItem) {
    return (
      <div className="text-center py-12 text-gray-500">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h3 className="text-xl font-semibold text-gray-900">All done!</h3>
        <p className="mt-2">All stores have been processed.</p>
      </div>
    );
  }

  // Show loading state while processing
  if (currentItem.status === 'searching' || currentItem.status === 'enhancing') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-lg text-gray-700">
          {currentItem.status === 'searching' ? 'Searching for Place ID...' : 'Enhancing with AI...'}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {currentItem.csvData.title}
        </p>
      </div>
    );
  }

  // Show error state - but still show approval card so manual Place ID can be entered
  // (The approval card will show the error and manual input section)

  // Show duplicate state
  if (currentItem.status === 'duplicate') {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-900">
              Duplicate: {currentItem.csvData.title}
            </h3>
            <p className="text-yellow-700 mt-2">
              This store already exists in the database.
            </p>
            <p className="text-sm text-yellow-600 mt-1">
              Auto-skipping in a moment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Handle manual Place ID retry
   */
  const handleRetryWithPlaceId = async (placeId: string) => {
    console.log(`🔄 Retrying with manual Place ID: ${placeId}`);

    try {
      // Update item with new Place ID
      onUpdateItem(currentIndex, {
        placeId,
        status: 'searching',
        error: undefined,
      });

      // Fetch place details with the manual Place ID
      const placeDetails = await fetchPlaceDetails(placeId);

      onUpdateItem(currentIndex, {
        placeDetails,
        placeName: placeDetails.name,
        placeAddress: placeDetails.address,
        status: 'enhancing',
      });

      // Run AI enhancement with category detection
      const category = detectCategoryFromTypes(placeDetails.types || []);
      const enhanced = await enhancePlaceDetailsWithAI(placeDetails, category);

      onUpdateItem(currentIndex, {
        enhancedData: enhanced,
        status: 'ready',
      });

      console.log(`✅ Manual Place ID fetch successful`);
    } catch (error) {
      console.error(`❌ Manual Place ID fetch failed:`, error);
      onMarkFailed(currentIndex, error instanceof Error ? error.message : 'Manual fetch failed');
    }
  };

  // Show approval card
  return (
    <BulkImportApprovalCard
      item={currentItem}
      onApprove={handleApprove}
      onSkip={() => onSkip(currentIndex)}
      onMarkForReview={() => onMarkFailed(currentIndex, 'Marked for manual review')}
      onRetryWithPlaceId={handleRetryWithPlaceId}
      isProcessing={isSaving}
    />
  );
}
