import { useState, useCallback } from 'react';
import { bookingService } from '../services';
import { Booking, BookingCreateData, TimeSlot } from '../types';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (status?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bookingService.getBookings(status);
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUpcomingBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await bookingService.getUpcomingBookings();
      setUpcomingBookings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load upcoming bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPastBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await bookingService.getPastBookings();
      setPastBookings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load past bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBooking = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const booking = await bookingService.getBooking(id);
      setSelectedBooking(booking);
      return booking;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load booking details');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (data: BookingCreateData) => {
    setIsLoading(true);
    setError(null);
    try {
      const booking = await bookingService.createBooking(data);
      setBookings((prev) => [booking, ...prev]);
      return booking;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (id: string, reason?: string) => {
    setIsLoading(true);
    try {
      const booking = await bookingService.cancelBooking(id, reason);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? booking : b))
      );
      return booking;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAvailableSlots = useCallback(async (salonId: string, date: string) => {
    setIsLoading(true);
    try {
      const slots = await bookingService.getAvailableSlots(salonId, date);
      setAvailableSlots(slots);
      return slots;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load available slots');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    bookings,
    upcomingBookings,
    pastBookings,
    selectedBooking,
    availableSlots,
    isLoading,
    error,
    fetchBookings,
    fetchUpcomingBookings,
    fetchPastBookings,
    fetchBooking,
    createBooking,
    cancelBooking,
    fetchAvailableSlots,
    clearError: () => setError(null),
  };
};

export default useBookings;

