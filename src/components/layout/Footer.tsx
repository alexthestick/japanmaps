import { Link } from 'react-router-dom';
import { MapPin, Instagram, Youtube } from 'lucide-react';
import { MAJOR_CITIES_JAPAN, MAIN_CATEGORIES, CITY_REGIONS } from '../../lib/constants';
import { cityToSlug } from '../../utils/cityData';

// Custom Substack icon since Lucide doesn't have one
const SubstackIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
  </svg>
);

// Group cities by region for organized display
const REGIONS = ['Kanto', 'Kansai', 'Chubu', 'Kyushu', 'Hokkaido', 'Chugoku', 'Shikoku', 'Tohoku'] as const;

export function Footer() {
  // Group cities by region
  const citiesByRegion = REGIONS.reduce((acc, region) => {
    acc[region] = MAJOR_CITIES_JAPAN.filter(city => CITY_REGIONS[city] === region);
    return acc;
  }, {} as Record<string, readonly string[]>);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cities by Region - SEO Internal Links */}
        <div className="mb-10 pb-8 border-b border-gray-800">
          <h3 className="text-white font-bold text-lg mb-6">Explore Japan</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {REGIONS.map(region => {
              const cities = citiesByRegion[region];
              if (!cities || cities.length === 0) return null;
              return (
                <div key={region}>
                  <h4 className="text-cyan-400 font-semibold text-sm mb-2 uppercase tracking-wider">{region}</h4>
                  <ul className="space-y-1">
                    {cities.map(city => (
                      <li key={city}>
                        <Link
                          to={`/city/${cityToSlug(city)}`}
                          className="text-gray-400 hover:text-white transition-colors text-sm"
                        >
                          {city}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories Section - SEO Internal Links */}
        <div className="mb-10 pb-8 border-b border-gray-800">
          <h3 className="text-white font-bold text-lg mb-4">Browse by Category</h3>
          <div className="flex flex-wrap gap-3">
            {MAIN_CATEGORIES.map(category => (
              <Link
                key={category}
                to={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full text-sm transition-colors border border-gray-700 hover:border-cyan-500/50"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 text-white mb-4">
              <MapPin className="w-6 h-6 text-cyan-400" />
              <span className="text-lg font-bold">Lost in Transit JP</span>
            </div>
            <p className="text-gray-400 mb-4">
              Discover the best clothing stores, restaurants, coffee shops, and hidden gems in Japan.
              Curated for streetwear enthusiasts, vintage hunters, and archive collectors.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/lostintransit.japan/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/@alexcoluna"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Subscribe on YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://substack.com/@lostintransitjp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Subscribe on Substack"
              >
                <SubstackIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/map" className="text-gray-400 hover:text-white transition-colors">
                  Map
                </Link>
              </li>
              <li>
                <Link to="/cities" className="text-gray-400 hover:text-white transition-colors">
                  Cities
                </Link>
              </li>
              <li>
                <Link to="/neighborhoods" className="text-gray-400 hover:text-white transition-colors">
                  Neighborhoods
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/suggest" className="text-gray-400 hover:text-white transition-colors">
                  Suggest a Store
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:alex91748@yahoo.com"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Email Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Lost in Transit JP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}


