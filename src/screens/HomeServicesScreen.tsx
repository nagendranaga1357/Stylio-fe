import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useLocation } from '../hooks';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Provider interface
interface HomeProvider {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  distance: string;
  location: string;
  services: string[];
  experience: string;
  phone: string;
  verified: boolean;
}

// Testimonial interface
interface Testimonial {
  name: string;
  rating: number;
  text: string;
}

/**
 * HomeServicesScreen
 * 
 * Displays home service providers with:
 * - Hero carousel
 * - Trust features
 * - Nearby providers list
 * - Customer testimonials
 */
const HomeServicesScreen = () => {
  const navigation = useNavigation<any>();
  const scrollViewRef = useRef<ScrollView>(null);
  const { location, formatDistance } = useLocation();
  
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero carousel data
  const heroCards = [
    {
      title: 'Trusted Home Salon Services',
      description: 'Verified female grooming professionals at your doorstep',
      gradient: ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent'],
    },
    {
      title: 'Safe & Hygienic Services',
      description: 'Following highest safety standards for your comfort',
      gradient: ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent'],
    },
    {
      title: 'Expert Beauty Professionals',
      description: 'Experienced specialists ready to serve you at home',
      gradient: ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent'],
    },
  ];

  // Sample providers (in production, fetch from API)
  const providers: HomeProvider[] = [
    {
      id: '1',
      name: 'Meera Kumar',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      rating: 4.9,
      reviews: 156,
      distance: '2.3 km',
      location: 'Indiranagar',
      services: ['Haircut', 'Waxing', 'Threading', 'Facial', 'Massage'],
      experience: '8 years',
      phone: '+91 98765 43210',
      verified: true,
    },
    {
      id: '2',
      name: 'Kavita Singh',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      rating: 4.8,
      reviews: 142,
      distance: '3.1 km',
      location: 'Koramangala',
      services: ['Bridal Makeup', 'Haircut', 'Facial', 'Manicure', 'Pedicure'],
      experience: '10 years',
      phone: '+91 98765 43211',
      verified: true,
    },
    {
      id: '3',
      name: 'Deepa Reddy',
      image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200',
      rating: 4.7,
      reviews: 128,
      distance: '1.8 km',
      location: 'HSR Layout',
      services: ['Haircut', 'Hair Coloring', 'Waxing', 'Threading'],
      experience: '6 years',
      phone: '+91 98765 43212',
      verified: true,
    },
    {
      id: '4',
      name: 'Shalini Menon',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      rating: 4.9,
      reviews: 189,
      distance: '2.7 km',
      location: 'Whitefield',
      services: ['Grooming Combo', 'Massage', 'Facial', 'Hair Spa'],
      experience: '12 years',
      phone: '+91 98765 43213',
      verified: true,
    },
  ];

  // Testimonials
  const testimonials: Testimonial[] = [
    { name: 'Priya Sharma', rating: 5, text: 'Excellent service at home! Very professional and hygienic.' },
    { name: 'Anjali Verma', rating: 5, text: 'Felt safe and comfortable. Highly recommend!' },
    { name: 'Neha Patel', rating: 5, text: 'Convenient and trustworthy. Will book again.' },
  ];

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroCards.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCallProvider = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const renderProviderCard = (provider: HomeProvider) => (
    <TouchableOpacity
      key={provider.id}
      style={styles.providerCard}
      onPress={() => navigation.navigate('HomeProviderDetails', { provider })}
    >
      <View style={styles.providerContent}>
        {/* Profile Image */}
        <View style={styles.providerImageContainer}>
          <Image
            source={{ uri: provider.image }}
            style={styles.providerImage}
          />
          {provider.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color={colors.textOnPrimary} />
            </View>
          )}
        </View>

        {/* Provider Info */}
        <View style={styles.providerInfo}>
          <View style={styles.providerHeader}>
            <View style={styles.providerNameRow}>
              <Text style={styles.providerName}>{provider.name}</Text>
            </View>
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>{provider.distance}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.locationText}>{provider.location}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.star} />
            <Text style={styles.ratingText}>{provider.rating}</Text>
            <Text style={styles.reviewsText}>({provider.reviews} reviews)</Text>
          </View>

          <View style={styles.experienceRow}>
            <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.experienceText}>{provider.experience} experience</Text>
          </View>

          {/* Services */}
          <View style={styles.servicesRow}>
            {provider.services.slice(0, 3).map((service, idx) => (
              <View key={idx} style={styles.serviceBadge}>
                <Text style={styles.serviceBadgeText}>{service}</Text>
              </View>
            ))}
            {provider.services.length > 3 && (
              <View style={[styles.serviceBadge, styles.moreServicesBadge]}>
                <Text style={styles.moreServicesText}>+{provider.services.length - 3}</Text>
              </View>
            )}
          </View>

          {/* Call Button */}
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCallProvider(provider.phone)}
          >
            <Ionicons name="call-outline" size={16} color={colors.primary} />
            <Text style={styles.callButtonText}>Call Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Home Services</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentSlide(index);
            }}
          >
            {heroCards.map((card, index) => (
              <View key={index} style={styles.carouselItem}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800' }}
                  style={styles.carouselImage}
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
                  style={styles.carouselGradient}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                />
                <View style={styles.carouselContent}>
                  <Text style={styles.carouselTitle}>{card.title}</Text>
                  <Text style={styles.carouselDescription}>{card.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          
          {/* Dots */}
          <View style={styles.dotsContainer}>
            {heroCards.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentSlide === index && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Nearby Providers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Providers</Text>
            <View style={styles.homeServiceBadge}>
              <Text style={styles.homeServiceBadgeText}>Home Service</Text>
            </View>
          </View>

          {providers.map(renderProviderCard)}

          {/* See All Button */}
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('AllProviders')}
          >
            <Text style={styles.seeAllButtonText}>See All Providers</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Testimonials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Our Customers Say</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testimonialsContainer}
          >
            {testimonials.map((testimonial, index) => (
              <View key={index} style={styles.testimonialCard}>
                <View style={styles.starsRow}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Ionicons key={i} name="star" size={14} color={colors.star} />
                  ))}
                </View>
                <Text style={styles.testimonialText}>"{testimonial.text}"</Text>
                <Text style={styles.testimonialName}>{testimonial.name}</Text>
                <View style={styles.verifiedCustomerBadge}>
                  <Text style={styles.verifiedCustomerText}>Verified Home Service Customer</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Carousel
  carouselContainer: {
    position: 'relative',
  },
  carouselItem: {
    width: SCREEN_WIDTH,
    height: 220,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  carouselContent: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
  },
  carouselTitle: {
    ...typography.h2,
    color: colors.textOnPrimary,
    marginBottom: spacing.xs,
  },
  carouselDescription: {
    ...typography.body,
    color: colors.textOnPrimary,
    opacity: 0.9,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: colors.textOnPrimary,
    width: 24,
  },
  // Sections
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  homeServiceBadge: {
    backgroundColor: '#EC4899',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  homeServiceBadgeText: {
    ...typography.caption,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  // Provider Card
  providerCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  providerContent: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  providerImageContainer: {
    position: 'relative',
  },
  providerImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
  },
  verifiedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EC4899',
    borderRadius: borderRadius.full,
    padding: 2,
  },
  providerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  providerNameRow: {
    flex: 1,
  },
  providerName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  distanceBadge: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  distanceText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  locationText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  ratingText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  reviewsText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  experienceText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  serviceBadge: {
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  serviceBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  moreServicesBadge: {
    backgroundColor: colors.backgroundSecondary,
  },
  moreServicesText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight + '20',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  callButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  seeAllButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  // Testimonials
  testimonialsContainer: {
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  testimonialCard: {
    width: 260,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: spacing.sm,
  },
  testimonialText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  testimonialName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  verifiedCustomerBadge: {
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  verifiedCustomerText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default HomeServicesScreen;



