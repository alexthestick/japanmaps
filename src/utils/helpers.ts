import type { Store } from '../types/store';

/**
 * Parse PostGIS geography data returned by Supabase into lat/lng.
 *
 * Supabase returns PostGIS geography columns in EWKB hex format when you do
 * a plain SELECT * (e.g. "0101000020E6100000..."). This is different from
 * the WKT text format ("POINT(lng lat)") that the old parser expected.
 *
 * The get_stores_with_coordinates RPC avoids this by using ST_Y/ST_X, which
 * is why the main map works fine. The store detail page does a direct SELECT *
 * which hits this function — previously it always fell through to {0, 0}.
 *
 * This function now handles three formats:
 *   1. EWKB hex  — what Supabase actually returns for geography columns
 *   2. WKT text  — "POINT(longitude latitude)"
 *   3. GeoJSON   — { coordinates: [longitude, latitude] }
 */
export function parseLocation(location: any): { latitude: number; longitude: number } {
  if (!location) return { latitude: 0, longitude: 0 };

  if (typeof location === 'string') {
    // ── Format 1: EWKB hex ────────────────────────────────────────────────
    // Supabase JS (PostgREST REST API) returns geography columns as EWKB hex
    // with a leading \x prefix: "\x0101000020E6100000..."
    // Direct SQL (via MCP/psql) returns without prefix: "0101000020E6..."
    // Strip the prefix if present so the parser handles both.
    //
    // Structure (little-endian example):
    //   01          — byte order (01 = little-endian)
    //   01000020    — geometry type (Point) with SRID flag (0x20000000)
    //   E6100000    — SRID value (4326 for WGS84 = 0x10E6 little-endian)
    //   <8 bytes>   — longitude (float64)
    //   <8 bytes>   — latitude  (float64)
    //
    // Minimum length: 1+4+8+8 = 21 bytes = 42 hex chars (no SRID)
    //                 1+4+4+8+8 = 25 bytes = 50 hex chars (with SRID)
    const ewkb = location.startsWith('\\x') ? location.slice(2) : location;
    if (/^[0-9a-fA-F]+$/.test(ewkb) && ewkb.length >= 42) {
      try {
        const bytes = new Uint8Array(
          ewkb.match(/.{2}/g)!.map((b: string) => parseInt(b, 16))
        );
        const view = new DataView(bytes.buffer);
        const littleEndian = bytes[0] === 1;
        const typeInt = view.getUint32(1, littleEndian);
        // Bit 29 (0x20000000) signals that a 4-byte SRID follows the type
        const hasSRID = (typeInt & 0x20000000) !== 0;
        const coordOffset = hasSRID ? 9 : 5;
        const lng = view.getFloat64(coordOffset, littleEndian);
        const lat = view.getFloat64(coordOffset + 8, littleEndian);
        if (isFinite(lat) && isFinite(lng)) {
          return { longitude: lng, latitude: lat };
        }
      } catch {
        // Malformed hex — fall through to other formats
      }
    }

    // ── Format 2: WKT text ────────────────────────────────────────────────
    // "POINT(longitude latitude)"
    const matches = location.match(/POINT\(([^ ]+) ([^ ]+)\)/i);
    if (matches) {
      return {
        longitude: parseFloat(matches[1]),
        latitude: parseFloat(matches[2]),
      };
    }
  }

  // ── Format 3: GeoJSON object ──────────────────────────────────────────
  // { type: "Point", coordinates: [longitude, latitude] }
  if (location?.coordinates) {
    return {
      longitude: location.coordinates[0],
      latitude: location.coordinates[1],
    };
  }

  return { latitude: 0, longitude: 0 };
}

/**
 * Format location for insertion into Supabase
 */
export function formatLocationForDB(latitude: number, longitude: number): string {
  return `POINT(${longitude} ${latitude})`;
}

/**
 * Sort stores by various criteria
 */
export function sortStores(stores: Store[], sortBy: string): Store[] {
  const sorted = [...stores];

  switch (sortBy) {
    case 'random':
      // Fisher-Yates shuffle for truly random order
      for (let i = sorted.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
      }
      return sorted;
    case 'alphabetical':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'reverse-alphabetical':
      // MOBILE: Z-A sorting
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'city':
      return sorted.sort((a, b) => a.city.localeCompare(b.city));
    case 'recent':
    case 'newest':
      // Both desktop "recent" and mobile "newest" = sort by creation date descending
      return sorted.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'category':
      return sorted.sort((a, b) => a.categories[0].localeCompare(b.categories[0]));
    default:
      return sorted;
  }
}

/**
 * Throttle function - limits how often a function can be called
 * Ensures function executes at most once every `limit` milliseconds
 * Perfect for expensive operations like map position updates
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: any;

  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func.apply(this, args);

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }

    return lastResult;
  };
}


