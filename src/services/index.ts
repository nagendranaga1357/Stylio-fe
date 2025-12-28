export { default as api, tokenStorage } from './api';
export { default as authService } from './auth.service';
export { default as salonService } from './salon.service';
export { default as bookingService } from './booking.service';
export { default as providerService } from './provider.service';

// Additional services
import api from './api';
import { 
  City, 
  Area, 
  ServiceCategory, 
  Service,
  ServiceFilters,
  ServiceListResponse,
  Notification, 
  Favorite, 
  PromoCode,
  UnifiedSearchParams,
  UnifiedSearchResponse,
  ServiceMode,
  AudienceType,
} from '../types';

/**
 * Location Service
 * Handles cities and areas data
 */
export const locationService = {
  async getCities(search?: string): Promise<City[]> {
    const params = search ? `?search=${search}` : '';
    const response = await api.get(`/cities${params}`);
    return response.data.data.cities || response.data.data || [];
  },

  async getAreas(cityId?: string, search?: string): Promise<Area[]> {
    const params = new URLSearchParams();
    if (cityId) params.append('city', cityId);
    if (search) params.append('search', search);
    const response = await api.get(`/areas?${params.toString()}`);
    return response.data.data.areas || response.data.data || [];
  },

  async getCityById(cityId: string): Promise<City> {
    const response = await api.get(`/cities/${cityId}`);
    return response.data.data.city || response.data.data;
  },

  async getAreaById(areaId: string): Promise<Area> {
    const response = await api.get(`/areas/${areaId}`);
    return response.data.data.area || response.data.data;
  },
};

/**
 * Service Service - V1 Enhanced
 * 
 * Supports advanced service search with:
 * - Text search (name, description)
 * - Mode filtering (toSalon, toHome, both)
 * - Audience filtering (men, women, kids, unisex)
 * - Price range filters
 * - Category and type filters
 * - Sorting (price, popular, duration)
 * - Pagination
 * 
 * Example API calls:
 * 
 * // Search services by name
 * GET /api/services?q=haircut&mode=toSalon&audience=men
 * 
 * // Filter by price range
 * GET /api/services?minPrice=200&maxPrice=800&sortBy=price&sortOrder=asc
 */
export const serviceService = {
  /**
   * Get service categories
   */
  async getCategories(): Promise<ServiceCategory[]> {
    const response = await api.get('/services/categories');
    return response.data.data.categories || response.data.data || [];
  },

  /**
   * Get service types for a category
   */
  async getTypes(categoryId?: string): Promise<any[]> {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    const response = await api.get(`/services/types${params}`);
    return response.data.data.types || response.data.data || [];
  },

  /**
   * Alias for getTypes (used by CategoryScreen)
   */
  async getServiceTypes(categoryId?: string): Promise<any[]> {
    return this.getTypes(categoryId);
  },

  /**
   * V1: Get services with advanced filters
   */
  async getServices(filters?: ServiceFilters): Promise<ServiceListResponse> {
    const params = new URLSearchParams();
    
    // Text search
    if (filters?.q) params.append('q', filters.q);
    
    // Mode & Audience filters (V1)
    if (filters?.mode) params.append('mode', filters.mode);
    if (filters?.audience) params.append('audience', filters.audience);
    
    // Salon filter
    if (filters?.salonId) params.append('salonId', filters.salonId);
    if (filters?.salon) params.append('salonId', filters.salon); // legacy
    
    // Category filters
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.typeId) params.append('typeId', filters.typeId);
    if (filters?.category) params.append('categoryId', filters.category); // legacy
    
    // Price range filters
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    
    // Popular flag
    if (filters?.popular) params.append('popular', 'true');
    
    // Sorting
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    // Pagination
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await api.get(`/services?${params.toString()}`);
    const responseData = response.data.data;
    
    return {
      data: responseData.data || responseData.services || [],
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
   * Get single service by ID
   */
  async getServiceById(serviceId: string): Promise<Service> {
    const response = await api.get(`/services/${serviceId}`);
    return response.data.data.service || response.data.data;
  },

  /**
   * V1: Search services by name or description
   */
  async searchServices(
    query: string,
    options?: {
      mode?: ServiceMode;
      audience?: AudienceType;
      minPrice?: number;
      maxPrice?: number;
      limit?: number;
    }
  ): Promise<ServiceListResponse> {
    return this.getServices({
      q: query,
      mode: options?.mode,
      audience: options?.audience,
      minPrice: options?.minPrice,
      maxPrice: options?.maxPrice,
      limit: options?.limit || 20,
      sortBy: 'popular',
    });
  },

  /**
   * V1: Get services by mode (To Salon or To Home)
   */
  async getServicesByMode(
    mode: ServiceMode,
    options?: {
      audience?: AudienceType;
      categoryId?: string;
      limit?: number;
    }
  ): Promise<ServiceListResponse> {
    return this.getServices({
      mode,
      audience: options?.audience,
      categoryId: options?.categoryId,
      limit: options?.limit || 20,
    });
  },
};

/**
 * V1: Unified Search Service
 * 
 * Provides a single endpoint to search across salons, services, and providers
 * 
 * Example:
 * GET /api/search?q=haircut&lat=12.97&lng=77.59&mode=toHome&type=all
 */
export const searchService = {
  /**
   * V1: Unified search across salons, services, and providers
   */
  async search(params: UnifiedSearchParams): Promise<UnifiedSearchResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.q) queryParams.append('q', params.q);
    if (params.lat !== undefined) queryParams.append('lat', params.lat.toString());
    if (params.lng !== undefined) queryParams.append('lng', params.lng.toString());
    if (params.radius !== undefined) queryParams.append('radius', params.radius.toString());
    if (params.mode) queryParams.append('mode', params.mode);
    if (params.audience) queryParams.append('audience', params.audience);
    if (params.type) queryParams.append('type', params.type);
    
    try {
      const response = await api.get(`/search?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      // Fallback: if unified search endpoint doesn't exist, 
      // manually aggregate from salons and services
      if (error.response?.status === 404) {
        const { salonService } = await import('./salon.service');
        
        const [salonsResult, servicesResult] = await Promise.all([
          salonService.getSalons({
            q: params.q,
            lat: params.lat,
            lng: params.lng,
            radius: params.radius,
            mode: params.mode,
            audience: params.audience,
            limit: 10,
          }),
          serviceService.getServices({
            q: params.q,
            mode: params.mode,
            audience: params.audience,
            limit: 10,
          }),
        ]);
        
        return {
          salons: {
            data: salonsResult.salons || salonsResult.data || [],
            pagination: salonsResult.pagination,
          },
          services: servicesResult,
        };
      }
      throw error;
    }
  },

  /**
   * V1: Quick search suggestions
   */
  async getSuggestions(query: string, limit: number = 5): Promise<{
    salons: { id: string; name: string; type: 'salon' }[];
    services: { id: string; name: string; type: 'service' }[];
  }> {
    try {
      const response = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
      return response.data.data;
    } catch (error: any) {
      // Fallback implementation
      const [salonsResult, servicesResult] = await Promise.all([
        api.get(`/salons?q=${encodeURIComponent(query)}&limit=${limit}`),
        api.get(`/services?q=${encodeURIComponent(query)}&limit=${limit}`),
      ]);
      
      const salons = (salonsResult.data.data.salons || salonsResult.data.data.data || [])
        .slice(0, limit)
        .map((s: any) => ({ id: s.id || s._id, name: s.name, type: 'salon' as const }));
      
      const services = (servicesResult.data.data.services || servicesResult.data.data.data || [])
        .slice(0, limit)
        .map((s: any) => ({ id: s.id || s._id, name: s.name, type: 'service' as const }));
      
      return { salons, services };
    }
  },
};

/**
 * Favorites Service
 */
export const favoriteService = {
  async getFavorites(): Promise<Favorite[]> {
    const response = await api.get('/favorites');
    return response.data.data.favorites || response.data.data || [];
  },

  async toggleFavorite(salonId: string): Promise<{ isFavorite: boolean }> {
    const response = await api.post('/favorites/toggle', { salon: salonId });
    return response.data.data;
  },

  async addFavorite(salonId: string): Promise<Favorite> {
    const response = await api.post('/favorites', { salon: salonId });
    return response.data.data;
  },

  async removeFavorite(salonId: string): Promise<void> {
    await api.delete(`/favorites/${salonId}`);
  },

  async isFavorite(salonId: string): Promise<boolean> {
    try {
      const response = await api.get(`/favorites/check/${salonId}`);
      return response.data.data.isFavorite;
    } catch {
      return false;
    }
  },
};

/**
 * Notification Service
 */
export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get('/notifications');
    return response.data.data.notifications || response.data.data || [];
  },

  async getUnreadNotifications(): Promise<{ notifications: Notification[]; count: number }> {
    const response = await api.get('/notifications/unread');
    return response.data.data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.post(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/read-all');
  },
};

/**
 * Promo Code Service
 */
export const promoCodeService = {
  async validatePromoCode(code: string, bookingAmount: number): Promise<{
    valid: boolean;
    discountAmount: number;
    finalAmount: number;
  }> {
    const response = await api.post('/promo-codes/validate', { code, bookingAmount });
    return response.data.data;
  },

  async getActivePromoCodes(): Promise<PromoCode[]> {
    const response = await api.get('/promo-codes/active');
    return response.data.data.promoCodes || response.data.data || [];
  },
};

/**
 * User Service
 * Handles user profile operations
 */
export const userService = {
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data.data.user || response.data.data;
  },

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
  }) {
    const response = await api.patch('/users/profile', data);
    return response.data.data.user || response.data.data;
  },

  async updateAvatar(uri: string) {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('avatar', {
      uri,
      name: filename,
      type,
    } as any);

    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await api.patch('/users/password', {
      currentPassword,
      newPassword,
    });
    return response.data.data;
  },

  async deleteAccount() {
    const response = await api.delete('/users/account');
    return response.data;
  },

  async getAddresses() {
    const response = await api.get('/users/addresses');
    return response.data.data.addresses || response.data.data || [];
  },

  async addAddress(address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  }) {
    const response = await api.post('/users/addresses', address);
    return response.data.data;
  },

  async updateAddress(addressId: string, address: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    isDefault?: boolean;
  }) {
    const response = await api.patch(`/users/addresses/${addressId}`, address);
    return response.data.data;
  },

  async deleteAddress(addressId: string) {
    await api.delete(`/users/addresses/${addressId}`);
  },
};
