import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { UserLocation } from '../types';

interface UseLocationResult {
  location: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
  formatDistance: (distanceInMeters: number) => string;
}

/**
 * useLocation Hook - V1
 * 
 * Handles user location for geo-based search & discovery.
 * Uses expo-location for cross-platform location services.
 * 
 * Features:
 * - Request and manage location permissions
 * - Get current user coordinates
 * - Format distances for display
 * - Cache location for performance
 * 
 * Example usage:
 * ```tsx
 * const { location, isLoading, requestPermission, formatDistance } = useLocation();
 * 
 * // Check if we have location
 * if (location) {
 *   const salons = await salonService.searchByLocation(
 *     location.latitude,
 *     location.longitude,
 *     { radius: 5000, mode: 'toHome' }
 *   );
 * }
 * 
 * // Format distance for display
 * const distanceText = formatDistance(salon.distanceInMeters); // "2.5 km"
 * ```
 */
export const useLocation = (autoRequest: boolean = false): UseLocationResult => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  /**
   * Request location permission from the user
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      
      if (!granted) {
        setError('Location permission denied');
      }
      
      return granted;
    } catch (err) {
      console.error('Error requesting location permission:', err);
      setError('Failed to request location permission');
      return false;
    }
  }, []);

  /**
   * Check current permission status
   */
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (err) {
      console.error('Error checking location permission:', err);
      return false;
    }
  }, []);

  /**
   * Get current user location
   */
  const refreshLocation = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check permission first
      const permitted = await checkPermission();
      if (!permitted) {
        setError('Location permission not granted');
        setIsLoading(false);
        return;
      }
      
      // Get current position
      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const userLocation: UserLocation = {
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
        accuracy: result.coords.accuracy ?? undefined,
      };
      
      // Try to get city/area from reverse geocoding (optional)
      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
        });
        
        if (geocode) {
          userLocation.city = geocode.city || geocode.subregion || undefined;
          userLocation.area = geocode.district || geocode.street || undefined;
        }
      } catch (geocodeError) {
        // Geocoding is optional, don't fail if it doesn't work
        console.warn('Reverse geocoding failed:', geocodeError);
      }
      
      setLocation(userLocation);
    } catch (err: any) {
      console.error('Error getting location:', err);
      setError(err.message || 'Failed to get location');
    } finally {
      setIsLoading(false);
    }
  }, [checkPermission]);

  /**
   * Format distance for display
   * @param distanceInMeters - Distance in meters
   * @returns Formatted string like "1.5 km" or "500 m"
   */
  const formatDistance = useCallback((distanceInMeters: number): string => {
    if (distanceInMeters === undefined || distanceInMeters === null) {
      return '';
    }
    
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)} m`;
    }
    
    const km = distanceInMeters / 1000;
    if (km < 10) {
      return `${km.toFixed(1)} km`;
    }
    
    return `${Math.round(km)} km`;
  }, []);

  // Auto-request permission and get location on mount if specified
  useEffect(() => {
    if (autoRequest) {
      (async () => {
        const permitted = await requestPermission();
        if (permitted) {
          await refreshLocation();
        }
      })();
    } else {
      // Just check permission status
      checkPermission();
    }
  }, [autoRequest, requestPermission, refreshLocation, checkPermission]);

  return {
    location,
    isLoading,
    error,
    hasPermission,
    requestPermission,
    refreshLocation,
    formatDistance,
  };
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in meters
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => deg * (Math.PI / 180);

export default useLocation;

