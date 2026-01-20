import type { Store } from '../types/store';

/**
 * Helper to parse PostGIS geography data from Supabase
 * Converts the geography object to latitude/longitude coordinates
 */
export function parseLocation(location: any): { latitude: number; longitude: number } {
  if (typeof location === 'string') {
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

  // Fallback
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


