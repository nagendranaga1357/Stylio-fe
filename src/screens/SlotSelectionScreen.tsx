import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useBookings } from '../hooks';
import { Salon, Service, TimeSlot } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import { formatCurrency, formatDuration, formatTime, showToast } from '../utils';

const SlotSelectionScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { salon, services }: { salon: Salon; services: Service[] } = route.params;

  const { availableSlots, isLoading, fetchAvailableSlots, createBooking } = useBookings();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  useEffect(() => {
    loadSlots();
  }, [selectedDate]);

  const loadSlots = async () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    await fetchAvailableSlots(salon.id, dateStr);
    setSelectedSlot(null);
  };

  const getTotal = () => {
    return services.reduce((sum, s) => sum + (s.discountedPrice || s.price), 0);
  };

  const getDuration = () => {
    return services.reduce((sum, s) => sum + s.durationMinutes, 0);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      showToast.error('Error', 'Please select a time slot');
      return;
    }

    setIsBooking(true);
    try {
      const booking = await createBooking({
        salon: salon.id,
        bookingType: 'salon',
        bookingDate: selectedDate.toISOString().split('T')[0],
        bookingTime: selectedSlot,
        services: services.map((s) => s.id),
      });

      navigation.replace('BookingConfirmation', { booking });
    } catch (err: any) {
      showToast.error('Error', err.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  const formatDateDisplay = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Time</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Salon Info */}
        <View style={styles.salonInfo}>
          <Text style={styles.salonName}>{salon.name}</Text>
          <Text style={styles.servicesSummary}>
            {services.length} service(s) • {formatDuration(getDuration())}
          </Text>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesContainer}
          >
            {dates.map((date, index) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text style={[styles.dateNum, isSelected && styles.dateTextSelected]}>
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Available Slots for {formatDateDisplay(selectedDate)}
          </Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : availableSlots.length === 0 ? (
            <Text style={styles.noSlots}>No slots available for this date</Text>
          ) : (
            <View style={styles.slotsGrid}>
              {availableSlots.map((slot, index) => {
                const isSelected = selectedSlot === slot.time;
                const isDisabled = !slot.available;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.slotCard,
                      isSelected && styles.slotCardSelected,
                      isDisabled && styles.slotCardDisabled,
                    ]}
                    onPress={() => !isDisabled && setSelectedSlot(slot.time)}
                    disabled={isDisabled}
                  >
                    <Text
                      style={[
                        styles.slotTime,
                        isSelected && styles.slotTimeSelected,
                        isDisabled && styles.slotTimeDisabled,
                      ]}
                    >
                      {formatTime(slot.time)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{formatCurrency(getTotal())}</Text>
        </View>
        <TouchableOpacity
          style={[styles.confirmButton, (!selectedSlot || isBooking) && styles.confirmButtonDisabled]}
          onPress={handleConfirmBooking}
          disabled={!selectedSlot || isBooking}
        >
          <Text style={styles.confirmButtonText}>
            {isBooking ? 'Booking...' : 'Confirm Booking'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  salonInfo: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  salonName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  servicesSummary: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    fontSize: 16,
  },
  datesContainer: {
    gap: spacing.sm,
  },
  dateCard: {
    width: 64,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    marginRight: spacing.sm,
  },
  dateCardSelected: {
    backgroundColor: colors.primary,
  },
  dateDay: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dateNum: {
    ...typography.h3,
    color: colors.text,
  },
  dateTextSelected: {
    color: colors.textOnPrimary,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  noSlots: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.xl,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slotCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  slotCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  slotCardDisabled: {
    backgroundColor: colors.backgroundSecondary,
    opacity: 0.5,
  },
  slotTime: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  slotTimeSelected: {
    color: colors.primary,
  },
  slotTimeDisabled: {
    color: colors.textLight,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  totalAmount: {
    ...typography.h3,
    color: colors.text,
  },
  confirmButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  confirmButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
});

export default SlotSelectionScreen;

