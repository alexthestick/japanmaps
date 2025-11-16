export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Map styles: Using light/dark styles for cleaner appearance
// These show fewer POI labels than navigation styles, making custom pins more visible
export const MAP_STYLE_DAY =
  import.meta.env.VITE_MAPBOX_STYLE_DAY || 'mapbox://styles/mapbox/light-v11';
export const MAP_STYLE_NIGHT =
  import.meta.env.VITE_MAPBOX_STYLE_NIGHT || 'mapbox://styles/mapbox/dark-v11';

// Default style (day)
export const MAP_STYLE = MAP_STYLE_DAY;

export const DEFAULT_CENTER = {
  longitude: 139.6917, // Tokyo
  latitude: 35.6895,
};

export const DEFAULT_ZOOM = 11;

export const MAP_BOUNDS = {
  // Japan bounds
  minLng: 122.9336,
  minLat: 24.2458,
  maxLng: 153.9869,
  maxLat: 45.5579,
};


