/**
 * Generate a URL-friendly slug from a store name
 * Example: "Graphpaper Kyoto" -> "graphpaper-kyoto"
 */
export function generateSlug(name: string, city?: string): string {
  let slug = name
    .toLowerCase()
    .trim()
    // Remove special characters except spaces and hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');

  // If city is provided and not already in the name, append it for uniqueness
  if (city) {
    const citySlug = city
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Only append city if it's not already part of the slug
    if (!slug.includes(citySlug)) {
      slug = `${slug}-${citySlug}`;
    }
  }

  return slug;
}

/**
 * Check if a string looks like a UUID (store ID) vs a slug
 */
export function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
