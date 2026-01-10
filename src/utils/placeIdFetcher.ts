/**
 * Fetch Place ID from Google Places API using store name
 * Uses serverless function to bypass referrer restrictions
 */

export interface PlaceIdSearchResult {
  placeId: string;
  name: string;
  address: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Search for a place and return top candidates
 * Routes through serverless function to avoid referrer blocks
 */
export async function searchPlaceId(
  storeName: string,
  location?: string
): Promise<PlaceIdSearchResult[]> {
  try {
    // Build search query
    let query = storeName;
    if (location) {
      query += ` ${location}`;
    }
    query += ' Japan'; // Always add Japan bias

    console.log(`🔍 Searching Place ID for: "${query}"`);

    const response = await fetch('/api/search-place', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Places API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to search places');
    }

    const places = result.places || [];

    if (places.length === 0) {
      console.warn(`⚠️ No places found for "${storeName}"`);
      return [];
    }

    // Convert to results with confidence scoring
    const results: PlaceIdSearchResult[] = places.slice(0, 5).map((place: any) => {
      const placeId = place.placeId || '';
      const name = place.name || '';
      const address = place.address || '';

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
