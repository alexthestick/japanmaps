import { supabase } from '../lib/supabase';

export interface CityData {
  name: string;
  storeCount: number;
  image: string;
}

// City images from local folder
const CITY_IMAGES: Record<string, string> = {
  Tokyo: '/images/cities/original/tokyo/tokyo1.jpg',
  Osaka: '/images/cities/original/fukuoka.jpg', // Fallback - no osaka dir found
  Kyoto: '/images/cities/original/kyoto/kyoto.jpg',
  Fukuoka: '/images/cities/original/fukuoka.jpg',
  Nagoya: '/images/cities/original/fukuoka.jpg', // Fallback - need to check if nagoya exists
  'Kanagawa / Yokohama': '/images/cities/original/yokohama.jpg',
  Yokohama: '/images/cities/original/yokohama.jpg',
  Sapporo: '/images/cities/original/sapporo.jpg',
  Hiroshima: '/images/cities/original/hiroshima.jpg',
  Kanazawa: '/images/cities/original/kanazawa.jpg',
  Kobe: '/images/cities/original/kobe/kobe.jpg',
  Niigata: '/images/cities/original/fukuoka.jpg', // Fallback - need to check if niigata exists
  Chiba: '/images/cities/original/chiba.jpg',
  Takamatsu: '/images/cities/original/takamatsu.jpg',
  Fukushima: '/images/cities/original/fukushima.jpg',
  Kanagawa: '/images/cities/original/yokohama.jpg',
  Okayama: '/images/cities/original/okayama.jpg',
  Kojima: '/images/cities/original/kojima/kojima1.jpg',
  Atsugi: '/images/cities/original/atsugi.jpg',
  Toyama: '/images/cities/original/toyama.jpg',
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
