import { supabase } from '../lib/supabase';
import { LOCATIONS, MAJOR_CITIES_JAPAN } from '../lib/constants';

interface NeighborhoodCount {
  city: string;
  neighborhood: string | null;
  count: number;
}

/**
 * Get store counts for all neighborhoods and cities
 * Returns a map of "City-Neighborhood" -> count
 */
export async function getNeighborhoodStoreCounts(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  try {
    // Fetch all stores with their city and neighborhood
    const { data: stores, error } = await supabase
      .from('stores')
      .select('city, neighborhood');

    if (error) {
      console.error('Error fetching store counts:', error);
      return counts;
    }

    if (!stores) return counts;

    // Count stores per city-neighborhood combination
    const cityNeighborhoodCounts: Record<string, number> = {};
    const cityCounts: Record<string, number> = {};

    stores.forEach((store) => {
      const city = store.city;
      const neighborhood = store.neighborhood;

      // Count by city
      cityCounts[city] = (cityCounts[city] || 0) + 1;

      // Count by city-neighborhood if neighborhood exists
      if (neighborhood) {
        const key = `${city}-${neighborhood}`;
        cityNeighborhoodCounts[key] = (cityNeighborhoodCounts[key] || 0) + 1;
      }
    });

    // Build the map
    // First add all neighborhoods from LOCATIONS
    Object.entries(LOCATIONS).forEach(([city, neighborhoods]) => {
      if (neighborhoods.length > 0) {
        neighborhoods.forEach((neighborhood) => {
          const key = `${city}-${neighborhood}`;
          counts.set(key, cityNeighborhoodCounts[key] || 0);
        });
      }
    });

    // Then add city-level counts for cities without neighborhoods
    MAJOR_CITIES_JAPAN.forEach((city) => {
      // If city has no neighborhoods in LOCATIONS, use city count
      const cityStr = city as string;
      if (!LOCATIONS[cityStr] || LOCATIONS[cityStr].length === 0) {
        counts.set(cityStr, cityCounts[cityStr] || 0);
      }
    });

    return counts;
  } catch (error) {
    console.error('Error in getNeighborhoodStoreCounts:', error);
    return counts;
  }
}

/**
 * Get list of all unique neighborhoods that have stores
 * Useful for admin dashboard
 */
export async function getAllNeighborhoodsWithStores(): Promise<NeighborhoodCount[]> {
  try {
    const { data: stores, error } = await supabase
      .from('stores')
      .select('city, neighborhood');

    if (error || !stores) {
      console.error('Error fetching neighborhoods:', error);
      return [];
    }

    // Build a map to count occurrences
    const countMap = new Map<string, NeighborhoodCount>();

    stores.forEach((store) => {
      const key = store.neighborhood
        ? `${store.city}-${store.neighborhood}`
        : store.city;

      if (countMap.has(key)) {
        const existing = countMap.get(key)!;
        existing.count++;
      } else {
        countMap.set(key, {
          city: store.city,
          neighborhood: store.neighborhood || null,
          count: 1,
        });
      }
    });

    // Convert to array and sort by city, then neighborhood
    return Array.from(countMap.values()).sort((a, b) => {
      if (a.city !== b.city) {
        return a.city.localeCompare(b.city);
      }
      const aNeighborhood = a.neighborhood || '';
      const bNeighborhood = b.neighborhood || '';
      return aNeighborhood.localeCompare(bNeighborhood);
    });
  } catch (error) {
    console.error('Error in getAllNeighborhoodsWithStores:', error);
    return [];
  }
}
