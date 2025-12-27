import { useState, useCallback } from 'react';
import { salonService } from '../services';
import { Salon, Service, Provider, Review, SalonFilters } from '../types';

export const useSalons = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchSalons = useCallback(async (filters?: SalonFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await salonService.getSalons(filters);
      setSalons(data.salons || []);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load salons');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSalon = useCallback(async (id: string) => {
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

  const fetchSalonServices = useCallback(async (salonId: string, category?: string) => {
    setIsLoading(true);
    try {
      const data = await salonService.getSalonServices(salonId, category);
      setServices(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load services');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSalonProviders = useCallback(async (salonId: string) => {
    try {
      const data = await salonService.getSalonProviders(salonId);
      setProviders(data);
      return data;
    } catch (err) {
      return [];
    }
  }, []);

  const fetchSalonReviews = useCallback(async (salonId: string) => {
    try {
      const data = await salonService.getSalonReviews(salonId);
      setReviews(data);
      return data;
    } catch (err) {
      return [];
    }
  }, []);

  const loadMore = useCallback(async (filters?: SalonFilters) => {
    if (pagination.page >= pagination.pages) return;
    
    setIsLoading(true);
    try {
      const data = await salonService.getSalons({
        ...filters,
        page: pagination.page + 1,
      });
      setSalons((prev) => [...prev, ...(data.salons || [])]);
      setPagination(data.pagination);
    } finally {
      setIsLoading(false);
    }
  }, [pagination]);

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
    clearError: () => setError(null),
  };
};

export default useSalons;

