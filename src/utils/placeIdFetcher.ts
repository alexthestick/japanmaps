/**
 * Fetch Place ID from Google Places API using store name
 * Used when CSV only contains URLs without Place IDs
 */

export interface PlaceIdSearchResult {
  placeId: string;
  name: string;
  address: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Search for a place and return top candidates
 * Reuses logic from FetchPlaceIdButton but with bias for exact matches
 */
export async function searchPlaceId(
  storeName: string,
  location?: string
): Promise<PlaceIdSearchResult[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    throw new Error('Google Places API key not configured');
  }

  try {
    // Build search query
    let query = storeName;
    if (location) {
      query += ` ${location}`;
    }
    query += ' Japan'; // Always add Japan bias

    console.log(`🔍 Searching Place ID for: "${query}"`);

    const response = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.types',
        },
        body: JSON.stringify({
          textQuery: query,
          languageCode: 'en',
          locationBias: {
            circle: {
              center: {
                latitude: 35.6762,
                longitude: 139.6503,
              },
              radius: 50000.0, // 50km radius around Tokyo (API max is 50000)
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Places API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const places = data.places || [];

    if (places.length === 0) {
      console.warn(`⚠️ No places found for "${storeName}"`);
      return [];
    }

    // Convert to results with confidence scoring
    const results: PlaceIdSearchResult[] = places.slice(0, 5).map((place: any) => {
      const placeId = place.id || '';
      const name = place.displayName?.text || '';
      const address = place.formattedAddress || '';

      // Calculate confidence based on name similarity
      const confidence = calculateConfidence(storeName, name);

      return { placeId, name, address, confidence };
    });

    console.log(`✅ Found ${results.length} candidates for "${storeName}"`);
    return results;
  } catch (error) {
    console.error(`❌ Error searching Place ID for "${storeName}":`, error);
    throw error;
  }
}

/**
 * Calculate confidence score based on name similarity
 */
function calculateConfidence(query: string, result: string): 'high' | 'medium' | 'low' {
  const queryLower = query.toLowerCase().trim();
  const resultLower = result.toLowerCase().trim();

  // Exact match
  if (queryLower === resultLower) {
    return 'high';
  }

  // Query contains result or vice versa
  if (queryLower.includes(resultLower) || resultLower.includes(queryLower)) {
    return 'high';
  }

  // Partial match (50% of characters)
  const matchCount = queryLower.split('').filter(char => resultLower.includes(char)).length;
  const matchPercentage = matchCount / queryLower.length;

  if (matchPercentage > 0.7) {
    return 'high';
  } else if (matchPercentage > 0.5) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Auto-select best match from search results
 * Returns null if confidence is too low
 */
export function autoSelectBestMatch(
  results: PlaceIdSearchResult[]
): PlaceIdSearchResult | null {
  if (results.length === 0) return null;

  // If first result is high confidence, return it
  const first = results[0];
  if (first.confidence === 'high') {
    return first;
  }

  // Otherwise, require manual selection
  return null;
}
