/**
 * Extract photo URLs from Google Maps using Place Details API
 * Uses direct googleusercontent.com URLs that work without additional API calls
 */

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

interface GooglePhotoData {
  url: string;
  width: number;
  height: number;
}

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
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_PLACES_API_KEY}`,
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
  try {
    // Step 1: Handle shortened URLs by following redirects
    let fullUrl = googleMapsUrl;
    if (googleMapsUrl.includes('goo.gl')) {
      const response = await fetch(googleMapsUrl, { redirect: 'follow' });
      fullUrl = response.url;
    }

    // Step 2: Extract Place ID from URL
    const placeId = extractPlaceIdFromUrl(fullUrl);

    if (!placeId || placeId === 'REDIRECT_NEEDED') {
      throw new Error('Could not extract Place ID from URL. Try copying the full URL from your browser address bar.');
    }

    // Step 3: Fetch place details from Google API
    const placeDetails = await fetchPlaceDetails(placeId);

    // Step 4: Extract photo references and convert to direct URLs
    const photoUrls: string[] = [];

    if (placeDetails.photos && placeDetails.photos.length > 0) {
      placeDetails.photos.forEach((photo: any) => {
        // Convert photo reference to direct googleusercontent URL
        const photoReference = photo.photo_reference;
        const directUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
        photoUrls.push(directUrl);
      });
    }

    return photoUrls.slice(0, 20); // Max 20 photos
  } catch (error) {
    console.error('Error extracting photos:', error);
    throw error;
  }
}

/**
 * Extract photo URLs directly from the page source
 * This is a simpler approach that works client-side
 */
export function extractPhotoUrlsFromPageSource(htmlContent: string): string[] {
  const photoUrls: string[] = [];
  const uniqueUrls = new Set<string>();

  // Match all googleusercontent URLs
  const urlRegex = /https:\/\/lh[0-9]\.googleusercontent\.com\/p\/[A-Za-z0-9_-]+/g;
  const matches = htmlContent.match(urlRegex);

  if (matches) {
    matches.forEach(url => {
      // Add high-resolution parameter
      const highResUrl = url + '=w1600';
      uniqueUrls.add(highResUrl);
    });
  }

  return Array.from(uniqueUrls).slice(0, 20);
}

/**
 * Convert photo reference to direct googleusercontent URL
 * This works for API photo references
 */
export function convertPhotoReferenceToDirectUrl(photoReference: string): string {
  // If it's already a direct URL, return it
  if (photoReference.includes('googleusercontent.com')) {
    return photoReference;
  }

  // For now, we can't convert photo references without making an API call
  // Users will need to paste the direct URLs
  throw new Error('Cannot convert photo reference without API call. Please use direct image URLs from Google Maps.');
}
