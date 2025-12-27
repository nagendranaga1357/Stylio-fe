import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useSalons, useLocation } from '../hooks';
import { Salon, SalonFilters, ServiceMode, AudienceType } from '../types';
import { colors, spacing, borderRadius, typography } from '../utils/theme';
import { 
  SalonCard, 
  ServiceModeTabs, 
  QuickFilterBar, 
  FilterModal,
  SearchFiltersState,
} from '../components';

/**
 * SearchScreen - V1 Enhanced
 * 
 * Advanced search & discovery with:
 * - Location-based search (geo-coordinates)
 * - Text search by name/keywords
 * - Mode filtering (To Salon / To Home)
 * - Audience filtering (Men / Women / Kids / Unisex)
 * - Rating and price level filters
 * - Sorting options (distance, rating, price, popular)
 * - Pagination with infinite scroll
 * 
 * Example searches:
 * - Nearby salons: uses $geoNear with user coordinates
 * - By name: "Looks Salon" -> text search
 * - By mode: "To Home" -> filter by mode=toHome
 * - Combined: "Haircut near me for women" -> geo + mode + audience
 */
const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  // Route params
  const initialMode = route.params?.mode as ServiceMode | undefined;
  const initialCategory = route.params?.category;
  const initialQuery = route.params?.q;
  
  // Hooks
  const { 
    salons, 
    isLoading, 
    pagination, 
    fetchSalons, 
    searchByLocation,
    searchByName,
    loadMore,
    resetSalons,
  } = useSalons();
  
  const {
    location,
    hasPermission,
    formatDistance,
  } = useLocation();

  // State
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersState>({
    mode: initialMode || null,
    audience: null,
    minRating: undefined,
    minPriceLevel: undefined,
    maxPriceLevel: undefined,
    sortBy: location ? 'distance' : 'popular',
    sortOrder: 'desc',
  });

  // Computed filters for API
  const apiFilters = useMemo((): SalonFilters => {
    const f: SalonFilters = {
      page: 1,
      limit: 20,
    };
    
    // Text search
    if (searchQuery.trim()) {
      f.q = searchQuery.trim();
    }
    
    // Location
    if (location && (filters.sortBy === 'distance' || !filters.sortBy)) {
      f.lat = location.latitude;
      f.lng = location.longitude;
      f.radius = 20000; // 20km
    }
    
    // Mode & Audience
    if (filters.mode) f.mode = filters.mode;
    if (filters.audience) f.audience = filters.audience;
    
    // Rating
    if (filters.minRating) f.minRating = filters.minRating;
    
    // Price level
    if (filters.minPriceLevel) f.minPriceLevel = filters.minPriceLevel;
    if (filters.maxPriceLevel) f.maxPriceLevel = filters.maxPriceLevel;
    
    // Sorting
    if (filters.sortBy) f.sortBy = filters.sortBy;
    if (filters.sortOrder) f.sortOrder = filters.sortOrder;
    
    // Category (from route params)
    if (initialCategory) {
      // Note: category filtering might need backend support
      // For now, we can use text search or a dedicated param
    }
    
    return f;
  }, [searchQuery, location, filters, initialCategory]);

  // Initial load
  useEffect(() => {
    performSearch();
  }, []);

  // Re-search when filters change
  useEffect(() => {
    performSearch();
  }, [filters.mode, filters.audience, filters.minRating, filters.minPriceLevel, filters.sortBy]);

  const performSearch = useCallback(async () => {
    Keyboard.dismiss();
    
    if (searchQuery.trim()) {
      // Text search
      await fetchSalons({
        ...apiFilters,
        q: searchQuery.trim(),
      });
    } else if (location && (filters.sortBy === 'distance' || !filters.mode)) {
      // Location-based search
      await searchByLocation(location.latitude, location.longitude, {
        mode: filters.mode || undefined,
        audience: filters.audience || undefined,
        minRating: filters.minRating,
        radius: 20000,
        limit: 20,
      });
    } else {
      // Default search with filters
      await fetchSalons(apiFilters);
    }
  }, [searchQuery, location, apiFilters, filters]);

  const handleSearch = useCallback(() => {
    performSearch();
  }, [performSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    performSearch();
  }, [performSearch]);

  const handleModeChange = useCallback((mode: ServiceMode | null) => {
    setFilters(prev => ({ ...prev, mode }));
  }, []);

  const handleFiltersChange = useCallback((newFilters: SearchFiltersState) => {
    setFilters(newFilters);
  }, []);

  const handleApplyFilters = useCallback((newFilters: SearchFiltersState) => {
    setFilters(newFilters);
    setShowFilters(false);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && (pagination.hasNextPage || pagination.page < (pagination.pages || 0))) {
      loadMore(apiFilters);
    }
  }, [isLoading, pagination, loadMore, apiFilters]);

  const renderHeader = () => (
    <View>
      {/* Mode tabs */}
      <View style={styles.modeTabsContainer}>
        <ServiceModeTabs
          selectedMode={filters.mode || null}
          onModeChange={handleModeChange}
        />
      </View>

      {/* Quick filter bar */}
      <QuickFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onOpenFilters={() => setShowFilters(true)}
      />

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {pagination.total} {pagination.total === 1 ? 'salon' : 'salons'} found
        </Text>
        {location && filters.sortBy === 'distance' && (
          <View style={styles.locationIndicator}>
            <Ionicons name="location" size={12} color={colors.primary} />
            <Text style={styles.locationIndicatorText}>Near you</Text>
          </View>
        )}
      </View>
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
        <Ionicons 
          name={filters.mode === 'toHome' ? 'home-outline' : 'storefront-outline'} 
          size={64} 
          color={colors.textLight} 
        />
        <Text style={styles.emptyText}>No salons found</Text>
        <Text style={styles.emptySubtext}>
          {searchQuery 
            ? `No results for "${searchQuery}"`
            : filters.mode 
              ? `No ${filters.mode === 'toHome' ? 'home service' : 'salon'} providers found`
              : 'Try adjusting your search or filters'
          }
        </Text>
        {(searchQuery || filters.mode || filters.audience) && (
          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={() => {
              setSearchQuery('');
              setFilters({});
              fetchSalons({ limit: 20 });
            }}
          >
            <Text style={styles.clearFiltersText}>Clear all filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSalonItem = ({ item }: { item: Salon }) => (
    <SalonCard
      salon={item}
      onPress={() => navigation.navigate('SalonDetails', { salonId: item.id })}
      showMode={!filters.mode}
      showAudience={!filters.audience}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search salons, services..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus={!initialQuery && !initialMode}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={[
            styles.filterButton,
            (filters.mode || filters.audience || filters.minRating) && styles.filterButtonActive,
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons 
            name="options" 
            size={24} 
            color={(filters.mode || filters.audience || filters.minRating) 
              ? colors.textOnPrimary 
              : colors.text
            } 
          />
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
        keyboardShouldPersistTaps="handled"
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={handleApplyFilters}
        hasLocation={hasPermission && !!location}
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
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeTabsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  resultsCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationIndicatorText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + 80, // Account for tab bar
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
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  clearFiltersButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primaryLight + '20',
    borderRadius: borderRadius.md,
  },
  clearFiltersText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default SearchScreen;
