import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useSalons, useLocation } from '../hooks';
import { Salon, ServiceMode, AudienceType } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import { SalonCard } from '../components';

/**
 * ServiceListingScreen
 * 
 * Displays a list of salons filtered by:
 * - Service type/category
 * - Mode (toSalon/toHome)
 * - Location
 * - Various filters (rating, price, audience)
 */
const ServiceListingScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  // Route params
  const serviceSlug = route.params?.service;
  const serviceName = route.params?.serviceName || 'Services';
  const initialMode = route.params?.mode as ServiceMode | undefined;
  
  // Hooks
  const {
    salons,
    isLoading,
    pagination,
    fetchSalons,
    loadMore,
  } = useSalons();
  
  const { location, formatDistance } = useLocation();
  
  // State
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Filter chips
  const filterChips = [
    { id: 'filter', label: 'Filter', icon: 'options-outline' as const },
    { id: 'sort', label: 'Sort', icon: 'swap-vertical-outline' as const },
    { id: 'nearby', label: 'Nearby', icon: 'location-outline' as const },
    { id: 'topRated', label: 'Top Rated', icon: 'star-outline' as const },
  ];

  useEffect(() => {
    loadSalons();
  }, [serviceSlug, initialMode]);

  const loadSalons = async () => {
    const filters: any = {
      limit: 20,
    };
    
    if (serviceSlug) {
      filters.q = serviceSlug;
    }
    
    if (initialMode) {
      filters.mode = initialMode;
    }
    
    if (location) {
      filters.lat = location.latitude;
      filters.lng = location.longitude;
      filters.radius = 20000;
      filters.sortBy = 'distance';
    }
    
    await fetchSalons(filters);
  };

  const handleFilterPress = (filterId: string) => {
    setActiveFilter(activeFilter === filterId ? null : filterId);
    
    switch (filterId) {
      case 'nearby':
        if (location) {
          fetchSalons({
            lat: location.latitude,
            lng: location.longitude,
            radius: 5000,
            sortBy: 'distance',
            limit: 20,
          });
        }
        break;
      case 'topRated':
        fetchSalons({
          minRating: 4,
          sortBy: 'rating',
          sortOrder: 'desc',
          limit: 20,
        });
        break;
      default:
        // TODO: Open filter modal
        break;
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!isLoading && (pagination.hasNextPage || pagination.page < (pagination.pages || 0))) {
      loadMore({
        q: serviceSlug,
        mode: initialMode,
      });
    }
  }, [isLoading, pagination, loadMore, serviceSlug, initialMode]);

  const renderHeader = () => (
    <View style={styles.filtersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
      >
        {filterChips.map((chip) => (
          <TouchableOpacity
            key={chip.id}
            style={[
              styles.filterChip,
              activeFilter === chip.id && styles.filterChipActive,
            ]}
            onPress={() => handleFilterPress(chip.id)}
          >
            <Ionicons
              name={chip.icon}
              size={16}
              color={activeFilter === chip.id ? colors.textOnPrimary : colors.text}
            />
            <Text
              style={[
                styles.filterChipText,
                activeFilter === chip.id && styles.filterChipTextActive,
              ]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="storefront-outline" size={64} color={colors.textLight} />
        <Text style={styles.emptyText}>No salons found</Text>
        <Text style={styles.emptySubtext}>
          Try adjusting your search or filters
        </Text>
      </View>
    );
  };

  const renderSalonItem = ({ item, index }: { item: Salon; index: number }) => (
    <View style={{ opacity: 1 }}>
      <SalonCard
        salon={item}
        onPress={() => navigation.navigate('SalonDetails', { salonId: item.id })}
        showMode={!initialMode}
      />
    </View>
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
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{serviceName}</Text>
          <Text style={styles.headerSubtitle}>Find the best salons near you</Text>
        </View>
        
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Salon List */}
      <FlatList
        data={salons}
        keyExtractor={(item) => item.id}
        renderItem={renderSalonItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    paddingVertical: spacing.md,
  },
  filtersScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.textOnPrimary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  footer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
});

export default ServiceListingScreen;



