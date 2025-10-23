import { useState } from 'react';
import { MapPin, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Store } from '../../types/store';

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  hours?: string;
  website?: string;
  phone?: string;
  phoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  photos?: Array<{ name: string }>;
  reviews?: Array<{ text: { text: string } }>;
  types?: string[];
  priceLevel?: string;
  editorialSummary?: string;
}

interface FetchPlaceIdButtonProps {
  store: Store;
  onSuccess?: (placeId: string, placeDetails?: PlaceDetails) => void;
}

interface PlaceOption {
  id: string;
  name: string;
  address: string;
  types: string[];
}

export function FetchPlaceIdButton({ store, onSuccess }: FetchPlaceIdButtonProps) {
  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [placeOptions, setPlaceOptions] = useState<PlaceOption[]>([]);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const extractPlaceIdFromUrl = (url: string): string | null => {
    // Extract from various Google Maps URL formats
    // Format 1: /place/Store+Name/data=...!1s0xChIJabc123...
    const dataMatch = url.match(/!1s(ChIJ[a-zA-Z0-9_-]+)/);
    if (dataMatch) return dataMatch[1];

    // Format 2: place_id=ChIJabc123
    const paramMatch = url.match(/place_id=([a-zA-Z0-9_-]+)/);
    if (paramMatch) return paramMatch[1];

    // Format 3: Direct ChIJ... format
    if (url.match(/^ChIJ[a-zA-Z0-9_-]+$/)) return url;

    return null;
  };

  const handleManualSubmit = async () => {
    const placeId = extractPlaceIdFromUrl(manualInput.trim());

    if (!placeId) {
      setResult({
        success: false,
        message: 'Could not extract Place ID from input. Please paste a Google Maps URL or Place ID starting with "ChIJ..."',
      });
      return;
    }

    await savePlaceId(placeId, `Manual: ${placeId.substring(0, 12)}...`);
    setManualInput('');
    setShowManualInput(false);
  };

  const fetchFullPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
      const url = `https://places.googleapis.com/v1/places/${placeId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,editorialSummary,regularOpeningHours,websiteUri,internationalPhoneNumber,rating,userRatingCount,photos,reviews,types,priceLevel',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch place details:', response.status);
        return null;
      }

      const data = await response.json();

      // Format opening hours
      let hoursText = '';
      if (data.regularOpeningHours?.weekdayDescriptions) {
        hoursText = data.regularOpeningHours.weekdayDescriptions.join('\n');
      }

      return {
        placeId: data.id,
        name: data.displayName?.text || '',
        address: data.formattedAddress || '',
        latitude: data.location?.latitude || 0,
        longitude: data.location?.longitude || 0,
        description: data.editorialSummary?.text || '',
        hours: hoursText,
        website: data.websiteUri || '',
        phoneNumber: data.internationalPhoneNumber || '',
        rating: data.rating,
        userRatingCount: data.userRatingCount,
        photos: data.photos || [],
        reviews: data.reviews || [],
        types: data.types || [],
        priceLevel: data.priceLevel,
        editorialSummary: data.editorialSummary?.text || '',
      };
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  };

  const savePlaceId = async (placeId: string, placeName: string) => {
    try {
      setFetching(true);
      setResult({
        success: false,
        message: '⏳ Fetching full place details...',
      });

      // Fetch full place details
      const placeDetails = await fetchFullPlaceDetails(placeId);

      // Save to database
      const { error } = await supabase
        .from('stores')
        .update({ google_place_id: placeId })
        .eq('id', store.id);

      if (error) throw error;

      setResult({
        success: true,
        message: placeDetails
          ? `✓ Saved "${placeName}" with full details! ${placeDetails.photos?.length || 0} photos available.`
          : `✓ Saved "${placeName}"! You can now fetch photos.`,
      });

      setPlaceOptions([]); // Clear options

      if (onSuccess) {
        onSuccess(placeId, placeDetails || undefined);
      }
    } catch (error) {
      console.error('Error saving Place ID:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save Place ID',
      });
    } finally {
      setFetching(false);
    }
  };

  const handleFetchPlaceId = async () => {
    setFetching(true);
    setResult(null);
    setPlaceOptions([]);

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

      // Use Text Search to find the place
      const searchUrl = 'https://places.googleapis.com/v1/places:searchText';

      // Build a more specific search query with city for better accuracy
      const searchQuery = `${store.name} ${store.city}`;

      const searchResponse = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.types',
        },
        body: JSON.stringify({
          textQuery: searchQuery,
          locationBias: {
            circle: {
              center: {
                latitude: store.latitude,
                longitude: store.longitude,
              },
              radius: 100.0, // 100 meters radius (more precise)
            },
          },
        }),
      });

      if (!searchResponse.ok) {
        throw new Error(`Google API error: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();

      if (!searchData.places || searchData.places.length === 0) {
        setResult({
          success: false,
          message: 'Could not find this store on Google Maps. Try the manual option below.',
        });
        setShowManualInput(true);
        return;
      }

      // Filter and categorize results
      const CLOTHING_TYPES = ['clothing_store', 'shoe_store', 'store', 'shopping_mall', 'department_store'];
      const BAD_TYPES = ['restaurant', 'cafe', 'bar', 'food'];

      const allPlaces = searchData.places.map((p: any) => ({
        id: p.id,
        name: p.displayName?.text || 'Unknown',
        address: p.formattedAddress || 'No address',
        types: p.types || [],
        isClothingRelated: p.types?.some((t: string) => CLOTHING_TYPES.includes(t)),
        isBadMatch: p.types?.some((t: string) => BAD_TYPES.includes(t))
      }));

      // Prioritize clothing-related places, exclude bad matches
      const goodMatches = allPlaces.filter((p: any) => !p.isBadMatch);
      const clothingMatches = goodMatches.filter((p: any) => p.isClothingRelated);

      console.log('All results:', allPlaces.length, '| Good matches:', goodMatches.length, '| Clothing matches:', clothingMatches.length);
      console.log('Results:', goodMatches);

      // Show clothing matches first, then other good matches
      const placesToShow = clothingMatches.length > 0
        ? clothingMatches.slice(0, 5)
        : goodMatches.slice(0, 5);

      if (placesToShow.length === 0) {
        setResult({
          success: false,
          message: 'Only found restaurants/cafes. Try the manual option below.',
        });
        setShowManualInput(true);
        return;
      }

      // Always show options if we have results (even if just 1)
      setPlaceOptions(placesToShow);
      setResult({
        success: false,
        message: `Found ${placesToShow.length} result${placesToShow.length > 1 ? 's' : ''}. ${clothingMatches.length > 0 ? 'Clothing stores shown first.' : 'No clothing stores found - showing other matches.'}`,
      });
      setFetching(false);
    } catch (error) {
      console.error('Error fetching Place ID:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch Place ID',
      });
    } finally {
      setFetching(false);
    }
  };

  // Don't show button if store already has Place ID
  if (store.google_place_id) {
    return (
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-green-800">
          <CheckCircle className="w-4 h-4" />
          <span>Google Place ID: <code className="text-xs bg-green-100 px-2 py-1 rounded">{store.google_place_id}</code></span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start gap-3 mb-3">
        <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">Fetch Google Place ID</h4>
          <p className="text-sm text-gray-600 mt-1">
            Get the Google Place ID for <strong>{store.name}</strong> to enable photo fetching.
          </p>
        </div>
      </div>

      {result && (
        <div
          className={`mb-3 p-3 rounded-lg border ${
            result.success
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <div className="flex items-start gap-2">
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
            )}
            <p
              className={`text-sm ${
                result.success ? 'text-green-800' : 'text-yellow-800'
              }`}
            >
              {result.message}
            </p>
          </div>
        </div>
      )}

      {/* Show place options if multiple results */}
      {placeOptions.length > 0 && (
        <div className="mb-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Choose the correct place:</p>
            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              {showManualInput ? 'Hide manual input' : 'None of these? Enter manually'}
            </button>
          </div>
          {placeOptions.map((option, idx) => (
            <button
              key={option.id}
              type="button"
              onClick={() => savePlaceId(option.id, option.name)}
              disabled={fetching}
              className="w-full p-3 text-left border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="font-medium text-gray-900">{option.name}</div>
              <div className="text-sm text-gray-600 mt-1">{option.address}</div>
              <div className="text-xs text-gray-500 mt-1">
                {option.types.slice(0, 3).join(', ')}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Manual Place ID input */}
      {showManualInput && (
        <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Enter Google Maps URL or Place ID:</p>
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="https://maps.app.goo.gl/... or ChIJabc123..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleManualSubmit}
            disabled={!manualInput.trim()}
            className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Save Place ID
          </button>
          <p className="text-xs text-gray-600 mt-2">
            💡 Open the store on Google Maps, copy the URL from your browser, and paste it here.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleFetchPlaceId}
          disabled={fetching}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {fetching ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              Auto-Search
            </>
          )}
        </button>

        {!showManualInput && placeOptions.length === 0 && (
          <button
            type="button"
            onClick={() => setShowManualInput(true)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Manual Input
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-600">
        💡 Auto-search will find "{store.name}" on Google Maps. Use manual input if it can't find the right place.
      </p>
    </div>
  );
}
