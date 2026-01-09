import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CityGridMenu } from '../navigation/CityGridMenu';
import { getCityDataWithCounts, type CityData } from '../../utils/cityData';

// Module-level cache for city data to prevent refetching across mounts
let cityDataCache: CityData[] | null = null;

export function Layout() {
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);
  const [cities, setCities] = useState<CityData[]>(cityDataCache || []);
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  // Fetch actual city counts on mount - only once per session
  useEffect(() => {
    if (hasFetched.current || cityDataCache) {
      return;
    }
    hasFetched.current = true;
    getCityDataWithCounts().then((data) => {
      cityDataCache = data;
      setCities(data);
    });
  }, []);

  const handleCitySelect = (cityName: string) => {
    // Navigate to map with city filter in URL
    navigate(`/map?city=${cityName}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onCitiesClick={() => setIsCityMenuOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {/* City Grid Menu */}
      <CityGridMenu
        isOpen={isCityMenuOpen}
        onClose={() => setIsCityMenuOpen(false)}
        onCitySelect={handleCitySelect}
        cities={cities}
      />
    </div>
  );
}


