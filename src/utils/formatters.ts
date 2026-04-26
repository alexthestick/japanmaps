export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatInstagramHandle(handle: string): string {
  return handle.startsWith('@') ? handle : `@${handle}`;
}

/**
 * Returns the best maps URL for the current platform.
 *
 * On iOS (iPhone / iPad):
 *   maps.apple.com links are intercepted by the OS and open Apple Maps
 *   natively — no app-detection or custom URL scheme needed.
 *
 * On Android / desktop:
 *   Falls back to Google Maps web, which also deep-links into the Android
 *   Google Maps app when available.
 *
 * Accepts either:
 *   getGoogleMapsUrl("Omotesando, Tokyo")          — text address
 *   getGoogleMapsUrl(35.6681, 139.7047, "Store")   — lat, lng, optional label
 */
export function getGoogleMapsUrl(
  addressOrLat: string | number,
  lngOrUndefined?: number,
  label?: string,
): string {
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

  // ── Coordinate form ────────────────────────────────────────────────────────
  if (typeof addressOrLat === 'number' && typeof lngOrUndefined === 'number') {
    const lat = addressOrLat;
    const lng = lngOrUndefined;
    if (isIOS) {
      const q = label ? encodeURIComponent(label) : '';
      return `https://maps.apple.com/?ll=${lat},${lng}${q ? `&q=${q}` : ''}`;
    }
    return `https://www.google.com/maps/?q=${lat},${lng}`;
  }

  // ── Address-string form ────────────────────────────────────────────────────
  const query = encodeURIComponent(addressOrLat as string);
  if (isIOS) {
    return `https://maps.apple.com/?q=${query}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function getDistanceFromLatLon(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}


