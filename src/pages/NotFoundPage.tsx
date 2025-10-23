import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { MapPin } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-xl text-gray-600 mb-8">
          Oops! This page seems to be off the map.
        </p>
        <Button onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}


