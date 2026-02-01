// Main categories (top-level)
export const MAIN_CATEGORIES = [
  'Fashion',
  'Food',
  'Coffee',
  'Home Goods',
  'Museum',
  'Spots',
] as const;

// Sub-categories for Fashion stores
export const FASHION_SUB_CATEGORIES = [
  'archive',
  'vintage',
  'secondhand',
  'streetwear',
  'designer',
  'luxury',
  'avant-garde',
  'military',
  'antiques',
  'stationery',
  'flagship',
  'concept store',
  'womenswear',
  'select shop',
] as const;

// Sub-categories for Food stores
export const FOOD_SUB_CATEGORIES = [
  'Ramen',
  'Sushi',
  'Izakaya',
  'Kaiseki',
  'Yakitori',
  'Tempura',
  'Udon/Soba',
  'Tonkatsu',
  'Yakiniku',
  'Cafe/Restaurant',
  'Bakery',
  'Dessert',
  'Street Food',
  'Fine Dining',
  'Pizza',
  'Burger',
  'Curry',
  'Okonomiyaki',
  'Bar',
  'Japanese',
  'Western',
  'Asian',
  'Foreign',
] as const;

// Coffee has no sub-categories (as per user request)
export const COFFEE_SUB_CATEGORIES = [] as const;

// Sub-categories for Home Goods stores
export const HOME_GOODS_SUB_CATEGORIES = [
  'Antiques',
  'Homeware',
  'Furniture',
  'Art',
  'General Stores',
  'Stationery',
  'Toys',
] as const;

// Museum has no sub-categories
export const MUSEUM_SUB_CATEGORIES = [] as const;

// Spots has no sub-categories
export const SPOTS_SUB_CATEGORIES = [] as const;

// All categories combined (for backward compatibility and store selection)
export const STORE_CATEGORIES = [
  ...FASHION_SUB_CATEGORIES,
  ...FOOD_SUB_CATEGORIES,
  ...COFFEE_SUB_CATEGORIES,
  ...HOME_GOODS_SUB_CATEGORIES,
  ...MUSEUM_SUB_CATEGORIES,
  ...SPOTS_SUB_CATEGORIES,
  'Fashion',
  'Food',
  'Coffee',
  'Home Goods',
  'Museum',
  'Spots',
  'Shopping',
] as const;

export const PRICE_RANGES = ['$', '$$', '$$$'] as const;

export const COUNTRIES = [
  { code: 'JP', name: 'Japan' },
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  // Add more as needed
] as const;

export const MAJOR_CITIES_JAPAN = [
  'Tokyo',
  'Osaka',
  'Kyoto',
  'Fukuoka',
  'Nagoya',
  'Sapporo',
  'Kanagawa / Yokohama',
  'Hiroshima',
  'Kanazawa',
  'Kobe',
  'Niigata',
  'Chiba',
  'Takamatsu',
  'Fukushima',
  'Okayama',
  'Kojima',
  'Nagano',
  'Toyama',
] as const;

// Main category colors (default view) - Vibrant neon colors
export const MAIN_CATEGORY_COLORS = {
  Fashion: '#00D9FF', // Electric cyan/blue - vibrant and modern
  Food: '#FF6B35', // Electric orange - appetizing and energetic
  Coffee: '#8B4513', // Rich brown - classic coffee color
  'Home Goods': '#FFD700', // Gold - luxurious and warm
  Museum: '#9370DB', // Medium purple - cultured and elegant
  Spots: '#10B981', // Emerald green - natural and exploratory
} as const;

// Main category icons - Using icon names from Lucide React
// Icons are rendered as components in the UI, not stored as emoji
export const MAIN_CATEGORY_ICONS = {
  Fashion: 'Shirt',
  Food: 'UtensilsCrossed',
  Coffee: 'Coffee',
  'Home Goods': 'Home',
  Museum: 'Building2',
  Spots: 'MapPin',
} as const;

// Sub-category colors (for Fashion - used when filter is active)
export const FASHION_COLORS = {
  archive: '#3B82F6', // blue
  vintage: '#10B981', // green
  secondhand: '#8B5CF6', // purple
  streetwear: '#EF4444', // red
  designer: '#F59E0B', // amber
  luxury: '#D97706', // gold
  'avant-garde': '#A855F7', // purple-500
  military: '#059669', // green-600 (army/military green)
  antiques: '#92400E', // brown
  stationery: '#EC4899', // pink
  flagship: '#6366F1', // indigo
  'concept store': '#14B8A6', // teal
  womenswear: '#F472B6', // pink-400
  'select shop': '#22D3EE', // cyan-400
} as const;

// Sub-category colors for Food
export const FOOD_COLORS = {
  Ramen: '#EF4444', // red
  Sushi: '#EC4899', // pink
  Izakaya: '#F59E0B', // amber
  Kaiseki: '#8B5CF6', // purple
  Yakitori: '#D97706', // gold
  Tempura: '#10B981', // green
  'Udon/Soba': '#6366F1', // indigo
  Tonkatsu: '#F97316', // orange
  Yakiniku: '#DC2626', // red-600
  'Cafe/Restaurant': '#14B8A6', // teal
  Bakery: '#FBBF24', // yellow
  Dessert: '#F472B6', // pink-400
  'Street Food': '#FB923C', // orange-400
  'Fine Dining': '#7C3AED', // violet
  Pizza: '#EF4444', // red
  Burger: '#F59E0B', // amber
  Curry: '#FBBF24', // yellow
  Okonomiyaki: '#10B981', // green
  Bar: '#A855F7', // purple-500
  Japanese: '#DC2626', // red-600
  Western: '#3B82F6', // blue
  Asian: '#F97316', // orange
  Foreign: '#06B6D4', // cyan-500
} as const;

// Sub-category colors for Home Goods
export const HOME_GOODS_COLORS = {
  Antiques: '#92400E', // brown
  Homeware: '#6B7280', // grey
  Furniture: '#78716C', // stone-600
  Art: '#A855F7', // purple-500
  'General Stores': '#64748B', // slate-600
  Stationery: '#EC4899', // pink
  Toys: '#F472B6', // pink-400
} as const;

// Legacy PIN_COLORS - kept for backward compatibility
export const PIN_COLORS = {
  ...FASHION_COLORS,
  Fashion: '#F59E0B',
  Shopping: '#10B981',
} as const;

export const LOCATIONS = {
  Tokyo: [
    'Harajuku',
    'Shibuya',
    'Shimokitazawa',
    'Shinjuku',
    'Daikanyama',
    'Ebisu',
    'Hiroo',
    'Omotesando',
    'Nakameguro',
    'Koenji',
    'Setagaya City',
    'Ueno',
    'Ikebukuro',
    'Kichijoji',
    'Aoyama',
    'Nakano',
    'Jinbocho',
    'Jiyugaoka',
    'Kuramae',
    'Yutenji',
    'Gakugei-Daigaku',
    'Toritsu-Daigaku',
    'Asakusa',
    'Asakusabashi',
    'Meguro City',
    'Kiyosumi-shirakawa',
    'Chofu',
    'Komae',
    'Odaiba',
    'Tokyo Dome',
    'Yoyogi',
    'Sangenjaya',
    'Ginza',
    'Asagaya',
    'Chiyoda City',
    'Ikejiri-Ohashi',
    'Kinshicho',
    'Koto City',
    'Kyobashi',
    'Roppongi',
    'Shinagawa City',
    'Tsukiji',
    'Umegaoka',
    'Yanaka Ginza',
    'Yurakucho',
    'Akasaka',
    'Azabujuban',
    'Bunkyo City',
    'Edogawa City',
    'Kokubunji',
    'Nishitokyo',
    'Ota City',
    'Sumida City',
    'Tachikawa',
    'Taito City',
    'Takadanobaba',
    'Waseda',
  ],
  Osaka: [
    'Shinsaibashi',
    'Horie',
    'Umeda',
    'Nakazakicho',
    'Nakatsu',
    'Sakai',
  ],
  Fukuoka: [],
  Nagoya: [
    'Osu',
    'Sakae',
  ],
  Nagano: [
    'Ueda',
  ],
  Kyoto: [],
  Sapporo: [],
  'Kanagawa / Yokohama': [
    'Atsugi',
    'Hakone',
  ],
  Hiroshima: [],
  Kanazawa: [],
  Kobe: [],
  Niigata: [],
  Chiba: [],
  Takamatsu: [],
  Fukushima: [],
  Okayama: [],
  Kojima: [],
  Toyama: [],
} as const;

// City coordinates for map centering
export const CITY_COORDINATES: Record<string, { latitude: number; longitude: number; zoom: number }> = {
  Tokyo: { latitude: 35.6895, longitude: 139.6917, zoom: 12 },
  Osaka: { latitude: 34.6937, longitude: 135.5023, zoom: 12 },
  Kyoto: { latitude: 35.0116, longitude: 135.7681, zoom: 12 },
  Fukuoka: { latitude: 33.5904, longitude: 130.4017, zoom: 12 },
  Nagoya: { latitude: 35.1815, longitude: 136.9066, zoom: 12 },
  Sapporo: { latitude: 43.0642, longitude: 141.3469, zoom: 12 },
  'Kanagawa / Yokohama': { latitude: 35.4437, longitude: 139.6380, zoom: 12 },
  Hiroshima: { latitude: 34.3853, longitude: 132.4553, zoom: 12 },
  Kanazawa: { latitude: 36.5611, longitude: 136.6564, zoom: 12 },
  Kobe: { latitude: 34.6901, longitude: 135.1955, zoom: 12 },
  Niigata: { latitude: 37.9161, longitude: 139.0364, zoom: 12 },
  Chiba: { latitude: 35.6074, longitude: 140.1065, zoom: 12 },
  Takamatsu: { latitude: 34.3402, longitude: 134.0435, zoom: 12 },
  Fukushima: { latitude: 37.7503, longitude: 140.4676, zoom: 12 },
  Okayama: { latitude: 34.6550, longitude: 133.9190, zoom: 12 },
  Kojima: { latitude: 34.4640, longitude: 133.8150, zoom: 12 },
  Nagano: { latitude: 36.6513, longitude: 138.1809, zoom: 12 },
  Toyama: { latitude: 36.6959, longitude: 137.2137, zoom: 12 },
};

// Neighborhood coordinates for map centering (zoom level 14-15 for neighborhood detail)
export const NEIGHBORHOOD_COORDINATES: Record<string, { latitude: number; longitude: number; zoom: number }> = {
  // Tokyo neighborhoods
  'Harajuku': { latitude: 35.6702, longitude: 139.7026, zoom: 15 },
  'Shibuya': { latitude: 35.6580, longitude: 139.7016, zoom: 15 },
  'Shimokitazawa': { latitude: 35.6617, longitude: 139.6682, zoom: 15 },
  'Shinjuku': { latitude: 35.6938, longitude: 139.7034, zoom: 14 },
  'Daikanyama': { latitude: 35.6486, longitude: 139.7030, zoom: 15 },
  'Ebisu': { latitude: 35.6467, longitude: 139.7103, zoom: 15 },
  'Hiroo': { latitude: 35.6510, longitude: 139.7220, zoom: 15 },
  'Omotesando': { latitude: 35.6654, longitude: 139.7121, zoom: 15 },
  'Nakameguro': { latitude: 35.6441, longitude: 139.6986, zoom: 15 },
  'Koenji': { latitude: 35.7052, longitude: 139.6494, zoom: 15 },
  'Setagaya City': { latitude: 35.6464, longitude: 139.6532, zoom: 14 },
  'Ueno': { latitude: 35.7141, longitude: 139.7774, zoom: 15 },
  'Ikebukuro': { latitude: 35.7295, longitude: 139.7109, zoom: 14 },
  'Kichijoji': { latitude: 35.7032, longitude: 139.5794, zoom: 15 },
  'Aoyama': { latitude: 35.6718, longitude: 139.7199, zoom: 15 },
  'Nakano': { latitude: 35.7074, longitude: 139.6659, zoom: 15 },
  'Jinbocho': { latitude: 35.6959, longitude: 139.7577, zoom: 15 },
  'Jiyugaoka': { latitude: 35.6076, longitude: 139.6686, zoom: 15 },
  'Kuramae': { latitude: 35.7025, longitude: 139.7893, zoom: 15 },
  'Yutenji': { latitude: 35.6336, longitude: 139.6862, zoom: 15 },
  'Gakugei-Daigaku': { latitude: 35.6280, longitude: 139.6851, zoom: 15 },
  'Toritsu-Daigaku': { latitude: 35.6175, longitude: 139.6775, zoom: 15 },
  'Asakusa': { latitude: 35.7148, longitude: 139.7967, zoom: 15 },
  'Asakusabashi': { latitude: 35.6986, longitude: 139.7832, zoom: 15 },
  'Meguro City': { latitude: 35.6414, longitude: 139.6981, zoom: 14 },
  'Kiyosumi-shirakawa': { latitude: 35.6817, longitude: 139.8011, zoom: 15 },
  'Chofu': { latitude: 35.6505, longitude: 139.5407, zoom: 14 },
  'Komae': { latitude: 35.6347, longitude: 139.5789, zoom: 15 },
  'Odaiba': { latitude: 35.6267, longitude: 139.7756, zoom: 14 },
  'Tokyo Dome': { latitude: 35.7056, longitude: 139.7519, zoom: 15 },
  'Yoyogi': { latitude: 35.6833, longitude: 139.7020, zoom: 15 },
  'Sangenjaya': { latitude: 35.6439, longitude: 139.6706, zoom: 15 },
  'Ginza': { latitude: 35.6717, longitude: 139.7649, zoom: 15 },
  'Asagaya': { latitude: 35.7044, longitude: 139.6358, zoom: 15 },
  'Chiyoda City': { latitude: 35.6940, longitude: 139.7536, zoom: 14 },
  'Ikejiri-Ohashi': { latitude: 35.6544, longitude: 139.6836, zoom: 15 },
  'Kinshicho': { latitude: 35.6960, longitude: 139.8133, zoom: 15 },
  'Koto City': { latitude: 35.6729, longitude: 139.8172, zoom: 14 },
  'Kyobashi': { latitude: 35.6775, longitude: 139.7706, zoom: 15 },
  'Roppongi': { latitude: 35.6628, longitude: 139.7315, zoom: 15 },
  'Shinagawa City': { latitude: 35.6093, longitude: 139.7302, zoom: 14 },
  'Tsukiji': { latitude: 35.6654, longitude: 139.7707, zoom: 15 },
  'Umegaoka': { latitude: 35.6583, longitude: 139.6558, zoom: 15 },
  'Yanaka Ginza': { latitude: 35.7274, longitude: 139.7665, zoom: 15 },
  'Yurakucho': { latitude: 35.6750, longitude: 139.7630, zoom: 15 },
  'Akasaka': { latitude: 35.6740, longitude: 139.7376, zoom: 15 },
  'Azabujuban': { latitude: 35.6547, longitude: 139.7360, zoom: 15 },
  'Bunkyo City': { latitude: 35.7081, longitude: 139.7520, zoom: 14 },
  'Edogawa City': { latitude: 35.7071, longitude: 139.8685, zoom: 14 },
  'Kokubunji': { latitude: 35.7103, longitude: 139.4625, zoom: 15 },
  'Nishitokyo': { latitude: 35.7254, longitude: 139.5383, zoom: 14 },
  'Ota City': { latitude: 35.5614, longitude: 139.7163, zoom: 14 },
  'Sumida City': { latitude: 35.7106, longitude: 139.8014, zoom: 14 },
  'Tachikawa': { latitude: 35.6989, longitude: 139.4133, zoom: 14 },
  'Taito City': { latitude: 35.7107, longitude: 139.7796, zoom: 14 },
  'Takadanobaba': { latitude: 35.7129, longitude: 139.7036, zoom: 15 },
  'Waseda': { latitude: 35.7095, longitude: 139.7193, zoom: 15 },
  // Osaka neighborhoods
  'Shinsaibashi': { latitude: 34.6751, longitude: 135.5009, zoom: 15 },
  'Horie': { latitude: 34.6780, longitude: 135.4940, zoom: 15 },
  'Umeda': { latitude: 34.7024, longitude: 135.4959, zoom: 15 },
  'Nakazakicho': { latitude: 34.7081, longitude: 135.5054, zoom: 15 },
  'Nakatsu': { latitude: 34.7136, longitude: 135.4998, zoom: 15 },
  'Sakai': { latitude: 34.5733, longitude: 135.4830, zoom: 14 },
  // Nagoya neighborhoods
  'Osu': { latitude: 35.1592, longitude: 136.9026, zoom: 15 },
  'Sakae': { latitude: 35.1681, longitude: 136.9085, zoom: 15 },
  // Nagano neighborhoods
  'Ueda': { latitude: 36.4017, longitude: 138.2490, zoom: 14 },
  // Kanagawa / Yokohama neighborhoods
  'Atsugi': { latitude: 35.4414, longitude: 139.3618, zoom: 14 },
  'Hakone': { latitude: 35.2324, longitude: 139.1069, zoom: 13 },
};

// City color accents for UI (cards, badges). Picked to be distinct but harmonious.
export const CITY_COLORS: Record<string, string> = {
  Tokyo: '#F97316', // orange-500
  Osaka: '#22C55E', // green-500
  Kyoto: '#8B5CF6', // violet-500
  Fukuoka: '#06B6D4', // cyan-500
  Nagoya: '#EAB308', // yellow-500
  Sapporo: '#60A5FA', // blue-400
  'Kanagawa / Yokohama': '#F43F5E', // rose-500
  Hiroshima: '#10B981', // emerald-500
  Kanazawa: '#A78BFA', // violet-400
  Kobe: '#F59E0B', // amber-500
  Niigata: '#34D399', // green-400
  Chiba: '#FB7185', // rose-400
  Takamatsu: '#38BDF8', // sky-400
  Fukushima: '#F472B6', // pink-400
  Okayama: '#84CC16', // lime-500
  Kojima: '#FCD34D', // amber-300
  Nagano: '#A855F7', // purple-500
  Toyama: '#FB923C', // orange-400
};

// Japanese city names (for ticket cards)
export const CITY_NAMES_JAPANESE: Record<string, string> = {
  Tokyo: '東京',
  Osaka: '大阪',
  Kyoto: '京都',
  Fukuoka: '福岡',
  Nagoya: '名古屋',
  Sapporo: '札幌',
  'Kanagawa / Yokohama': '横浜',
  Hiroshima: '広島',
  Kanazawa: '金沢',
  Kobe: '神戸',
  Niigata: '新潟',
  Chiba: '千葉',
  Takamatsu: '高松',
  Fukushima: '福島',
  Okayama: '岡山',
  Kojima: '児島',
  Nagano: '長野',
  Toyama: '富山',
};

// City regions (for ticket cards)
export const CITY_REGIONS: Record<string, string> = {
  Tokyo: 'Kanto',
  Osaka: 'Kansai',
  Kyoto: 'Kansai',
  Fukuoka: 'Kyushu',
  Nagoya: 'Chubu',
  Sapporo: 'Hokkaido',
  'Kanagawa / Yokohama': 'Kanto',
  Hiroshima: 'Chugoku',
  Kanazawa: 'Chubu',
  Kobe: 'Kansai',
  Niigata: 'Chubu',
  Chiba: 'Kanto',
  Takamatsu: 'Shikoku',
  Fukushima: 'Tohoku',
  Okayama: 'Chugoku',
  Kojima: 'Chugoku',
  Nagano: 'Chubu',
  Toyama: 'Chubu',
};


