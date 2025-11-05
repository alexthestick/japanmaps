import { useState, useCallback, useEffect } from 'react';

interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

interface UseGeolocationReturn {
  position: GeolocationPosition | null;
  error: GeolocationError | null;
  loading: boolean;
  requestLocation: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by your browser',
      });
      return;
    }

    // Clear any previous errors and position
    setLoading(true);
    setError(null);

    console.log('Requesting geolocation...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log('Geolocation success:', pos.coords);
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        let message = 'Unable to retrieve your location';

        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case err.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable. Please check your device settings.';
            break;
          case err.TIMEOUT:
            message = 'Location request timed out. Please try again.';
            break;
        }

        setError({
          code: err.code,
          message,
        });
        setLoading(false);
      },
      {
        enableHighAccuracy: false, // Battery-efficient
        timeout: 10000, // 10 second timeout
        maximumAge: 60000, // Accept cached position up to 1 minute old
      }
    );
  }, []);

  return {
    position,
    error,
    loading,
    requestLocation,
  };
}
