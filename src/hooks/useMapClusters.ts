import { useMemo } from 'react';
import Supercluster from 'supercluster';
import type { Store } from '../types/store';

export interface ClusterPoint {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    cluster: false;
    storeId: string;
    store: Store;
  };
}

export interface ClusterFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    cluster: true;
    cluster_id: number;
    point_count: number;
    point_count_abbreviated: string;
  };
}

export type MapFeature = ClusterPoint | ClusterFeature;

/**
 * PHASE 2.2: Custom hook for map clustering
 * Groups nearby markers at lower zoom levels for better performance
 * At zoom < 14: Shows clusters
 * At zoom >= 14: Shows individual stores
 */
export function useMapClusters(
  stores: Store[],
  bounds: [number, number, number, number] | null,
  zoom: number
) {
  // Create supercluster index (memoized based on stores)
  const supercluster = useMemo(() => {
    const cluster = new Supercluster<ClusterPoint['properties'], ClusterPoint['properties']>({
      radius: 60, // Cluster radius in pixels
      maxZoom: 16, // Max zoom level to cluster
      minZoom: 0,
      minPoints: 2, // Minimum points to form a cluster
    });

    // Convert stores to GeoJSON points
    const points: ClusterPoint[] = stores.map(store => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [store.longitude, store.latitude],
      },
      properties: {
        cluster: false,
        storeId: store.id,
        store,
      },
    }));

    cluster.load(points);
    return cluster;
  }, [stores]);

  // Get clusters/points for current viewport
  const features = useMemo(() => {
    if (!bounds) return [];

    try {
      return supercluster.getClusters(bounds, Math.floor(zoom)) as MapFeature[];
    } catch (error) {
      console.error('Error getting clusters:', error);
      return [];
    }
  }, [supercluster, bounds, zoom]);

  // Helper function to expand cluster (get child points)
  const getClusterExpansionZoom = (clusterId: number): number => {
    try {
      return supercluster.getClusterExpansionZoom(clusterId);
    } catch (error) {
      return zoom + 2; // Fallback: zoom in 2 levels
    }
  };

  return {
    features,
    getClusterExpansionZoom,
  };
}
