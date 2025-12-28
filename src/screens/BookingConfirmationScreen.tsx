import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { Booking } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import { formatDate, formatTime, formatCurrency, getStatusColor, getStatusText } from '../utils';

/**
 * BookingConfirmationScreen
 * 
 * Displays booking confirmation with:
 * - Success animation
 * - Booking details
 * - Payment summary
 * - Navigation to home or bookings
 * 
 * Supports two data formats:
 * 1. New format from PaymentMethod (with paymentDetails)
 * 2. Legacy format with Booking object
 */
const BookingConfirmationScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  // Support both new and legacy data formats
  const legacyBooking: Booking | undefined = route.params?.booking;
  const paymentData = route.params?.paymentDetails;
  
  // New format data
  const salon = route.params?.salon || legacyBooking?.salon;
  const selectedServices = route.params?.selectedServices || [];
  const selectedService = route.params?.selectedService;
  const selectedDate = route.params?.selectedDate;
  const selectedSlot = route.params?.selectedSlot;
  const bookingNumber = route.params?.bookingNumber || legacyBooking?.bookingNumber;
  const bookingId = route.params?.bookingId || legacyBooking?.id;
  const isHomeService = route.params?.isHomeService || legacyBooking?.bookingType === 'home';

  // Format time slot to display format
  const formatTimeSlot = (time24: string): string => {
    if (!time24) return '';
    const hour = parseInt(time24.split(':')[0]);
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleViewBookings = () => {
    navigation.reset({
      index: 0,
      routes: [
        { name: 'Main' },
        { name: 'Main', params: { screen: 'Bookings' } },
      ],
    });
  };

  // Render with new format data
  const renderWithNewFormat = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Success Animation */}
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={48} color={colors.textOnPrimary} />
        </View>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Your booking has been successfully confirmed. We're excited to serve you!
        </Text>
      </View>

      {/* Booking Details Card */}
      <View style={styles.card}>
        {/* Salon Info */}
        <View style={styles.detailSection}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{isHomeService ? 'Provider' : 'Salon'}</Text>
            <Text style={styles.detailValue}>{salon?.name}</Text>
            {salon?.address && (
              <Text style={styles.detailSubvalue}>{salon.address}</Text>
            )}
            {bookingNumber && (
              <Text style={styles.bookingId}>Booking ID: #{bookingNumber}</Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Services */}
        <View style={styles.detailSection}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>
              Service{selectedServices?.length > 1 ? 's' : ''}
            </Text>
            {selectedServices && selectedServices.length > 0 ? (
              <View style={styles.servicesList}>
                {selectedServices.map((service: any, index: number) => (
                  <View key={index} style={styles.serviceItem}>
                    <Text style={styles.detailValue}>{service.name}</Text>
                    <View style={styles.serviceDetails}>
                      <Text style={styles.serviceDetailText}>{service.duration}</Text>
                      <Text style={styles.servicePrice}>{service.price}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.detailValue}>{selectedService?.name}</Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Date & Time */}
        <View style={styles.detailSection}>
          <View style={styles.detailIconContainer}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>
              {selectedDate && format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
            </Text>
            <Text style={styles.detailSubvalue}>at {formatTimeSlot(selectedSlot)}</Text>
          </View>
        </View>

        {/* Payment Info */}
        {paymentData && (
          <>
            <View style={styles.divider} />
            
            <View style={styles.detailSection}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="card-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Payment</Text>
                <Text style={styles.detailValue}>
                  {paymentData.type === 'advance' ? 'Advance Payment' : 'Full Payment'}
                </Text>
                <Text style={styles.detailSubvalue}>
                  Paid: ₹{paymentData.amount.toLocaleString()}
                  {paymentData.type === 'advance' && ` of ₹${paymentData.totalAmount.toLocaleString()}`}
                </Text>
                {paymentData.paymentId && (
                  <Text style={styles.paymentId}>Payment ID: {paymentData.paymentId}</Text>
                )}
              </View>
            </View>
          </>
        )}
      </View>

      {/* Important Note for Advance Payment */}
      {paymentData?.type === 'advance' && (
        <View style={styles.warningBox}>
          <Ionicons name="warning-outline" size={20} color={colors.warning} />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Important Note</Text>
            <Text style={styles.warningText}>
              You've paid the advance amount. Please pay the remaining ₹
              {(paymentData.totalAmount - paymentData.amount).toLocaleString()} 
              {isHomeService ? ' at the time of service' : ' at the salon when you arrive'}.
            </Text>
          </View>
        </View>
      )}

      {/* Info Note */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color={colors.info} />
        <Text style={styles.infoText}>
          A confirmation has been sent to your email. Please arrive 10 minutes before your scheduled time.
        </Text>
      </View>
    </ScrollView>
  );

  // Render with legacy Booking object
  const renderWithLegacyFormat = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Success Animation */}
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={48} color={colors.textOnPrimary} />
        </View>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Your appointment has been successfully booked
        </Text>
      </View>

      {/* Booking Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.bookingNumber}>#{legacyBooking!.bookingNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(legacyBooking!.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(legacyBooking!.status) }]}>
              {getStatusText(legacyBooking!.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.salonName}>{legacyBooking!.salon?.name || legacyBooking!.salonName}</Text>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.gridDetailItem}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <View>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.gridDetailValue}>{formatDate(legacyBooking!.bookingDate)}</Text>
            </View>
          </View>

          <View style={styles.gridDetailItem}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <View>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.gridDetailValue}>{formatTime(legacyBooking!.bookingTime)}</Text>
            </View>
          </View>

          <View style={styles.gridDetailItem}>
            <Ionicons name="cut-outline" size={20} color={colors.primary} />
            <View>
              <Text style={styles.detailLabel}>Services</Text>
              <Text style={styles.gridDetailValue}>
                {legacyBooking!.servicesCount || legacyBooking!.services?.length || 0} service(s)
              </Text>
            </View>
          </View>

          <View style={styles.gridDetailItem}>
            <Ionicons name="storefront-outline" size={20} color={colors.primary} />
            <View>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.gridDetailValue}>
                {legacyBooking!.bookingType === 'home' ? 'At Home' : 'At Salon'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Amount */}
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>{formatCurrency(legacyBooking!.finalAmount)}</Text>
        </View>
      </View>

      {/* Info Note */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color={colors.info} />
        <Text style={styles.infoText}>
          You can cancel or reschedule your booking up to 2 hours before the appointment time.
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {legacyBooking ? renderWithLegacyFormat() : renderWithNewFormat()}

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleViewBookings}>
          <Text style={styles.secondaryButtonText}>View My Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
          <Text style={styles.primaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  successSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bookingNumber: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  salonName: {
    ...typography.h3,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  // New format styles
  detailSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  detailSubvalue: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  bookingId: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  servicesList: {
    marginTop: spacing.xs,
  },
  serviceItem: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  serviceDetailText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  servicePrice: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  paymentId: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  // Legacy format styles
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridDetailItem: {
    width: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  gridDetailValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  amountValue: {
    ...typography.h2,
    color: colors.primary,
  },
  // Alert boxes
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warning + '15',
    borderWidth: 1,
    borderColor: colors.warning + '40',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    ...typography.body,
    color: colors.warning,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.warning,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.info + '10',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.info,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textOnPrimary,
    textAlign: 'center',
  },
});

export default BookingConfirmationScreen;
