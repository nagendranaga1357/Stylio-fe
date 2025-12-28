import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { bookingService } from '../services';
import { colors, spacing, borderRadius, shadows } from '../utils/theme';
import { showToast, formatCurrency } from '../utils';

type PaymentType = 'full' | 'advance';

/**
 * PaymentMethodScreen
 * 
 * Allows user to select payment method:
 * - Full payment
 * - Advance payment (10% minimum)
 */
const PaymentMethodScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bookingData = route.params;

  const [paymentType, setPaymentType] = useState<PaymentType>('advance');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!bookingData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>Booking data not found</Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={styles.goBackButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate amounts
  const totalAmount = bookingData.totalAmount || 0;
  const advanceAmount = Math.round(totalAmount * 0.1); // 10% advance
  const payableAmount = paymentType === 'full' ? totalAmount : advanceAmount;
  const remainingAmount = totalAmount - advanceAmount;

  // Format time slot
  const formatTimeSlot = (time24: string): string => {
    if (!time24) return '';
    const hour = parseInt(time24.split(':')[0]);
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };

  const handlePayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const payload = {
        salon: bookingData.salon.id,
        bookingType: bookingData.isHomeService ? 'home' : 'salon',
        bookingDate: format(new Date(bookingData.selectedDate), 'yyyy-MM-dd'),
        bookingTime: bookingData.selectedSlot,
        services: bookingData.selectedServices.map((s: any) => s.id),
        homeAddress: bookingData.homeAddress,
        customerNotes: bookingData.notes,
      };

      const newBooking = await bookingService.createBooking(payload);

      showToast.success('Booking confirmed successfully!');

      navigation.navigate('BookingConfirmation', {
        salon: bookingData.salon,
        selectedService: bookingData.selectedService,
        selectedServices: bookingData.selectedServices,
        selectedDate: bookingData.selectedDate,
        selectedSlot: bookingData.selectedSlot,
        bookingId: newBooking.id,
        bookingNumber: newBooking.bookingNumber,
        isHomeService: bookingData.isHomeService,
        paymentDetails: {
          type: paymentType,
          amount: payableAmount,
          totalAmount: totalAmount,
          paymentId: 'pay_' + Date.now(),
          orderId: 'order_' + Date.now(),
        },
      });
    } catch (error: any) {
      console.error('Booking failed:', error);
      const errorMsg = error.response?.data?.message || 'Failed to create booking. Please try again.';
      showToast.error('Booking Failed', errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

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
          <Text style={styles.headerTitle}>Payment Method</Text>
          <Text style={styles.headerSubtitle}>Choose your payment option</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Booking Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Summary</Text>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Salon</Text>
            <Text style={styles.summaryValue} numberOfLines={2}>
              {bookingData.salon?.name}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>
              Service{bookingData.selectedServices?.length > 1 ? 's' : ''}
            </Text>
            <View style={styles.servicesContainer}>
              {bookingData.selectedServices?.map((service: any, index: number) => (
                <View key={index} style={styles.serviceRow}>
                  <Text style={styles.serviceName} numberOfLines={1}>
                    {service.name}
                  </Text>
                  <Text style={styles.servicePrice}>
                    {formatCurrency(service.price)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Date & Time</Text>
            <Text style={styles.summaryValue}>
              {bookingData.selectedDate && format(new Date(bookingData.selectedDate), 'EEE, MMM d, yyyy')}
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Time Slot</Text>
            <Text style={styles.summaryValue}>
              {formatTimeSlot(bookingData.selectedSlot)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Service Charge</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>

        {/* Payment Options */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="card-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Select Payment Method</Text>
          </View>
          <Text style={styles.cardSubtitle}>Choose how you want to pay</Text>

          {/* Full Payment */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentType === 'full' && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentType('full')}
          >
            <View style={styles.radioContainer}>
              <View style={[
                styles.radioOuter,
                paymentType === 'full' && styles.radioOuterSelected,
              ]}>
                {paymentType === 'full' && <View style={styles.radioInner} />}
              </View>
            </View>
            <View style={styles.paymentContent}>
              <Text style={styles.paymentTitle}>Full Payment</Text>
              <Text style={styles.paymentDesc}>
                Pay the complete service charge now
              </Text>
            </View>
            <View style={styles.paymentAmount}>
              <Text style={styles.paymentAmountText}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Advance Payment */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentType === 'advance' && styles.paymentOptionSelected,
            ]}
            onPress={() => setPaymentType('advance')}
          >
            <View style={styles.radioContainer}>
              <View style={[
                styles.radioOuter,
                paymentType === 'advance' && styles.radioOuterSelected,
              ]}>
                {paymentType === 'advance' && <View style={styles.radioInner} />}
              </View>
            </View>
            <View style={styles.paymentContent}>
              <View style={styles.paymentTitleRow}>
                <Text style={styles.paymentTitle}>Advance Payment</Text>
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommended</Text>
                </View>
              </View>
              <Text style={styles.paymentDesc}>
                10% advance to confirm booking
              </Text>
              <View style={styles.remainingInfo}>
                <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.remainingText}>
                  Pay {formatCurrency(remainingAmount)} at {bookingData.isHomeService ? 'service time' : 'salon'}
                </Text>
              </View>
            </View>
            <View style={[styles.paymentAmount, styles.paymentAmountPrimary]}>
              <Text style={styles.paymentAmountTextPrimary}>
                {formatCurrency(advanceAmount)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Payment Summary */}
        <View style={[styles.card, styles.summaryCard]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Payment Type</Text>
            <Text style={styles.summaryRowValue}>
              {paymentType === 'full' ? 'Full' : 'Advance'} Payment
            </Text>
          </View>

          {paymentType === 'advance' && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryRowLabel}>Total Service</Text>
              <Text style={styles.summaryRowValue}>{formatCurrency(totalAmount)}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.amountLabel}>Amount to Pay</Text>
            <Text style={styles.amountValue}>{formatCurrency(payableAmount)}</Text>
          </View>

          {paymentType === 'advance' && (
            <View style={styles.noteRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.noteText}>
                10% advance is required to confirm
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={styles.payButtonText}>
              Pay {formatCurrency(payableAmount)} via RazorPay
            </Text>
          )}
        </TouchableOpacity>
        <Text style={styles.secureNote}>
          🔒 Secure payment powered by RazorPay
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
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
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Cards
  card: {
    margin: spacing.md,
    marginBottom: 0,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  summaryCard: {
    backgroundColor: colors.primaryLight + '15',
    borderWidth: 1,
    borderColor: colors.primaryLight + '30',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  // Summary Items
  summaryItem: {
    marginBottom: spacing.md,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  servicesContainer: {
    marginTop: 4,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  serviceName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  divider: {
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
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  // Payment Options
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  radioContainer: {
    paddingTop: 2,
    marginRight: spacing.md,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  paymentContent: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  paymentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  recommendedBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  paymentDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  remainingInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: spacing.xs,
  },
  remainingText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  paymentAmount: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  paymentAmountPrimary: {
    backgroundColor: colors.primary,
  },
  paymentAmountText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  paymentAmountTextPrimary: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  // Summary Card
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryRowLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  noteText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
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
    paddingBottom: spacing.lg,
    ...shadows.lg,
  },
  payButton: {
    height: 54,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  secureNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export default PaymentMethodScreen;
