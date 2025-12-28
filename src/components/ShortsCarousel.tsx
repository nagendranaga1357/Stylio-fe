import React, { useState, useRef, memo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  Modal,
  Image,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing } from '../utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHORT_CARD_WIDTH = 140;
const SHORT_CARD_HEIGHT = 200;
const SHORT_SPACING = 12;

interface ShortVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'local';
  duration: string;
  views: string;
  likes: string;
  creator: {
    name: string;
    username: string;
    verified: boolean;
  };
}

// Salon, Fashion, Hairstyle & Grooming related shorts
const SAMPLE_SHORTS: ShortVideo[] = [
  {
    id: '1',
    title: 'Perfect Fade Tutorial 💈',
    description: 'Master the art of the perfect fade!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400',
    platform: 'youtube',
    duration: '0:45',
    views: '2.3M',
    likes: '89K',
    creator: {
      name: 'BarberPro',
      username: '@barberpro',
      verified: true,
    },
  },
  {
    id: '2',
    title: 'Bridal Makeup ✨',
    description: 'Stunning bridal look',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400',
    platform: 'instagram',
    duration: '1:20',
    views: '1.8M',
    likes: '156K',
    creator: {
      name: 'Glam Studio',
      username: '@glamstudio',
      verified: true,
    },
  },
  {
    id: '3',
    title: 'Men\'s Hairstyle 2024 ✂️',
    description: 'Top trending hairstyles',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    platform: 'tiktok',
    duration: '0:35',
    views: '956K',
    likes: '42K',
    creator: {
      name: 'Hair Master',
      username: '@hairmaster',
      verified: false,
    },
  },
  {
    id: '4',
    title: 'Spa Treatment 🧖‍♀️',
    description: 'Ultimate relaxation',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
    platform: 'youtube',
    duration: '0:55',
    views: '3.4M',
    likes: '245K',
    creator: {
      name: 'Spa Wellness',
      username: '@spawellness',
      verified: true,
    },
  },
  {
    id: '5',
    title: 'Nail Art Ideas 💅',
    description: 'Spring nail inspiration',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
    platform: 'instagram',
    duration: '0:28',
    views: '789K',
    likes: '98K',
    creator: {
      name: 'Nail Art Queen',
      username: '@nailartqueen',
      verified: true,
    },
  },
  {
    id: '6',
    title: 'Skincare Routine 🌸',
    description: 'Glass skin secrets',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    platform: 'tiktok',
    duration: '1:05',
    views: '2.1M',
    likes: '134K',
    creator: {
      name: 'Skincare Queen',
      username: '@skincarequeen',
      verified: true,
    },
  },
];

interface Props {
  onViewAll?: () => void;
}

interface ShortCardProps {
  item: ShortVideo;
  index: number;
  onPress: (short: ShortVideo) => void;
}

const ShortCard = memo(({ item, index, onPress }: ShortCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getPlatformIcon = () => {
    switch (item.platform) {
      case 'youtube':
        return <FontAwesome5 name="youtube" size={10} color="#FF0000" />;
      case 'instagram':
        return <FontAwesome5 name="instagram" size={10} color="#E4405F" />;
      case 'tiktok':
        return <FontAwesome5 name="tiktok" size={10} color="#FFF" />;
      default:
        return <Ionicons name="play-circle" size={12} color="#FFF" />;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onPress(item)}
    >
      <Animated.View
        style={[
          styles.shortCard,
          { transform: [{ scale }] },
          index === 0 && { marginLeft: spacing.md },
        ]}
      >
        {/* Thumbnail Image */}
        <Image 
          source={{ uri: item.thumbnailUrl }} 
          style={styles.shortThumbnail}
        />
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.shortGradient}
        />
        
        {/* Platform Badge */}
        <View style={styles.platformBadge}>
          {getPlatformIcon()}
        </View>
        
        {/* Duration Badge */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
        
        {/* Play Icon */}
        <View style={styles.playIconContainer}>
          <View style={styles.playIcon}>
            <Ionicons name="play" size={20} color="#FFF" />
          </View>
        </View>
        
        {/* Content */}
        <View style={styles.shortContent}>
          <Text style={styles.shortTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.shortMeta}>
            <Ionicons name="eye-outline" size={10} color="rgba(255,255,255,0.8)" />
            <Text style={styles.shortViews}>{item.views}</Text>
          </View>
        </View>
        
        {/* Verified Badge */}
        {item.creator.verified && (
          <View style={styles.verifiedBadge}>
            <MaterialCommunityIcons name="check-decagram" size={12} color="#3897F0" />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
});

/**
 * Full Screen Video Player Modal
 */
const FullScreenPlayer = ({ 
  visible, 
  short, 
  onClose 
}: { 
  visible: boolean; 
  short: ShortVideo | null; 
  onClose: () => void;
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  
  // Create video player
  const player = useVideoPlayer(short?.videoUrl || '', (player) => {
    player.loop = true;
    player.muted = isMuted;
  });

  // Play when visible
  useEffect(() => {
    if (visible && short && !isPaused) {
      player.play();
    } else {
      player.pause();
    }
  }, [visible, short, isPaused, player]);

  // Handle mute changes
  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setIsPaused(false);
      setShowPlayIcon(false);
    }
  }, [visible]);

  const handleVideoPress = () => {
    if (isPaused) {
      player.play();
      setIsPaused(false);
      setShowPlayIcon(false);
    } else {
      player.pause();
      setIsPaused(true);
      setShowPlayIcon(true);
    }
  };

  const handleClose = () => {
    player.pause();
    onClose();
  };

  if (!short) return null;

  const getPlatformIcon = () => {
    switch (short.platform) {
      case 'youtube':
        return <FontAwesome5 name="youtube" size={14} color="#FF0000" />;
      case 'instagram':
        return <FontAwesome5 name="instagram" size={14} color="#E4405F" />;
      case 'tiktok':
        return <FontAwesome5 name="tiktok" size={14} color="#FFF" />;
      default:
        return <Ionicons name="play-circle" size={16} color="#FFF" />;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={styles.fullScreenContainer}>
        {/* Thumbnail Background */}
        <Image 
          source={{ uri: short.thumbnailUrl }} 
          style={StyleSheet.absoluteFillObject}
          blurRadius={3}
        />
        
        {/* Video */}
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={handleVideoPress}
          style={StyleSheet.absoluteFillObject}
        >
          <VideoView
            player={player}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            nativeControls={false}
          />
        </TouchableOpacity>

        {/* Play/Pause Overlay */}
        {showPlayIcon && (
          <View style={styles.playPauseOverlay} pointerEvents="none">
            <View style={styles.playPauseIconBg}>
              <Ionicons name="play" size={50} color="#FFF" />
            </View>
          </View>
        )}

        {/* Gradient Overlays */}
        <LinearGradient
          colors={['rgba(0,0,0,0.5)', 'transparent']}
          style={styles.topGradient}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.bottomGradient}
          pointerEvents="none"
        />

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>

        {/* Mute Button */}
        <TouchableOpacity 
          style={styles.muteButton}
          onPress={() => setIsMuted(!isMuted)}
        >
          <Ionicons 
            name={isMuted ? "volume-mute" : "volume-high"} 
            size={20} 
            color="#FFF" 
          />
        </TouchableOpacity>

        {/* Platform Badge */}
        <View style={styles.fullScreenPlatformBadge}>
          {getPlatformIcon()}
          <Text style={styles.fullScreenPlatformText}>
            {short.platform === 'youtube' ? 'YouTube' : 
             short.platform === 'instagram' ? 'Instagram' : 
             short.platform === 'tiktok' ? 'TikTok' : 'Stylio'}
          </Text>
        </View>

        {/* Right Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setIsLiked(!isLiked)}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={32} 
              color={isLiked ? "#FF3B5C" : "#FFF"} 
            />
            <Text style={styles.actionText}>{short.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-ellipses-outline" size={28} color="#FFF" />
            <Text style={styles.actionText}>1.2K</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={26} color="#FFF" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="bookmark-outline" size={26} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Bottom Content */}
        <View style={styles.bottomContent}>
          <View style={styles.creatorInfo}>
            <View style={styles.creatorAvatar}>
              <Text style={styles.creatorAvatarText}>
                {short.creator.name.charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={styles.creatorName}>
                {short.creator.name}
                {short.creator.verified && (
                  <>
                    <Text> </Text>
                    <MaterialCommunityIcons name="check-decagram" size={14} color="#3897F0" />
                  </>
                )}
              </Text>
              <Text style={styles.creatorUsername}>{short.creator.username}</Text>
            </View>
          </View>
          <Text style={styles.fullScreenTitle}>{short.title}</Text>
          <Text style={styles.fullScreenDescription}>{short.description}</Text>
          <View style={styles.viewsRow}>
            <Ionicons name="eye-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.viewsText}>{short.views} views</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * ShortsCarousel - Horizontal carousel of short videos for HomeScreen
 */
const ShortsCarousel = ({ onViewAll }: Props) => {
  const navigation = useNavigation<any>();
  const [selectedShort, setSelectedShort] = useState<ShortVideo | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  const handleShortPress = useCallback((short: ShortVideo) => {
    setSelectedShort(short);
    setIsPlayerVisible(true);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setIsPlayerVisible(false);
    setSelectedShort(null);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.shortsIcon}>
            <Ionicons name="play" size={14} color="#FFF" />
          </View>
          <Text style={styles.headerTitle}>Shorts</Text>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>NEW</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Shorts')}
          style={styles.seeAllButton}
        >
          <Text style={styles.viewAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Shorts List */}
      <FlatList
        data={SAMPLE_SHORTS}
        renderItem={({ item, index }) => (
          <ShortCard 
            item={item} 
            index={index} 
            onPress={handleShortPress}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={SHORT_CARD_WIDTH + SHORT_SPACING}
        decelerationRate="fast"
      />

      {/* Full Screen Player */}
      <FullScreenPlayer
        visible={isPlayerVisible}
        short={selectedShort}
        onClose={handleClosePlayer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shortsIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#FF0050',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  liveBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  listContent: {
    paddingRight: spacing.md,
  },
  // Short Card
  shortCard: {
    width: SHORT_CARD_WIDTH,
    height: SHORT_CARD_HEIGHT,
    marginRight: SHORT_SPACING,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  shortThumbnail: {
    ...StyleSheet.absoluteFillObject,
  },
  shortGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  platformBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  playIconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  shortTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    lineHeight: 15,
    marginBottom: 4,
  },
  shortMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shortViews: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 32,
    right: 8,
  },
  // Full Screen Player
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  playPauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenPlatformBadge: {
    position: 'absolute',
    top: 100,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  fullScreenPlatformText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  actionsContainer: {
    position: 'absolute',
    right: 16,
    bottom: 180,
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 4,
    fontWeight: '500',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 50,
    left: 16,
    right: 80,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  creatorAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  creatorUsername: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  fullScreenTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 6,
  },
  fullScreenDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  viewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
});

export default ShortsCarousel;
