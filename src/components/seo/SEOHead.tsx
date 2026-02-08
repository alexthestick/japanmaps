import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Lost in Transit JP';
const SITE_URL = 'https://lostintransitjp.com';
const DEFAULT_IMAGE = 'https://ik.imagekit.io/wscyshoygv/og-default.jpg';
const DEFAULT_DESCRIPTION = 'Discover the best thrift stores, vintage shops, and secondhand clothing in Japan. Your 2025 guide to affordable thrifting, preloved fashion, and unique finds in Tokyo, Osaka, Kyoto, and beyond.';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'place';
  noIndex?: boolean;
  // For store pages
  storeName?: string;
  storeAddress?: string;
  storeCity?: string;
  storeNeighborhood?: string;
  storeCategory?: string;
  storeLatitude?: number;
  storeLongitude?: number;
  // For structured data
  jsonLd?: object | object[];
}

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noIndex = false,
  storeName,
  storeAddress,
  storeCity,
  storeNeighborhood,
  storeCategory,
  storeLatitude,
  storeLongitude,
  jsonLd,
}: SEOHeadProps) {
  // Build the full title
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} - Discover Japan's Best Stores & Hidden Gems`;

  // Build the canonical URL
  const canonicalUrl = url ? `${SITE_URL}${url}` : SITE_URL;

  // Ensure image is absolute URL
  const absoluteImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <Helmet prioritizeSeoTags>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type === 'place' ? 'place' : type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* Place-specific Open Graph (for stores) */}
      {type === 'place' && storeLatitude && storeLongitude && (
        <>
          <meta property="place:location:latitude" content={String(storeLatitude)} />
          <meta property="place:location:longitude" content={String(storeLongitude)} />
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />

      {/* Additional Meta */}
      <meta name="theme-color" content="#000000" />
      <meta name="geo.region" content="JP" />
      <meta name="geo.country" content="Japan" />

      {/* Keywords (still useful for some search engines) */}
      {storeCategory && storeCity && (
        <meta
          name="keywords"
          content={`${storeCategory}, ${storeCity}, ${storeNeighborhood || ''}, Japan, vintage stores, thrift shops, thrifting, secondhand clothing, used clothing, preloved fashion, affordable vintage, fashion, shopping`.trim()}
        />
      )}

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}
        </script>
      )}
    </Helmet>
  );
}

// Default export for convenience
export default SEOHead;
