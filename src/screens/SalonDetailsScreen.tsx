import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Linking,
  Platform,
  Modal,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const carouselRef = useRef<FlatList>(null);
  const galleryRef = useRef<FlatList>(null);

  // Get all images (cover + gallery)
  const getAllImages = () => {
    if (!salon) return [];
    const images: string[] = [];
    
    // Add cover image first
    if (salon.coverImage) {
      images.push(salon.coverImage);
    }
    
    // Add gallery images
    if (salon.galleryImages && Array.isArray(salon.galleryImages)) {
      salon.galleryImages.forEach((img: any) => {
        const imageUrl = typeof img === 'string' ? img : img.image;
        if (imageUrl && !images.includes(imageUrl)) {
          images.push(imageUrl);
        }
      });
    }
    
    return images.length > 0 ? images : ['https://via.placeholder.com/400x300?text=No+Image'];
  };


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

  const images = getAllImages();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image Carousel */}
        <View style={styles.heroContainer}>
          <FlatList
            ref={carouselRef}
            data={images}
            keyExtractor={(item, index) => `${index}-${item}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentImageIndex(index);
            }}
            renderItem={({ item, index }) => (
              <TouchableOpacity 
                activeOpacity={0.9}
                onPress={() => {
                  setGalleryIndex(index);
                  setGalleryVisible(true);
                }}
              >
                <Image
                  source={{ uri: item }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.heroGradient}
          />
          
          {/* Image Counter */}
          {/* {images.length > 1 && (
            <View style={styles.imageCounter}>
              <Ionicons name="images-outline" size={14} color={colors.textOnPrimary} />
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1}/{images.length}
              </Text>
            </View>
          )}
           */}
          {/* Pagination Dots */}
          {images.length > 1 && (
            <View style={styles.paginationDots}>
              {images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dot,
                    currentImageIndex === index && styles.dotActive
                  ]}
                  onPress={() => {
                    carouselRef.current?.scrollToIndex({ index, animated: true });
                    setCurrentImageIndex(index);
                  }}
                />
              ))}
            </View>
          )}
          
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
              {/* {salon.priceLevel && salon.priceLevel > 0 && (
                <>
                  <Text style={styles.separator}>•</Text>
                  <Text style={styles.priceLevel}>{'₹'.repeat(salon.priceLevel)}</Text>
                </>
              )} */}
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
          <TouchableOpacity 
            style={styles.infoCard}
            onPress={() => setAddressModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <View style={styles.infoCardContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {salon.address}
                {typeof salon.area === 'object' && salon.area?.name ? `, ${salon.area.name}` : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
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

        {/* Contact Card - Show mobile (preferred) or phone */}
        {(salon.mobile || salon.phone) && (
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => {
              const phoneNumber = salon.mobile || salon.phone;
              const cleanNumber = phoneNumber!.replace(/[^0-9+]/g, '');
              Linking.openURL(`tel:${cleanNumber}`);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="call" size={18} color={colors.textOnPrimary} />
            </View>
            <Text style={styles.contactNumber}>{salon.mobile || salon.phone}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

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

      {/* Full Screen Gallery Modal */}
      <Modal
        visible={galleryVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setGalleryVisible(false)}
      >
        <StatusBar backgroundColor="#000" barStyle="light-content" />
        <View style={styles.galleryModal}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.galleryCloseBtn}
            onPress={() => setGalleryVisible(false)}
          >
            <Ionicons name="close" size={28} color={colors.textOnPrimary} />
          </TouchableOpacity>

          {/* Image Counter */}
          <View style={styles.galleryCounter}>
            <Text style={styles.galleryCounterText}>
              {galleryIndex + 1} / {images.length}
            </Text>
          </View>

          {/* Gallery Images */}
          <FlatList
            ref={galleryRef}
            data={images}
            keyExtractor={(item, index) => `gallery-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={galleryIndex}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setGalleryIndex(index);
            }}
            renderItem={({ item }) => (
              <View style={styles.galleryImageContainer}>
                <Image
                  source={{ uri: item }}
                  style={styles.galleryImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <View style={styles.thumbnailStrip}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((img, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setGalleryIndex(index);
                      galleryRef.current?.scrollToIndex({ index, animated: true });
                    }}
                    style={[
                      styles.thumbnail,
                      galleryIndex === index && styles.thumbnailActive
                    ]}
                  >
                    <Image
                      source={{ uri: img }}
                      style={styles.thumbnailImage}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>

      {/* Address Preview Modal */}
      <Modal
        visible={addressModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.addressModalOverlay}>
          <View style={styles.addressModalContent}>
            {/* Header */}
            <View style={styles.addressModalHeader}>
              <Text style={styles.addressModalTitle}>Full Address</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Address Details */}
            <View style={styles.addressDetails}>
              <View style={styles.addressIconRow}>
                <View style={styles.addressIconContainer}>
                  <Ionicons name="location" size={24} color={colors.primary} />
                </View>
                <View style={styles.addressTextContainer}>
                  <Text style={styles.addressLabel}>Street Address</Text>
                  <Text style={styles.addressText}>{salon.address}</Text>
                </View>
              </View>

              {typeof salon.area === 'object' && salon.area?.name && (
                <View style={styles.addressIconRow}>
                  <View style={styles.addressIconContainer}>
                    <Ionicons name="business-outline" size={24} color={colors.info} />
                  </View>
                  <View style={styles.addressTextContainer}>
                    <Text style={styles.addressLabel}>Area</Text>
                    <Text style={styles.addressText}>{salon.area.name}</Text>
                  </View>
                </View>
              )}

              {salon.cityName && (
                <View style={styles.addressIconRow}>
                  <View style={styles.addressIconContainer}>
                    <Ionicons name="map-outline" size={24} color={colors.success} />
                  </View>
                  <View style={styles.addressTextContainer}>
                    <Text style={styles.addressLabel}>City</Text>
                    <Text style={styles.addressText}>{salon.cityName}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Open in Maps Button */}
            <TouchableOpacity
              style={styles.openMapsButton}
              onPress={() => {
                const address = encodeURIComponent(
                  `${salon.address}${salon.cityName ? ', ' + salon.cityName : ''}`
                );
                const url = Platform.select({
                  ios: `maps:0,0?q=${address}`,
                  android: `geo:0,0?q=${address}`,
                });
                if (url) Linking.openURL(url);
              }}
            >
              <Ionicons name="navigate" size={20} color={colors.textOnPrimary} />
              <Text style={styles.openMapsButtonText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    height: 350,
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 350,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 50,
    
    right: 0, // Account for action buttons
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  imageCounterText: {
    ...typography.caption,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  paginationDots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.textOnPrimary,
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
    top: 60,
    left: '40%',
    transform: [{ translateX: -50 }],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 3,
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
    ...typography.h3,
    color: colors.textOnPrimary,
    marginBottom: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rating: {
    ...typography.bodySmall,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  reviews: {
    ...typography.bodySmall,
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
    flexBasis: 0,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  infoCardContent: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 16,
  },
  // Contact Card Style
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  contactIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactNumber: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  // Gallery Modal Styles
  galleryModal: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  galleryCloseBtn: {
    position: 'absolute',
    top: 50,
    right: spacing.md,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryCounter: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
  },
  galleryCounterText: {
    fontSize: 16,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  galleryImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  thumbnailStrip: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: spacing.sm,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
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
    ...typography.h4,
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
  // Address Modal Styles
  addressModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  addressModalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  addressModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  addressModalTitle: {
    ...typography.h4,
    color: colors.text,
  },
  addressDetails: {
    gap: spacing.md,
  },
  addressIconRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  addressIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressTextContainer: {
    flex: 1,
    paddingTop: 2,
  },
  addressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  addressText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  openMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  openMapsButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
});

export default SalonDetailsScreen;
