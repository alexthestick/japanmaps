/**
 * Vercel Serverless Function: Enhance Store Description with Claude AI
 *
 * Purpose: Server-side AI description generation (keeps ANTHROPIC_API_KEY off the browser)
 *
 * Flow:
 * 1. Accepts: place details (name, address, types, reviews, editorialSummary, category)
 * 2. Calls Claude API to generate a description
 * 3. Returns: { description, instagram }
 */

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

// Allowed origins
const PRODUCTION_DOMAIN = process.env.PRODUCTION_URL || 'https://lostintransitjp.com';
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://lostintransitjp.com',
  'https://www.lostintransitjp.com',
  PRODUCTION_DOMAIN,
];

function isOriginAllowed(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  if (origin.includes('lostintransitjp.com')) return true;
  return false;
}

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  const validRequests = userRequests.filter(t => now - t < RATE_LIMIT_WINDOW);
  if (validRequests.length >= MAX_REQUESTS_PER_WINDOW) return false;
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);
  return true;
}

function setCorsHeaders(res, origin) {
  const allowedOrigin = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

const CATEGORY_PROMPT_MAP = {
  Fashion: {
    focus: 'what the store stocks (specific clothing styles, eras, brands, or types), what kind of shopper it suits, and what makes the curation or shopping experience special',
    subcategories: 'vintage, archive, streetwear, designer, accessories, denim, sneakers, second-hand',
  },
  Food: {
    focus: 'what the restaurant or food spot serves (dishes, cuisine type, signature items), the atmosphere and setting, and what makes it worth visiting',
    subcategories: 'ramen, sushi, izakaya, kaiseki, yakitori, tempura, udon, soba, curry, tonkatsu',
  },
  Coffee: {
    focus: 'what kind of coffee or drinks they serve, the cafe atmosphere and design, any food or pastries, and what makes it a destination',
    subcategories: 'specialty coffee, cafe, tea, bakery',
  },
  'Home Goods': {
    focus: 'what you can find (furniture, ceramics, antiques, textiles, tools), the curation style, and any unique origin story or speciality',
    subcategories: 'antiques, furniture, ceramics, textiles, vintage, design',
  },
  Museum: {
    focus: 'what collections or exhibitions it holds, the architecture or space, and what makes the experience distinctive',
    subcategories: 'art, history, design, contemporary',
  },
  Spots: {
    focus: 'what the spot is and what you can do or see there, what makes it a worthwhile detour',
    subcategories: 'park, viewpoint, architecture, cultural site, hidden gem',
  },
};

export default async function handler(req, res) {
  const origin = req.headers.origin;

  if (origin && !isOriginAllowed(origin)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  if (req.method === 'OPTIONS') {
    setCorsHeaders(res, origin);
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  setCorsHeaders(res, origin);

  const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
             req.headers['x-real-ip'] ||
             'unknown';

  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.', retryAfter: 60 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'AI service not configured on server' });
  }

  try {
    const {
      name,
      address,
      types = [],
      reviews = [],
      editorialSummary = '',
      category = 'Fashion',
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing required field: name' });
    }

    const { focus, subcategories } = CATEGORY_PROMPT_MAP[category] || CATEGORY_PROMPT_MAP['Fashion'];

    const reviewTexts = reviews
      .filter(r => r.text?.text || typeof r === 'string')
      .slice(0, 5)
      .map((r, idx) => `Review ${idx + 1}: "${r.text?.text || r}"`)
      .join('\n\n');

    const prompt = `You are writing store descriptions for Lost in Transit, a curated discovery map of vintage, streetwear, archive, and specialty stores across Japan. The audience is fashion-aware travelers looking for hidden gems.

Store Information:
- Name: ${name}
- Address: ${address || 'Japan'}
- Category: ${category}
- Google types: ${types.join(', ')}
${editorialSummary ? `- Google summary: ${editorialSummary}` : ''}

Customer reviews (use as hidden context only — do NOT quote or reference them):
${reviewTexts || 'No reviews available'}

Task: Write a single flowing paragraph (4-6 sentences) that covers:
1. What the place is and where it sits
2. Specifically: ${focus}
3. Any unique backstory, signature specialty, or reason it stands out from similar places

STRICT RULES:
- Do NOT mention ratings, review counts, or customer quotes
- Do NOT use phrases like "customers love" or "visitors say"
- Be specific and concrete — name actual item types, styles, eras, or techniques when possible
- Write like a knowledgeable travel writer, not a marketing brochure
- One paragraph only, no line breaks

Also extract the Instagram handle if mentioned in any review (format: @username, or "not_found").

Return ONLY valid JSON, nothing else:
{
  "description": "your paragraph here",
  "instagram": "@handle or not_found"
}`;

    console.log(`🤖 Claude enhancing: ${name} (${category})`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error(`Claude API error: ${response.status}`);
      return res.status(200).json({
        success: true,
        description: editorialSummary || `${name} is located at ${address}.`,
        instagram: undefined,
        fallback: true,
      });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return res.status(200).json({
        success: true,
        description: parsed.description || editorialSummary || `${name} is located at ${address}.`,
        instagram: parsed.instagram !== 'not_found' ? parsed.instagram : undefined,
      });
    }

    // Claude returned text but no JSON — use the raw text if it looks like a description
    const cleanText = text.trim();
    if (cleanText.length > 50) {
      return res.status(200).json({
        success: true,
        description: cleanText,
        instagram: undefined,
      });
    }

    return res.status(200).json({
      success: true,
      description: editorialSummary || `${name} is located at ${address}.`,
      instagram: undefined,
      fallback: true,
    });

  } catch (error) {
    console.error('enhance-description error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate description',
    });
  }
}
