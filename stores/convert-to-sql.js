import fs from 'fs';

// Read the CSV file
const csvContent = fs.readFileSync('../japan stores ready for sql file.csv', 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Skip first line (title) and second line (headers)
const dataLines = lines.slice(2);

console.log(`Processing ${dataLines.length} stores...`);

// Helper function to escape SQL strings
function escapeSql(str) {
  if (!str || str.trim() === '') return null;
  return str.replace(/'/g, "''");
}

// Helper function to parse CSV line (handles quoted fields with commas)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}

// Helper to extract city from formatted address
function extractCity(address) {
  if (!address) return 'Unknown';
  // Japanese addresses typically have city after prefecture
  // Format: "Japan, 〒postal Tokyo, Ward, Street..."
  const parts = address.split(',');
  if (parts.length >= 3) {
    // Usually third part has the city
    const cityPart = parts[2].trim();
    return cityPart || 'Tokyo'; // Default to Tokyo if unclear
  }
  // Check if Osaka, Tokyo, Kyoto in address
  if (address.includes('Osaka')) return 'Osaka';
  if (address.includes('Tokyo')) return 'Tokyo';
  if (address.includes('Kyoto')) return 'Kyoto';
  return 'Tokyo';
}

// Generate SQL INSERT statements
const sqlStatements = [];

dataLines.forEach((line, index) => {
  const fields = parseCSVLine(line);

  const [title, note, url, resolvedName, formattedAddress, latitude, longitude,
         placeId, photoUrl, photoAttribution, website, neighborhood, instagram, description] = fields;

  // Skip if missing critical data
  if (!title || !latitude || !longitude) {
    console.log(`Skipping row ${index + 1}: missing critical data`);
    return;
  }

  const name = escapeSql(title.trim());
  const address = escapeSql(formattedAddress || 'Japan');
  const city = escapeSql(extractCity(formattedAddress));
  const neighborhoodClean = escapeSql(neighborhood?.trim());
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  const desc = escapeSql(description || '');
  const websiteClean = escapeSql(website?.trim());
  const instagramClean = escapeSql(instagram?.trim());
  const photoUrlClean = escapeSql(photoUrl?.trim());

  // Build photo array
  const photosArray = photoUrlClean ? `ARRAY['${photoUrlClean}']` : 'ARRAY[]::TEXT[]';

  // Create INSERT statement
  const sql = `INSERT INTO stores (name, address, city, neighborhood, country, location, categories, description, photos, website, instagram, verified)
VALUES (
  '${name}',
  '${address}',
  '${city}',
  ${neighborhoodClean ? `'${neighborhoodClean}'` : 'NULL'},
  'Japan',
  ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography,
  ARRAY['Fashion', 'Shopping']::TEXT[],
  ${desc ? `'${desc}'` : 'NULL'},
  ${photosArray},
  ${websiteClean ? `'${websiteClean}'` : 'NULL'},
  ${instagramClean ? `'${instagramClean}'` : 'NULL'},
  true
);`;

  sqlStatements.push(sql);
});

// Write to SQL file
const output = `-- Migration: Import stores from CSV
-- Generated: ${new Date().toISOString()}
-- Total stores: ${sqlStatements.length}

${sqlStatements.join('\n\n')}
`;

fs.writeFileSync('006_import_stores.sql', output);
console.log(`✅ Generated 006_import_stores.sql with ${sqlStatements.length} stores`);
