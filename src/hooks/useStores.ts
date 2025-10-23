import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Store, StoreFilters } from '../types/store';

/**
 * Fetch all stores from database
 * Uses React Query for automatic caching
 */
async function fetchAllStores(): Promise<Store[]> {
  const { data, error } = await supabase.rpc('get_stores_with_coordinates');

  if (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.warn('No stores returned from database');
    return [];
  }

  // Transform data to match Store type
  const transformedStores: Store[] = data.map((store: any) => ({
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

  return transformedStores;
}

/**
 * Apply client-side filters to stores
 */
function applyFilters(stores: Store[], filters?: StoreFilters): Store[] {
  let filtered = [...stores];

  if (filters?.countries && filters.countries.length > 0) {
    filtered = filtered.filter(store =>
      filters.countries!.includes(store.country)
    );
  }

  if (filters?.cities && filters.cities.length > 0) {
    filtered = filtered.filter(store =>
      filters.cities!.includes(store.city)
    );
  }

  if (filters?.selectedNeighborhood) {
    filtered = filtered.filter(store =>
      store.neighborhood === filters.selectedNeighborhood
    );
  }

  // Filter by main categories (Food, Fashion, Coffee, etc)
  if (filters?.mainCategories && filters.mainCategories.length > 0) {
    filtered = filtered.filter(store =>
      filters.mainCategories!.includes(store.mainCategory || '')
    );
  }

  // Filter by subcategories (Ramen, Sushi, Vintage, etc)
  if (filters?.categories && filters.categories.length > 0) {
    filtered = filtered.filter(store =>
      store.categories.some(cat => filters.categories!.includes(cat))
    );
  }

  if (filters?.priceRanges && filters.priceRanges.length > 0) {
    filtered = filtered.filter(store =>
      filters.priceRanges!.includes(store.price_range)
    );
  }

  if (filters?.verified !== undefined) {
    filtered = filtered.filter(store =>
      store.verified === filters.verified
    );
  }

  if (filters?.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(store =>
      store.name.toLowerCase().includes(query) ||
      store.city.toLowerCase().includes(query)
    );
  }

  return filtered;
}

/**
 * Hook for fetching and filtering stores
 * Uses React Query for intelligent caching and refetching
 */
export function useStores(filters?: StoreFilters) {
  // Query key includes all filter values (except searchQuery which is client-side only)
  const { searchQuery, ...serverFilters } = filters || {};

  const queryKey = ['stores', serverFilters];

  // Fetch all stores once, cache for 5 minutes
  const query = useQuery({
    queryKey: ['stores'],
    queryFn: fetchAllStores,
  });

  // Apply filters to cached data
  const stores = query.data ? applyFilters(query.data, filters) : [];

  return {
    stores,
    loading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
