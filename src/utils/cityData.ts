import { supabase } from '../lib/supabase';

export interface CityData {
  name: string;
  storeCount: number;
  image: string;
}

// City images from Unsplash
const CITY_IMAGES: Record<string, string> = {
  Tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
  Osaka: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&h=600&fit=crop',
  Kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop',
  Fukuoka: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
  Nagoya: 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=800&h=600&fit=crop',
  'Kanagawa / Yokohama': 'https://images.unsplash.com/photo-1571897039684-0e4ed2584617?w=800&h=600&fit=crop',
  Sapporo: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop',
  Hiroshima: 'https://images.unsplash.com/photo-1555899434-94d1526a7048?w=800&h=600&fit=crop', // Peace Memorial
  Kanazawa: 'https://images.unsplash.com/photo-1597560536040-c46e2134f09b?w=800&h=600&fit=crop', // Traditional garden
  Kobe: 'https://images.unsplash.com/photo-1593922873473-267e6f77604a?w=800&h=600&fit=crop', // Harbor city
  Niigata: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=600&fit=crop', // Modern Japan
  Chiba: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&h=600&fit=crop', // Coastal city
  Takamatsu: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=600&fit=crop', // Shikoku region
  Fukushima: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&h=600&fit=crop', // Mountains
  Kanagawa: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800&h=600&fit=crop', // kept for fallback
  Okayama: 'https://images.unsplash.com/photo-1555899434-94d1526a7048?w=800&h=600&fit=crop',
  Kojima: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=600&fit=crop',
};

// Major Japanese cities we want to display
const MAJOR_JAPAN_CITIES = [
  'Tokyo',
  'Osaka',
  'Kyoto',
  'Fukuoka',
  'Nagoya',
  'Yokohama',
  'Sapporo',
  'Hiroshima',
  'Kanazawa',
  'Kobe',
  'Niigata',
  'Chiba',
  'Takamatsu',
  'Fukushima',
  'Kanagawa',
  'Okayama',
  'Kojima',
];

/**
 * Fetch actual store counts per city from Supabase (Japan cities only)
 */
export async function getCityDataWithCounts(): Promise<CityData[]> {
  try {
    // Get all stores from Japan
    const { data: stores, error } = await supabase
      .from('stores')
      .select('city, country')
      .eq('country', 'Japan');

    if (error) {
      console.error('Error fetching city counts:', error);
      return getDefaultCityData();
    }

    if (!stores) {
      return getDefaultCityData();
    }

    // Count stores per city
    const cityCounts = stores.reduce((acc, store) => {
      const city = store.city;
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Only include major Japanese cities - show all even if 0 stores for now
    const cityData: CityData[] = MAJOR_JAPAN_CITIES
      .map((name) => ({
        name,
        storeCount: cityCounts[name] || 0,
        image: CITY_IMAGES[name] || 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=600&fit=crop',
      }))
      .sort((a, b) => b.storeCount - a.storeCount);

    console.log('Final city data being returned:', cityData);
    return cityData;
  } catch (err) {
    console.error('Error in getCityDataWithCounts:', err);
    return getDefaultCityData();
  }
}

/**
 * Fallback city data if fetch fails
 */
function getDefaultCityData(): CityData[] {
  return [
    { name: 'Tokyo', storeCount: 0, image: CITY_IMAGES.Tokyo },
    { name: 'Osaka', storeCount: 0, image: CITY_IMAGES.Osaka },
    { name: 'Kyoto', storeCount: 0, image: CITY_IMAGES.Kyoto },
    { name: 'Fukuoka', storeCount: 0, image: CITY_IMAGES.Fukuoka },
    { name: 'Nagoya', storeCount: 0, image: CITY_IMAGES.Nagoya },
    { name: 'Yokohama', storeCount: 0, image: CITY_IMAGES.Yokohama },
    { name: 'Sapporo', storeCount: 0, image: CITY_IMAGES.Sapporo },
    { name: 'Hiroshima', storeCount: 0, image: CITY_IMAGES.Hiroshima },
    { name: 'Kanazawa', storeCount: 0, image: CITY_IMAGES.Kanazawa },
    { name: 'Kobe', storeCount: 0, image: CITY_IMAGES.Kobe },
    { name: 'Niigata', storeCount: 0, image: CITY_IMAGES.Niigata },
    { name: 'Chiba', storeCount: 0, image: CITY_IMAGES.Chiba },
    { name: 'Takamatsu', storeCount: 0, image: CITY_IMAGES.Takamatsu },
    { name: 'Fukushima', storeCount: 0, image: CITY_IMAGES.Fukushima },
    { name: 'Kanagawa', storeCount: 0, image: CITY_IMAGES.Kanagawa },
  ];
}

export function cityToSlug(name: string): string {
  return encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'));
}

export function slugToCity(slug: string): string {
  return decodeURIComponent(slug.replace(/-/g, ' ')).replace(/\b\w/g, (c) => c.toUpperCase());
}

export function neighborhoodToSlug(name: string): string {
  return encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'));
}

export function slugToNeighborhood(slug: string): string {
  return decodeURIComponent(slug.replace(/-/g, ' ')).replace(/\b\w/g, (c) => c.toUpperCase());
}
