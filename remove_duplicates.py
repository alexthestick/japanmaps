import csv
from urllib.parse import urlparse, parse_qs

def extract_place_id(url):
    """Extract place ID from Google Maps URL"""
    # Try to find place_id in URL parameters
    if 'place_id=' in url:
        parsed = urlparse(url)
        params = parse_qs(parsed.query)
        if 'place_id' in params:
            return params['place_id'][0]

    # Try to extract from /data=!4m2!3m1!1s format (place ID after last 1s)
    if '/data=' in url:
        parts = url.split('/data=')
        if len(parts) > 1:
            data_part = parts[1].split('!1s')
            if len(data_part) > 1:
                place_id = data_part[-1].split('!')[0].split('/')[0].split('?')[0]
                return place_id

    return None

# Read favorite places (already imported)
favorites = {}
with open('/Users/alexcoluna/Desktop/Takeout 6/Saved/Favorite places.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row['URL']:
            place_id = extract_place_id(row['URL'])
            if place_id:
                favorites[place_id] = row['Title']

print(f"Found {len(favorites)} places in favorites list")

# Read clothing stores and filter out duplicates
unique_clothing = []
duplicates = []

with open('/Users/alexcoluna/Desktop/Takeout 6/Saved/Japan Clothing Stores.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row['URL']:
            place_id = extract_place_id(row['URL'])
            if place_id and place_id in favorites:
                duplicates.append({
                    'Title': row['Title'],
                    'URL': row['URL'],
                    'MatchedWith': favorites[place_id]
                })
            else:
                unique_clothing.append(row)

print(f"Found {len(duplicates)} duplicates")
print(f"Found {len(unique_clothing)} unique clothing stores")

# Write cleaned clothing stores list
with open('/Users/alexcoluna/Desktop/Project Folder/Japan Maps/Japan_Clothing_Stores_Clean.csv', 'w', encoding='utf-8', newline='') as f:
    fieldnames = ['Title', 'Note', 'URL', 'Tags', 'Comment']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(unique_clothing)

# Write duplicates report
with open('/Users/alexcoluna/Desktop/Project Folder/Japan Maps/Duplicates_Report.csv', 'w', encoding='utf-8', newline='') as f:
    fieldnames = ['Title', 'URL', 'MatchedWith']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(duplicates)

print("\n✓ Created Japan_Clothing_Stores_Clean.csv")
print("✓ Created Duplicates_Report.csv")
