import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Store, MainCategory } from '../types/store';

export interface CityStorePreview {
  category: MainCategory;
  store: Store | null;
  icon: string;
  totalCount: number;
}

async function fetchCityStorePreviews(cityName: string): Promise<CityStorePreview[]> {
  if (!cityName || cityName === '???') {
    return [];
  }

  try {
    const { data: allStores, error } = await supabase.rpc('get_stores_with_coordinates');

    if (error) {
      console.error('Error fetching stores for city:', cityName, error);
      throw error;
    }

    if (!allStores || allStores.length === 0) {
      console.warn('No stores found in database');
      return [];
    }

    const cityStores: Store[] = allStores
      .filter((store: any) => store.city === cityName)
      .map((store: any) => ({
        id: store.id,
        name: store.name,
        address: store.address,
        city: store.city,
        neighborhood: store.neighborhood || undefined,
        country: store.country,
        latitude: store.latitude,
        longitude: store.longitude,
        mainCategory: store.main_category || 'Fashion',
        categories: store.categories as any,
        priceRange: store.price_range as any,
        description: store.description || undefined,
        photos: store.photos || [],
        website: store.website || undefined,
        instagram: store.instagram || undefined,
        hours: store.hours || undefined,
        verified: store.verified,
        submittedBy: store.submitted_by || undefined,
        createdAt: store.created_at,
        updatedAt: store.updated_at,
        haulCount: store.haul_count,
        saveCount: store.save_count,
      }));

    const storesByCategory: { [key in MainCategory]?: Store[] } = {
      Fashion: [], Food: [], Coffee: [], 'Home Goods': [], Museum: [],
    };

    cityStores.forEach(store => {
      const category = store.mainCategory || 'Fashion';
      if (storesByCategory[category]) {
        storesByCategory[category]!.push(store);
      }
    });

    const selectBestStore = (stores: Store[]): Store | null => {
      if (stores.length === 0) return null;
      const verified = stores.filter(s => s.verified && s.photos.length > 0);
      if (verified.length > 0) {
        return verified[Math.floor(Math.random() * verified.length)];
      }
      const verifiedAny = stores.filter(s => s.verified);
      if (verifiedAny.length > 0) {
        return verifiedAny[Math.floor(Math.random() * verifiedAny.length)];
      }
      const withPhotos = stores.filter(s => s.photos.length > 0);
      if (withPhotos.length > 0) {
        return withPhotos[Math.floor(Math.random() * withPhotos.length)];
      }
      return stores[Math.floor(Math.random() * stores.length)];
    };

    const selectTwoStores = (stores: Store[]): Store[] => {
      if (stores.length === 0) return [];
      if (stores.length === 1) return [stores[0]];
      const verified = stores.filter(s => s.verified && s.photos.length > 0);
      if (verified.length >= 2) {
        const shuffled = [...verified].sort(() => Math.random() - 0.5);
        return [shuffled[0], shuffled[1]];
      }
      const shuffled = [...stores].sort(() => Math.random() - 0.5);
      return [shuffled[0], shuffled[1]];
    };

    const categoryIcons: { [key in MainCategory]: string } = {
      Fashion: '👔', Food: '🍜', Coffee: '☕', 'Home Goods': '🏠', Museum: '🏛️',
    };

    const previews: CityStorePreview[] = [];
    const fashionStores = selectTwoStores(storesByCategory.Fashion || []);
    if (fashionStores.length > 0) {
      fashionStores.forEach(store => {
        previews.push({ category: 'Fashion', store, icon: categoryIcons.Fashion, totalCount: (storesByCategory.Fashion || []).length });
      });
    } else {
      previews.push({ category: 'Fashion', store: null, icon: categoryIcons.Fashion, totalCount: 0 });
    }

    const otherCategories: MainCategory[] = ['Food', 'Coffee', 'Home Goods', 'Museum'];
    otherCategories.forEach(category => {
      const stores = storesByCategory[category] || [];
      const selectedStore = selectBestStore(stores);
      previews.push({ category, store: selectedStore, icon: categoryIcons[category], totalCount: stores.length });
    });

    while (previews.length < 6) {
      previews.push({ category: 'Fashion', store: null, icon: categoryIcons.Fashion, totalCount: 0 });
    }

    return previews.slice(0, 6);
  } catch (error) {
    console.error('Error in fetchCityStorePreviews:', error);
    throw error;
  }
}

export function useCityStorePreviews(cityName: string) {
  const query = useQuery({
    queryKey: ['cityStorePreviews', cityName],
    queryFn: () => fetchCityStorePreviews(cityName),
    enabled: !!cityName && cityName !== '???',
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return { previews: query.data || [], loading: query.isLoading, error: query.error as Error | null, refetch: query.refetch };
}
