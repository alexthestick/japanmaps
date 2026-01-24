import { useState } from 'react';
import { Sparkles, MapPin, AlertCircle, Download, Edit2, Loader, Image } from 'lucide-react';
import type { Store } from '../../types/store';
import { importStoreFromGoogle, extractCity, extractNeighborhood, detectMainCategory } from '../../utils/importStore';
import { fetchGooglePhotosServerless } from '../../utils/edgePhotoFetcher';

interface GoogleMapsStoreExtractorProps {
  onApplyData: (data: ExtractedStoreData) => void;
}

export interface ExtractedStoreData {
  name: string;
  address: string;
  city: string;
  neighborhood?: string;
  latitude: number;
  longitude: number;
  description: string;
  hours?: string;
  website?: string;
  priceRange?: string;
  categories?: string[];
  photoUrls?: string[];
  mainCategory?: string;
  instagram?: string;
  placeId?: string;
}

export function GoogleMapsStoreExtractor({ onApplyData }: GoogleMapsStoreExtractorProps) {
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedStoreData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photoProgress, setPhotoProgress] = useState<{ current: number; total: number } | null>(null);
  const [fetchPhotos, setFetchPhotos] = useState(true); // Toggle for fetching photos
  const [dryRun, setDryRun] = useState(false); // Dry run mode

  const handleExtract = async () => {
    if (!googleMapsUrl.trim()) {
      setError('Please enter a Google Maps URL or Place ID');
      return;
    }

    setLoading(true);
    setError(null);
    setExtractedData(null);

    try {
      // Step 1: Import store from serverless function
      console.log('🔄 Importing store via serverless function...');
      const importResult = await importStoreFromGoogle(googleMapsUrl);

      console.log('✅ Import result:', importResult);

      // Step 2: Fetch photos if enabled
      let photoUrls: string[] = [];
      if (fetchPhotos && importResult.photoCount > 0) {
        console.log(`📸 Fetching ${importResult.photoCount} photos...`);

        setPhotoProgress({ current: 0, total: Math.min(importResult.photoCount, 5) });

        const tempStoreId = `temp-${Date.now()}`;

        try {
          photoUrls = await fetchGooglePhotosServerless(
            importResult.placeId,
            tempStoreId,
            5 // Max 5 photos
          );

          console.log(`✅ Fetched ${photoUrls.length} photos`);
        } catch (photoError) {
          console.error('⚠️ Photo fetch failed:', photoError);
          // Continue without photos
        } finally {
          setPhotoProgress(null);
        }
      }

      // Step 3: Extract city and neighborhood from address
      const city = extractCity(importResult.address);
      const neighborhood = extractNeighborhood(importResult.address);
      const mainCategory = detectMainCategory(importResult.types);

      // Step 4: Build extracted data
      const data: ExtractedStoreData = {
        name: importResult.name,
        address: importResult.address,
        city,
        neighborhood,
        latitude: importResult.location.latitude,
        longitude: importResult.location.longitude,
        description: importResult.description,
        hours: importResult.hours,
        website: importResult.website,
        instagram: importResult.instagram,
        mainCategory,
        categories: importResult.suggestedCategories,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
        placeId: importResult.placeId,
      };

      setExtractedData(data);
      console.log('✅ Extracted data ready:', data);
    } catch (err: any) {
      console.error('Extraction error:', err);
      setError(err.message || 'Failed to extract store information. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (extractedData) {
      onApplyData(extractedData);
      setGoogleMapsUrl('');
      setExtractedData(null);
    }
  };

  const handleReset = () => {
    setGoogleMapsUrl('');
    setExtractedData(null);
    setError(null);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <div>
          <h3 className="text-lg font-bold text-gray-900">AI Store Info Extractor</h3>
          <p className="text-sm text-gray-600">Auto-fill store details from Google Maps</p>
        </div>
      </div>

      {!extractedData ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Maps URL or Place ID
            </label>
            <input
              type="text"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="https://maps.app.goo.gl/... OR ChIJN1t_tDeuEmsRUsoyG83frY4"
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono"
              disabled={loading}
            />
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-600">
                💡 <strong>Option 1:</strong> Paste any Google Maps link (e.g., https://maps.app.goo.gl/...)
              </p>
              <p className="text-xs text-gray-600">
                💡 <strong>Option 2:</strong> Paste the Place ID directly (e.g., ChIJN1t_tDeuEmsRUsoyG83frY4)
              </p>
              <p className="text-xs text-purple-600 font-medium">
                ✨ Place IDs are more accurate! Find them in the URL or use Google's Place ID Finder.
              </p>
            </div>
          </div>

          {/* Photo Fetching Options */}
          <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-purple-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={fetchPhotos}
                onChange={(e) => setFetchPhotos(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                disabled={loading}
              />
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Image className="w-4 h-4" />
                Auto-fetch photos (5 per store)
              </span>
            </label>

            {fetchPhotos && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  disabled={loading}
                />
                <span className="text-sm font-medium text-orange-700">
                  🧪 Dry Run (test mode)
                </span>
              </label>
            )}
          </div>

          {dryRun && fetchPhotos && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs text-orange-800">
                <strong>Dry Run Mode:</strong> Photos will be validated but NOT uploaded to Supabase. Use this to test before importing all stores.
              </p>
            </div>
          )}

          {photoProgress && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Fetching photos: {photoProgress.current}/{photoProgress.total}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={loading || !googleMapsUrl.trim()}
            className="w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Extracting Store Info...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Extract Store Info
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Extraction Failed</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-5 border-2 border-purple-200 space-y-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                Extracted Information (editable)
              </h4>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                value={extractedData.name}
                onChange={(e) => setExtractedData({ ...extractedData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={extractedData.address}
                onChange={(e) => setExtractedData({ ...extractedData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={extractedData.latitude}
                  onChange={(e) => setExtractedData({ ...extractedData, latitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={extractedData.longitude}
                  onChange={(e) => setExtractedData({ ...extractedData, longitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                />
              </div>
            </div>

            {/* AI Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Sparkles className="w-3 h-3 inline mr-1 text-purple-600" />
                AI-Generated Description
                <span className="ml-2 text-xs text-purple-600 font-normal">✨ Powered by Gemini AI</span>
              </label>
              <textarea
                value={extractedData.description}
                onChange={(e) => setExtractedData({ ...extractedData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {/* Hours */}
            {extractedData.hours && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hours</label>
                <input
                  type="text"
                  value={extractedData.hours}
                  onChange={(e) => setExtractedData({ ...extractedData, hours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            )}

            {/* Website */}
            {extractedData.website && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={extractedData.website}
                  onChange={(e) => setExtractedData({ ...extractedData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleApply}
              className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Apply to Form
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Extract place name from Google Maps URL
 * Example: /place/American+Graffiti/@ -> "American Graffiti"
 */
function extractPlaceNameFromUrl(url: string): string | null {
  const match = url.match(/\/place\/([^/@]+)/);
  if (match) {
    // Decode URL encoding and replace + with spaces
    const name = decodeURIComponent(match[1]).replace(/\+/g, ' ');
    return name;
  }
  return null;
}

/**
 * Extract coordinates from Google Maps URL
 */
function extractCoordsFromUrl(url: string): { lat: number; lng: number } | null {
  // Look for @LAT,LNG pattern
  const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) {
    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2])
    };
  }
  return null;
}

/**
 * Search for a place by name using Text Search API
 */
async function searchPlaceByName(name: string, coords: { lat: number; lng: number } | null): Promise<any[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    throw new Error('Google Places API key not configured.');
  }

  const url = 'https://places.googleapis.com/v1/places:searchText';

  const body: any = {
    textQuery: name,
    languageCode: 'en'
  };

  // If we have coordinates, use them to bias the search
  if (coords) {
    body.locationBias = {
      circle: {
        center: {
          latitude: coords.lat,
          longitude: coords.lng
        },
        radius: 500.0 // 500 meters
      }
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Text Search API Error:', errorData);
    throw new Error(`Failed to search for place: ${response.statusText}`);
  }

  const data = await response.json();
  return data.places || [];
}

/**
 * Fetch place details using the NEW Places API
 * This API supports CORS and can be called from the browser
 */
async function fetchPlaceDetailsNew(placeId: string): Promise<any> {
  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    throw new Error('Google Places API key not configured. Add VITE_GOOGLE_PLACES_API_KEY to .env.local');
  }

  // Use the NEW Places API which supports CORS
  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'displayName,formattedAddress,location,websiteUri,regularOpeningHours,priceLevel,types,rating,userRatingCount,editorialSummary,reviews,photos'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('API Error:', errorData);

    if (response.status === 403) {
      throw new Error('API key error. Make sure "Places API (New)" is enabled in Google Cloud Console.');
    }

    throw new Error(`Failed to fetch place details: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Detect category from Google place types
 */
function detectCategoryFromTypes(types: string[]): 'Fashion' | 'Food' | 'Coffee' {
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

  // Default to Fashion (original behavior)
  return 'Fashion';
}

/**
 * Generate AI description using Google Gemini
 * Uses AI to analyze reviews and create natural, engaging descriptions
 */
async function generateDescriptionFromReviews(placeDetails: any): Promise<string> {
  const name = placeDetails.displayName?.text || 'This store';
  const address = placeDetails.formattedAddress || '';
  const rating = placeDetails.rating;
  const ratingCount = placeDetails.userRatingCount;
  const types = placeDetails.types || [];
  const reviews = placeDetails.reviews || [];
  const editorialSummary = placeDetails.editorialSummary?.text || '';

  // Detect category from place types
  const category = detectCategoryFromTypes(types);

  // Get Gemini API key
  const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    console.warn('Gemini API key not configured, using fallback description');
    return generateFallbackDescription(placeDetails);
  }

  try {
    console.log('🤖 Using Gemini AI to generate description...');
    console.log('Reviews found:', reviews.length);

    // Prepare review excerpts (top 5 reviews)
    const reviewTexts = reviews
      .filter((r: any) => r.text?.text)
      .slice(0, 5)
      .map((r: any, idx: number) => `Review ${idx + 1}: "${r.text.text}"`)
      .join('\n\n');

    console.log('Review texts to analyze:', reviewTexts.substring(0, 200) + '...');

    // Build prompt based on detected category
    const isFashion = category === 'Fashion';
    const isCoffee = category === 'Coffee';

    const fashionPrompt = `You are writing a detailed description for a Japan clothing/fashion store map website.

Store Information:
- Name: ${name}
- Location: ${address}
- Rating: ${rating}/5 (${ratingCount} reviews)
- Type: ${types.join(', ')}
${editorialSummary ? `- Google Summary: ${editorialSummary}` : ''}

Customer Reviews:
${reviewTexts || 'No reviews available'}

Task: Write a comprehensive single-paragraph description (4-6 sentences) for this store that includes:

1. **Introduction**: Start with the store name and its location/neighborhood context
2. **What they sell**: Specific items, brands, or types of clothing/fashion available (e.g., "vintage streetwear", "curated designer pieces", "sneakers and accessories")
3. **Unique characteristics**: What makes this store special based on reviews (atmosphere, curation style, shopping experience, expertise, etc.)
4. **Appeal**: Why customers love it and what type of shopper it attracts

Write in a flowing, informative style similar to Google AI summaries - detailed but readable in one paragraph. Focus on concrete details from the reviews about the merchandise, atmosphere, and shopping experience.

Example style: "Ann's, a curated used and vintage clothing store located in the upscale Minamiaoyama district of Tokyo, operates out of a third-floor apartment. The inventory is carefully selected and regularly rotated, comprising a diverse mix of pre-owned apparel and accessories, from brand-name vintage to rediscovered one-of-a-kind pieces..."

Write ONLY the description paragraph, nothing else.`;

    const foodPrompt = `You are writing a detailed description for a Japan food/coffee/restaurant map website.

Store Information:
- Name: ${name}
- Location: ${address}
- Rating: ${rating}/5 (${ratingCount} reviews)
- Type: ${types.join(', ')}
${editorialSummary ? `- Google Summary: ${editorialSummary}` : ''}

Customer Reviews:
${reviewTexts || 'No reviews available'}

Task: Write a comprehensive single-paragraph description (4-6 sentences) for this establishment that includes:

1. **Introduction**: Start with the establishment name and its location/neighborhood context
2. **What they serve**: Specific dishes, drinks, cuisine type, or specialty items available (e.g., "artisan coffee and pastries", "traditional ramen", "seasonal Japanese cuisine", "craft cocktails and small plates")
3. **Unique characteristics**: What makes this place special based on reviews (atmosphere, quality, ingredients, preparation style, interior design, service, etc.)
4. **Appeal**: Why customers love it and what type of diner/coffee-lover it attracts

Write in a flowing, informative style similar to Google AI summaries - detailed but readable in one paragraph. Focus on concrete details from the reviews about the food/drinks, atmosphere, and dining experience.

Example style: "Bread, Espresso & in Omotesando is a minimalist café known for its exceptional coffee and freshly baked breads. The space features a sleek industrial design with an open kitchen, allowing guests to watch bakers at work. Their signature items include sourdough loaves and specialty espresso drinks made with carefully sourced beans. The café attracts both locals seeking quality breakfast items and tourists drawn to its refined aesthetic and consistent quality..."

Write ONLY the description paragraph, nothing else.`;

    const prompt = isFashion ? fashionPrompt : foodPrompt;

    // Call Gemini API - using gemini-2.0-flash (current stable model as of 2025)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      return generateFallbackDescription(placeDetails);
    }

    const data = await response.json();
    const description = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (description) {
      console.log('✅ Gemini AI description generated successfully!');
      console.log('Description:', description);
      return description;
    }

    console.warn('⚠️ No description returned from Gemini, using fallback');
    return generateFallbackDescription(placeDetails);
  } catch (error) {
    console.error('❌ Error generating AI description:', error);
    return generateFallbackDescription(placeDetails);
  }
}

/**
 * Fallback description when AI is unavailable
 */
function generateFallbackDescription(placeDetails: any): string {
  const name = placeDetails.displayName?.text || 'This store';
  const address = placeDetails.formattedAddress || '';
  const rating = placeDetails.rating;
  const ratingCount = placeDetails.userRatingCount;

  const addressParts = address.split(',');
  const neighborhood = addressParts[0]?.trim() || '';

  let description = `${name} is located in ${neighborhood}, Tokyo. `;

  if (rating && ratingCount) {
    description += `With a ${rating}/5 rating from ${ratingCount} reviews, it's a popular destination for fashion enthusiasts. `;
  }

  description += 'Visit this store to explore their curated selection of clothing and accessories.';

  return description;
}

/**
 * Format opening hours
 */
function formatHours(openingHours: any): string | undefined {
  if (!openingHours?.weekdayDescriptions) return undefined;

  // Return simplified format (could be enhanced)
  return openingHours.weekdayDescriptions[0]?.replace(/^[^:]+:\s*/, '') || undefined;
}

/**
 * Convert price level to our format
 */
function convertPriceLevel(priceLevel: string | undefined): string | undefined {
  if (!priceLevel) return undefined;

  const map: { [key: string]: string } = {
    'PRICE_LEVEL_INEXPENSIVE': '$',
    'PRICE_LEVEL_MODERATE': '$$',
    'PRICE_LEVEL_EXPENSIVE': '$$$',
    'PRICE_LEVEL_VERY_EXPENSIVE': '$$$$',
  };

  return map[priceLevel];
}
