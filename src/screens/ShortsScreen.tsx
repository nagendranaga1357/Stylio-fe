import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing } from '../utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 30;
const SHORT_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT;

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
  comments: string;
  shares: string;
  creator: {
    name: string;
    username: string;
    verified: boolean;
  };
  music?: string;
  tags: string[];
}

// Salon, Fashion, Hairstyle & Grooming related shorts
const SAMPLE_SHORTS: ShortVideo[] = [
  {
    id: '1',
    title: 'Perfect Fade Haircut Tutorial 💈',
    description: 'Master the art of the perfect fade! Watch and learn from a pro barber. #barbering #haircut #fade',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400',
    platform: 'youtube',
    duration: '0:45',
    views: '2.3M',
    likes: '89K',
    comments: '1.2K',
    shares: '5.6K',
    creator: {
      name: 'BarberPro Academy',
      username: '@barberpro',
      verified: true,
    },
    music: '🎵 Original Sound - BarberPro',
    tags: ['#haircut', '#fade', '#barbering', '#grooming'],
  },
  {
    id: '2',
    title: 'Bridal Makeup Transformation ✨',
    description: 'Watch this stunning bridal makeup transformation! Perfect for your big day 💄👰',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400',
    platform: 'instagram',
    duration: '1:20',
    views: '1.8M',
    likes: '156K',
    comments: '3.4K',
    shares: '12K',
    creator: {
      name: 'Glam Studio',
      username: '@glamstudio',
      verified: true,
    },
    music: '🎵 Trending Bridal Music',
    tags: ['#makeup', '#bridal', '#beauty', '#transformation'],
  },
  {
    id: '3',
    title: 'Men\'s Hairstyle Trends 2024 ✂️',
    description: 'Top 5 hairstyles every man should try this year! Which one is your favorite?',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    platform: 'tiktok',
    duration: '0:35',
    views: '956K',
    likes: '42K',
    comments: '890',
    shares: '2.3K',
    creator: {
      name: 'Hair Master',
      username: '@hairmaster',
      verified: false,
    },
    music: '🎵 Trending Sound',
    tags: ['#hairstyle', '#mensfashion', '#trends2024'],
  },
  {
    id: '4',
    title: 'Luxury Spa Treatment 🧖‍♀️',
    description: 'Experience the ultimate relaxation with our signature spa treatment. Book now!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
    platform: 'youtube',
    duration: '0:55',
    views: '3.4M',
    likes: '245K',
    comments: '8.9K',
    shares: '45K',
    creator: {
      name: 'Spa Wellness',
      username: '@spawellness',
      verified: true,
    },
    music: '🎵 Relaxing Spa Music',
    tags: ['#spa', '#relaxation', '#wellness', '#selfcare'],
  },
  {
    id: '5',
    title: 'Nail Art Spring Collection 💅',
    description: 'Spring nail art inspiration! 10 stunning designs you need to try 🌸',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
    platform: 'instagram',
    duration: '0:28',
    views: '789K',
    likes: '98K',
    comments: '4.5K',
    shares: '15K',
    creator: {
      name: 'Nail Art Queen',
      username: '@nailartqueen',
      verified: true,
    },
    music: '🎵 Aesthetic Vibes',
    tags: ['#nailart', '#nails', '#springnails', '#beauty'],
  },
  {
    id: '6',
    title: 'Korean Skincare Routine 🌸',
    description: 'My complete 10-step Korean skincare routine for glass skin! ✨',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    platform: 'tiktok',
    duration: '1:05',
    views: '2.1M',
    likes: '134K',
    comments: '5.6K',
    shares: '18K',
    creator: {
      name: 'Skincare Queen',
      username: '@skincarequeen',
      verified: true,
    },
    music: '🎵 Get Ready With Me',
    tags: ['#skincare', '#kbeauty', '#glassskin', '#routine'],
  },
  {
    id: '7',
    title: 'Beard Grooming 101 🧔',
    description: 'Essential beard grooming tips for the modern gentleman. Look sharp!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400',
    platform: 'youtube',
    duration: '0:42',
    views: '1.5M',
    likes: '78K',
    comments: '2.1K',
    shares: '9.8K',
    creator: {
      name: 'Gentleman\'s Guide',
      username: '@gentlemansguide',
      verified: true,
    },
    music: '🎵 Classic Grooming Beats',
    tags: ['#beard', '#grooming', '#mensstyle', '#gentleman'],
  },
  {
    id: '8',
    title: 'Hair Color Transformation 🎨',
    description: 'From brunette to platinum blonde in one session! Amazing transformation',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
    platform: 'instagram',
    duration: '0:50',
    views: '4.2M',
    likes: '312K',
    comments: '15K',
    shares: '28K',
    creator: {
      name: 'Color Expert',
      username: '@colorexpert',
      verified: true,
    },
    music: '🎵 Transformation Vibes',
    tags: ['#haircolor', '#transformation', '#blonde', '#hairstylist'],
  },
];

/**
 * Single Short Item Component with Video Player
 */
const ShortItem = ({ 
  item, 
  isActive, 
  isScreenFocused,
  isLiked, 
  isMuted,
  onLike,
  onMute,
}: { 
  item: ShortVideo; 
  isActive: boolean;
  isScreenFocused: boolean;
  isLiked: boolean;
  isMuted: boolean;
  onLike: () => void;
  onMute: () => void;
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  
  // Create video player for this item
  const player = useVideoPlayer(item.videoUrl, (player) => {
    player.loop = true;
    player.muted = isMuted;
  });

  // Handle play/pause based on visibility and screen focus
  useEffect(() => {
    if (isActive && isScreenFocused && !isPaused) {
      player.play();
      setIsBuffering(false);
    } else {
      player.pause();
    }
  }, [isActive, isScreenFocused, isPaused, player]);

  // Handle mute changes
  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  // Listen to player status for buffering
  useEffect(() => {
    const subscription = player.addListener('statusChange', (payload: { status: string }) => {
      if (payload.status === 'readyToPlay') {
        setIsBuffering(false);
      } else if (payload.status === 'loading') {
        setIsBuffering(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

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

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
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
    <View style={styles.shortContainer}>
      {/* Thumbnail as background (shows while loading) */}
      <Image 
        source={{ uri: item.thumbnailUrl }} 
        style={styles.thumbnail}
        blurRadius={isBuffering ? 2 : 0}
      />
      
      {/* Video Player */}
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={handleVideoPress}
        style={StyleSheet.absoluteFillObject}
      >
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
        />
      </TouchableOpacity>

      {/* Buffering Indicator - Only show when actually buffering */}
      {isBuffering && isActive && isScreenFocused && (
        <View style={styles.bufferingOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.bufferingText}>Loading...</Text>
        </View>
      )}

      {/* Play/Pause Icon Overlay */}
      {showPlayIcon && !isBuffering && (
        <View style={styles.playPauseOverlay} pointerEvents="none">
          <View style={styles.playPauseIconBg}>
            <Ionicons name="play" size={50} color="#FFF" />
          </View>
        </View>
      )}

      {/* Gradient Overlays */}
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* Top Controls */}
      <View style={styles.topControls}>
        {/* Mute Button */}
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={onMute}
        >
          <Ionicons 
            name={isMuted ? "volume-mute" : "volume-high"} 
            size={20} 
            color="#FFF" 
          />
        </TouchableOpacity>
      </View>

      {/* Right Side Actions */}
      <View style={styles.actionsContainer}>
        {/* Creator Avatar */}
        <TouchableOpacity style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.creator.name.charAt(0)}
            </Text>
          </View>
          <View style={styles.followBadge}>
            <Ionicons name="add" size={12} color="#FFF" />
          </View>
        </TouchableOpacity>

        {/* Like */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onLike}
        >
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={32} 
            color={isLiked ? "#FF3B5C" : "#FFF"} 
          />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-ellipses-outline" size={28} color="#FFF" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="paper-plane-outline" size={26} color="#FFF" />
          <Text style={styles.actionText}>{item.shares}</Text>
        </TouchableOpacity>

        {/* Bookmark */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bookmark-outline" size={26} color="#FFF" />
        </TouchableOpacity>

        {/* More */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Content */}
      <View style={styles.bottomContent}>
        {/* Creator Info */}
        <View style={styles.creatorInfo}>
          <Text style={styles.creatorName}>
            {item.creator.name}
            {item.creator.verified && (
              <>
                <Text> </Text>
                <MaterialCommunityIcons name="check-decagram" size={14} color="#3897F0" />
              </>
            )}
          </Text>
          <Text style={styles.creatorUsername}>{item.creator.username}</Text>
        </View>

        {/* Title */}
        <Text style={styles.shortTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Description */}
        <Text style={styles.shortDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {item.tags.slice(0, 4).map((tag, idx) => (
            <Text key={idx} style={styles.tag}>{tag}</Text>
          ))}
        </View>

        {/* Music */}
        {item.music && (
          <View style={styles.musicRow}>
            <Ionicons name="musical-notes" size={14} color="#FFF" />
            <Text style={styles.musicText} numberOfLines={1}>
              {item.music}
            </Text>
          </View>
        )}
      </View>

      {/* Platform Badge */}
      <View style={styles.platformBadge}>
        {getPlatformIcon(item.platform)}
        <Text style={styles.platformText}>
          {item.platform === 'youtube' ? 'YouTube' : 
           item.platform === 'instagram' ? 'Instagram' : 
           item.platform === 'tiktok' ? 'TikTok' : 'Stylio'}
        </Text>
      </View>

      {/* Views Badge */}
      <View style={styles.viewsBadge}>
        <Ionicons name="eye-outline" size={14} color="#FFF" />
        <Text style={styles.viewsText}>{item.views}</Text>
      </View>

      {/* Duration Badge */}
      <View style={styles.durationBadge}>
        <Ionicons name="time-outline" size={12} color="#FFF" />
        <Text style={styles.durationText}>{item.duration}</Text>
      </View>
    </View>
  );
};

/**
 * ShortsScreen - YouTube Shorts / Instagram Reels Style with Video Playback
 */
const ShortsScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedShorts, setLikedShorts] = useState<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Check if screen is focused (to pause when navigating away)
  const isFocused = useIsFocused();

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setCurrentIndex(newIndex);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  const handleLike = (shortId: string) => {
    setLikedShorts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(shortId)) {
        newSet.delete(shortId);
      } else {
        newSet.add(shortId);
      }
      return newSet;
    });
  };

  const handleMute = () => {
    setIsMuted(prev => !prev);
  };

  const renderShort = ({ item, index }: { item: ShortVideo; index: number }) => {
    const isLiked = likedShorts.has(item.id);
    const isActive = index === currentIndex;

    return (
      <ShortItem 
        item={item}
        isActive={isActive}
        isScreenFocused={isFocused}
        isLiked={isLiked}
        isMuted={isMuted}
        onLike={() => handleLike(item.id)}
        onMute={handleMute}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shorts</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="search-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="videocam-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Shorts Feed */}
      <FlatList
        ref={flatListRef}
        data={SAMPLE_SHORTS}
        renderItem={renderShort}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SHORT_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SHORT_HEIGHT,
          offset: SHORT_HEIGHT * index,
          index,
        })}
        removeClippedSubviews
        maxToRenderPerBatch={2}
        windowSize={3}
        initialNumToRender={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortContainer: {
    width: SCREEN_WIDTH,
    height: SHORT_HEIGHT,
    backgroundColor: '#000',
  },
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bufferingText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 8,
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
    height: 150,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  topControls: {
    position: 'absolute',
    top: 100,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Right Actions
  actionsContainer: {
    position: 'absolute',
    right: 12,
    bottom: 120,
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  followBadge: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B5C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: 11,
    color: '#FFF',
    marginTop: 2,
    fontWeight: '500',
  },
  // Bottom Content
  bottomContent: {
    position: 'absolute',
    bottom: 20,
    left: 12,
    right: 70,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  creatorUsername: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  shortTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
    lineHeight: 18,
  },
  shortDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 17,
    marginBottom: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  tag: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  musicText: {
    fontSize: 12,
    color: '#FFF',
    flex: 1,
  },
  // Badges
  platformBadge: {
    position: 'absolute',
    top: 100,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  platformText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },
  viewsBadge: {
    position: 'absolute',
    top: 140,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  viewsText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '500',
  },
  durationBadge: {
    position: 'absolute',
    top: 175,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  durationText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '500',
  },
});

export default ShortsScreen;
