import csv
import time
import re
import requests
from urllib.parse import urlparse, parse_qs

# ============================================================================
# CONFIGURATION
# ============================================================================
# Replace with your actual Google API key
GOOGLE_API_KEY = "AIzaSyDbYxOTi_JkL5n_Sw2smuMrstVxX34WU0E"

# Input and output file paths
INPUT_FILE = "Japan_Stores_Clean.csv"
OUTPUT_FILE = "Japan_Stores_Enriched.csv"

# Rate limiting: delay between API calls (in seconds)
API_DELAY = 0.1  # 100ms between calls to stay under rate limits

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def extract_place_id_from_url(url):
    """
    Extract Place ID from a Google Maps URL if present.
    """
    if not url:
        return None
    
    try:
        # Method 1: Look for ChI format Place ID (the valid format)
        match = re.search(r'!1s(ChI[a-zA-Z0-9_-]+)', url)
        if match:
            return match.group(1)
        
        # Method 2: Look for Place ID in ftid parameter
        parsed = urlparse(url)
        params = parse_qs(parsed.query)
        if 'ftid' in params:
            place_id = params['ftid'][0]
            if place_id.startswith('ChI'):
                return place_id
        
        # Method 3: Check if URL contains /place/ with ChI format
        match = re.search(r'/place/[^/]*/(ChI[a-zA-Z0-9_-]+)', url)
        if match:
            return match.group(1)
            
    except Exception as e:
        print(f"  ⚠ Error parsing URL: {e}")
    
    return None


def extract_coords_from_url(url):
    """
    Extract latitude and longitude from Google Maps URL if present.
    Example: https://www.google.com/maps/place/@35.6812,139.7671,17z
    """
    if not url:
        return None, None
    
    try:
        # Look for @LAT,LNG pattern
        match = re.search(r'@(-?\d+\.\d+),(-?\d+\.\d+)', url)
        if match:
            lat = float(match.group(1))
            lng = float(match.group(2))
            return lat, lng
    except Exception as e:
        print(f"  ⚠ Error extracting coordinates: {e}")
    
    return None, None


def get_place_details_by_id(place_id):
    """
    Fetch place details using Google Place Details API with a Place ID.
    Gets: name, address, coordinates, photos, and website.
    """
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "name,formatted_address,geometry,place_id,photos,website",
        "key": GOOGLE_API_KEY
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get("status") == "OK":
            result = data.get("result", {})
            
            # Extract photo URL if available
            photo_url = ""
            photo_attribution = ""
            if result.get("photos") and len(result["photos"]) > 0:
                photo_ref = result["photos"][0].get("photo_reference")
                if photo_ref:
                    photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference={photo_ref}&key={GOOGLE_API_KEY}"
                    # Get attribution
                    attributions = result["photos"][0].get("html_attributions", [])
                    photo_attribution = attributions[0] if attributions else ""
            
            return {
                "name": result.get("name"),
                "address": result.get("formatted_address"),
                "lat": result.get("geometry", {}).get("location", {}).get("lat"),
                "lng": result.get("geometry", {}).get("location", {}).get("lng"),
                "place_id": result.get("place_id"),
                "photo_url": photo_url,
                "photo_attribution": photo_attribution,
                "website": result.get("website", "")
            }
        else:
            print(f"  ⚠ Place Details API returned status: {data.get('status')}")
            return None
            
    except Exception as e:
        print(f"  ❌ Error calling Place Details API: {e}")
        return None


def search_place_by_name(name, region="jp"):
    """
    Search for a place using Google Places Text Search API.
    """
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": name,
        "region": region,
        "key": GOOGLE_API_KEY
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get("status") == "OK" and data.get("results"):
            result = data["results"][0]  # Take the first result
            place_id = result.get("place_id")
            
            # Get full details including photos and website
            if place_id:
                return get_place_details_by_id(place_id)
            
            # Fallback if no place_id
            return {
                "name": result.get("name"),
                "address": result.get("formatted_address"),
                "lat": result.get("geometry", {}).get("location", {}).get("lat"),
                "lng": result.get("geometry", {}).get("location", {}).get("lng"),
                "place_id": place_id,
                "photo_url": "",
                "photo_attribution": "",
                "website": ""
            }
        else:
            print(f"  ⚠ Text Search API returned status: {data.get('status')}")
            return None
            
    except Exception as e:
        print(f"  ❌ Error calling Text Search API: {e}")
        return None


def enrich_store_data(row, seen_place_ids):
    """
    Enrich a single store row with data from Google Places API.
    """
    title = row.get("Title", "").strip()
    note = row.get("Note", "").strip()
    url = row.get("URL", "").strip()
    existing_lat = row.get("Latitude", "").strip()
    existing_lng = row.get("Longitude", "").strip()
    
    print(f"\n📍 Processing: {title}")
    
    # Try to extract Place ID from URL first
    place_id = extract_place_id_from_url(url)
    place_data = None
    
    if place_id:
        print(f"  ✓ Found Place ID in URL: {place_id}")
        if place_id in seen_place_ids:
            print(f"  ⚠ Duplicate Place ID detected, skipping...")
            return None
        place_data = get_place_details_by_id(place_id)
        time.sleep(API_DELAY)
    
    # If no Place ID or API call failed, try extracting coordinates from URL
    if not place_data:
        lat_from_url, lng_from_url = extract_coords_from_url(url)
        if lat_from_url and lng_from_url:
            print(f"  ✓ Found coordinates in URL: ({lat_from_url}, {lng_from_url})")
            # Still try to get place details by searching with the name
            place_data = search_place_by_name(title)
            time.sleep(API_DELAY)
            if not place_data:
                # Use URL coordinates as fallback
                place_data = {
                    "name": title,
                    "address": "",
                    "lat": lat_from_url,
                    "lng": lng_from_url,
                    "place_id": "",
                    "photo_url": "",
                    "photo_attribution": "",
                    "website": ""
                }
    
    # If still no data, search by title
    if not place_data:
        print(f"  🔍 Searching by name: {title}")
        place_data = search_place_by_name(title)
        time.sleep(API_DELAY)
    
    # If we still have no data, return None
    if not place_data:
        print(f"  ❌ Could not find place data")
        return None
    
    # Check for duplicate Place ID
    if place_data.get("place_id") and place_data["place_id"] in seen_place_ids:
        print(f"  ⚠ Duplicate Place ID detected after API call, skipping...")
        return None
    
    # Mark this Place ID as seen
    if place_data.get("place_id"):
        seen_place_ids.add(place_data["place_id"])
    
    # Show what we enriched
    enriched_fields = []
    if place_data.get("photo_url"):
        enriched_fields.append("📸 photo")
    if place_data.get("website"):
        enriched_fields.append("🌐 website")
    
    print(f"  ✅ Enriched: {place_data.get('name')}")
    if enriched_fields:
        print(f"     Added: {', '.join(enriched_fields)}")
    
    return {
        "Title": title,
        "Note": note,
        "URL": url,
        "Resolved Name": place_data.get("name", ""),
        "Formatted Address": place_data.get("address", ""),
        "Latitude": place_data.get("lat", ""),
        "Longitude": place_data.get("lng", ""),
        "Place ID": place_data.get("place_id", ""),
        "Photo URL": place_data.get("photo_url", ""),
        "Photo Attribution": place_data.get("photo_attribution", ""),
        "Website": place_data.get("website", "")
    }


# ============================================================================
# MAIN SCRIPT
# ============================================================================

def main():
    """
    Main function to process the CSV and enrich store data.
    """
    print("=" * 70)
    print("🗾 Google Maps Store Data Enrichment Script")
    print("=" * 70)
    
    # Check if API key is set
    if GOOGLE_API_KEY == "YOUR_NEW_API_KEY_HERE":
        print("\n❌ ERROR: Please set your Google API key in the script!")
        print("   Edit the GOOGLE_API_KEY variable at the top of the file.\n")
        return
    
    # Read input CSV
    print(f"\n📂 Reading input file: {INPUT_FILE}")
    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        print(f"  ✓ Found {len(rows)} rows")
    except FileNotFoundError:
        print(f"  ❌ ERROR: Could not find {INPUT_FILE}")
        return
    except Exception as e:
        print(f"  ❌ ERROR reading file: {e}")
        return
    
    # Process each row
    enriched_rows = []
    seen_place_ids = set()
    stats = {
        "total": len(rows),
        "with_photos": 0,
        "with_website": 0
    }
    
    for i, row in enumerate(rows, 1):
        print(f"\n[{i}/{len(rows)}]", end=" ")
        enriched_row = enrich_store_data(row, seen_place_ids)
        
        if enriched_row:
            enriched_rows.append(enriched_row)
            
            # Update stats
            if enriched_row.get("Photo URL"):
                stats["with_photos"] += 1
            if enriched_row.get("Website"):
                stats["with_website"] += 1
        else:
            print(f"  ⏭ Skipping row (duplicate or no data found)")
    
    # Write output CSV
    print(f"\n\n💾 Writing enriched data to: {OUTPUT_FILE}")
    try:
        fieldnames = [
            "Title", "Note", "URL", "Resolved Name", 
            "Formatted Address", "Latitude", "Longitude", "Place ID",
            "Photo URL", "Photo Attribution", "Website"
        ]
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(enriched_rows)
        
        print(f"  ✅ Successfully wrote {len(enriched_rows)} enriched rows")
        print(f"\n📊 Statistics:")
        print(f"  • Original rows: {stats['total']}")
        print(f"  • Enriched rows: {len(enriched_rows)}")
        print(f"  • Deduplicated/failed: {stats['total'] - len(enriched_rows)}")
        print(f"  • Stores with photos: {stats['with_photos']}")
        print(f"  • Stores with websites: {stats['with_website']}")
        
    except Exception as e:
        print(f"  ❌ ERROR writing file: {e}")
        return
    
    print("\n" + "=" * 70)
    print("✨ Enrichment complete!")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()

