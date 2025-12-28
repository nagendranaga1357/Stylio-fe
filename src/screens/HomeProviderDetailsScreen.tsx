import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import { showToast } from '../utils';

interface ProviderService {
  name: string;
  duration: string;
  price: number;
}

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}

/**
 * HomeProviderDetailsScreen
 * 
 * Detailed view of a home service provider with:
 * - Profile info
 * - Services & pricing
 * - Previous work gallery
 * - Customer reviews
 * - Call & Book actions
 */
const HomeProviderDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const provider = route.params?.provider;

  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Sample services (in production, fetch from API)
  const services: ProviderService[] = [
    { name: 'Hair Cutting', duration: '45 min', price: 499 },
    { name: 'Waxing (Full Body)', duration: '60 min', price: 899 },
    { name: 'Threading', duration: '15 min', price: 149 },
    { name: 'Facial', duration: '45 min', price: 699 },
    { name: 'Massage', duration: '60 min', price: 999 },
    { name: 'Hair Coloring', duration: '90 min', price: 1499 },
  ];

  // Sample reviews
  const reviews: Review[] = [
    { id: '1', name: 'Priya Sharma', rating: 5, text: 'Excellent service! Very professional and hygienic.', date: '2 days ago' },
    { id: '2', name: 'Anjali Verma', rating: 5, text: 'Felt safe and comfortable. Highly recommend!', date: '1 week ago' },
    { id: '3', name: 'Neha Patel', rating: 4, text: 'Good service, will book again.', date: '2 weeks ago' },
  ];

  // Sample gallery
  const gallery = [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=300',
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300',
  ];

  if (!provider) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>Provider not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${provider.phone}`);
  };

  const handleBookHomeVisit = () => {
    if (selectedServices.length === 0) {
      showToast.error('Please select at least one service');
      return;
    }

    // Navigate to slot selection with selected services
    const selectedServiceObjects = services.filter(s => selectedServices.includes(s.name));
    const totalPrice = selectedServiceObjects.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = selectedServiceObjects.reduce((sum, s) => {
      const mins = parseInt(s.duration);
      return sum + (isNaN(mins) ? 0 : mins);
    }, 0);

    navigation.navigate('SlotSelection', {
      salon: {
        id: provider.id,
        name: provider.name,
        address: provider.location,
        mode: 'toHome',
      },
      services: selectedServiceObjects.map(s => ({
        id: s.name,
        name: s.name,
        price: s.price,
        durationMinutes: parseInt(s.duration) || 30,
      })),
      isHomeService: true,
    });
  };

  const toggleService = (serviceName: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceName)
        ? prev.filter(s => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const getSelectedTotal = () => {
    return services
      .filter(s => selectedServices.includes(s.name))
      .reduce((sum, s) => sum + s.price, 0);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: provider.image }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.heroGradient}
          />
          
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Verified Badge */}
          {provider.verified && (
            <View style={styles.verifiedOverlay}>
              <Ionicons name="shield-checkmark" size={18} color={colors.textOnPrimary} />
              <Text style={styles.verifiedOverlayText}>Verified</Text>
            </View>
          )}
        </View>

        {/* Provider Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.providerName}>{provider.name}</Text>
            {provider.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>Verified</Text>
              </View>
            )}
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.locationText}>{provider.location} • {provider.distance} away</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color={colors.star} />
              <Text style={styles.statValue}>{provider.rating}</Text>
              <Text style={styles.statLabel}>({provider.reviews} reviews)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="person-outline" size={18} color={colors.primary} />
              <Text style={styles.statValue}>{provider.experience}</Text>
              <Text style={styles.statLabel}>experience</Text>
            </View>
          </View>

          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>
              Professional home beauty service provider with {provider.experience} of experience. 
              Specializing in {provider.services.slice(0, 3).join(', ')} and more. 
              Committed to providing safe, hygienic, and high-quality services at your doorstep.
            </Text>
          </View>
        </View>

        {/* Services & Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services & Pricing</Text>
          <Text style={styles.sectionSubtitle}>Select services to book</Text>
          
          {services.map((service, index) => {
            const isSelected = selectedServices.includes(service.name);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.serviceCard,
                  isSelected && styles.serviceCardSelected,
                ]}
                onPress={() => toggleService(service.name)}
              >
                <View style={[
                  styles.serviceCheckbox,
                  isSelected && styles.serviceCheckboxSelected,
                ]}>
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color={colors.textOnPrimary} />
                  )}
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDuration}>{service.duration}</Text>
                </View>
                <Text style={styles.servicePrice}>₹{service.price.toLocaleString()}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Previous Work Gallery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Previous Work</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryContainer}
          >
            {gallery.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.galleryImage}
              />
            ))}
          </ScrollView>
        </View>

        {/* Customer Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Reviews</Text>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.name}</Text>
                <View style={styles.reviewRating}>
                  {[...Array(review.rating)].map((_, i) => (
                    <Ionicons key={i} name="star" size={12} color={colors.star} />
                  ))}
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}
        </View>

        {/* Bottom padding */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {selectedServices.length > 0 && (
          <View style={styles.selectedSummary}>
            <Text style={styles.selectedCount}>
              {selectedServices.length} service(s) selected
            </Text>
            <Text style={styles.selectedTotal}>
              ₹{getSelectedTotal().toLocaleString()}
            </Text>
          </View>
        )}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.callButton}
            onPress={handleCall}
          >
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.bookButton,
              selectedServices.length === 0 && styles.bookButtonDisabled,
            ]}
            onPress={handleBookHomeVisit}
            disabled={selectedServices.length === 0}
          >
            <Ionicons name="home-outline" size={20} color={colors.textOnPrimary} />
            <Text style={styles.bookButtonText}>
              {selectedServices.length === 0 ? 'Select Services' : 'Book Home Visit'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  // Hero
  heroContainer: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  verifiedOverlay: {
    position: 'absolute',
    top: 50,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EC4899',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  verifiedOverlayText: {
    ...typography.bodySmall,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  // Info Section
  infoSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  providerName: {
    ...typography.h2,
    color: colors.text,
  },
  verifiedBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  verifiedBadgeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  locationText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  aboutSection: {
    marginTop: spacing.lg,
  },
  aboutText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  // Sections
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  // Services
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  serviceCardSelected: {
    backgroundColor: colors.primaryLight + '10',
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  serviceCheckbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  serviceCheckboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  serviceDuration: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  servicePrice: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  // Gallery
  galleryContainer: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    marginRight: spacing.sm,
  },
  // Reviews
  reviewCard: {
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  reviewerName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    ...typography.caption,
    color: colors.textLight,
    marginLeft: 'auto',
  },
  reviewText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
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
  selectedSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  selectedCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  selectedTotal: {
    ...typography.h3,
    color: colors.primary,
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.xs,
  },
  callButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  bookButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: '#EC4899',
    gap: spacing.xs,
  },
  bookButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  bookButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
});

export default HomeProviderDetailsScreen;



