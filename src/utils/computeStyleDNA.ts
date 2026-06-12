/**
 * computeStyleDNA.ts
 *
 * Derives a personal style identity from a user's GPS-verified stamp history.
 *
 * Identity line format:  "[Category] fan · Runs [Neighborhood]"
 * Examples:
 *   "Archive fan · Runs Shimokita"
 *   "Vintage & Archive fan · Runs Harajuku"
 *   "Vintage fan · Covering Tokyo"
 *   "Archive fan · Tokyo to Osaka"
 *
 * Requires ≥ MINIMUM_STAMPS stamps to produce a result.
 * Returns null below the threshold so the UI can show a teaser.
 */

export const MINIMUM_STAMPS = 10;

// ─── Category mapping ─────────────────────────────────────────────────────────
// Maps raw DB values (primary_category / main_category) to a canonical group
// and a display label. Null / generic "Fashion" values are excluded — they
// carry no taste signal.

interface CategoryDef {
  label: string;   // display: "Archive fan", "Vintage fan", etc.
  group: string;   // de-dupe key (secondhand merges into vintage)
}

const CATEGORY_MAP: Record<string, CategoryDef> = {
  'archive':       { label: 'Archive',       group: 'archive'      },
  'vintage':       { label: 'Vintage',       group: 'vintage'      },
  'secondhand':    { label: 'Vintage',       group: 'vintage'      }, // same culture
  'streetwear':    { label: 'Streetwear',    group: 'streetwear'   },
  'concept store': { label: 'Concept store', group: 'concept'      },
  'designer':      { label: 'Designer',      group: 'designer'     },
  'avant-garde':   { label: 'Avant-garde',   group: 'avant-garde'  },
  'select shop':   { label: 'Select shop',   group: 'select'       },
  'military':      { label: 'Military',      group: 'military'     },
  'luxury':        { label: 'Luxury',        group: 'luxury'       },
  'womenswear':    { label: 'Womenswear',    group: 'womenswear'   },
  'antiques':      { label: 'Antiques',      group: 'antiques'     },
  // Top-level fallbacks when primary_category is null
  'coffee':        { label: 'Coffee',        group: 'coffee'       },
  'food':          { label: 'Food',          group: 'food'         },
  'home goods':    { label: 'Home goods',    group: 'home'         },
};

// Values to skip — too generic to carry taste signal
const SKIP_VALUES = new Set(['fashion', 'Fashion', null, undefined, '']);

function resolveCategory(
  primaryCategory: string | null | undefined,
  mainCategory: string | null | undefined,
): CategoryDef | null {
  // Try primary subcategory first
  if (primaryCategory && !SKIP_VALUES.has(primaryCategory)) {
    const key = primaryCategory.toLowerCase().trim();
    if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
  }
  // Fall back to main_category (catches Coffee, Food, etc. with no subcategory)
  if (mainCategory && !SKIP_VALUES.has(mainCategory)) {
    const key = mainCategory.toLowerCase().trim();
    if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
  }
  return null;
}

// ─── Neighborhood → behavior label ───────────────────────────────────────────

// Shorten long neighborhood names for the identity line
const NEIGHBORHOOD_SHORT: Record<string, string> = {
  'Shimokitazawa':     'Shimokita',
  'Shinjuku':          'Shinjuku',
  'Shibuya':           'Shibuya',
  'Harajuku':          'Harajuku',
  'Daikanyama':        'Daikanyama',
  'Nakameguro':        'Nakameguro',
  'Koenji':            'Koenji',
  'Ebisu':             'Ebisu',
  'Omotesando':        'Omotesando',
  'Ikebukuro':         'Ikebukuro',
  'Ueno':              'Ueno',
  'Akihabara':         'Akihabara',
  'Asakusa':           'Asakusa',
  'Ginza':             'Ginza',
  'Roppongi':          'Roppongi',
};

function shortNeighborhood(name: string): string {
  return NEIGHBORHOOD_SHORT[name] ?? name;
}

function buildLocationLabel(
  neighborhoodCounts: Map<string, number>,
  cityCounts: Map<string, number>,
  totalStamps: number,
): string | null {
  // Multi-city check: two cities each with ≥ 20% of stamps
  const topCities = [...cityCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .filter(([, c]) => c / totalStamps >= 0.20);

  if (topCities.length >= 2) {
    return `${topCities[0][0]} to ${topCities[1][0]}`;
  }

  if (neighborhoodCounts.size === 0) return null;

  const topNeighborhoods = [...neighborhoodCounts.entries()]
    .sort((a, b) => b[1] - a[1]);

  const [topNbhd, topCount] = topNeighborhoods[0];
  const topPct = topCount / totalStamps;

  // Single dominant neighborhood (≥ 35%)
  if (topPct >= 0.35) {
    return `Runs ${shortNeighborhood(topNbhd)}`;
  }

  // Two co-dominant neighborhoods (each ≥ 20%)
  if (
    topNeighborhoods.length >= 2 &&
    topNeighborhoods[1][1] / totalStamps >= 0.20
  ) {
    const n1 = shortNeighborhood(topNbhd);
    const n2 = shortNeighborhood(topNeighborhoods[1][0]);
    return `Runs ${n1} & ${n2}`;
  }

  // Spread across many neighborhoods in one city
  const topCity = topCities[0]?.[0];
  if (topCity) return `Covering ${topCity}`;

  return null;
}

// ─── Output types ─────────────────────────────────────────────────────────────

export interface CategoryBreakdown {
  group: string;
  label: string;      // e.g. "Archive"
  count: number;
  percentage: number; // 0–100
}

export interface StyleDNAResult {
  identityLine: string;              // "Archive fan · Runs Shimokita"
  categoryLabel: string | null;      // "Archive fan" (just the category part)
  locationLabel: string | null;      // "Runs Shimokita" (just the location part)
  breakdown: CategoryBreakdown[];    // top categories for the bar chart
  topNeighborhood: string | null;
  topCity: string | null;
  stampCount: number;
  classifiedCount: number;           // stamps that had a classifiable category
}

// ─── Input shape (subset of Checkin from ProfilePage) ────────────────────────

export interface CheckinForDNA {
  primary_category?: string | null;
  main_category?: string | null;
  neighborhood?: string | null;
  city?: string | null;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function computeStyleDNA(
  checkins: CheckinForDNA[],
): StyleDNAResult | null {
  if (checkins.length < MINIMUM_STAMPS) return null;

  // Tally category groups
  const groupCounts = new Map<string, { label: string; count: number }>();
  let classifiedCount = 0;

  for (const c of checkins) {
    const def = resolveCategory(c.primary_category, c.main_category);
    if (!def) continue;
    classifiedCount++;
    const existing = groupCounts.get(def.group);
    if (existing) {
      existing.count++;
    } else {
      groupCounts.set(def.group, { label: def.label, count: 1 });
    }
  }

  // Tally neighborhoods and cities
  const neighborhoodCounts = new Map<string, number>();
  const cityCounts = new Map<string, number>();

  for (const c of checkins) {
    if (c.neighborhood) {
      neighborhoodCounts.set(c.neighborhood, (neighborhoodCounts.get(c.neighborhood) ?? 0) + 1);
    }
    if (c.city) {
      cityCounts.set(c.city, (cityCounts.get(c.city) ?? 0) + 1);
    }
  }

  const total = checkins.length;
  const classifiedTotal = classifiedCount;

  // Build sorted breakdown
  const breakdown: CategoryBreakdown[] = [...groupCounts.entries()]
    .map(([group, { label, count }]) => ({
      group,
      label,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // show top 5 at most

  // Category label: top 1 or 2 groups
  let categoryLabel: string | null = null;
  if (breakdown.length > 0) {
    const top = breakdown[0];
    const second = breakdown[1];
    const topPct = top.count / total;
    const secondPct = second ? second.count / total : 0;

    if (topPct >= 0.45) {
      // Clear winner
      categoryLabel = `${top.label} fan`;
    } else if (topPct >= 0.25 && secondPct >= 0.20) {
      // Two co-dominant
      categoryLabel = `${top.label} & ${second.label} fan`;
    } else if (topPct >= 0.20) {
      categoryLabel = `${top.label} fan`;
    } else if (classifiedTotal > 0) {
      // No clear leader — pick the top one anyway
      categoryLabel = `${top.label} fan`;
    }
  }

  // Location label
  const locationLabel = buildLocationLabel(neighborhoodCounts, cityCounts, total);

  // Top neighborhood / city for display
  const topNeighborhood = [...neighborhoodCounts.entries()]
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const topCity = [...cityCounts.entries()]
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Identity line
  const parts = [categoryLabel, locationLabel].filter(Boolean);
  const identityLine = parts.length > 0
    ? parts.join(' · ')
    : `${total} stores explored`;

  return {
    identityLine,
    categoryLabel,
    locationLabel,
    breakdown,
    topNeighborhood,
    topCity,
    stampCount: total,
    classifiedCount,
  };
}
