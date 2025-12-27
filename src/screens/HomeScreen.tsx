import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth, useSalons, useLocation } from '../hooks';
import { serviceService, notificationService } from '../services';
import { Salon, ServiceCategory, ServiceMode } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import { SalonCard, SalonCardHorizontal, ServiceModeSelector } from '../components';

/**
 * HomeScreen - V1 Enhanced
 * 
 * Main landing screen with:
 * - Service mode selector (To Salon / To Home)
 * - Location-aware search
 * - Category browsing
 * - Popular salons for selected mode
 * - Nearby salons (when location available)
 */
const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { 
    salons, 
    isLoading, 
    fetchSalons, 
    searchByLocation, 
    searchByMode 
  } = useSalons();
  const {
    location,
    hasPermission,
    requestPermission,
    formatDistance,
  } = useLocation(true); // Auto-request location
  
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ServiceMode | null>(null);
  const [nearbySalons, setNearbySalons] = useState<Salon[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  // Load nearby salons when location becomes available
  useEffect(() => {
    if (location && selectedMode) {
      loadNearbySalons();
    }
  }, [location, selectedMode]);

  // Reload salons when mode changes
  useEffect(() => {
    if (selectedMode) {
      loadSalonsByMode(selectedMode);
    } else {
      fetchSalons({ limit: 10 });
    }
  }, [selectedMode]);

  const loadData = async () => {
    await Promise.all([
      fetchSalons({ limit: 10 }),
      loadCategories(),
      loadUnreadCount(),
    ]);
  };

  const loadCategories = async () => {
    try {
      const data = await serviceService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const { count } = await notificationService.getUnreadNotifications();
      setUnreadCount(count);
    } catch (err) {
      // Ignore
    }
  };

  const loadSalonsByMode = async (mode: ServiceMode) => {
    if (location) {
      await searchByLocation(location.latitude, location.longitude, {
        mode,
        radius: 10000, // 10km
        limit: 10,
      });
    } else {
      await searchByMode(mode, { limit: 10 });
    }
  };

  const loadNearbySalons = async () => {
    if (!location) return;
    
    try {
      const result = await import('../services').then(m => 
        m.salonService.searchByLocation(
          location.latitude,
          location.longitude,
          {
            radius: 5000, // 5km
            mode: selectedMode || undefined,
            limit: 5,
          }
        )
      );
      setNearbySalons(result.data);
    } catch (err) {
      console.error('Failed to load nearby salons', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    if (location && selectedMode) {
      await loadNearbySalons();
    }
    setRefreshing(false);
  };

  const handleModeChange = (mode: ServiceMode | null) => {
    setSelectedMode(mode);
  };

  const handleLocationRequest = async () => {
    const granted = await requestPermission();
    if (granted) {
      Alert.alert('Location Enabled', 'We\'ll show you nearby salons!');
    }
  };

  const getCategoryIcon = (name: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      men: 'man',
      women: 'woman',
      unisex: 'people',
      kids: 'happy',
      spa: 'water',
      hair: 'cut',
      makeup: 'color-palette',
      nails: 'hand-left',
      facial: 'sparkles',
      massage: 'body',
    };
    return icons[name.toLowerCase()] || 'ellipse';
  };

  const getModeDescription = (): string => {
    if (!selectedMode) return 'All services';
    if (selectedMode === 'toSalon') return 'Visit a salon near you';
    if (selectedMode === 'toHome') return 'Get services at your doorstep';
    return 'Browse all options';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.firstName || user?.username}!</Text>
            <TouchableOpacity 
              style={styles.locationRow}
              onPress={handleLocationRequest}
            >
              <Ionicons 
                name={hasPermission ? 'location' : 'location-outline'} 
                size={14} 
                color={hasPermission ? colors.primary : colors.textSecondary} 
              />
              <Text style={styles.locationText}>
                {location?.city || location?.area || 'Enable location'}
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search', { mode: selectedMode })}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <Text style={styles.searchText}>Search salons, services...</Text>
        </TouchableOpacity>

        {/* Service Mode Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What are you looking for?</Text>
          <ServiceModeSelector
            selectedMode={selectedMode}
            onModeChange={handleModeChange}
            showBothOption={false}
          />
          <Text style={styles.modeDescription}>{getModeDescription()}</Text>
        </View>

        {/* Nearby Salons (when location available) */}
        {location && nearbySalons.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="location" size={18} color={colors.primary} />
                <Text style={styles.sectionTitle}>Nearby</Text>
              </View>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Search', { 
                  mode: selectedMode,
                  lat: location.latitude,
                  lng: location.longitude,
                })}
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {nearbySalons.map((salon) => (
                <SalonCardHorizontal
                  key={salon.id}
                  salon={salon}
                  onPress={() => navigation.navigate('SalonDetails', { salonId: salon.id })}
                  showMode={!selectedMode}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitlePlain}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => navigation.navigate('Search', { 
                  category: category.slug,
                  mode: selectedMode,
                })}
              >
                <View style={styles.categoryIcon}>
                  <Ionicons
                    name={getCategoryIcon(category.name)}
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Salons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitlePlain}>
              {selectedMode === 'toHome' ? 'Home Service Providers' : 
               selectedMode === 'toSalon' ? 'Popular Salons' : 
               'Popular Salons'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search', { mode: selectedMode })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {isLoading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : salons.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="storefront-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No salons found</Text>
              <Text style={styles.emptySubtext}>
                {selectedMode ? 'Try changing the service mode' : 'Pull to refresh'}
              </Text>
            </View>
          ) : (
            salons.slice(0, 5).map((salon) => (
              <SalonCard
                key={salon.id}
                salon={salon}
                onPress={() => navigation.navigate('SalonDetails', { salonId: salon.id })}
                showMode={!selectedMode}
                showAudience={true}
              />
            ))
          )}
        </View>

        {/* Bottom spacing for tab bar */}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: {
    ...typography.h3,
    color: colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...typography.caption,
    color: colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchText: {
    ...typography.body,
    color: colors.textLight,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitlePlain: {
    ...typography.h3,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  modeDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  seeAll: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  horizontalScrollContent: {
    paddingHorizontal: spacing.lg,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
});

export default HomeScreen;
