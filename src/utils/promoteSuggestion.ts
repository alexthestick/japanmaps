import { supabase } from '../lib/supabase';
import { generateSlug } from './slugify';
import { migrateStorePhotosViaEdge } from './edgePhotoFetcher';
import type { MainCategory, SubCategory } from '../types/store';

export interface PromoteSuggestionInput {
  /** store_suggestions.id being promoted */
  id: string;
  storeName: string;
  city: string;
  neighborhood?: string | null;
  address?: string | null;
  country?: string | null;
  instagram?: string | null;
  website?: string | null;
  lat?: number | null;
  lng?: number | null;
  googlePlaceId?: string | null;
  /** Chosen by the admin at approve time (Phase 2: single-select dropdown) */
  mainCategory: MainCategory;
  categories?: SubCategory[];
  notes?: string | null;
}

export interface PromoteSuggestionResult {
  storeId: string;
  slug: string;
}

/**
 * Turns a store_suggestions row into a real, unverified `stores` row — the
 * "publish" step the Admin Dashboard's Approve button never actually did
 * (it only ever flipped suggestion.status, so approving created nothing).
 *
 * Mirrors BulkImportQueue.tsx's insert -> slug-retry -> photo-migration
 * pattern so a promoted store behaves exactly like a manually-imported one:
 * same slug generation (generateSlug), same 23505 collision handling with
 * -2/-3/-4 suffixes, same best-effort migrateStorePhotosViaEdge() call when
 * a google_place_id is available.
 *
 * Safe to call on a suggestion whose status is already 'pending' or
 * 'approved' (the latter covers the orphan case: a row Alex already
 * approved before this flow existed, where promoted_store_id is still
 * null). It is NOT safe to call twice successfully for the same row in
 * normal operation — callers should check promoted_store_id first and only
 * offer this when it's null, so a suggestion is never turned into two
 * stores.
 *
 * On success, sets store_suggestions.status = 'approved' and
 * promoted_store_id = <new store id> in the same call. If that update
 * fails after the store was already created, the error is re-thrown with
 * the new store id included, so the caller can surface a precise "store
 * was created, but the suggestion record wasn't marked" message instead of
 * a generic failure (this pairing, not the store insert alone, is what
 * makes promoted_store_id IS NULL a reliable orphan signal elsewhere in the
 * dashboard).
 */
export async function promoteSuggestion(
  input: PromoteSuggestionInput,
): Promise<PromoteSuggestionResult> {
  if (input.lat == null || input.lng == null) {
    throw new Error(
      'This suggestion has no coordinates (geocode_confidence was likely "none"). ' +
        'Add a location before approving — stores.location is required and can\'t be left blank.',
    );
  }

  const storeCity = input.city || 'Tokyo';
  const baseSlug = generateSlug(input.storeName, storeCity);
  const safeSlug = baseSlug.replace(/^-+/, '') || `store-${input.id.slice(0, 8)}`;

  // `any` here matches the existing convention in BulkImportQueue.tsx — the
  // generated Supabase types (src/types/database.ts) are stale relative to
  // the live schema, so a precisely-typed insert payload fights the
  // generated Insert type rather than the actual columns.
  const storeData: any = {
    name: input.storeName,
    address: input.address || '',
    city: storeCity,
    neighborhood: input.neighborhood || null,
    country: input.country || 'Japan',
    location: `POINT(${input.lng} ${input.lat})`,
    main_category: input.mainCategory,
    categories: input.categories || [],
    description: input.notes || null,
    photos: [],
    website: input.website || null,
    instagram: input.instagram || null,
    verified: false,
    verification_status: 'unverified',
    google_place_id: input.googlePlaceId || null,
    import_source: 'discovery_bot',
    // find_store_duplicates()'s fuzzy_name tier filters on normalized_name
    // <> '' — leaving this null would make the newly-promoted store
    // invisible to future fuzzy dedup (only google_place_id/instagram exact
    // matches would still catch a re-discovery). Mirrors the SQL side's
    // lower + strip-non-alphanumeric normalization closely enough for
    // Latin-script names; doesn't need to be byte-identical to be useful.
    normalized_name: normalizeName(input.storeName),
  };

  let store: { id: string } | null = null;
  let lastError: { message?: string; code?: string } | null = null;

  for (let attempt = 0; attempt <= 3; attempt++) {
    const slug = attempt === 0 ? safeSlug : `${safeSlug}-${attempt + 1}`;
    const { data, error } = await (supabase.from('stores') as any)
      .insert([{ ...storeData, slug }])
      .select('id')
      .single();

    if (!error && data) {
      store = data;
      break;
    }

    lastError = error;
    const isSlugCollision = error?.code === '23505' || error?.message?.includes('slug');
    if (!isSlugCollision) {
      throw new Error(`Failed to create store: ${error?.message}`);
    }
  }

  if (!store) {
    throw new Error(
      `Slug collision unresolved for "${input.storeName}" — all suffix variants taken (${lastError?.message})`,
    );
  }

  // Photos: best-effort, exactly like BulkImportQueue — a failure here never
  // blocks the promotion, it just leaves photos empty for now.
  if (input.googlePlaceId) {
    try {
      const photoUrls = await migrateStorePhotosViaEdge(store.id, input.googlePlaceId, false);
      if (photoUrls.length > 0) {
        await supabase.from('stores').update({ photos: photoUrls }).eq('id', store.id);
      }
    } catch (photoError) {
      console.error('Photo migration failed (continuing anyway):', photoError);
    }
  }

  const { error: updateError } = await supabase
    .from('store_suggestions')
    .update({ status: 'approved', promoted_store_id: store.id })
    .eq('id', input.id);

  if (updateError) {
    throw new Error(
      `Store created (id: ${store.id}) but failed to mark the suggestion as approved: ${updateError.message}. ` +
        `The store is live — fix the suggestion row manually or retry marking it.`,
    );
  }

  return { storeId: store.id, slug: (storeData.slug as string) ?? safeSlug };
}

/** Rough client-side mirror of the DB's unaccent + strip-non-alphanumeric normalization. */
function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritical marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

/**
 * Reverts an approved-but-orphaned suggestion (promoted_store_id IS NULL)
 * back to 'pending' so it can go through the normal approve flow again,
 * per Alex's "let me flip them back to pending first" option for rows that
 * predate this promote flow.
 */
export async function revertSuggestionToPending(suggestionId: string): Promise<void> {
  const { error } = await supabase
    .from('store_suggestions')
    .update({ status: 'pending' })
    .eq('id', suggestionId);

  if (error) {
    throw new Error(`Failed to revert suggestion to pending: ${error.message}`);
  }
}
