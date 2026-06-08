/**
 * StoreMiniMap — lazy-loaded map widget for StoreDetailPage.
 *
 * This component is intentionally isolated so that the Mapbox GL JS bundle
 * (~1.6 MB) is never downloaded on pages that don't need it. StoreDetailPage
 * imports this via React.lazy(), so Mapbox only loads when the component
 * actually mounts (i.e. after the store's hero content has already painted).
 *
 * Do NOT re-add static Mapbox imports to StoreDetailPage — that would undo
 * the code-split and cause the 1.6 MB bundle to block LCP on all store pages.
 */
import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import { MapPin } from 'lucide-react';
import { MAPBOX_TOKEN, MAP_STYLE_DAY } from '../../lib/mapbox';
import { MAIN_CATEGORY_COLORS } from '../../lib/constants';
import 'mapbox-gl/dist/mapbox-gl.css';

interface StoreMiniMapProps {
  latitude: number;
  longitude: number;
  mainCategory?: string;
}

export default function StoreMiniMap({ latitude, longitude, mainCategory }: StoreMiniMapProps) {
  const [viewState, setViewState] = useState({
    longitude,
    latitude,
    zoom: 15,
  });

  // Keep the map centred if coords change (e.g. store data loads after mount)
  useEffect(() => {
    setViewState(prev => ({ ...prev, longitude, latitude }));
  }, [latitude, longitude]);

  const markerColor = mainCategory
    ? MAIN_CATEGORY_COLORS[mainCategory as keyof typeof MAIN_CATEGORY_COLORS]
    : '#22D9EE';

  if (!MAPBOX_TOKEN || latitude === 0 || longitude === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Map unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <Map
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle={MAP_STYLE_DAY}
      mapboxAccessToken={MAPBOX_TOKEN}
      scrollZoom={false}
    >
      <NavigationControl position="top-right" />
      <Marker longitude={longitude} latitude={latitude} anchor="bottom">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
          style={{
            backgroundColor: markerColor,
            boxShadow: `0 0 15px ${markerColor}80`,
          }}
        >
          <MapPin className="w-5 h-5 text-white" />
        </div>
      </Marker>
    </Map>
  );
}
