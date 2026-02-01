/**
 * Vercel Serverless Function: Fetch Substack RSS Feed
 *
 * Purpose: Fetches and parses Substack RSS feed for blog import tool
 * Returns: Array of parsed posts with structured data
 *
 * Flow:
 * 1. Fetch RSS feed from Substack
 * 2. Parse XML to extract post data
 * 3. Parse HTML content to extract intro + store sections
 * 4. Return structured data ready for BlogPostEditor
 */

export const runtime = 'nodejs';

// Your Substack URL
const SUBSTACK_FEED_URL = 'https://lostintransitjp.substack.com/feed';

// Allowed origins
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://lostintransitjp.com',
  'https://www.lostintransitjp.com',
];

function isOriginAllowed(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  if (origin.includes('lostintransitjp.com')) return true;
  return false;
}

/**
 * Parse Substack HTML content to extract intro and store sections
 */
function parseSubstackContent(htmlContent) {
  // Remove HTML tags for easier parsing
  const stripHtml = (html) => {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Extract images from HTML
  const extractImages = (html) => {
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    const images = [];
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      images.push(match[1]);
    }
    return images;
  };

  // Extract links (for Google Maps addresses)
  const extractLinks = (html) => {
    const linkRegex = /<a[^>]+href="([^">]+)"[^>]*>([^<]+)<\/a>/g;
    const links = [];
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      links.push({ url: match[1], text: match[2] });
    }
    return links;
  };

  try {
    const images = extractImages(htmlContent);
    const links = extractLinks(htmlContent);

    // Split content by headings (store names)
    // Looking for: <h1>, <h2>, <h3>, <h4> tags (Substack uses h1 or h3 for store names)
    const headingRegex = /<h([1-4])[^>]*>(.*?)<\/h\1>/gi;
    const sections = [];
    let match;
    const matches = [];

    // Reset regex lastIndex before using
    headingRegex.lastIndex = 0;

    while ((match = headingRegex.exec(htmlContent)) !== null) {
      const headingText = match[2].replace(/<[^>]+>/g, '').trim(); // Strip any inner HTML tags
      if (headingText) {
        matches.push({
          heading: headingText,
          index: match.index,
          fullMatch: match[0]
        });
      }
    }

    console.log(`Found ${matches.length} store sections:`, matches.map(m => m.heading));

    // Extract intro (everything before first heading)
    let intro = '';
    if (matches.length > 0) {
      const firstHeadingIndex = matches[0].index;
      intro = stripHtml(htmlContent.substring(0, firstHeadingIndex));
    } else {
      // No headings found, use first 2 paragraphs as intro
      const paragraphs = htmlContent.match(/<p[^>]*>.*?<\/p>/gi) || [];
      intro = stripHtml(paragraphs.slice(0, 2).join(' '));
    }

    // Hero image is likely the first large image after intro
    const heroImage = images.length > 0 ? images[0] : null;

    // Parse store sections
    matches.forEach((match, i) => {
      const storeName = match.heading.trim();
      const startIndex = match.index + match.fullMatch.length;
      const endIndex = i < matches.length - 1 ? matches[i + 1].index : htmlContent.length;
      const sectionHtml = htmlContent.substring(startIndex, endIndex);

      // Extract section content
      const sectionText = stripHtml(sectionHtml);
      const sectionImages = extractImages(sectionHtml);
      const sectionLinks = extractLinks(sectionHtml);

      // Find address (look for Google Maps links or "address:" text)
      let address = '';
      let mapLink = '';

      // Check for Google Maps links (share.google, goo.gl, google.com/maps)
      const mapsLink = sectionLinks.find(link =>
        link.url.includes('google') &&
        (link.url.includes('maps') || link.url.includes('goo.gl') || link.url.includes('share.google'))
      );

      if (mapsLink) {
        mapLink = mapsLink.url;
        address = mapsLink.text;
      }

      // Also look for "address:" pattern in the HTML (before stripping)
      const addressLineMatch = sectionHtml.match(/address:\s*<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/i);
      if (addressLineMatch) {
        if (!mapLink) mapLink = addressLineMatch[1];
        if (!address) address = addressLineMatch[2];
      }

      // Fallback: look for "address:" in plain text
      if (!address) {
        const addressMatch = sectionText.match(/address:\s*([^\n]+)/i);
        if (addressMatch) {
          address = addressMatch[1].trim();
        }
      }

      // Description is the main text (excluding address line)
      let description = sectionText.replace(/address:\s*[^\n]+/i, '').trim();

      // Instagram removal (since you said you won't include it in future)
      description = description.replace(/instagram:\s*[^\n]+/i, '').trim();

      // Store image is first image in section (after hero)
      const storeImage = sectionImages.length > 0 ? sectionImages[0] : '';

      sections.push({
        store_name: storeName,
        description: description.substring(0, 800), // Limit length
        image: storeImage,
        address: address,
        map_link: mapLink,
        reverse: false, // Default, user can toggle
      });
    });

    return {
      intro: intro.substring(0, 1000), // Limit intro length
      heroImage,
      sections,
      rawImages: images, // For debugging
    };
  } catch (error) {
    console.error('Error parsing content:', error);
    return {
      intro: stripHtml(htmlContent).substring(0, 500),
      heroImage: null,
      sections: [],
      rawImages: [],
    };
  }
}

/**
 * Parse RSS XML feed
 */
async function parseRssFeed(xmlText) {
  try {
    // Simple XML parsing for RSS (basic implementation)
    const items = [];
    const itemRegex = /<item>(.*?)<\/item>/gs;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemXml = match[1];

      // Extract fields
      const getField = (field) => {
        const regex = new RegExp(`<${field}[^>]*><!\\[CDATA\\[([^\\]]+)\\]\\]><\\/${field}>`, 's');
        const cdataMatch = itemXml.match(regex);
        if (cdataMatch) return cdataMatch[1];

        const simpleRegex = new RegExp(`<${field}[^>]*>([^<]+)<\\/${field}>`, 's');
        const simpleMatch = itemXml.match(simpleRegex);
        return simpleMatch ? simpleMatch[1] : '';
      };

      const title = getField('title');
      const link = getField('link');
      const pubDate = getField('pubDate');
      const contentEncoded = getField('content:encoded') || getField('description');

      // Parse content to extract structured data
      const parsed = parseSubstackContent(contentEncoded);

      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      items.push({
        title,
        slug,
        link,
        publishedAt: pubDate,
        ...parsed,
      });
    }

    return items;
  } catch (error) {
    console.error('Error parsing RSS:', error);
    throw new Error('Failed to parse RSS feed');
  }
}

/**
 * Main handler
 */
export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin;
  if (isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📡 Fetching Substack RSS feed...');

    // Fetch RSS feed
    const response = await fetch(SUBSTACK_FEED_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    console.log('✅ RSS feed fetched, parsing...');

    // Parse RSS
    const posts = await parseRssFeed(xmlText);
    console.log(`✅ Parsed ${posts.length} posts`);

    return res.status(200).json({
      success: true,
      posts: posts.slice(0, 10), // Return last 10 posts
      feedUrl: SUBSTACK_FEED_URL,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
