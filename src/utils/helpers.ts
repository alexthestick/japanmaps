import type { Store } from '../types/store';
import wkx from 'wkx';

/**
 * Helper to parse PostGIS geography data from Supabase
 * Converts the geography object to latitude/longitude coordinates
 */
export function parseLocation(location: any): { latitude: number; longitude: number } {
  // Handle text WKT format
  if (typeof location === 'string' && location.includes('POINT')) {
    // Format: "POINT(longitude latitude)"
    const matches = location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (matches) {
      return {
        longitude: parseFloat(matches[1]),
        latitude: parseFloat(matches[2]),
      };
    }
  }

  // Handle GeoJSON format
  if (location?.coordinates) {
    return {
      longitude: location.coordinates[0],
      latitude: location.coordinates[1],
    };
  }

  // Handle binary WKB format (hex string) from PostGIS
  // This is the default format returned by Supabase for geography/geometry columns
  if (typeof location === 'string' && /^[0-9A-Fa-f]+$/.test(location)) {
    try {
      // Convert hex string to Uint8Array (browser-compatible)
      const hexToBytes = (hex: string): Uint8Array => {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
          bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
        }
        return bytes;
      };

      const buffer = hexToBytes(location);
      const geometry = wkx.Geometry.parse(buffer);

      // Check if it's a Point geometry with valid coordinates
      if (geometry && 'x' in geometry && 'y' in geometry && geometry.x != null && geometry.y != null) {
        const coords = {
          longitude: geometry.x,
          latitude: geometry.y,
        };
        console.log('Successfully parsed WKB coordinates:', coords);
        return coords;
      }
    } catch (e) {
      console.error('Failed to parse WKB location data:', e);
    }
  }

  // Fallback
  console.warn('Could not parse location data:', location);
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
    case 'city':
      return sorted.sort((a, b) => a.city.localeCompare(b.city));
    case 'recent':
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


