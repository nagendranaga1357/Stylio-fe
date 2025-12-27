import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Salon } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';

interface SalonCardProps {
  salon: Salon;
  onPress: () => void;
}

const SalonCard = ({ salon, onPress }: SalonCardProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{ uri: salon.coverImage || 'https://via.placeholder.com/120x80' }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{salon.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.location} numberOfLines={1}>
            {salon.areaName || (typeof salon.area === 'object' ? salon.area?.name : '') || 'Unknown Area'}
            {salon.cityName ? `, ${salon.cityName}` : ''}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={colors.star} />
            <Text style={styles.rating}>{salon.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({salon.totalReviews})</Text>
          </View>
          <Text style={styles.distance}>{salon.distance || '2.5 km'}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  name: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
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
  distance: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default SalonCard;

