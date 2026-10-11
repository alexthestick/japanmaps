/**
 * Legacy Google Maps helpers. Photo extraction is disabled.
 */

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

/**
 * Extract Place ID from various Google Maps URL formats
 */
export function extractPlaceIdFromUrl(url: string): string | null {
  // Format 1: maps.app.goo.gl short URLs - extract from redirect
  if (url.includes('maps.app.goo.gl') || url.includes('goo.gl')) {
    // We'll need to follow the redirect to get the real URL
    return 'REDIRECT_NEEDED';
  }

  // Format 2: Direct place_id parameter
  const placeIdMatch = url.match(/place_id=([^&]+)/);
  if (placeIdMatch) return placeIdMatch[1];

  // Format 3: Hex coordinate format in data attribute (most common)
  // Example: !1s0x60188fab2114db81:0x857f107efefab057
  const hexMatch = url.match(/!1s(0x[a-f0-9]+:0x[a-f0-9]+)/i);
  if (hexMatch) return hexMatch[1];

  // Format 4: From the URL path
  const pathMatch = url.match(/\/place\/[^\/]+\/@([^\/,]+)/);
  if (pathMatch) return pathMatch[1];

  return null;
}

/**
 * Fetch place details from Google Places API
 */
export async function fetchPlaceDetails(placeId: string): Promise<any> {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error('Google Places API key not configured. Add VITE_GOOGLE_PLACES_API_KEY to .env.local');
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,opening_hours,website&key=${GOOGLE_PLACES_API_KEY}`,
    {
      mode: 'cors',
    }
  );

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Google API error: ${data.status}`);
  }

  return data.result;
}

/**
 * Main function: Extract photo URLs from Google Maps URL
 */
export async function extractPhotoUrlsFromMapsUrl(googleMapsUrl: string): Promise<string[]> {
  void googleMapsUrl;
  throw new Error('Google photo URLs cannot be imported or stored.');
}

/**
 * Extract photo URLs directly from the page source
 * This is a simpler approach that works client-side
 */
export function extractPhotoUrlsFromPageSource(htmlContent: string): string[] {
  void htmlContent;
  throw new Error('Google photo URLs cannot be imported or stored.');
}

/**
 * Convert photo reference to direct googleusercontent URL
 * This works for API photo references
 */
export function convertPhotoReferenceToDirectUrl(photoReference: string): string {
  void photoReference;
  throw new Error('Google photo references cannot be converted for storage.');
}
