/**
 * Schema.org structured data generators for Lost in Transit JP
 *
 * These generate JSON-LD markup for rich results in Google Search.
 */

import type { Store } from '../../types/store';

const SITE_NAME = 'Lost in Transit JP';
const SITE_URL = 'https://lostintransitjp.com';
const IMAGEKIT_BASE = 'https://ik.imagekit.io/wscyshoygv';

/**
 * Map main category to Schema.org type
 */
function getSchemaType(mainCategory?: string): string {
  switch (mainCategory) {
    case 'Fashion':
      return 'ClothingStore';
    case 'Food':
      return 'Restaurant';
    case 'Coffee':
      return 'CafeOrCoffeeShop';
    case 'Museum':
      return 'Museum';
    case 'Home Goods':
      return 'HomeGoodsStore';
    case 'Spots':
    default:
      return 'LocalBusiness';
  }
}

/**
 * Generate LocalBusiness schema for a store
 */
export function generateStoreSchema(store: Store): object {
  const schemaType = getSchemaType(store.mainCategory);

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: store.name,
    url: `${SITE_URL}/store/${store.slug || store.id}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: store.address,
      addressLocality: store.neighborhood || store.city,
      addressRegion: store.city,
      addressCountry: 'JP',
    },
  };

  // Add coordinates if available
  if (store.latitude && store.longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: store.latitude,
      longitude: store.longitude,
    };
  }

  // Add description
  if (store.description) {
    schema.description = store.description;
  }

  // Add images
  if (store.photos && store.photos.length > 0) {
    schema.image = store.photos.slice(0, 5); // Max 5 images
  }

  // Add price range
  if (store.priceRange) {
    schema.priceRange = store.priceRange;
  }

  // Add website
  if (store.website) {
    schema.sameAs = [store.website];
  }

  // Add Instagram
  if (store.instagram) {
    const instagramUrl = `https://www.instagram.com/${store.instagram.replace('@', '')}`;
    schema.sameAs = schema.sameAs ? [...schema.sameAs, instagramUrl] : [instagramUrl];
  }

  // Add categories as keywords
  if (store.categories && store.categories.length > 0) {
    schema.keywords = store.categories.join(', ');
  }

  // Add aggregate rating based on save count (signals popularity to Google)
  const saveCount = store.saveCount || 0;
  if (saveCount >= 1) {
    // Map save count to a rating: 1-4 saves = 4.0, 5-9 = 4.3, 10-19 = 4.5, 20+ = 4.8
    let ratingValue = 4.0;
    if (saveCount >= 20) ratingValue = 4.8;
    else if (saveCount >= 10) ratingValue = 4.5;
    else if (saveCount >= 5) ratingValue = 4.3;

    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: ratingValue,
      bestRating: 5,
      worstRating: 1,
      ratingCount: saveCount,
    };
  }

  // Add opening hours if available
  if (store.hours) {
    schema.openingHours = store.hours;
  }

  return schema;
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Generate WebSite schema for homepage
 */
export function generateWebsiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: 'Lost in Transit Japan',
    url: SITE_URL,
    description: 'Discover the best vintage stores, coffee shops, restaurants, and hidden gems across Japan.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/map?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${IMAGEKIT_BASE}/logo.png`,
    description: 'Your curated guide to the best stores and hidden gems across Japan.',
    sameAs: [
      // Add social media links when available
      // 'https://www.instagram.com/lostintransitjp',
      // 'https://twitter.com/lostintransitjp',
    ].filter(Boolean),
  };
}

/**
 * Generate ItemList schema for city/neighborhood pages
 */
export function generateItemListSchema(
  stores: Store[],
  listName: string,
  listUrl: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    url: `${SITE_URL}${listUrl}`,
    numberOfItems: stores.length,
    itemListElement: stores.slice(0, 50).map((store, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/store/${store.slug || store.id}`,
      name: store.name,
    })),
  };
}

/**
 * Generate Place schema for city pages
 */
export function generateCitySchema(
  cityName: string,
  citySlug: string,
  storeCount: number
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'City',
    name: cityName,
    url: `${SITE_URL}/city/${citySlug}`,
    containedInPlace: {
      '@type': 'Country',
      name: 'Japan',
    },
    description: `Explore ${storeCount} curated stores, restaurants, and hidden gems in ${cityName}, Japan.`,
  };
}

/**
 * Generate BlogPosting schema
 */
export function generateBlogPostSchema(post: {
  title: string;
  slug: string;
  description?: string;
  content?: string;
  image?: string;
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    url: `${SITE_URL}/blog/${post.slug}`,
    description: post.description,
    image: post.image,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
  };
}
