/**
 * Muse-only optional intake fields. Keep this independent of Deno and the
 * database so invalid payloads can be rejected before any external lookup.
 */
export const SOURCE_TYPES = [
  'social_post',
  'social_profile',
  'editorial_article',
  'store_website',
  'directory',
  'other',
] as const;

export const DISCOVERED_VIA = [
  'instagram',
  'threads',
  'web_search',
  'website',
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
): FieldResult<OptionalIntakeFields> {
  const website = optionalText(body, 'website', 2048);
  if (!website.ok) return website;
  if (website.value) {
    try {
      const url = new URL(website.value);
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
        return { ok: false, error: 'website must be an http(s) URL with a domain and no credentials' };
      }
    } catch {
      return { ok: false, error: 'website must be a valid http(s) URL' };
    }
  }

  const instagramBio = optionalText(body, 'instagram_bio', 1000);
  if (!instagramBio.ok) return instagramBio;
  const brandsCarried = optionalBrands(body);
  if (!brandsCarried.ok) return brandsCarried;
  const priceRange = optionalText(body, 'price_range', 3);
  if (!priceRange.ok) return priceRange;
  if (priceRange.value && !['$', '$$', '$$$'].includes(priceRange.value)) {
    return { ok: false, error: 'price_range must be $, $$, or $$$' };
  }

  const openingDate = optionalText(body, 'opening_date', 10);
  if (!openingDate.ok) return openingDate;
  if (openingDate.value && !validDate(openingDate.value)) {
    return { ok: false, error: 'opening_date must be a real YYYY-MM-DD date' };
  }

  const verificationEvidence = optionalText(body, 'verification_evidence', 2000);
  if (!verificationEvidence.ok) return verificationEvidence;
  const sourceType = optionalText(body, 'source_type', 40);
  if (!sourceType.ok) return sourceType;
  if (sourceType.value && !(SOURCE_TYPES as readonly string[]).includes(sourceType.value)) {
    return { ok: false, error: `source_type must be one of: ${SOURCE_TYPES.join(', ')}` };
  }
  const sourceAccount = optionalText(body, 'source_account', 200);
  if (!sourceAccount.ok) return sourceAccount;
  const discoveredVia = optionalText(body, 'discovered_via', 40);
  if (!discoveredVia.ok) return discoveredVia;
  if (discoveredVia.value && !(DISCOVERED_VIA as readonly string[]).includes(discoveredVia.value)) {
    return { ok: false, error: `discovered_via must be one of: ${DISCOVERED_VIA.join(', ')}` };
  }

  return {
    ok: true,
    value: {
      website: website.value,
      instagram_bio: instagramBio.value,
      brands_carried: brandsCarried.value,
      price_range: priceRange.value,
      opening_date: openingDate.value,
      verification_evidence: verificationEvidence.value,
      source_type: sourceType.value,
      source_account: sourceAccount.value,
      discovered_via: discoveredVia.value,
    },
  };
}
