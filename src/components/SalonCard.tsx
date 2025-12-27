import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Salon, ServiceMode, AudienceType } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';

interface SalonCardProps {
  salon: Salon;
  onPress: () => void;
  showMode?: boolean;
  showAudience?: boolean;
  compact?: boolean;
}

/**
 * Get display text for service mode
 */
const getModeDisplay = (mode: ServiceMode): { label: string; color: string; icon: keyof typeof Ionicons.glyphMap } => {
  switch (mode) {
    case 'toSalon':
      return { label: 'To Salon', color: colors.primary, icon: 'storefront-outline' };
    case 'toHome':
      return { label: 'To Home', color: '#EC4899', icon: 'home-outline' };
    case 'both':
      return { label: 'Both', color: colors.info, icon: 'swap-horizontal-outline' };
    default:
      return { label: '', color: colors.textSecondary, icon: 'ellipse' };
  }
};

/**
 * Get icon for audience type
 */
const getAudienceIcon = (audience: AudienceType): keyof typeof Ionicons.glyphMap => {
  switch (audience) {
    case 'men':
      return 'man-outline';
    case 'women':
      return 'woman-outline';
    case 'kids':
      return 'happy-outline';
    case 'unisex':
      return 'people-outline';
    default:
      return 'person-outline';
  }
};

/**
 * Format distance for display
 */
const formatDistance = (distanceInMeters?: number, distanceString?: string): string => {
  if (distanceString) return distanceString;
  if (!distanceInMeters) return '';
  
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)} m`;
  }
  
  const km = distanceInMeters / 1000;
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
};

/**
 * Get price level display
 */
const getPriceLevelDisplay = (priceLevel?: number): string => {
  if (!priceLevel) return '';
  return '₹'.repeat(priceLevel);
};

/**
 * SalonCard Component - V1 Enhanced
 * 
 * Displays salon information in a card format with support for:
 * - Service mode badges (To Salon / To Home)
 * - Audience indicators (Men / Women / Kids / Unisex)
 * - Distance from user (when geo-search is used)
 * - Price level indicator
 * - Rating and reviews
 */
const SalonCard: React.FC<SalonCardProps> = ({
  salon,
  onPress,
  showMode = true,
  showAudience = true,
  compact = false,
}) => {
  const modeDisplay = salon.mode ? getModeDisplay(salon.mode) : null;
  const displayDistance = formatDistance(salon.distanceInMeters, salon.distance);
  const priceDisplay = getPriceLevelDisplay(salon.priceLevel);
  const rating = salon.averageRating ?? salon.rating ?? 0;

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={onPress}>
        <Image
          source={{ uri: salon.thumbnailUrl || salon.coverImage || 'https://via.placeholder.com/80' }}
          style={styles.compactImage}
        />
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={1}>{salon.name}</Text>
          <View style={styles.compactMeta}>
            <Ionicons name="star" size={12} color={colors.star} />
            <Text style={styles.compactRating}>{rating.toFixed(1)}</Text>
            {displayDistance && (
              <>
                <Text style={styles.compactDot}>•</Text>
                <Text style={styles.compactDistance}>{displayDistance}</Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Image */}
      <Image
        source={{ uri: salon.thumbnailUrl || salon.coverImage || 'https://via.placeholder.com/120x80' }}
        style={styles.image}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Header with name and mode badge */}
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{salon.name}</Text>
          {showMode && modeDisplay && (
            <View style={[styles.modeBadge, { backgroundColor: modeDisplay.color + '20' }]}>
              <Ionicons name={modeDisplay.icon} size={10} color={modeDisplay.color} />
              <Text style={[styles.modeBadgeText, { color: modeDisplay.color }]}>
                {modeDisplay.label}
              </Text>
            </View>
          )}
        </View>

        {/* Location row */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.location} numberOfLines={1}>
            {salon.areaName || (typeof salon.area === 'object' ? salon.area?.name : '') || 'Unknown Area'}
            {salon.cityName ? `, ${salon.cityName}` : ''}
          </Text>
        </View>

        {/* Audience badges */}
        {showAudience && salon.audience && salon.audience.length > 0 && (
          <View style={styles.audienceRow}>
            {salon.audience.slice(0, 3).map((aud) => (
              <View key={aud} style={styles.audienceBadge}>
                <Ionicons name={getAudienceIcon(aud)} size={10} color={colors.textSecondary} />
                <Text style={styles.audienceBadgeText}>{aud}</Text>
              </View>
            ))}
            {salon.audience.length > 3 && (
              <Text style={styles.moreAudience}>+{salon.audience.length - 3}</Text>
            )}
          </View>
        )}

        {/* Bottom row with rating, price, and distance */}
        <View style={styles.bottomRow}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={colors.star} />
            <Text style={styles.rating}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({salon.totalReviews})</Text>
          </View>
          
          <View style={styles.rightMeta}>
            {priceDisplay && (
              <Text style={styles.priceLevel}>{priceDisplay}</Text>
            )}
            {displayDistance && (
              <Text style={styles.distance}>{displayDistance}</Text>
            )}
          </View>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );
};

/**
 * Horizontal salon card for carousels
 */
export const SalonCardHorizontal: React.FC<SalonCardProps> = ({
  salon,
  onPress,
  showMode = true,
}) => {
  const modeDisplay = salon.mode ? getModeDisplay(salon.mode) : null;
  const displayDistance = formatDistance(salon.distanceInMeters, salon.distance);
  const rating = salon.averageRating ?? salon.rating ?? 0;

  return (
    <TouchableOpacity style={styles.horizontalContainer} onPress={onPress}>
      {/* Image */}
      <Image
        source={{ uri: salon.thumbnailUrl || salon.coverImage || 'https://via.placeholder.com/160x100' }}
        style={styles.horizontalImage}
      />
      
      {/* Mode badge overlay */}
      {showMode && modeDisplay && (
        <View style={[styles.modeOverlay, { backgroundColor: modeDisplay.color }]}>
          <Ionicons name={modeDisplay.icon} size={10} color={colors.textOnPrimary} />
          <Text style={styles.modeOverlayText}>{modeDisplay.label}</Text>
        </View>
      )}
      
      {/* Distance badge */}
      {displayDistance && (
        <View style={styles.distanceOverlay}>
          <Ionicons name="location" size={10} color={colors.textOnPrimary} />
          <Text style={styles.distanceOverlayText}>{displayDistance}</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.horizontalContent}>
        <Text style={styles.horizontalName} numberOfLines={1}>{salon.name}</Text>
        <Text style={styles.horizontalLocation} numberOfLines={1}>
          {salon.areaName || salon.cityName || 'Location'}
        </Text>
        <View style={styles.horizontalRating}>
          <Ionicons name="star" size={12} color={colors.star} />
          <Text style={styles.horizontalRatingText}>{rating.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Main card styles
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.xs,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  modeBadgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  location: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  audienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  audienceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  audienceBadgeText: {
    fontSize: 9,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  moreAudience: {
    fontSize: 9,
    color: colors.textLight,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  reviews: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceLevel: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  distance: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },

  // Compact card styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    width: 200,
  },
  compactImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  compactContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  compactName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  compactRating: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
  },
  compactDot: {
    fontSize: 11,
    color: colors.textLight,
  },
  compactDistance: {
    fontSize: 11,
    color: colors.primary,
  },

  // Horizontal card styles
  horizontalContainer: {
    width: 160,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  horizontalImage: {
    width: '100%',
    height: 100,
    backgroundColor: colors.backgroundSecondary,
  },
  modeOverlay: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  modeOverlayText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  distanceOverlay: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  distanceOverlayText: {
    fontSize: 9,
    fontWeight: '500',
    color: colors.textOnPrimary,
  },
  horizontalContent: {
    padding: spacing.sm,
  },
  horizontalName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  horizontalLocation: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  horizontalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: spacing.xs,
  },
  horizontalRatingText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
  },
});

export default SalonCard;
