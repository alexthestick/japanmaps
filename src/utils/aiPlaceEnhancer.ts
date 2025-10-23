import type { PlaceDetails } from '../components/admin/FetchPlaceIdButton';

export interface EnhancedPlaceData {
  description: string;
  instagram?: string;
  // categories removed - user will set manually
  // priceRange removed - not used in website
}

// Rate limiting: Track last API call time
let lastApiCallTime = 0;
const MIN_DELAY_BETWEEN_CALLS = 2000; // 2 seconds between calls

/**
 * Wait to respect rate limits
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCallTime;

  if (timeSinceLastCall < MIN_DELAY_BETWEEN_CALLS) {
    const waitTime = MIN_DELAY_BETWEEN_CALLS - timeSinceLastCall;
    console.log(`⏳ Rate limiting: waiting ${waitTime}ms before next API call...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastApiCallTime = Date.now();
}

/**
 * Retry logic for API calls
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const is429 = error instanceof Error && error.message.includes('429');
      const isLastAttempt = i === maxRetries - 1;

      if (!is429 || isLastAttempt) {
        throw error;
      }

      // Exponential backoff: 2s, 4s, 8s
      const delay = baseDelay * Math.pow(2, i);
      console.log(`⚠️ Rate limit hit (429), retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Enhance place details using Gemini AI
 * Extracts Instagram, better description based on category type
 */
export async function enhancePlaceDetailsWithAI(
  placeDetails: PlaceDetails,
  category: 'Fashion' | 'Food' | 'Coffee' | 'Home Goods' | 'Museum' = 'Fashion',
  subCategories?: string[]
): Promise<EnhancedPlaceData> {
  const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    console.warn('Gemini API key not configured, using fallback data');
    return {
      description: placeDetails.editorialSummary || placeDetails.description || `${placeDetails.name} is located at ${placeDetails.address}.`,
    };
  }

  try {
    console.log(`🤖 Enhancing place details with Gemini AI... (Category: ${category})`);

    const name = placeDetails.name;
    const address = placeDetails.address;
    const rating = placeDetails.rating;
    const ratingCount = placeDetails.userRatingCount;
    const types = placeDetails.types || [];
    const reviews = placeDetails.reviews || [];
    const editorialSummary = placeDetails.editorialSummary || '';
    const website = placeDetails.website || '';

    console.log(`📊 Place data: ${name}, ${reviews.length} reviews, types: ${types.join(', ')}`);

    // Prepare review excerpts (top 5 reviews)
    const reviewTexts = reviews
      .filter((r: any) => r.text?.text)
      .slice(0, 5)
      .map((r: any, idx: number) => `Review ${idx + 1}: "${r.text.text}"`)
      .join('\n\n');

    // Build prompt based on category type
    const isFashion = category === 'Fashion';
    const isFood = category === 'Food' || category === 'Coffee';

    const providedSubs = subCategories && subCategories.length > 0 ? `\n- Provided subcategories: ${subCategories.join(', ')}` : '';

    const commonRules = `\n\nIMPORTANT WRITING RULES:\n- Do NOT mention ratings, star counts, or reviews.\n- Do NOT quote or reference reviewers or "customers".\n- Do NOT use phrases like "customers say", "reviews mention", or direct quotes.\n- Focus on: what it is, what you can find, what makes it special, why it’s worth visiting.\n- Use concrete, specific nouns (items, styles, eras, materials, brands if available).\n- One cohesive paragraph only.`;

    const fashionPrompt = `You are writing a detailed description for a Japan clothing/fashion store map website.${providedSubs}

Store Information:
- Name: ${name}
- Location: ${address}
- Rating: ${rating}/5 (${ratingCount} reviews)
- Type: ${types.join(', ')}
${editorialSummary ? `- Google Summary: ${editorialSummary}` : ''}

Customer Reviews:
${reviewTexts || 'No reviews available'}

Task: Write a comprehensive single-paragraph description (4-6 sentences) for this store that includes:

1. What it is and where it is (neighborhood context)
2. What you can find: specific items, styles, eras, brands, or categories
3. What makes it special: curation, sourcing, atmosphere, service, price/quality
4. Why it’s worth a visit and who it’s for

Write in a flowing, informative style. Focus on concrete details about the merchandise, atmosphere, and shopping experience. If reviews are present, use them only as hidden signals to infer specifics without mentioning them.${commonRules}

Example style: "Ann's, a curated used and vintage clothing store located in the upscale Minamiaoyama district of Tokyo, operates out of a third-floor apartment. The inventory is carefully selected and regularly rotated, comprising a diverse mix of pre-owned apparel and accessories, from brand-name vintage to rediscovered one-of-a-kind pieces. The intimate setting and knowledgeable staff create a personalized shopping experience for fashion enthusiasts seeking unique finds..."

Also extract:
- **Instagram handle** if mentioned in reviews (format: @username, or "not_found")

Return your response in this exact JSON format:
{
  "description": "your detailed single-paragraph description",
  "instagram": "@username or not_found"
}

Write ONLY valid JSON, nothing else.`;

    const foodPrompt = `You are writing a detailed description for a Japan food/coffee/restaurant map website.${providedSubs}

Store Information:
- Name: ${name}
- Location: ${address}
- Rating: ${rating}/5 (${ratingCount} reviews)
- Type: ${types.join(', ')}
${editorialSummary ? `- Google Summary: ${editorialSummary}` : ''}

Customer Reviews:
${reviewTexts || 'No reviews available'}

Task: Write a comprehensive single-paragraph description (4-6 sentences) for this establishment that includes:

1. What it is and where it is (neighborhood context)
2. What you can find/expect: dishes, drinks, cuisine type, signature items
3. What makes it special: quality, ingredients, preparation, design, service, vibe
4. Why it’s worth a visit and who it’s for

Write in a flowing, informative style. Focus on concrete details about the food/drinks, atmosphere, and experience. If reviews are present, use them only as hidden signals to infer specifics without mentioning them.${commonRules}

Example style: "Bread, Espresso & in Omotesando is a minimalist café known for its exceptional coffee and freshly baked breads. The space features a sleek industrial design with an open kitchen, allowing guests to watch bakers at work. Their signature items include sourdough loaves and specialty espresso drinks made with carefully sourced beans. The café attracts both locals seeking quality breakfast items and tourists drawn to its refined aesthetic and consistent quality..."

Also extract:
- **Instagram handle** if mentioned in reviews (format: @username, or "not_found")

Return your response in this exact JSON format:
{
  "description": "your detailed single-paragraph description",
  "instagram": "@username or not_found"
}

Write ONLY valid JSON, nothing else.`;

    const homeGoodsPrompt = `You are writing a detailed description for a Japan home goods/antiques/houseware map website.${providedSubs}

Store Information:
- Name: ${name}
- Location: ${address}
- Rating: ${rating}/5 (${ratingCount} reviews)
- Type: ${types.join(', ')}
${editorialSummary ? `- Google Summary: ${editorialSummary}` : ''}

Customer Reviews:
${reviewTexts || 'No reviews available'}

Task: Write a comprehensive single-paragraph description (4-6 sentences) for this shop that includes:

1. What it is and where it is (neighborhood context)
2. What you can find: antiques, furniture, homeware, art, tools, stationery, general goods (as applicable)
3. What makes it special: curation, era/region focus, materials, restoration, pricing, atmosphere
4. Why it’s worth a visit and who it’s for

Write in an informative, warm style. Focus on tangible goods and browsing experience.${commonRules}

Also extract:
- **Instagram handle** if mentioned in reviews (format: @username, or "not_found")

Return your response in this exact JSON format:
{
  "description": "your detailed single-paragraph description",
  "instagram": "@username or not_found"
}

Write ONLY valid JSON, nothing else.`;

    const museumPrompt = `You are writing a detailed description for a Japan museum/arts map website.${providedSubs}

Place Information:
- Name: ${name}
- Location: ${address}
- Rating: ${rating}/5 (${ratingCount} reviews)
- Type: ${types.join(', ')}
${editorialSummary ? `- Google Summary: ${editorialSummary}` : ''}

Visitor Reviews:
${reviewTexts || 'No reviews available'}

Task: Write a concise single-paragraph description (4-6 sentences) that covers:

1. What it is and where it is (neighborhood context)
2. What you can find: collection focus or exhibition themes
3. What makes it special: space/architecture, visitor experience, curation
4. Why it’s worth a visit and who it’s for

Keep it neutral and informative.${commonRules}

Also extract:
- **Instagram handle** if mentioned in reviews (format: @username, or "not_found")

Return your response in this exact JSON format:
{
  "description": "your detailed single-paragraph description",
  "instagram": "@username or not_found"
}

Write ONLY valid JSON, nothing else.`;

    // Choose prompt by category
    const prompt = isFashion
      ? fashionPrompt
      : isFood
      ? foodPrompt
      : category === 'Home Goods'
      ? homeGoodsPrompt
      : category === 'Museum'
      ? museumPrompt
      : fashionPrompt;

    // Wait for rate limit before making the call
    await waitForRateLimit();

    // Make API call with retry logic
    const data = await retryWithBackoff(async () => {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      return await response.json();
    });

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('🤖 Gemini raw response:', text);

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from Gemini response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Clean up the response (categories removed - user will set manually)
    const enhanced: EnhancedPlaceData = {
      description: parsed.description || placeDetails.editorialSummary || '',
      instagram: parsed.instagram !== 'not_found' ? parsed.instagram : undefined,
    };

    console.log('✅ Enhanced data:', enhanced);
    return enhanced;
  } catch (error) {
    console.error('❌ AI enhancement error (returning fallback):', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return fallback
    return {
      description: placeDetails.editorialSummary || placeDetails.description || `${placeDetails.name} is located at ${placeDetails.address}.`,
    };
  }
}
