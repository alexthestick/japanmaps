import type { PlaceDetails } from ‘../components/admin/FetchPlaceIdButton’;
import { logger } from ‘./logger’;

export interface EnhancedPlaceData {
  description: string;
  instagram?: string;
}

// Rate limiting: ensure we don’t spam the endpoint
let lastApiCallTime = 0;
const MIN_DELAY_BETWEEN_CALLS = 1500; // 1.5 seconds between calls

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCallTime;
  if (timeSinceLastCall < MIN_DELAY_BETWEEN_CALLS) {
    const waitTime = MIN_DELAY_BETWEEN_CALLS - timeSinceLastCall;
    logger.log(`⏳ Rate limiting: waiting ${waitTime}ms...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastApiCallTime = Date.now();
}

/**
 * Enhance place details using Claude AI via server-side endpoint.
 * The Anthropic API key never leaves the server — this calls /api/enhance-description.
 */
export async function enhancePlaceDetailsWithAI(
  placeDetails: PlaceDetails,
  category: ‘Fashion’ | ‘Food’ | ‘Coffee’ | ‘Home Goods’ | ‘Museum’ | ‘Spots’ = ‘Fashion’,
  subCategories?: string[]
): Promise<EnhancedPlaceData> {
  const fallback: EnhancedPlaceData = {
    description:
      placeDetails.editorialSummary ||
      placeDetails.description ||
      `${placeDetails.name} is located at ${placeDetails.address}.`,
  };

  try {
    logger.log(`🤖 Enhancing "${placeDetails.name}" via Claude (Category: ${category})`);

    await waitForRateLimit();

    const response = await fetch(‘/api/enhance-description’, {
      method: ‘POST’,
      headers: { ‘Content-Type’: ‘application/json’ },
      body: JSON.stringify({
        name: placeDetails.name,
        address: placeDetails.address,
        types: placeDetails.types || [],
        reviews: placeDetails.reviews || [],
        editorialSummary: placeDetails.editorialSummary || ‘’,
        category,
      }),
    });

    if (!response.ok) {
      logger.warn(`enhance-description endpoint error: ${response.status} — using fallback`);
      return fallback;
    }

    const data = await response.json();

    if (!data.success) {
      logger.warn(‘enhance-description returned failure — using fallback’);
      return fallback;
    }

    const enhanced: EnhancedPlaceData = {
      description: data.description || fallback.description,
      instagram: data.instagram,
    };

    logger.log(`✅ Enhanced: "${placeDetails.name}"`, enhanced);
    return enhanced;
  } catch (error) {
    console.error(‘❌ AI enhancement error (returning fallback):’, error);
    return fallback;
  }
}
