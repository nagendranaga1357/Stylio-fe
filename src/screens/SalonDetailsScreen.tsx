import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useSalons } from '../hooks';
import { favoriteService } from '../services';
import { Service, ServiceMode, AudienceType } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import { formatCurrency, formatDuration, showToast } from '../utils';

/**
 * Get display info for service mode
 */
const getModeDisplay = (mode: ServiceMode | undefined): { 
  label: string; 
  color: string; 
  icon: keyof typeof Ionicons.glyphMap 
} | null => {
  if (!mode) return null;
  switch (mode) {
    case 'toSalon':
      return { label: 'To Salon', color: colors.primary, icon: 'storefront-outline' };
    case 'toHome':
      return { label: 'To Home', color: '#EC4899', icon: 'home-outline' };
    case 'both':
      return { label: 'Both Options', color: colors.info, icon: 'swap-horizontal-outline' };
    default:
      return null;
  }
};

/**
 * Get icon for audience type
 */
const getAudienceIcon = (audience: AudienceType): keyof typeof Ionicons.glyphMap => {
  switch (audience) {
    case 'men': return 'man-outline';
    case 'women': return 'woman-outline';
    case 'kids': return 'happy-outline';
    case 'unisex': return 'people-outline';
    default: return 'person-outline';
  }
};

/**
 * SalonDetailsScreen - V1 Enhanced
 * 
 * Displays detailed salon information with:
 * - Service mode badge (To Salon / To Home / Both)
 * - Audience indicators (Men / Women / Kids / Unisex)
 * - Service selection with mode/audience filtering
 * - Price level indicator
 */
const SalonDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const salonId = route.params?.salonId;

  const {
    selectedSalon: salon,
    services,
    isLoading,
    fetchSalon,
    fetchSalonServices,
  } = useSalons();

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (salonId) {
      loadData();
    }
  }, [salonId]);

  const loadData = async () => {
    await Promise.all([
      fetchSalon(salonId),
      fetchSalonServices(salonId),
    ]);
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const toggleFavorite = async () => {
    try {
      const { isFavorite: newState } = await favoriteService.toggleFavorite(salonId);
      setIsFavorite(newState);
      showToast.success(newState ? 'Added to favorites' : 'Removed from favorites');
    } catch (err) {
      showToast.error('Error', 'Failed to update favorites');
    }
  };

  const getSelectedTotal = () => {
    return services
      .filter((s) => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + (s.discountedPrice || s.price), 0);
  };

  const getSelectedDuration = () => {
    return services
      .filter((s) => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  };

  const handleBookNow = () => {
    if (selectedServices.length === 0) {
      showToast.error('Error', 'Please select at least one service');
      return;
    }

    const selectedServiceObjects = services.filter((s) => selectedServices.includes(s.id));
    
    navigation.navigate('SlotSelection', {
      salon,
      services: selectedServiceObjects,
    });
  };

  if (isLoading || !salon) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const modeDisplay = getModeDisplay(salon.mode);
  const rating = salon.averageRating ?? salon.rating ?? 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: salon.coverImage || 'https://via.placeholder.com/400x300' }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.heroGradient}
          />
          
          {/* Mode Badge Overlay */}
          {modeDisplay && (
            <View style={[styles.modeBadgeOverlay, { backgroundColor: modeDisplay.color }]}>
              <Ionicons name={modeDisplay.icon} size={14} color={colors.textOnPrimary} />
              <Text style={styles.modeBadgeOverlayText}>{modeDisplay.label}</Text>
            </View>
          )}
          
          {/* Back & Actions */}
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.rightActions}>
              <TouchableOpacity style={styles.actionButton} onPress={toggleFavorite}>
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorite ? colors.error : colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Salon Info */}
          <View style={styles.heroInfo}>
            <Text style={styles.salonName}>{salon.name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color={colors.star} />
              <Text style={styles.rating}>{rating.toFixed(1)}</Text>
              <Text style={styles.reviews}>({salon.totalReviews} reviews)</Text>
              {salon.priceLevel && (
                <>
                  <Text style={styles.separator}>•</Text>
                  <Text style={styles.priceLevel}>{'₹'.repeat(salon.priceLevel)}</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Audience Badges (V1) */}
        {salon.audience && salon.audience.length > 0 && (
          <View style={styles.audienceContainer}>
            <Text style={styles.audienceLabel}>Available for</Text>
            <View style={styles.audienceBadges}>
              {salon.audience.map((aud) => (
                <View key={aud} style={styles.audienceBadge}>
                  <Ionicons name={getAudienceIcon(aud)} size={16} color={colors.primary} />
                  <Text style={styles.audienceBadgeText}>{aud}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Info Cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <View style={styles.infoCardContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {salon.address}
                {typeof salon.area === 'object' && salon.area?.name ? `, ${salon.area.name}` : ''}
              </Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <View style={styles.infoCardContent}>
              <Text style={styles.infoLabel}>Hours</Text>
              <Text style={styles.infoValue}>
                {salon.openingTime} - {salon.closingTime}
              </Text>
            </View>
          </View>
        </View>

        {/* Features */}
        {salon.features && (
          <View style={styles.featuresContainer}>
            {salon.features.hasWifi && (
              <View style={styles.featureBadge}>
                <Ionicons name="wifi" size={14} color={colors.textSecondary} />
                <Text style={styles.featureText}>WiFi</Text>
              </View>
            )}
            {salon.features.hasParking && (
              <View style={styles.featureBadge}>
                <Ionicons name="car" size={14} color={colors.textSecondary} />
                <Text style={styles.featureText}>Parking</Text>
              </View>
            )}
            {salon.features.hasAc && (
              <View style={styles.featureBadge}>
                <Ionicons name="snow" size={14} color={colors.textSecondary} />
                <Text style={styles.featureText}>AC</Text>
              </View>
            )}
            {salon.features.acceptsCards && (
              <View style={styles.featureBadge}>
                <Ionicons name="card" size={14} color={colors.textSecondary} />
                <Text style={styles.featureText}>Cards</Text>
              </View>
            )}
          </View>
        )}

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <Text style={styles.sectionSubtitle}>Select one or more services</Text>
          
          {services.length === 0 ? (
            <View style={styles.emptyServices}>
              <Ionicons name="cut-outline" size={40} color={colors.textLight} />
              <Text style={styles.emptyServicesText}>No services available</Text>
            </View>
          ) : (
            services.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              return (
                <TouchableOpacity
                  key={service.id}
                  style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                  onPress={() => toggleService(service.id)}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color={colors.textOnPrimary} />}
                  </View>
                  <View style={styles.serviceInfo}>
                    <View style={styles.serviceHeader}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      {/* Service audience badges */}
                      {service.audience && service.audience.length > 0 && (
                        <View style={styles.serviceAudienceBadges}>
                          {service.audience.slice(0, 2).map((aud) => (
                            <Ionicons 
                              key={aud} 
                              name={getAudienceIcon(aud)} 
                              size={12} 
                              color={colors.textLight} 
                            />
                          ))}
                        </View>
                      )}
                    </View>
                    <Text style={styles.serviceDuration}>{formatDuration(service.durationMinutes)}</Text>
                  </View>
                  <View style={styles.servicePrice}>
                    {service.discountedPrice && service.discountedPrice < service.price && (
                      <Text style={styles.originalPrice}>{formatCurrency(service.price)}</Text>
                    )}
                    <Text style={styles.finalPrice}>
                      {formatCurrency(service.discountedPrice || service.price)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Bottom padding for safe scrolling */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        {selectedServices.length > 0 && (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedCount}>
              {selectedServices.length} service(s) • {formatDuration(getSelectedDuration())}
            </Text>
            <Text style={styles.selectedTotal}>{formatCurrency(getSelectedTotal())}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.bookButton, selectedServices.length === 0 && styles.bookButtonDisabled]}
          onPress={handleBookNow}
          disabled={selectedServices.length === 0}
        >
          <Text style={styles.bookButtonText}>
            {selectedServices.length === 0 ? 'Select Services' : 
             salon.mode === 'toHome' ? 'Book Home Service' : 'Book Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
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
  modeBadgeOverlay: {
    position: 'absolute',
    top: 50,
    left: '50%',
    transform: [{ translateX: -50 }],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  modeBadgeOverlayText: {
    ...typography.bodySmall,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  heroActions: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  heroInfo: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  salonName: {
    ...typography.h2,
    color: colors.textOnPrimary,
    marginBottom: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rating: {
    ...typography.body,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  reviews: {
    ...typography.body,
    color: colors.textOnPrimary,
    opacity: 0.8,
  },
  separator: {
    color: colors.textOnPrimary,
    opacity: 0.6,
    marginHorizontal: spacing.xs,
  },
  priceLevel: {
    ...typography.body,
    color: colors.success,
    fontWeight: '600',
  },
  // Audience section (V1)
  audienceContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  audienceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  audienceBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  audienceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  audienceBadgeText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  infoCards: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  infoCardContent: {
    flex: 1,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  featureText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    padding: spacing.md,
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
  emptyServices: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyServicesText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  serviceAudienceBadges: {
    flexDirection: 'row',
    gap: 2,
    marginLeft: spacing.xs,
  },
  serviceDuration: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  servicePrice: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    ...typography.caption,
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  finalPrice: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  bottomBar: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.lg,
  },
  selectedInfo: {
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
  bookButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  bookButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
});

export default SalonDetailsScreen;
