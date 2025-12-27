import api from './api';
import { Booking, BookingCreateData, TimeSlot, PaginatedResponse } from '../types';

export const bookingService = {
  async getBookings(status?: string): Promise<PaginatedResponse<Booking>> {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/bookings${params}`);
    return response.data.data;
  },

  async getBooking(id: string): Promise<Booking> {
    const response = await api.get(`/bookings/${id}`);
    return response.data.data.booking;
  },

  async createBooking(data: BookingCreateData): Promise<Booking> {
    const response = await api.post('/bookings', data);
    return response.data.data.booking;
  },

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    const response = await api.post(`/bookings/${id}/cancel`, { reason });
    return response.data.data.booking;
  },

  async getUpcomingBookings(): Promise<Booking[]> {
    const response = await api.get('/bookings/upcoming');
    return response.data.data.bookings;
  },

  async getPastBookings(): Promise<Booking[]> {
    const response = await api.get('/bookings/past');
    return response.data.data.bookings;
  },

  async getAvailableSlots(salonId: string, date: string): Promise<TimeSlot[]> {
    const response = await api.get(`/bookings/available-slots?salon=${salonId}&date=${date}`);
    return response.data.data.slots;
  },
};

export default bookingService;

