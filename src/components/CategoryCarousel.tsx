import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import { ServiceCategory } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Category icon mapping with beautiful icons
export const CATEGORY_ICONS: Record<string, {
  icon: string;
  iconSet: 'ionicons' | 'material' | 'fontawesome';
  colors: [string, string];
  emoji?: string;
}> = {
  // Hair Services
  'hair': { 
    icon: 'cut', 
    iconSet: 'ionicons', 
    colors: ['#FF6B6B', '#FF8E8E'],
    emoji: '✂️'
  },
  'haircut': { 
    icon: 'content-cut', 
    iconSet: 'material', 
    colors: ['#FF6B6B', '#FF8E8E'],
    emoji: '✂️'
  },
  'haircutting': { 
    icon: 'cut', 
    iconSet: 'ionicons', 
    colors: ['#FF6B6B', '#FF8E8E'],
    emoji: '✂️'
  },
  // Beard & Shaving
  'beard': { 
    icon: 'face-man', 
    iconSet: 'material', 
    colors: ['#4ECDC4', '#45B7AF'],
    emoji: '🧔'
  },
  'shaving': { 
    icon: 'razor', 
    iconSet: 'material', 
    colors: ['#4ECDC4', '#45B7AF'],
    emoji: '🪒'
  },
  // Spa & Massage
  'spa': { 
    icon: 'spa', 
    iconSet: 'material', 
    colors: ['#A78BFA', '#8B5CF6'],
    emoji: '🧖'
  },
  'massage': { 
    icon: 'hand-left', 
    iconSet: 'ionicons', 
    colors: ['#F472B6', '#EC4899'],
    emoji: '💆'
  },
  // Facial & Skin
  'facial': { 
    icon: 'sparkles', 
    iconSet: 'ionicons', 
    colors: ['#FBBF24', '#F59E0B'],
    emoji: '✨'
  },
  'skincare': { 
    icon: 'face-woman', 
    iconSet: 'material', 
    colors: ['#FBBF24', '#F59E0B'],
    emoji: '🧴'
  },
  // Makeup
  'makeup': { 
    icon: 'color-palette', 
    iconSet: 'ionicons', 
    colors: ['#F87171', '#EF4444'],
    emoji: '💄'
  },
  'bridal': { 
    icon: 'sparkles-outline', 
    iconSet: 'ionicons', 
    colors: ['#FB7185', '#E11D48'],
    emoji: '👰'
  },
  // Nails
  'nails': { 
    icon: 'hand-left-outline', 
    iconSet: 'ionicons', 
    colors: ['#C084FC', '#A855F7'],
    emoji: '💅'
  },
  'manicure': { 
    icon: 'hand-right', 
    iconSet: 'ionicons', 
    colors: ['#C084FC', '#A855F7'],
    emoji: '💅'
  },
  'pedicure': { 
    icon: 'foot', 
    iconSet: 'fontawesome', 
    colors: ['#C084FC', '#A855F7'],
    emoji: '🦶'
  },
  // Hair Coloring
  'coloring': { 
    icon: 'color-fill', 
    iconSet: 'ionicons', 
    colors: ['#34D399', '#10B981'],
    emoji: '🎨'
  },
  'color': { 
    icon: 'color-fill', 
    iconSet: 'ionicons', 
    colors: ['#34D399', '#10B981'],
    emoji: '🎨'
  },
  // Threading & Waxing
  'threading': { 
    icon: 'eye', 
    iconSet: 'ionicons', 
    colors: ['#60A5FA', '#3B82F6'],
    emoji: '👁️'
  },
  'waxing': { 
    icon: 'flash', 
    iconSet: 'ionicons', 
    colors: ['#FBBF24', '#D97706'],
    emoji: '⚡'
  },
  // Categories
  'men': { 
    icon: 'man', 
    iconSet: 'ionicons', 
    colors: ['#3B82F6', '#2563EB'],
    emoji: '👨'
  },
  'women': { 
    icon: 'woman', 
    iconSet: 'ionicons', 
    colors: ['#EC4899', '#DB2777'],
    emoji: '👩'
  },
  'kids': { 
    icon: 'happy', 
    iconSet: 'ionicons', 
    colors: ['#22C55E', '#16A34A'],
    emoji: '👶'
  },
  'unisex': { 
    icon: 'people', 
    iconSet: 'ionicons', 
    colors: ['#8B5CF6', '#7C3AED'],
    emoji: '👥'
  },
  // Default
  'default': { 
    icon: 'sparkles', 
    iconSet: 'ionicons', 
    colors: ['#8B5CF6', '#7C3AED'],
    emoji: '✨'
  },
};

const getCategoryConfig = (name: string) => {
  const key = name.toLowerCase().replace(/\s+/g, '');
  return CATEGORY_ICONS[key] || CATEGORY_ICONS['default'];
};

interface CategoryCarouselProps {
  categories: ServiceCategory[];
  onCategoryPress: (category: ServiceCategory) => void;
  selectedMode?: string | null;
}

/**
 * CategoryCarousel - Infinite scrolling category icons
 * Inspired by Flipkart's category row with auto-scroll
 */
const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  onCategoryPress,
  selectedMode,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollX] = useState(new Animated.Value(0));
  const scrollPosition = useRef(0);
  
  // Auto-scroll animation for infinite effect
  useEffect(() => {
    if (categories.length < 5) return;
    
    const totalWidth = categories.length * 90; // Approximate item width
    let currentPosition = 0;
    
    const autoScroll = setInterval(() => {
      currentPosition += 100;
      if (currentPosition >= totalWidth - SCREEN_WIDTH + 48) {
        currentPosition = 0;
      }
      scrollViewRef.current?.scrollTo({ x: currentPosition, animated: true });
    }, 3000);
    
    return () => clearInterval(autoScroll);
  }, [categories.length]);

  const renderIcon = (config: typeof CATEGORY_ICONS['default'], size: number = 28) => {
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

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {categories.map((category, index) => {
          const config = getCategoryConfig(category.name);
          
          return (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryItem}
              onPress={() => onCategoryPress(category)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={config.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
              >
                {renderIcon(config)}
              </LinearGradient>
              <Text style={styles.categoryName} numberOfLines={1}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

/**
 * CategoryGrid - Flipkart style grid layout
 */
export const CategoryGrid: React.FC<CategoryCarouselProps & { showViewAll?: boolean }> = ({
  categories,
  onCategoryPress,
  showViewAll = true,
}) => {
  const renderIcon = (config: typeof CATEGORY_ICONS['default'], size: number = 32) => {
    const iconColor = '#FFFFFF';
    
    switch (config.iconSet) {
      case 'material':
        return <MaterialCommunityIcons name={config.icon as any} size={size} color={iconColor} />;
      case 'fontawesome':
        return <FontAwesome5 name={config.icon as any} size={size - 6} color={iconColor} />;
      default:
        return <Ionicons name={config.icon as any} size={size} color={iconColor} />;
    }
  };

  const displayCategories = showViewAll ? categories.slice(0, 7) : categories;

  return (
    <View style={styles.gridContainer}>
      {displayCategories.map((category) => {
        const config = getCategoryConfig(category.name);
        
        return (
          <TouchableOpacity
            key={category.id}
            style={styles.gridItem}
            onPress={() => onCategoryPress(category)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={config.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gridIconContainer}
            >
              {renderIcon(config)}
            </LinearGradient>
            <Text style={styles.gridCategoryName} numberOfLines={2}>
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
      
      {showViewAll && categories.length > 7 && (
        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => onCategoryPress({ id: 'all', name: 'All', slug: 'all' })}
          activeOpacity={0.7}
        >
          <View style={styles.viewAllIcon}>
            <Ionicons name="grid" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.gridCategoryName, { color: colors.primary }]}>
            View All
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
    width: 72,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    ...shadows.md,
  },
  categoryName: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Grid styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    justifyContent: 'flex-start',
  },
  gridItem: {
    width: (SCREEN_WIDTH - 32) / 4,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  gridIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    ...shadows.md,
  },
  gridCategoryName: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  viewAllIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    backgroundColor: colors.primaryLight + '20',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
});

export default CategoryCarousel;

