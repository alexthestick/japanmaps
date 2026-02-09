import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { StoreList } from '../components/store/StoreList';
import { SortDropdown } from '../components/store/SortDropdown';
import { ScrollingBanner } from '../components/layout/ScrollingBanner';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { SEOHead, generateItemListSchema, generateBreadcrumbSchema } from '../components/seo';
import { useStores } from '../hooks/useStores';
import { Loader } from '../components/common/Loader';
import { sortStores } from '../utils/helpers';
import {
  MAIN_CATEGORIES,
  MAIN_CATEGORY_COLORS,
  FASHION_SUB_CATEGORIES,
  FOOD_SUB_CATEGORIES,
  HOME_GOODS_SUB_CATEGORIES,
} from '../lib/constants';
import type { MainCategory } from '../types/store';

// Map URL slugs to actual category names
const CATEGORY_SLUG_MAP: Record<string, string> = {
  'fashion': 'Fashion',
  'food': 'Food',
  'coffee': 'Coffee',
  'home-goods': 'Home Goods',
  'museum': 'Museum',
  'spots': 'Spots',
};

// Get subcategories for a main category
function getSubCategories(mainCategory: string): readonly string[] {
  switch (mainCategory) {
    case 'Fashion':
      return FASHION_SUB_CATEGORIES;
    case 'Food':
      return FOOD_SUB_CATEGORIES;
    case 'Home Goods':
      return HOME_GOODS_SUB_CATEGORIES;
    default:
      return [];
  }
}

// Category descriptions for SEO
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Fashion': 'Discover Japan\'s best thrift stores and vintage fashion shops - from affordable secondhand boutiques and preloved designer finds to archive stores, American vintage clothing, retro streetwear, and sustainable fashion. Your complete guide to thrifting in Japan.',
  'Food': 'Explore Japan\'s best restaurants and dining experiences - from traditional ramen shops and sushi bars to modern izakayas, hidden gem cafes, and fine dining destinations.',
  'Coffee': 'Find the best coffee shops and specialty cafes in Japan - from third-wave roasters and traditional kissaten to modern espresso bars and unique coffee experiences.',
  'Home Goods': 'Browse Japan\'s top vintage and secondhand homeware stores - antiques, preloved furniture, retro decor, art, and beautifully crafted lifestyle goods.',
  'Museum': 'Discover Japan\'s fascinating museums and cultural experiences - art galleries, history exhibits, fashion museums, and unique cultural destinations.',
  'Spots': 'Explore unique spots and hidden gems across Japan - off-the-beaten-path locations, scenic viewpoints, and memorable experiences.',
};

export function CategoryPage() {
  const { category: categorySlug, subcategory: subcategorySlug } = useParams<{ category: string; subcategory?: string }>();
  const navigate = useNavigate();

  // Convert slugs to actual names
  const mainCategory = categorySlug ? CATEGORY_SLUG_MAP[categorySlug] : null;
  const subCategory = subcategorySlug?.replace(/-/g, ' ') || null;

  // Filter & sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('alphabetical');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(subCategory);

  // Fetch stores filtered by category
  const { stores, loading } = useStores({
    countries: [],
    cities: [],
    categories: [],
    priceRanges: [],
    searchQuery: '',
    selectedCity: null,
    selectedNeighborhood: null,
    selectedCategory: mainCategory as MainCategory | null,
  });

  // Filter stores based on selected filters
  const filteredStores = stores.filter((store) => {
    // Search query
    if (searchQuery && !store.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Sub-category filter
    if (selectedSubCategory) {
      const hasCategory = store.categories.some(
        cat => cat.toLowerCase() === selectedSubCategory.toLowerCase()
      );
      if (!hasCategory) return false;
    }

    return true;
  });

  // Sort stores
  const sortedStores = sortStores(filteredStores, sortBy);

  // Get subcategories for current main category
  const subCategories = mainCategory ? getSubCategories(mainCategory) : [];

  // Get category color
  const categoryColor = mainCategory
    ? MAIN_CATEGORY_COLORS[mainCategory as keyof typeof MAIN_CATEGORY_COLORS]
    : '#22D9EE';

  // SEO data
  const seoTitle = selectedSubCategory
    ? `${selectedSubCategory.charAt(0).toUpperCase() + selectedSubCategory.slice(1)} ${mainCategory} Stores in Japan`
    : `${mainCategory} Stores in Japan`;
  const seoDescription = CATEGORY_DESCRIPTIONS[mainCategory || ''] ||
    `Discover the best ${mainCategory?.toLowerCase()} stores across Japan.`;
  const seoUrl = selectedSubCategory
    ? `/category/${categorySlug}/${subcategorySlug}`
    : `/category/${categorySlug}`;

  // Structured data
  const itemListSchema = generateItemListSchema(sortedStores, seoTitle, seoUrl);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' },
    { name: mainCategory || '', url: `/category/${categorySlug}` },
    ...(selectedSubCategory ? [{ name: selectedSubCategory, url: seoUrl }] : []),
  ]);

  if (!mainCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Category Not Found</h1>
          <Link to="/" className="text-cyan-400 hover:text-cyan-300">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* SEO Head */}
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        url={seoUrl}
        jsonLd={[itemListSchema, breadcrumbSchema]}
      />

      {/* Film grain overlay */}
      <div className="fixed inset-0 film-grain opacity-20 pointer-events-none" />

      {/* Scrolling Banner */}
      <ScrollingBanner />

      {/* Hero Section */}
      <div className="relative py-16 px-6 md:px-12 border-b-2 border-cyan-400/30">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: 'Categories', href: '/categories' },
              { label: mainCategory, href: `/category/${categorySlug}` },
              ...(selectedSubCategory ? [{ label: selectedSubCategory }] : []),
            ]}
            className="mb-6"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Category Name */}
            <h1
              className="text-5xl md:text-6xl font-black text-white mb-4 italic uppercase"
              style={{
                textShadow: `0 0 30px ${categoryColor}80, 0 0 20px ${categoryColor}60`,
                color: categoryColor,
              }}
            >
              {selectedSubCategory || mainCategory}
            </h1>

            {/* Description */}
            <p className="text-gray-300 text-lg max-w-3xl leading-relaxed mb-6">
              {seoDescription}
            </p>

            {/* Store Count Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border-2 rounded-lg"
              style={{
                borderColor: `${categoryColor}60`,
                boxShadow: `0 0 20px ${categoryColor}30`,
              }}
            >
              <MapPin className="w-5 h-5" style={{ color: categoryColor }} />
              <span className="text-white font-bold">{sortedStores.length} Places</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sub-category Filter Pills */}
      {subCategories.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedSubCategory
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All {mainCategory}
            </button>
            {subCategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubCategory(sub === selectedSubCategory ? null : sub)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                  selectedSubCategory === sub
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        {/* Search & Sort Controls */}
        <div className="flex flex-col md:flex-row mb-6 gap-4 items-stretch md:items-center">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border-2 border-cyan-400/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/60 transition-all"
            />
          </div>

          {/* Sort Dropdown */}
          <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-400">
          Showing <span className="text-cyan-300 font-bold">{sortedStores.length}</span> places
        </div>

        {/* Store Grid */}
        <StoreList
          stores={sortedStores}
          loading={loading}
          onStoreClick={(store) => navigate(`/store/${store.slug || store.id}`)}
        />
      </div>

    </div>
  );
}
