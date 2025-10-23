import type { Store } from '../types/store';

const SAVED_STORES_KEY = 'jazzstripe_saved_stores';

export interface SavedStore {
  id: string;
  savedAt: string;
}

/**
 * Get all saved store IDs
 */
export function getSavedStoreIds(): string[] {
  try {
    const saved = localStorage.getItem(SAVED_STORES_KEY);
    if (!saved) return [];

    const savedStores: SavedStore[] = JSON.parse(saved);
    return savedStores.map(s => s.id);
  } catch (error) {
    console.error('Error reading saved stores:', error);
    return [];
  }
}

/**
 * Check if a store is saved
 */
export function isStoreSaved(storeId: string): boolean {
  const savedIds = getSavedStoreIds();
  return savedIds.includes(storeId);
}

/**
 * Save a store
 */
export function saveStore(storeId: string): void {
  try {
    const saved = localStorage.getItem(SAVED_STORES_KEY);
    const savedStores: SavedStore[] = saved ? JSON.parse(saved) : [];

    // Don't add duplicates
    if (savedStores.some(s => s.id === storeId)) {
      return;
    }

    savedStores.push({
      id: storeId,
      savedAt: new Date().toISOString(),
    });

    localStorage.setItem(SAVED_STORES_KEY, JSON.stringify(savedStores));

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('savedStoresChanged'));
  } catch (error) {
    console.error('Error saving store:', error);
  }
}

/**
 * Unsave a store
 */
export function unsaveStore(storeId: string): void {
  try {
    const saved = localStorage.getItem(SAVED_STORES_KEY);
    if (!saved) return;

    const savedStores: SavedStore[] = JSON.parse(saved);
    const filtered = savedStores.filter(s => s.id !== storeId);

    localStorage.setItem(SAVED_STORES_KEY, JSON.stringify(filtered));

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('savedStoresChanged'));
  } catch (error) {
    console.error('Error unsaving store:', error);
  }
}

/**
 * Toggle save state
 */
export function toggleSaveStore(storeId: string): boolean {
  const isSaved = isStoreSaved(storeId);

  if (isSaved) {
    unsaveStore(storeId);
    return false;
  } else {
    saveStore(storeId);
    return true;
  }
}

/**
 * Get count of saved stores
 */
export function getSavedStoreCount(): number {
  return getSavedStoreIds().length;
}

/**
 * Clear all saved stores
 */
export function clearAllSavedStores(): void {
  localStorage.removeItem(SAVED_STORES_KEY);
  window.dispatchEvent(new CustomEvent('savedStoresChanged'));
}

/**
 * Get all saved store details (sorted by most recently saved)
 */
export function getSavedStores(): SavedStore[] {
  try {
    const saved = localStorage.getItem(SAVED_STORES_KEY);
    if (!saved) return [];

    const savedStores: SavedStore[] = JSON.parse(saved);
    // Sort by most recently saved first
    return savedStores.sort((a, b) =>
      new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );
  } catch (error) {
    console.error('Error reading saved stores:', error);
    return [];
  }
}
