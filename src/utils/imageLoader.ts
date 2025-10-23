/**
 * Image Loader Utility for Japan Maps
 * 
 * Provides utilities for loading optimized images with fallbacks
 */

import manifest from '../data/imageManifest.json';

export interface ImageSet {
  webp: string;
  jpg: string;
  width: number;
  height: number;
}

export interface LocationImage {
  slug: string;
  name?: string;
  hasCustomImage: boolean;
  square: ImageSet;
  preview: ImageSet;
  metadata?: {
    photographer?: string;
    date?: string;
    altText?: string;
  };
}

/**
 * Get image URLs for a city
 */
export function getCityImage(cityName: string, type: 'square' | 'preview' = 'square'): ImageSet | null {
  const slug = nameToSlug(cityName);
  const cityData = manifest.cities[slug];

  if (cityData && cityData.hasCustomImage) {
    return cityData[type];
  }

  // Return fallback
  return getFallbackImage('city', type);
}

/**
 * Get image URLs for a neighborhood
 */
export function getNeighborhoodImage(
  neighborhoodName: string,
  type: 'square' | 'preview' = 'square'
): ImageSet | null {
  const slug = nameToSlug(neighborhoodName);
  const neighborhoodData = manifest.neighborhoods[slug];

  if (neighborhoodData && neighborhoodData.hasCustomImage) {
    return neighborhoodData[type];
  }

  // Return fallback
  return getFallbackImage('neighborhood', type);
}

/**
 * Get all available city images
 */
export function getAllCityImages(): Record<string, LocationImage> {
  return manifest.cities;
}

/**
 * Get all available neighborhood images
 */
export function getAllNeighborhoodImages(): Record<string, LocationImage> {
  return manifest.neighborhoods;
}

/**
 * Convert location name to slug
 */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\/\s*/g, '-') // Handle "Kanagawa / Yokohama"
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Get fallback image
 */
function getFallbackImage(locationType: 'city' | 'neighborhood', imageType: 'square' | 'preview'): ImageSet {
  const base = `/images/fallbacks/${locationType}-default`;
  
  if (imageType === 'square') {
    return {
      webp: `${base}-square.webp`,
      jpg: `${base}-square.jpg`,
      width: 240,
      height: 240,
    };
  } else {
    return {
      webp: `${base}-preview.webp`,
      jpg: `${base}-preview.jpg`,
      width: 840,
      height: 1000,
    };
  }
}

/**
 * Check if browser supports WebP
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width === 1);
    img.onerror = () => resolve(false);
    img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  });
}

/**
 * Get the best image URL based on browser support
 */
export async function getBestImageUrl(imageSet: ImageSet): Promise<string> {
  const webpSupported = await supportsWebP();
  return webpSupported ? imageSet.webp : imageSet.jpg;
}

/**
 * Get image URL synchronously (prefers WebP)
 */
export function getImageUrl(imageSet: ImageSet, preferWebP: boolean = true): string {
  return preferWebP ? imageSet.webp : imageSet.jpg;
}

/**
 * Build srcset for responsive images
 */
export function buildSrcSet(imageSet: ImageSet): string {
  return `${imageSet.webp} 2x, ${imageSet.jpg} 1x`;
}

