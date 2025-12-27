export { default as api, tokenStorage } from './api';
export { default as authService } from './auth.service';
export { default as salonService } from './salon.service';
export { default as bookingService } from './booking.service';

// Additional services
import api from './api';
import { City, Area, ServiceCategory, Notification, Favorite, PromoCode } from '../types';

export const locationService = {
  async getCities(search?: string) {
    const params = search ? `?search=${search}` : '';
    const response = await api.get(`/cities${params}`);
    return response.data.data.cities as City[];
  },

  async getAreas(cityId?: string, search?: string) {
    const params = new URLSearchParams();
    if (cityId) params.append('city', cityId);
    if (search) params.append('search', search);
    const response = await api.get(`/areas?${params.toString()}`);
    return response.data.data.areas as Area[];
  },
};

export const serviceService = {
  async getCategories() {
    const response = await api.get('/services/categories');
    return response.data.data.categories as ServiceCategory[];
  },

  async getServices(filters?: { salon?: string; category?: string; popular?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.salon) params.append('salon', filters.salon);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.popular) params.append('popular', 'true');
    const response = await api.get(`/services?${params.toString()}`);
    return response.data.data.services;
  },
};

export const favoriteService = {
  async getFavorites(): Promise<Favorite[]> {
    const response = await api.get('/favorites');
    return response.data.data.favorites;
  },

  async toggleFavorite(salonId: string): Promise<{ isFavorite: boolean }> {
    const response = await api.post('/favorites/toggle', { salon: salonId });
    return response.data.data;
  },
};

export const notificationService = {
  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data.data.notifications as Notification[];
  },

  async getUnreadNotifications() {
    const response = await api.get('/notifications/unread');
    return response.data.data as { notifications: Notification[]; count: number };
  },

  async markAsRead(id: string) {
    await api.post(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    await api.post('/notifications/read-all');
  },
};

export const promoCodeService = {
  async validatePromoCode(code: string, bookingAmount: number): Promise<{
    valid: boolean;
    discountAmount: number;
    finalAmount: number;
  }> {
    const response = await api.post('/promo-codes/validate', { code, bookingAmount });
    return response.data.data;
  },
};

