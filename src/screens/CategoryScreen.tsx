import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import { serviceService, salonService } from '../services';
import { ServiceCategory, ServiceType, Salon, ServiceMode } from '../types';
import { SalonCard } from '../components';
import { CATEGORY_ICONS } from '../components/CategoryCarousel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RouteParams {
  category?: string;
  categoryName?: string;
  mode?: ServiceMode;
}

/**
 * CategoryScreen - Flipkart Inspired Category Page
 * 
 * Features:
 * - Left sidebar with sub-categories
 * - Right content area with salons/services
 * - Sticky header
 * - Quick filters
 */
const CategoryScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { category, categoryName, mode } = (route.params as RouteParams) || {};

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSalons, setIsLoadingSalons] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadServiceTypes(selectedCategory.id);
      loadSalonsByCategory(selectedCategory.slug);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await serviceService.getCategories();
      setCategories(data);
      
      // Select initial category
      if (category) {
        const found = data.find(c => c.slug === category || c.name.toLowerCase() === category.toLowerCase());
        setSelectedCategory(found || data[0]);
      } else if (data.length > 0) {
        setSelectedCategory(data[0]);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadServiceTypes = async (categoryId: string) => {
    try {
      const data = await serviceService.getServiceTypes(categoryId);
      setServiceTypes(data);
    } catch (err) {
      console.error('Failed to load service types', err);
    }
  };

  const loadSalonsByCategory = async (categorySlug: string) => {
    setIsLoadingSalons(true);
    try {
      const result = await salonService.getSalons({
        q: categorySlug,
        mode,
        limit: 20,
      });
      setSalons(result.data || []);
    } catch (err) {
      console.error('Failed to load salons', err);
    } finally {
      setIsLoadingSalons(false);
    }
  };

  const getCategoryIcon = (name: string) => {
    const key = name.toLowerCase().replace(/\s+/g, '');
    return CATEGORY_ICONS[key] || CATEGORY_ICONS['default'];
  };

  const renderIcon = (config: typeof CATEGORY_ICONS['default'], size: number = 24) => {
    const iconColor = '#FFFFFF';
    
    switch (config.iconSet) {
      case 'material':
        return <MaterialCommunityIcons name={config.icon as any} size={size} color={iconColor} />;
      case 'fontawesome':
        return <FontAwesome5 name={config.icon as any} size={size - 4} color={iconColor} />;
      default:
        return <Ionicons name={config.icon as any} size={size} color={iconColor} />;
    }
  };

  const renderCategorySidebar = () => (
    <View style={styles.sidebar}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {categories.map((cat) => {
          const isSelected = selectedCategory?.id === cat.id;
          const config = getCategoryIcon(cat.name);
          
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.sidebarItem,
                isSelected && styles.sidebarItemActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <View style={[
                styles.sidebarIcon,
                isSelected && { backgroundColor: config.colors[0] },
              ]}>
                {isSelected ? (
                  renderIcon(config, 20)
                ) : (
                  <View style={[styles.sidebarIconInactive, { backgroundColor: config.colors[0] + '20' }]}>
                    {renderIcon({ ...config }, 18)}
                  </View>
                )}
              </View>
              <Text 
                style={[
                  styles.sidebarText,
                  isSelected && styles.sidebarTextActive,
                ]}
                numberOfLines={2}
              >
                {cat.name}
              </Text>
              {isSelected && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderSubCategories = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.subCategoriesContainer}
      contentContainerStyle={styles.subCategoriesContent}
    >
      <TouchableOpacity style={styles.subCategoryChip}>
        <Text style={styles.subCategoryChipTextActive}>All</Text>
      </TouchableOpacity>
      {serviceTypes.slice(0, 8).map((type) => (
        <TouchableOpacity 
          key={type.id} 
          style={styles.subCategoryChip}
          onPress={() => navigation.navigate('ServiceListing', { 
            service: type.slug,
            serviceName: type.name,
            mode,
          })}
        >
          <Text style={styles.subCategoryChipText}>{type.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity style={styles.quickAction}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E53']}
          style={styles.quickActionGradient}
        >
          <Ionicons name="flash" size={20} color="#FFF" />
        </LinearGradient>
        <Text style={styles.quickActionText}>Deals</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.quickAction}>
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          style={styles.quickActionGradient}
        >
          <Ionicons name="star" size={20} color="#FFF" />
        </LinearGradient>
        <Text style={styles.quickActionText}>Top Rated</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.quickAction}>
        <LinearGradient
          colors={['#11998E', '#38EF7D']}
          style={styles.quickActionGradient}
        >
          <Ionicons name="location" size={20} color="#FFF" />
        </LinearGradient>
        <Text style={styles.quickActionText}>Nearby</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.quickAction}>
        <LinearGradient
          colors={['#F093FB', '#F5576C']}
          style={styles.quickActionGradient}
        >
          <Ionicons name="home" size={20} color="#FFF" />
        </LinearGradient>
        <Text style={styles.quickActionText}>Home</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => (
    <View style={styles.content}>
      {/* Sub-categories chips */}
      {renderSubCategories()}
      
      {/* Quick Actions */}
      {renderQuickActions()}
      
      {/* Category Banner */}
      {selectedCategory && (
        <LinearGradient
          colors={getCategoryIcon(selectedCategory.name).colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryBanner}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>{selectedCategory.name}</Text>
            <Text style={styles.bannerSubtitle}>
              {salons.length} salons available
            </Text>
          </View>
          <View style={styles.bannerIcon}>
            {renderIcon(getCategoryIcon(selectedCategory.name), 48)}
          </View>
        </LinearGradient>
      )}
      
      {/* Salons List */}
      <View style={styles.salonsSection}>
        <Text style={styles.salonsSectionTitle}>
          {selectedCategory?.name} Specialists
        </Text>
        
        {isLoadingSalons ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : salons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>No salons found</Text>
            <Text style={styles.emptySubtext}>Try a different category</Text>
          </View>
        ) : (
          <FlatList
            data={salons}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SalonCard
                salon={item}
                onPress={() => navigation.navigate('SalonDetails', { salonId: item.id })}
                showMode={true}
                showAudience={true}
              />
            )}
            scrollEnabled={false}
            contentContainerStyle={styles.salonsList}
          />
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => navigation.navigate('Search', { category: selectedCategory?.slug })}
          >
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <Text style={styles.searchButtonText}>
              Search in {selectedCategory?.name || 'categories'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Main Content - Flipkart Style Split View */}
      <View style={styles.mainContent}>
        {/* Left Sidebar */}
        {renderCategorySidebar()}
        
        {/* Right Content */}
        <ScrollView 
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
          <View style={{ height: 100 }} />
        </ScrollView>
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
  },
  // Header
  header: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Main Content
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  // Sidebar
  sidebar: {
    width: 90,
    backgroundColor: colors.backgroundSecondary,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  sidebarItem: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    position: 'relative',
  },
  sidebarItemActive: {
    backgroundColor: colors.background,
  },
  sidebarIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sidebarIconInactive: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 11,
  },
  sidebarTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -16,
    width: 3,
    height: 32,
    backgroundColor: colors.primary,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  // Content
  contentScroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  // Sub-categories
  subCategoriesContainer: {
    backgroundColor: colors.background,
  },
  subCategoriesContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  subCategoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subCategoryChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  subCategoryChipTextActive: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
  },
  quickActionGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    ...shadows.sm,
  },
  quickActionText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
    fontSize: 10,
  },
  // Category Banner
  categoryBanner: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    ...typography.h2,
    color: '#FFF',
    marginBottom: spacing.xs,
  },
  bannerSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)',
  },
  bannerIcon: {
    justifyContent: 'center',
    opacity: 0.8,
  },
  // Salons Section
  salonsSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  salonsSectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  salonsList: {
    gap: spacing.sm,
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

export default CategoryScreen;

