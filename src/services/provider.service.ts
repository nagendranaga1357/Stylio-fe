import api from './api';
import { Provider, PaginationMeta, ServiceMode, AudienceType } from '../types';

/**
 * Provider Service
 * 
 * Handles API calls for home service providers
 */

interface ProviderFilters {
  lat?: number;
  lng?: number;
  radius?: number;
  mode?: ServiceMode;
  audience?: AudienceType;
  minRating?: number;
  serviceType?: string;
  page?: number;
  limit?: number;
  sortBy?: 'distance' | 'rating' | 'popular';
  sortOrder?: 'asc' | 'desc';
}

interface ProviderListResponse {
  data: Provider[];
  pagination: PaginationMeta;
}

interface ProviderAvailability {
  date: string;
  slots: Array<{
    time: string;
    available: boolean;
  }>;
}

/**
 * Get list of home service providers
 * 
 * @example
 * // Get nearby providers
 * GET /api/providers?lat=12.9716&lng=77.5946&radius=5000&mode=toHome
 */
export const getProviders = async (filters: ProviderFilters = {}): Promise<ProviderListResponse> => {
  const params = new URLSearchParams();
  
  if (filters.lat !== undefined) params.append('lat', String(filters.lat));
  if (filters.lng !== undefined) params.append('lng', String(filters.lng));
  if (filters.radius !== undefined) params.append('radius', String(filters.radius));
  if (filters.mode) params.append('mode', filters.mode);
  if (filters.audience) params.append('audience', filters.audience);
  if (filters.minRating !== undefined) params.append('minRating', String(filters.minRating));
  if (filters.serviceType) params.append('serviceType', filters.serviceType);
  if (filters.page !== undefined) params.append('page', String(filters.page));
  if (filters.limit !== undefined) params.append('limit', String(filters.limit));
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  
  const response = await api.get(`/providers?${params.toString()}`);
  
  return {
    data: response.data.data || response.data.results || response.data,
    pagination: response.data.pagination || {
      page: 1,
      limit: filters.limit || 20,
      total: response.data.count || response.data.length || 0,
    },
  };
};

/**
 * Get single provider by ID
 * 
 * @example
 * GET /api/providers/:id
 */
export const getProviderById = async (id: string): Promise<Provider> => {
  const response = await api.get(`/providers/${id}`);
  return response.data;
};

/**
 * Get provider reviews
 * 
 * @example
 * GET /api/providers/:id/reviews
 */
export const getProviderReviews = async (
  id: string,
  page: number = 1,
  limit: number = 10
): Promise<any> => {
  const response = await api.get(`/providers/${id}/reviews`, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Get provider availability
 * 
 * @example
 * GET /api/providers/:id/availability?date=2024-01-20
 */
export const getProviderAvailability = async (
  id: string,
  date: string
): Promise<ProviderAvailability> => {
  const response = await api.get(`/providers/${id}/availability`, {
    params: { date },
  });
  return response.data;
};

/**
 * Search providers by location
 * 
 * @example
 * GET /api/providers?lat=12.9716&lng=77.5946&radius=10000&sortBy=distance
 */
export const searchNearbyProviders = async (
  lat: number,
  lng: number,
  options: Omit<ProviderFilters, 'lat' | 'lng'> = {}
): Promise<ProviderListResponse> => {
  return getProviders({
    lat,
    lng,
    radius: options.radius || 10000,
    sortBy: 'distance',
    sortOrder: 'asc',
    mode: 'toHome', // Home providers only
    ...options,
  });
};

/**
 * Get featured/top providers
 */
export const getFeaturedProviders = async (
  limit: number = 10
): Promise<Provider[]> => {
  const response = await getProviders({
    sortBy: 'rating',
    sortOrder: 'desc',
    mode: 'toHome',
    limit,
  });
  return response.data;
};

export default {
  getProviders,
  getProviderById,
  getProviderReviews,
  getProviderAvailability,
  searchNearbyProviders,
  getFeaturedProviders,
};



