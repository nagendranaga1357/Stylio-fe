import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius, shadows } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = SCREEN_WIDTH - (CARD_MARGIN * 2);
const CARD_HEIGHT = 160;

interface BannerCard {
  id: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  image?: string;
  gradientColors: [string, string, string?];
  icon?: keyof typeof Ionicons.glyphMap;
}

interface BannerCarouselProps {
  banners?: BannerCard[];
  onBannerPress?: (banner: BannerCard) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const defaultBanners: BannerCard[] = [
  {
    id: '1',
    title: '50% OFF',
    subtitle: 'First Booking Special',
    ctaText: 'Book Now',
    gradientColors: ['#FF6B6B', '#FF8E53', '#FFCD56'],
    icon: 'gift',
  },
  {
    id: '2',
    title: 'Home Services',
    subtitle: 'Doorstep Premium Care',
    ctaText: 'Explore',
    gradientColors: ['#667EEA', '#764BA2', '#F093FB'],
    icon: 'home',
  },
  {
    id: '3',
    title: 'Spa Weekend',
    subtitle: 'Relax & Rejuvenate',
    ctaText: 'View Offers',
    gradientColors: ['#11998E', '#38EF7D', '#4FFFB0'],
    icon: 'sparkles',
  },
  {
    id: '4',
    title: 'Bridal Package',
    subtitle: 'Complete Makeovers',
    ctaText: 'Explore',
    gradientColors: ['#FC466B', '#3F5EFB', '#A770EF'],
    icon: 'heart',
  },
];

/**
 * BannerCarousel - Amazon/Flipkart style hero banner
 * Features: Auto-scroll, dot indicators, gradient backgrounds
 */
const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners = defaultBanners,
  onBannerPress,
  autoPlay = true,
  autoPlayInterval = 4000,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const startAutoPlay = () => {
      timerRef.current = setInterval(() => {
        const nextIndex = (currentIndex + 1) % banners.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * CARD_WIDTH,
          animated: true,
        });
        setCurrentIndex(nextIndex);
      }, autoPlayInterval);
    };

    startAutoPlay();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, autoPlay, autoPlayInterval, banners.length]);

  const handleScroll = (event: any) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / CARD_WIDTH);
    if (index !== currentIndex && index >= 0 && index < banners.length) {
      setCurrentIndex(index);
    }
  };

  const handleDotPress = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * CARD_WIDTH,
      animated: true,
    });
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH}
        snapToAlignment="center"
        contentContainerStyle={styles.scrollContent}
      >
        {banners.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            style={styles.cardContainer}
            activeOpacity={0.95}
            onPress={() => onBannerPress?.(banner)}
          >
            <LinearGradient
              colors={banner.gradientColors.filter(Boolean) as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* Decorative circles */}
              <View style={styles.decorativeCircle1} />
              <View style={styles.decorativeCircle2} />
              <View style={styles.decorativeCircle3} />
              
              {/* Content */}
              <View style={styles.cardContent}>
                <View style={styles.leftContent}>
                  {banner.icon && (
                    <View style={styles.iconBadge}>
                      <Ionicons name={banner.icon} size={20} color="#FFF" />
                    </View>
                  )}
                  <Text style={styles.cardTitle}>{banner.title}</Text>
                  <Text style={styles.cardSubtitle}>{banner.subtitle}</Text>
                  
                  {banner.ctaText && (
                    <View style={styles.ctaButton}>
                      <Text style={styles.ctaText}>{banner.ctaText}</Text>
                      <Ionicons name="arrow-forward" size={14} color={colors.text} />
                    </View>
                  )}
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dots */}
      {banners.length > 1 && (
        <View style={styles.dotsContainer}>
          {banners.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleDotPress(index)}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <View
                style={[
                  styles.dot,
                  currentIndex === index && styles.dotActive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: CARD_MARGIN,
  },
  cardContainer: {
    width: CARD_WIDTH,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    marginLeft:5,
    marginRight:5,
    ...shadows.md,
  },
  // Decorative elements
  decorativeCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -40,
    right: 60,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: 40,
    right: 80,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  cardContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  leftContent: {
    maxWidth: '65%',
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.sm,
    lineHeight: 10,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    ...shadows.sm,
  },
  ctaText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
});

export default BannerCarousel;
