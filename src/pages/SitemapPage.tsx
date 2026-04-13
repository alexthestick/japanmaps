/**
 * SitemapPage — /sitemap
 *
 * A plain HTML directory of every store on the site, organized by city.
 *
 * Why this exists:
 * Google found all 1,061 URLs in our sitemap.xml but wasn't crawling them
 * because they had no inbound links from any indexed page ("Referring page:
 * None detected" in Search Console). This page gives Google a single,
 * fully pre-rendered HTML page with real <a> links to every store, city,
 * and neighborhood — dramatically increasing crawl priority for all of them.
 *
 * It also works as a useful human directory for power users.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/seo';
import { useStores } from '../hooks/useStores';
import { cityToSlug } from '../utils/cityData';
import { MapPin, Store, Grid3X3, ExternalLink } from 'lucide-react';

// Cities we want listed first (most content, most important for SEO)
const PRIORITY_CITIES = ['Tokyo', 'Osaka', 'Kyoto', 'Fukuoka', 'Kobe', 'Nagoya', 'Yokohama', 'Sapporo'];

interface CityGroup {
  city: string;
  citySlug: string;
  neighborhoods: NeighborhoodGroup[];
  totalStores: number;
}

interface NeighborhoodGroup {
  neighborhood: string;
  neighborhoodSlug: string;
  stores: { name: string; slug: string; id: string; category: string }[];
}

function slugifyNeighborhood(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function SitemapPage() {
  const { stores, loading } = useStores();

  // Group stores by city → neighborhood
  const cityGroups = useMemo<CityGroup[]>(() => {
    if (!stores.length) return [];

    const map = new Map<string, Map<string, typeof stores>>();

    for (const store of stores) {
      const city = store.city || 'Other';
      const neighborhood = store.neighborhood || 'General';

      if (!map.has(city)) map.set(city, new Map());
      const cityMap = map.get(city)!;
      if (!cityMap.has(neighborhood)) cityMap.set(neighborhood, []);
      cityMap.get(neighborhood)!.push(store);
    }

    const groups: CityGroup[] = [];

    for (const [city, neighborhoodMap] of map.entries()) {
      const neighborhoods: NeighborhoodGroup[] = [];
      let total = 0;

      for (const [neighborhood, storeList] of neighborhoodMap.entries()) {
        const sorted = [...storeList].sort((a, b) => a.name.localeCompare(b.name));
        neighborhoods.push({
          neighborhood,
          neighborhoodSlug: slugifyNeighborhood(neighborhood),
          stores: sorted.map(s => ({
            name: s.name,
            slug: s.slug || s.id,
            id: s.id,
            category: s.mainCategory || s.category || 'Store',
          })),
        });
        total += storeList.length;
      }

      // Sort neighborhoods: General last, rest alphabetically
      neighborhoods.sort((a, b) => {
        if (a.neighborhood === 'General') return 1;
        if (b.neighborhood === 'General') return -1;
        return a.neighborhood.localeCompare(b.neighborhood);
      });

      groups.push({
        city,
        citySlug: cityToSlug(city),
        neighborhoods,
        totalStores: total,
      });
    }

    // Sort: priority cities first (in order), then rest alphabetically
    groups.sort((a, b) => {
      const ai = PRIORITY_CITIES.indexOf(a.city);
      const bi = PRIORITY_CITIES.indexOf(b.city);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.city.localeCompare(b.city);
    });

    return groups;
  }, [stores]);

  const totalStores = stores.length;
  const totalCities = cityGroups.length;

  return (
    <>
      <SEOHead
        title="Store Directory — Lost in Transit JP"
        description={`Complete directory of ${totalStores}+ vintage, archive, and streetwear stores across ${totalCities} cities in Japan. Browse Tokyo, Osaka, Kyoto, and more.`}
        url="/sitemap"
        keywords="Japan store directory, vintage stores Japan, Tokyo vintage, Osaka thrift, Kyoto fashion, Japan shopping guide"
      />

      <div className="min-h-screen bg-gray-950 text-gray-100">

        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-900/50">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="flex items-center gap-3 mb-3">
              <Grid3X3 className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium tracking-widest uppercase">
                Store Directory
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Every Store on Lost in Transit JP
            </h1>
            <p className="text-gray-400 text-base">
              {loading
                ? 'Loading stores...'
                : `${totalStores.toLocaleString()} stores across ${totalCities} cities in Japan`
              }
            </p>

            {/* Quick city jump links */}
            {!loading && cityGroups.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {cityGroups.map(({ city, citySlug, totalStores: count }) => (
                  <a
                    key={city}
                    href={`#city-${citySlug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <MapPin className="w-3 h-3" />
                    {city}
                    <span className="text-gray-500">({count})</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="max-w-5xl mx-auto px-6 py-20 text-center text-gray-500">
            Loading store directory...
          </div>
        )}

        {/* Directory */}
        {!loading && (
          <div className="max-w-5xl mx-auto px-6 py-10 space-y-14">
            {cityGroups.map(({ city, citySlug, neighborhoods, totalStores: cityTotal }) => (
              <section key={city} id={`city-${citySlug}`}>

                {/* City heading — links to city page */}
                <div className="flex items-baseline gap-4 mb-5 pb-3 border-b border-gray-800">
                  <Link
                    to={`/city/${citySlug}`}
                    className="text-xl font-bold text-white hover:text-cyan-400 transition-colors"
                  >
                    {city}
                  </Link>
                  <span className="text-sm text-gray-500">
                    {cityTotal} {cityTotal === 1 ? 'store' : 'stores'}
                  </span>
                  <Link
                    to={`/city/${citySlug}`}
                    className="ml-auto text-xs text-cyan-500 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    Browse {city} <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Neighborhoods within city */}
                <div className="space-y-8">
                  {neighborhoods.map(({ neighborhood, neighborhoodSlug, stores: neighborhoodStores }) => (
                    <div key={neighborhood}>

                      {/* Neighborhood subheading — links to neighborhood page (if not General) */}
                      {neighborhood !== 'General' ? (
                        <Link
                          to={`/city/${citySlug}/${neighborhoodSlug}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 mb-3 transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          {neighborhood}
                          <span className="text-gray-600 font-normal">
                            ({neighborhoodStores.length})
                          </span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-3">
                          <Store className="w-3.5 h-3.5" />
                          {city}
                          <span className="text-gray-600 font-normal">
                            ({neighborhoodStores.length})
                          </span>
                        </div>
                      )}

                      {/* Store links grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                        {neighborhoodStores.map(({ name, slug, category }) => (
                          <Link
                            key={slug}
                            to={`/store/${slug}`}
                            className="group flex items-center gap-2 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                          >
                            <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-cyan-400 flex-shrink-0 transition-colors" />
                            <span className="truncate">{name}</span>
                            <span className="text-gray-600 text-xs flex-shrink-0 ml-auto">
                              {category}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Footer note */}
            <div className="pt-6 border-t border-gray-800 text-sm text-gray-600 text-center">
              Know a store that should be here?{' '}
              <Link to="/suggest" className="text-cyan-500 hover:text-cyan-300 transition-colors">
                Suggest a store →
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
