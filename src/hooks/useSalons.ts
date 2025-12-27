import { useState, useCallback } from 'react';
import { salonService } from '../services';
import { 
  Salon, 
  Service, 
  Provider, 
  Review, 
  SalonFilters,
  ServiceMode,
  AudienceType,
  SalonSortBy,
  SortOrder,
  PaginationMeta,
} from '../types';

interface UseSalonsState {
  salons: Salon[];
  selectedSalon: Salon | null;
  services: Service[];
  providers: Provider[];
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationMeta;
}

interface UseSalonsResult extends UseSalonsState {
  // Fetch methods
  fetchSalons: (filters?: SalonFilters) => Promise<void>;
  fetchSalon: (id: string) => Promise<Salon | null>;
  fetchSalonServices: (salonId: string, options?: { category?: string; mode?: string; audience?: string }) => Promise<Service[]>;
  fetchSalonProviders: (salonId: string) => Promise<Provider[]>;
  fetchSalonReviews: (salonId: string) => Promise<Review[]>;
  loadMore: (filters?: SalonFilters) => Promise<void>;
  
  // V1: Enhanced search methods
  searchByLocation: (lat: number, lng: number, options?: SearchByLocationOptions) => Promise<void>;
  searchByName: (query: string, options?: SearchByNameOptions) => Promise<void>;
  searchByMode: (mode: ServiceMode, options?: SearchByModeOptions) => Promise<void>;
  
  // Utility
  clearError: () => void;
  resetSalons: () => void;
}

interface SearchByLocationOptions {
  radius?: number;
  mode?: ServiceMode;
  audience?: AudienceType;
  minRating?: number;
  limit?: number;
}

interface SearchByNameOptions {
  cityId?: string;
  mode?: ServiceMode;
  audience?: AudienceType;
  limit?: number;
}

interface SearchByModeOptions {
  lat?: number;
  lng?: number;
  cityId?: string;
  audience?: AudienceType;
  minRating?: number;
  page?: number;
  limit?: number;
}

/**
 * useSalons Hook - V1 Enhanced
 * 
 * Manages salon data with support for V1 search & discovery features:
 * - Location-based search with geo-coordinates
 * - Text search by name
 * - Mode filtering (toSalon, toHome)
 * - Audience filtering (men, women, kids, unisex)
 * - Rating and price level filters
 * - Sorting and pagination
 * 
 * Example usage:
 * ```tsx
 * const { salons, searchByLocation, searchByMode, isLoading } = useSalons();
 * 
 * // Search near user location
 * await searchByLocation(12.97, 77.59, { mode: 'toHome', audience: 'women' });
 * 
 * // Search by mode
 * await searchByMode('toSalon', { minRating: 4 });
 * ```
 */
export const useSalons = (): UseSalonsResult => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  /**
   * Fetch salons with V1 filters
   */
  const fetchSalons = useCallback(async (filters?: SalonFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await salonService.getSalons(filters);
      setSalons(data.salons || data.data || []);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load salons');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch single salon details
   */
  const fetchSalon = useCallback(async (id: string): Promise<Salon | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const salon = await salonService.getSalon(id);
      setSelectedSalon(salon);
      return salon;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load salon details');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch services for a salon (V1: with mode/audience support)
   */
  const fetchSalonServices = useCallback(async (
    salonId: string, 
    options?: { category?: string; mode?: string; audience?: string }
  ): Promise<Service[]> => {
    setIsLoading(true);
    try {
      const data = await salonService.getSalonServices(salonId, options);
      setServices(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load services');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch providers at a salon
   */
  const fetchSalonProviders = useCallback(async (salonId: string): Promise<Provider[]> => {
    try {
      const data = await salonService.getSalonProviders(salonId);
      setProviders(data);
      return data;
    } catch (err) {
      return [];
    }
  }, []);

  /**
   * Fetch reviews for a salon
   */
  const fetchSalonReviews = useCallback(async (salonId: string): Promise<Review[]> => {
    try {
      const data = await salonService.getSalonReviews(salonId);
      setReviews(data);
      return data;
    } catch (err) {
      return [];
    }
  }, []);

  /**
   * Load more salons (pagination)
   */
  const loadMore = useCallback(async (filters?: SalonFilters) => {
    if (pagination.page >= (pagination.pages || 0) && !pagination.hasNextPage) return;
    
    setIsLoading(true);
    try {
      const data = await salonService.getSalons({
        ...filters,
        page: pagination.page + 1,
      });
      setSalons((prev) => [...prev, ...(data.salons || data.data || [])]);
      setPagination(data.pagination);
    } finally {
      setIsLoading(false);
    }
  }, [pagination]);

  /**
   * V1: Search salons by location (geo-search)
   */
  const searchByLocation = useCallback(async (
    lat: number,
    lng: number,
    options?: SearchByLocationOptions
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await salonService.searchByLocation(lat, lng, {
        radius: options?.radius,
        mode: options?.mode,
        audience: options?.audience,
        minRating: options?.minRating,
        limit: options?.limit,
      });
      setSalons(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search salons');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * V1: Search salons by name
   */
  const searchByName = useCallback(async (
    query: string,
    options?: SearchByNameOptions
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await salonService.searchByName(query, {
        cityId: options?.cityId,
        mode: options?.mode,
        audience: options?.audience,
        limit: options?.limit,
      });
      setSalons(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search salons');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * V1: Get salons by mode (To Salon or To Home)
   */
  const searchByMode = useCallback(async (
    mode: ServiceMode,
    options?: SearchByModeOptions
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await salonService.getSalonsByMode(mode, {
        lat: options?.lat,
        lng: options?.lng,
        cityId: options?.cityId,
        audience: options?.audience,
        minRating: options?.minRating,
        page: options?.page,
        limit: options?.limit,
      });
      setSalons(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load salons');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset salons state
   */
  const resetSalons = useCallback(() => {
    setSalons([]);
    setPagination({
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    });
  }, []);

  return {
    salons,
    selectedSalon,
    services,
    providers,
    reviews,
    isLoading,
    error,
    pagination,
    fetchSalons,
    fetchSalon,
    fetchSalonServices,
    fetchSalonProviders,
    fetchSalonReviews,
    loadMore,
    searchByLocation,
    searchByName,
    searchByMode,
    clearError: () => setError(null),
    resetSalons,
  };
};

export default useSalons;
