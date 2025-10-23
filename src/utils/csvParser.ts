/**
 * CSV Parser for Google Maps Saved Places Export
 * Supports two formats:
 * 1. Full export (with Place ID, address, coordinates, etc.)
 * 2. Simple export (only Title and URL)
 */

export interface ParsedStoreRow {
  title: string;
  note?: string;
  url: string;
  placeId?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  neighborhood?: string;
  instagram?: string;
  website?: string;
  description?: string;
  photoUrl?: string;
  rowIndex: number; // For error tracking
}

export interface CSVParseResult {
  stores: ParsedStoreRow[];
  errors: Array<{ row: number; error: string }>;
  format: 'full' | 'simple';
}

/**
 * Extract Place ID from Google Maps URL
 * Handles multiple URL formats
 * IMPORTANT: Only returns valid ChIJ format Place IDs, ignores hex format
 */
export function extractPlaceIdFromUrl(url: string): string | null {
  if (!url) return null;

  try {
    // Format 1: ChIJ... format directly in URL (VALID - use this!)
    const chijMatch = url.match(/ChIJ[\w-]+/);
    if (chijMatch) {
      return chijMatch[0];
    }

    // Format 2: place_id= parameter with ChIJ format
    const paramMatch = url.match(/place_id=(ChIJ[\w-]+)/);
    if (paramMatch) {
      return paramMatch[1];
    }

    // Format 3: Hex format (0x...:0x...) - CANNOT be used directly
    // Return null so we search by name instead
    const hexMatch = url.match(/1s0x[a-fA-F0-9]+:0x[a-fA-F0-9]+/);
    if (hexMatch) {
      console.log(`⚠️ Found hex Place ID in URL - will search by name instead`);
      return null; // Let the system search by store name
    }

    console.warn('⚠️ Could not extract valid Place ID from URL:', url);
    return null;
  } catch (error) {
    console.error('❌ Error extracting Place ID:', error);
    return null;
  }
}

/**
 * Parse CSV content from Google Maps export
 */
export function parseGoogleMapsCsv(csvContent: string): CSVParseResult {
  const lines = csvContent.split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    return { stores: [], errors: [{ row: 0, error: 'CSV file is empty' }], format: 'simple' };
  }

  const header = lines[0].split(',').map(h => h.trim());
  const stores: ParsedStoreRow[] = [];
  const errors: Array<{ row: number; error: string }> = [];

  // Detect format based on headers
  const hasPlaceId = header.includes('Place ID');
  const hasFormattedAddress = header.includes('Formatted Address');
  const format: 'full' | 'simple' = (hasPlaceId && hasFormattedAddress) ? 'full' : 'simple';

  console.log(`📊 Detected CSV format: ${format.toUpperCase()}`);
  console.log(`📋 Headers:`, header);

  // Parse each row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    try {
      const row = parseCSVLine(line);

      // Map columns based on header
      const rowData: any = {};
      header.forEach((colName, idx) => {
        rowData[colName] = row[idx] || '';
      });

      // Extract required fields
      const title = rowData['Title'] || '';
      const url = rowData['URL'] || '';

      if (!title && !url) {
        // Skip empty rows
        continue;
      }

      if (!title) {
        errors.push({ row: i + 1, error: 'Missing store title' });
        continue;
      }

      if (!url) {
        errors.push({ row: i + 1, error: `Missing URL for "${title}"` });
        continue;
      }

      const parsed: ParsedStoreRow = {
        title,
        url,
        note: rowData['Note'] || undefined,
        rowIndex: i + 1,
      };

      // Full format fields
      if (format === 'full') {
        parsed.placeId = rowData['Place ID'] || undefined;
        parsed.address = rowData['Formatted Address'] || rowData['Resolved Address'] || undefined;
        parsed.latitude = parseFloat(rowData['Latitude']) || undefined;
        parsed.longitude = parseFloat(rowData['Longitude']) || undefined;
        parsed.neighborhood = rowData['Neighborhood'] || undefined;
        parsed.instagram = rowData['Instagram'] || undefined;
        parsed.website = rowData['Website'] || undefined;
        parsed.description = rowData['Description'] || undefined;
        parsed.photoUrl = rowData['Photo URL'] || undefined;
      }

      // Try to extract Place ID from URL if not provided
      if (!parsed.placeId) {
        parsed.placeId = extractPlaceIdFromUrl(url) || undefined;
      }

      stores.push(parsed);
    } catch (error) {
      errors.push({
        row: i + 1,
        error: error instanceof Error ? error.message : 'Parse error'
      });
    }
  }

  console.log(`✅ Parsed ${stores.length} stores, ${errors.length} errors`);

  return { stores, errors, format };
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Toggle quote state
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}

/**
 * Validate parsed stores before processing
 */
export function validateStores(stores: ParsedStoreRow[]): {
  valid: ParsedStoreRow[];
  invalid: Array<{ store: ParsedStoreRow; reason: string }>;
} {
  const valid: ParsedStoreRow[] = [];
  const invalid: Array<{ store: ParsedStoreRow; reason: string }> = [];

  for (const store of stores) {
    if (!store.title) {
      invalid.push({ store, reason: 'Missing title' });
      continue;
    }

    if (!store.url && !store.placeId) {
      invalid.push({ store, reason: 'Missing URL and Place ID' });
      continue;
    }

    valid.push(store);
  }

  return { valid, invalid };
}
