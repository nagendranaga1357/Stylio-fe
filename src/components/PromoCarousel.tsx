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

import { colors, spacing, borderRadius, shadows } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = SCREEN_WIDTH - (CARD_MARGIN * 2);

interface PromoCard {
  id: string;
  title: string;
  subtitle: string;
  gradientColors: [string, string];
}

interface PromoCarouselProps {
  cards?: PromoCard[];
  onCardPress?: (card: PromoCard) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

/**
 * PromoCarousel
 * 
 * A horizontal carousel for promotional cards with:
 * - Auto-play functionality
 * - Gradient backgrounds
 * - Dot indicators
 * - Touch to navigate
 */
const PromoCarousel: React.FC<PromoCarouselProps> = ({
  cards,
  onCardPress,
  autoPlay = true,
  autoPlayInterval = 4000,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Default promo cards
  const defaultCards: PromoCard[] = [
    {
      id: '1',
      title: '50% Off First Visit',
      subtitle: 'New Customer Special',
      gradientColors: [colors.primary, colors.primaryLight],
    },
    {
      id: '2',
      title: 'Premium Package',
      subtitle: 'Hair + Beard + Massage',
      gradientColors: ['#EC4899', '#F472B6'],
    },
    {
      id: '3',
      title: 'Weekend Special',
      subtitle: 'Book Now & Save 30%',
      gradientColors: ['#8B5CF6', '#A78BFA'],
    },
  ];

  const displayCards = cards || defaultCards;

  // Auto-play
  useEffect(() => {
    if (!autoPlay || displayCards.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % displayCards.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * CARD_WIDTH,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, autoPlay, autoPlayInterval, displayCards.length]);

  const handleScroll = (event: any) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / CARD_WIDTH);
    if (index !== currentIndex && index >= 0 && index < displayCards.length) {
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
        {displayCards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.cardContainer}
            activeOpacity={0.9}
            onPress={() => onCardPress?.(card)}
          >
            <LinearGradient
              colors={card.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View style={styles.cardOverlay} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dots */}
      {displayCards.length > 1 && (
        <View style={styles.dotsContainer}>
          {displayCards.map((_, index) => (
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
    height: 140,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    ...shadows.md,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  cardContent: {
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
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

export default PromoCarousel;
