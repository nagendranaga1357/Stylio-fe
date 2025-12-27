import api from './api';
import { Salon, SalonFilters, Service, Provider, Review, PaginatedResponse } from '../types';

export const salonService = {
  async getSalons(filters?: SalonFilters): Promise<PaginatedResponse<Salon>> {
    const params = new URLSearchParams();
    
    if (filters?.city) params.append('city', filters.city);
    if (filters?.area) params.append('area', filters.area);
    if (filters?.minRating) params.append('minRating', filters.minRating.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const response = await api.get(`/salons?${params.toString()}`);
    return response.data.data;
  },

  async getSalon(id: string): Promise<Salon> {
    const response = await api.get(`/salons/${id}`);
    return response.data.data.salon;
  },

  async getSalonServices(salonId: string, category?: string): Promise<Service[]> {
    const params = category ? `?category=${category}` : '';
    const response = await api.get(`/salons/${salonId}/services${params}`);
    return response.data.data.services;
  },

  async getSalonProviders(salonId: string): Promise<Provider[]> {
    const response = await api.get(`/salons/${salonId}/providers`);
    return response.data.data.providers;
  },

  async getSalonReviews(salonId: string): Promise<Review[]> {
    const response = await api.get(`/salons/${salonId}/reviews`);
    return response.data.data.reviews;
  },

  async getSalonGallery(salonId: string): Promise<{ images: { image: string; caption: string }[] }> {
    const response = await api.get(`/salons/${salonId}/gallery`);
    return response.data.data;
  },
};

export default salonService;

