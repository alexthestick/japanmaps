import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CityGridMenu } from '../navigation/CityGridMenu';
import { getCityDataWithCounts, type CityData } from '../../utils/cityData';

export function Layout() {
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);
  const [cities, setCities] = useState<CityData[]>([]);
  const navigate = useNavigate();

  // Fetch actual city counts on mount
  useEffect(() => {
    getCityDataWithCounts().then(setCities);
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


