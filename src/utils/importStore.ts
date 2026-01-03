/**
 * Import Store Utilities
 * Client-side functions for importing stores from Google Maps
 */

export interface ImportStoreResult {
  success: boolean;
  placeId: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
  website?: string;
  phone?: string;
  hours?: string;
  instagram?: string;
  rating: number;
  userRatingCount: number;
  types: string[];
  suggestedCategories: string[];
  photoCount: number;
}

export interface ImportStoreError {
  success: false;
  error: string;
  details?: string;
}

/**
 * Import a store from Google Maps URL or Place ID
 * This calls the serverless function which:
 * 1. Extracts Place ID from URL
 * 2. Fetches place details from Google
 * 3. Enhances with AI description
 * 4. Returns preview data (does NOT save to database)
 *
 * @param input - Google Maps URL or Place ID
 * @returns Store data for preview/approval
 */
export async function importStoreFromGoogle(
  input: string
): Promise<ImportStoreResult> {
  try {
    console.log(`🔄 Importing store from: ${input}`);

    const response = await fetch('/api/import-store', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const errorData: ImportStoreError = await response.json().catch(() => ({
        success: false,
        error: `Server error: ${response.status}`,
      }));

      throw new Error(errorData.error || 'Failed to import store');
    }

    const result: ImportStoreResult = await response.json();

    if (!result.success) {
      throw new Error('Import failed');
    }

    console.log(`✅ Store imported successfully: ${result.name}`);
    return result;

  } catch (error) {
    console.error('❌ Import error:', error);
    throw error;
  }
}

/**
 * Extract city from formatted address
 * Japanese addresses format: "〒Postal Code, Ward/Area, City, Prefecture, Country"
 */
export function extractCity(address: string): string {
  const parts = address.split(',');
  const majorCities = [
    'Tokyo',
    'Osaka',
    'Kyoto',
    'Fukuoka',
    'Nagoya',
    'Sapporo',
    'Yokohama',
    'Kobe',
    'Hiroshima',
    'Sendai',
  ];

  for (const part of parts) {
    for (const city of majorCities) {
      if (part.includes(city)) {
        return city;
      }
    }
  }

  // Fallback: return second-to-last part (usually city)
  return parts[parts.length - 2]?.trim() || 'Tokyo';
}

/**
 * Extract neighborhood from formatted address
 */
export function extractNeighborhood(address: string): string | undefined {
  const parts = address.split(',');

  // Third part is usually ward/neighborhood
  if (parts.length >= 3) {
    const neighborhood = parts[2].trim();
    // Clean up postal codes and extra text
    return neighborhood.replace(/〒\d+-\d+\s*/g, '').trim();
  }

  return undefined;
}

/**
 * Detect main category from Google place types
 */
export function detectMainCategory(
  types: string[]
): 'Fashion' | 'Food' | 'Coffee' | 'Home Goods' | 'Museum' {
  const typesLower = types.map((t) => t.toLowerCase());

  // Check for coffee-related types
  if (typesLower.some((t) => t.includes('cafe') || t.includes('coffee'))) {
    return 'Coffee';
  }

  // Check for food-related types
  const foodTypes = [
    'restaurant',
    'food',
    'bar',
    'meal_takeaway',
    'meal_delivery',
    'bakery',
  ];
  if (typesLower.some((t) => foodTypes.some((ft) => t.includes(ft)))) {
    return 'Food';
  }

  // Check for museum types
  if (typesLower.some((t) => t.includes('museum'))) {
    return 'Museum';
  }

  // Check for home goods types
  const homeTypes = ['furniture_store', 'home_goods_store', 'store'];
  if (typesLower.some((t) => homeTypes.some((ht) => t.includes(ht)))) {
    return 'Home Goods';
  }

  // Check for fashion-related types
  const fashionTypes = ['clothing_store', 'shoe_store', 'shopping'];
  if (typesLower.some((t) => fashionTypes.some((ft) => t.includes(ft)))) {
    return 'Fashion';
  }

  // Default to Fashion
  return 'Fashion';
}
