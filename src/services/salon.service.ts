import api from './api';
import { 
  Salon, 
  SalonFilters, 
  Service, 
  Provider, 
  Review, 
  PaginatedResponse,
  SalonListResponse,
  PaginationMeta,
} from '../types';

/**
 * Salon Service - V1 Enhanced
 * 
 * Supports advanced search & discovery with:
 * - Location-based search (geo-coordinates)
 * - City/Area filtering
 * - Mode filtering (toSalon, toHome, both)
 * - Audience filtering (men, women, kids, unisex)
 * - Rating and price level filters
 * - Text search (name, tags)
 * - Sorting (distance, rating, price, popular)
 * - Pagination
 * 
 * Example API calls:
 * 
 * // Search salons near user location
 * GET /api/salons?lat=12.9716&lng=77.5946&radius=5000&mode=toHome&audience=women
 * 
 * // Search by name in a city
 * GET /api/salons?q=Looks%20Salon&cityId=abc123
 * 
 * // Filter by mode and rating
 * GET /api/salons?mode=toSalon&minRating=4&sortBy=rating&sortOrder=desc
 */
export const salonService = {
  /**
   * Get salons with advanced V1 filters
   * Supports geo-search, text search, and rich filtering
   */
  async getSalons(filters?: SalonFilters): Promise<PaginatedResponse<Salon>> {
    const params = new URLSearchParams();
    
    // Text search
    if (filters?.q) params.append('q', filters.q);
    if (filters?.search) params.append('q', filters.search); // legacy support
    
    // Location-based search (geo-coordinates)
    if (filters?.lat !== undefined) params.append('lat', filters.lat.toString());
    if (filters?.lng !== undefined) params.append('lng', filters.lng.toString());
    if (filters?.radius !== undefined) params.append('radius', filters.radius.toString());
    
    // City/Area based search
    if (filters?.cityId) params.append('cityId', filters.cityId);
    if (filters?.areaId) params.append('areaId', filters.areaId);
    if (filters?.city) params.append('cityId', filters.city); // legacy
    if (filters?.area) params.append('areaId', filters.area); // legacy
    
    // Mode & Audience filters (V1)
    if (filters?.mode) params.append('mode', filters.mode);
    if (filters?.audience) params.append('audience', filters.audience);
    
    // Rating filters
    if (filters?.minRating !== undefined) params.append('minRating', filters.minRating.toString());
    if (filters?.maxRating !== undefined) params.append('maxRating', filters.maxRating.toString());
    
    // Price level filters (V1)
    if (filters?.minPriceLevel !== undefined) params.append('minPriceLevel', filters.minPriceLevel.toString());
    if (filters?.maxPriceLevel !== undefined) params.append('maxPriceLevel', filters.maxPriceLevel.toString());
    
    // Sorting
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    // Pagination
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await api.get(`/salons?${params.toString()}`);
    
    // Handle V1 response format (data array) and legacy format (salons array)
    const responseData = response.data.data;
    return {
      salons: responseData.data || responseData.salons || [],
      data: responseData.data || responseData.salons || [],
      pagination: responseData.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  },

  /**
   * Get salon details by ID
   */
  async getSalon(id: string): Promise<Salon> {
    const response = await api.get(`/salons/${id}`);
    return response.data.data.salon || response.data.data;
  },

  /**
   * Get services offered by a salon
   * @param salonId - Salon ID
   * @param category - Optional category filter
   * @param mode - Optional mode filter (toSalon, toHome)
   * @param audience - Optional audience filter
   */
  async getSalonServices(
    salonId: string, 
    options?: { 
      category?: string; 
      mode?: string;
      audience?: string;
    }
  ): Promise<Service[]> {
    const params = new URLSearchParams();
    if (options?.category) params.append('category', options.category);
    if (options?.mode) params.append('mode', options.mode);
    if (options?.audience) params.append('audience', options.audience);
    
    const queryString = params.toString();
    const url = `/salons/${salonId}/services${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data.data.services || response.data.data || [];
  },

  /**
   * Get providers at a salon
   */
  async getSalonProviders(salonId: string): Promise<Provider[]> {
    const response = await api.get(`/salons/${salonId}/providers`);
    return response.data.data.providers || response.data.data || [];
  },

  /**
   * Get reviews for a salon
   */
  async getSalonReviews(salonId: string): Promise<Review[]> {
    const response = await api.get(`/salons/${salonId}/reviews`);
    return response.data.data.reviews || response.data.data || [];
  },

  /**
   * Get gallery images for a salon
   */
  async getSalonGallery(salonId: string): Promise<{ images: { image: string; caption: string }[] }> {
    const response = await api.get(`/salons/${salonId}/gallery`);
    return response.data.data;
  },

  /**
   * V1: Search salons by location (geo-search)
   * Uses $geoNear for distance-based sorting
   * 
   * @param lat - User latitude
   * @param lng - User longitude
   * @param options - Additional filters
   */
  async searchByLocation(
    lat: number,
    lng: number,
    options?: {
      radius?: number;
      mode?: string;
      audience?: string;
      minRating?: number;
      limit?: number;
    }
  ): Promise<SalonListResponse> {
    const result = await this.getSalons({
      lat,
      lng,
      radius: options?.radius || 5000, // default 5km
      mode: options?.mode as any,
      audience: options?.audience as any,
      minRating: options?.minRating,
      limit: options?.limit || 20,
      sortBy: 'distance',
      sortOrder: 'asc',
    });
    
    return {
      data: result.salons || result.data || [],
      pagination: result.pagination,
    };
  },

  /**
   * V1: Search salons by name or keyword
   * Uses text index for efficient search
   */
  async searchByName(
    query: string,
    options?: {
      cityId?: string;
      mode?: string;
      audience?: string;
      limit?: number;
    }
  ): Promise<SalonListResponse> {
    const result = await this.getSalons({
      q: query,
      cityId: options?.cityId,
      mode: options?.mode as any,
      audience: options?.audience as any,
      limit: options?.limit || 20,
      sortBy: 'popular',
    });
    
    return {
      data: result.salons || result.data || [],
      pagination: result.pagination,
    };
  },

  /**
   * V1: Get salons for a specific mode (To Salon, To Home, or Both)
   */
  async getSalonsByMode(
    mode: 'toSalon' | 'toHome' | 'both',
    options?: {
      lat?: number;
      lng?: number;
      cityId?: string;
      audience?: string;
      minRating?: number;
      page?: number;
      limit?: number;
    }
  ): Promise<SalonListResponse> {
    const result = await this.getSalons({
      mode,
      lat: options?.lat,
      lng: options?.lng,
      cityId: options?.cityId,
      audience: options?.audience as any,
      minRating: options?.minRating,
      page: options?.page,
      limit: options?.limit || 20,
      sortBy: options?.lat ? 'distance' : 'popular',
    });
    
    return {
      data: result.salons || result.data || [],
      pagination: result.pagination,
    };
  },
};

export default salonService;
