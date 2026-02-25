/**
 * Get a display username from a profiles join result.
 * Falls back to a short user-id-derived handle rather than "Anonymous".
 * @param profiles - the joined profiles object { username, display_name }
 * @param userId   - the user_id from the row (used as last-resort fallback)
 */
export function getDisplayUsername(
  profiles: { username: string | null; display_name: string | null } | null | undefined,
  userId?: string | null,
): string {
  if (profiles?.username) return profiles.username;
  if (profiles?.display_name) return profiles.display_name;
  if (userId) return `user_${userId.slice(0, 4)}`;
  return 'traveler';
}

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

/**
 * Slugify a single string segment
 */
function slugPart(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate an SEO-friendly slug for a find URL.
 * Format: {item-or-type}-{store-name}-{city}--{short-uuid}
 * Example: diesel-sweater-lvmy-lnd-nakano--182e3457
 */
export function generateFindSlug(find: {
  id: string;
  type: 'visit' | 'haul';
  item_name?: string | null;
  store_name: string;
  city: string;
  neighborhood?: string | null;
}): string {
  const label = find.item_name
    ? slugPart(find.item_name)
    : find.type === 'visit' ? 'visit' : 'pickup';
  const store = slugPart(find.store_name);
  const location = slugPart(find.neighborhood || find.city);
  const shortId = find.id.split('-')[0]; // first 8 chars of UUID
  return `${label}-${store}-${location}--${shortId}`;
}

/**
 * Extract the full UUID from a find slug param.
 * The slug ends with --{shortId} where shortId is the first UUID segment.
 * We receive the full id from the DB lookup using the short prefix.
 * This just returns the short ID portion for querying.
 */
export function extractFindShortId(slugParam: string): string | null {
  const match = slugParam.match(/--([0-9a-f]{8})$/i);
  return match ? match[1] : null;
}
