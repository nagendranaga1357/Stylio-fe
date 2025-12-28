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
import { format } from 'date-fns';

import { useBookings } from '../hooks';
import { Salon, Service, TimeSlot } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import { formatCurrency, formatDuration, formatTime, showToast } from '../utils';

/**
 * SlotSelectionScreen
 * 
 * Allow user to:
 * - View selected services summary
 * - Select a date (next 7 days)
 * - Select an available time slot
 * - Continue to payment
 */
const SlotSelectionScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { salon, services, isHomeService }: { salon: Salon; services: Service[]; isHomeService?: boolean } = route.params || {};

  const { availableSlots, isLoading, fetchAvailableSlots } = useBookings();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Generate next 7 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  useEffect(() => {
    if (salon?.id) {
      loadSlots();
    }
  }, [selectedDate, salon?.id]);

  const loadSlots = async () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    await fetchAvailableSlots(salon.id, dateStr);
    setSelectedSlot(null);
  };

  const getTotal = () => {
    if (!services) return 0;
    return services.reduce((sum, s) => sum + (s.discountedPrice || s.price || 0), 0);
  };

  const getDuration = () => {
    if (!services) return 0;
    return services.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  };

  const handleContinue = () => {
    if (!selectedSlot) {
      showToast.error('Please select a time slot');
      return;
    }

    // Create service summary for display
    const selectedService = {
      name: services.length === 1 
        ? services[0].name 
        : `${services.length} Services Selected`,
      price: formatCurrency(getTotal()),
      duration: formatDuration(getDuration()),
    };

    // Navigate to PaymentMethod screen
    navigation.navigate('PaymentMethod', {
      salon,
      selectedService,
      selectedServices: services.map(s => ({
        id: s.id,
        name: s.name,
        price: s.discountedPrice || s.price,
        duration: formatDuration(s.durationMinutes),
      })),
      selectedDate: selectedDate.toISOString(),
      selectedSlot,
      totalAmount: getTotal(),
      isHomeService,
    });
  };

  const formatDateDisplay = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return format(date, 'EEE, MMM d');
  };

  // Generate time slots if API doesn't return them
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 21; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const available = Math.random() > 0.3; // Simulated availability
      slots.push({ time, available });
    }
    return slots;
  };

  const displaySlots = availableSlots.length > 0 ? availableSlots : generateTimeSlots();

  if (!salon || !services) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>Booking data not found</Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Select Time Slot</Text>
          <Text style={styles.headerSubtitle}>{salon.name}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Service Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Details</Text>
          
          {services.length > 1 ? (
            <View style={styles.servicesListContainer}>
              {services.map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceItemName}>{service.name}</Text>
                    <Text style={styles.serviceItemDuration}>
                      {formatDuration(service.durationMinutes)}
                    </Text>
                  </View>
                  <Text style={styles.serviceItemPrice}>
                    {formatCurrency(service.discountedPrice || service.price)}
                  </Text>
                </View>
              ))}
              
              <View style={styles.totalDivider} />
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(getTotal())}</Text>
              </View>
              <View style={styles.durationRow}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.durationText}>{formatDuration(getDuration())}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.singleServiceContainer}>
              <View style={styles.serviceRow}>
                <Text style={styles.serviceName}>{services[0]?.name}</Text>
                <Text style={styles.servicePrice}>
                  {formatCurrency(services[0]?.discountedPrice || services[0]?.price)}
                </Text>
              </View>
              <View style={styles.durationRow}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.durationText}>
                  {formatDuration(services[0]?.durationMinutes)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Date Selection */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Select Date</Text>
          </View>
          
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
                    {format(date, 'EEE')}
                  </Text>
                  <Text style={[styles.dateNum, isSelected && styles.dateTextSelected]}>
                    {date.getDate()}
                  </Text>
                  <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>
                    {format(date, 'MMM')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Slots */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Available Time Slots</Text>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Loading available slots...</Text>
            </View>
          ) : (
            <View style={styles.slotsGrid}>
              {displaySlots.map((slot, index) => {
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
                    {isDisabled && (
                      <View style={styles.bookedBadge}>
                        <Text style={styles.bookedText}>Booked</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Selected Date & Time */}
        {selectedSlot && (
          <View style={[styles.card, styles.selectedCard]}>
            <View style={styles.selectedRow}>
              <Text style={styles.selectedLabel}>Selected Date & Time</Text>
              <Text style={styles.selectedValue}>
                {formatDateDisplay(selectedDate)} at {formatTime(selectedSlot)}
              </Text>
            </View>
          </View>
        )}

        {/* Bottom padding */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedSlot && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedSlot}
        >
          <Text style={styles.continueButtonText}>
            Continue to Book
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  goBackButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
  },
  goBackButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    marginLeft: spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  // Cards
  card: {
    margin: spacing.lg,
    marginBottom: 0,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  selectedCard: {
    backgroundColor: colors.primaryLight + '10',
    borderColor: colors.primaryLight,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  // Service Summary
  singleServiceContainer: {
    marginTop: spacing.md,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  servicePrice: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  durationText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  servicesListContainer: {
    marginTop: spacing.md,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceItemName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  serviceItemDuration: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  serviceItemPrice: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  totalDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  totalValue: {
    ...typography.h3,
    color: colors.primary,
  },
  // Date Selection
  datesContainer: {
    gap: spacing.sm,
  },
  dateCard: {
    width: 70,
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
    marginBottom: 2,
  },
  dateNum: {
    ...typography.h3,
    color: colors.text,
  },
  dateMonth: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dateTextSelected: {
    color: colors.textOnPrimary,
  },
  // Time Slots
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
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
    minWidth: 80,
    alignItems: 'center',
    position: 'relative',
  },
  slotCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  slotCardDisabled: {
    backgroundColor: colors.backgroundSecondary,
    opacity: 0.7,
  },
  slotTime: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  slotTimeSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  slotTimeDisabled: {
    color: colors.textLight,
  },
  bookedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.textLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  bookedText: {
    ...typography.caption,
    color: colors.textOnPrimary,
    fontSize: 9,
  },
  // Selected Summary
  selectedRow: {
    alignItems: 'center',
  },
  selectedLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  selectedValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    ...shadows.lg,
  },
  continueButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  continueButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
});

export default SlotSelectionScreen;
