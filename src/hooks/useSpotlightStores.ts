import { useMemo } from 'react';
import type { Store } from '../types/store';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface SpotlightOptions {
  count?: number; // Number of stores to spotlight (default: 5)
}

/**
 * Smart store curation algorithm for Spotlight Mode
 *
 * Selection criteria:
 * 1. Category diversity - prefer mix of Fashion/Coffee/Food/etc
 * 2. Photo quality - stores with photos rank higher
 * 3. Spatial distribution - penalize clustering
 * 4. Random factor - 25% randomness for variety on each press
 */
export function useSpotlightStores(
  stores: Store[],
  viewportBounds: ViewportBounds | null,
  options: SpotlightOptions = {}
) {
  const { count = 5 } = options;

  const spotlightedStores = useMemo(() => {
    if (!viewportBounds || stores.length === 0) return [];

    // Filter to stores in current viewport
    const visibleStores = stores.filter(store => {
      return store.latitude >= viewportBounds.south &&
             store.latitude <= viewportBounds.north &&
             store.longitude >= viewportBounds.west &&
             store.longitude <= viewportBounds.east;
    });

    if (visibleStores.length === 0) return [];

    // If fewer stores than requested, return all
    if (visibleStores.length <= count) return visibleStores;

    // Score each store
    const scoredStores = visibleStores.map(store => {
      let score = 0;

      // 1. Category diversity scoring
      // We'll track category distribution as we select, so this is a base score
      const categoryScores: Record<string, number> = {
        'Fashion': 1.0,
        'Food': 1.0,
        'Coffee': 1.0,
        'Home Goods': 0.8,
        'Museum': 0.8,
        'Spots': 0.8,
      };
      score += (categoryScores[store.mainCategory || 'Fashion'] || 0.5) * 10;

      // 2. Photo quality - stores with photos rank higher
      if (store.photos && store.photos.length > 0) {
        score += 15;
        // Bonus for multiple photos
        if (store.photos.length >= 3) score += 5;
      }

      // 3. Description quality - well-documented stores rank higher
      if (store.description && store.description.length > 50) {
        score += 8;
      }

      // 4. Social proof - Instagram presence
      if (store.instagram) {
        score += 5;
      }

      // 5. Random factor (25% weight) - ensures variety on each press
      const randomBonus = Math.random() * 25;
      score += randomBonus;

      return { store, score, baseScore: score - randomBonus };
    });

    // Sort by score descending
    scoredStores.sort((a, b) => b.score - a.score);

    // Select top stores with category diversity enforcement
    const selected: typeof scoredStores = [];
    const categoryCount: Record<string, number> = {};

    for (const item of scoredStores) {
      if (selected.length >= count) break;

      const category = item.store.mainCategory || 'Fashion';
      const categoryOccurrences = categoryCount[category] || 0;

      // If we already have 2 of this category and haven't filled quota, prefer others
      if (categoryOccurrences >= 2 && selected.length < count - 1) {
        // Check if there are stores of other categories available
        const hasOtherCategories = scoredStores
          .filter(s => !selected.includes(s))
          .some(s => {
            const cat = s.store.mainCategory || 'Fashion';
            return (categoryCount[cat] || 0) < 2;
          });

        if (hasOtherCategories) continue;
      }

      selected.push(item);
      categoryCount[category] = categoryOccurrences + 1;
    }

    // Spatial distribution check - penalize if stores are too clustered
    // Calculate average distance between selected stores
    const selectedStores = selected.map(s => s.store);
    const improved = improveSpatialDistribution(selectedStores, scoredStores.map(s => s.store), count);

    return improved;
  }, [stores, viewportBounds, count]);

  return spotlightedStores;
}

/**
 * Improve spatial distribution of selected stores
 * If stores are too clustered, swap out some for better-distributed alternatives
 */
function improveSpatialDistribution(
  selected: Store[],
  allVisibleStores: Store[],
  targetCount: number
): Store[] {
  if (selected.length <= 2) return selected; // Need at least 3 for spatial analysis

  // Calculate minimum distance between any two selected stores
  const getMinDistance = (stores: Store[]) => {
    let minDist = Infinity;
    for (let i = 0; i < stores.length; i++) {
      for (let j = i + 1; j < stores.length; j++) {
        const dist = Math.sqrt(
          Math.pow(stores[i].latitude - stores[j].latitude, 2) +
          Math.pow(stores[i].longitude - stores[j].longitude, 2)
        );
        minDist = Math.min(minDist, dist);
      }
    }
    return minDist;
  };

  const currentMinDist = getMinDistance(selected);

  // If minimum distance is very small, try to improve
  if (currentMinDist < 0.002) { // ~200m clustering threshold
    const unselected = allVisibleStores.filter(s => !selected.includes(s));

    // Try swapping the closest pair with better-distributed alternatives
    for (let attempt = 0; attempt < 3; attempt++) {
      // Find the two closest stores
      let minPairDist = Infinity;
      let closestPair: [number, number] = [0, 1];

      for (let i = 0; i < selected.length; i++) {
        for (let j = i + 1; j < selected.length; j++) {
          const dist = Math.sqrt(
            Math.pow(selected[i].latitude - selected[j].latitude, 2) +
            Math.pow(selected[i].longitude - selected[j].longitude, 2)
          );
          if (dist < minPairDist) {
            minPairDist = dist;
            closestPair = [i, j];
          }
        }
      }

      // Try swapping one of the pair with an unselected store
      const swapCandidate = unselected.find(candidate => {
        // Check if swapping improves distribution
        const testSelected = [...selected];
        testSelected[closestPair[1]] = candidate;
        return getMinDistance(testSelected) > currentMinDist;
      });

      if (swapCandidate) {
        selected[closestPair[1]] = swapCandidate;
        break;
      }
    }
  }

  return selected;
}
