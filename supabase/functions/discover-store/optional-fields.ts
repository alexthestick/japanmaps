/**
 * Muse-only optional intake fields. Keep this independent of Deno and the
 * database so malformed optional values can be dropped before any external lookup.
 */
export const SOURCE_TYPES = [
  'instagram_post',
  'threads_post',
  'instagram_profile',
  'store_website',
  'editorial_article',
  'directory',
  'open_data',
  'other',
] as const;

export const DISCOVERED_VIA = [
  'weekly_sweep',
  'directory_backfill',
  'watchlist',
  'open_data',
  'manual',
  'other',
] as const;

export interface OptionalIntakeFields {
  website: string | null;
  instagram_bio: string | null;
  brands_carried: string[] | null;
  price_range: string | null;
  opening_date: string | null;
  verification_evidence: string | null;
  source_type: string | null;
  source_account: string | null;
  discovered_via: string | null;
}

export interface OptionalIntakeWarning {
  field: keyof OptionalIntakeFields;
  reason: string;
}

export interface OptionalIntakeValidation {
  value: OptionalIntakeFields;
  warnings: OptionalIntakeWarning[];
}

type Valid<T> = { ok: true; value: T };
type Invalid = { ok: false; error: string };
type FieldResult<T> = Valid<T> | Invalid;

function optionalText(body: Record<string, unknown>, field: string, maxLength: number): FieldResult<string | null> {
  const raw = body[field];
  if (raw == null) return { ok: true, value: null };
  if (typeof raw !== 'string') return { ok: false, error: `${field} must be a string` };
  const value = raw.trim();
  if (!value) return { ok: true, value: null };
  if (value.length > maxLength) {
    return { ok: false, error: `${field} must be at most ${maxLength} characters` };
  }
  return { ok: true, value };
}

function optionalBrands(body: Record<string, unknown>): FieldResult<string[] | null> {
  const raw = body.brands_carried;
  if (raw == null) return { ok: true, value: null };
  if (!Array.isArray(raw)) return { ok: false, error: 'brands_carried must be an array of strings' };
  if (raw.length > 30) return { ok: false, error: 'brands_carried may contain at most 30 brands' };

  const values: string[] = [];
  const seen = new Set<string>();
  for (const brand of raw) {
    if (typeof brand !== 'string') {
      return { ok: false, error: 'brands_carried must be an array of strings' };
    }
    const value = brand.trim();
    if (!value || value.length > 100) {
      return { ok: false, error: 'each brand must be 1–100 characters' };
    }
    const key = value.toLocaleLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      values.push(value);
    }
  }
  return { ok: true, value: values.length ? values : null };
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateOptionalIntakeFields(
  body: Record<string, unknown>,
): OptionalIntakeValidation {
  const warnings: OptionalIntakeWarning[] = [];
  const take = <T>(field: keyof OptionalIntakeFields, result: FieldResult<T | null>): T | null => {
    if (result.ok) return result.value;
    warnings.push({ field, reason: result.error });
    return null;
  };

  let website = take('website', optionalText(body, 'website', 2048));
  if (website) {
    try {
      const url = new URL(website);
      const labels = url.hostname.split('.');
      const isIpAddress = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(url.hostname);
      if (
        !['http:', 'https:'].includes(url.protocol) ||
        labels.length < 2 ||
        labels.some((label) => !label) ||
        isIpAddress ||
        url.username ||
        url.password
      ) {
        warnings.push({ field: 'website', reason: 'website must be an http(s) URL with a domain and no credentials' });
        website = null;
      }
    } catch {
      warnings.push({ field: 'website', reason: 'website must be a valid http(s) URL' });
      website = null;
    }
  }

  const instagramBio = take('instagram_bio', optionalText(body, 'instagram_bio', 1000));
  const brandsCarried = take('brands_carried', optionalBrands(body));
  let priceRange = take('price_range', optionalText(body, 'price_range', 3));
  if (priceRange && !['$', '$$', '$$$'].includes(priceRange)) {
    warnings.push({ field: 'price_range', reason: 'price_range must be $, $$, or $$$' });
    priceRange = null;
  }

  let openingDate = take('opening_date', optionalText(body, 'opening_date', 10));
  if (openingDate && !validDate(openingDate)) {
    warnings.push({ field: 'opening_date', reason: 'opening_date must be a real YYYY-MM-DD date' });
    openingDate = null;
  }

  const verificationEvidence = take('verification_evidence', optionalText(body, 'verification_evidence', 2000));
  let sourceType = take('source_type', optionalText(body, 'source_type', 40));
  if (sourceType && !(SOURCE_TYPES as readonly string[]).includes(sourceType)) {
    warnings.push({ field: 'source_type', reason: `source_type must be one of: ${SOURCE_TYPES.join(', ')}` });
    sourceType = null;
  }
  const sourceAccount = take('source_account', optionalText(body, 'source_account', 200));
  let discoveredVia = take('discovered_via', optionalText(body, 'discovered_via', 40));
  if (discoveredVia && !(DISCOVERED_VIA as readonly string[]).includes(discoveredVia)) {
    warnings.push({ field: 'discovered_via', reason: `discovered_via must be one of: ${DISCOVERED_VIA.join(', ')}` });
    discoveredVia = null;
  }

  return {
    value: {
      website,
      instagram_bio: instagramBio,
      brands_carried: brandsCarried,
      price_range: priceRange,
      opening_date: openingDate,
      verification_evidence: verificationEvidence,
      source_type: sourceType,
      source_account: sourceAccount,
      discovered_via: discoveredVia,
    },
    warnings,
  };
}
