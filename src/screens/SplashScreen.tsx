import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  // Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 6 }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Main animation sequence
    Animated.sequence([
      // Logo entrance with bounce
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Text fade in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Tagline fade in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Shimmer animation loop
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Particle animations
    particleAnims.forEach((particle, index) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(particle.opacity, {
                toValue: 0.6,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(particle.translateY, {
                toValue: -100,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(particle.scale, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(particle.opacity, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(particle.translateY, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
              Animated.timing(particle.scale, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
          ])
        ).start();
      }, index * 300);
    });

    // Navigate after splash
    const timer = setTimeout(onFinish, 3000);
    return () => clearTimeout(timer);
  }, []);

  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const particlePositions = [
    { left: '15%', bottom: '30%' },
    { left: '80%', bottom: '25%' },
    { left: '25%', bottom: '45%' },
    { left: '70%', bottom: '50%' },
    { left: '10%', bottom: '60%' },
    { left: '85%', bottom: '40%' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating particles */}
        {particleAnims.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: particlePositions[index].left,
                bottom: particlePositions[index].bottom,
                opacity: particle.opacity,
                transform: [
                  { translateY: particle.translateY },
                  { scale: particle.scale },
                ],
              },
            ]}
          >
            <Ionicons 
              name={index % 2 === 0 ? 'sparkles' : 'star'} 
              size={index % 3 === 0 ? 16 : 12} 
              color="#E94560" 
            />
          </Animated.View>
        ))}

        {/* Main content */}
        <View style={styles.content}>
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: logoScale }, { rotate: spin }],
              },
            ]}
          >
            <LinearGradient
              colors={['#E94560', '#FF6B6B', '#EE5A24']}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.logoInner}>
                <Text style={styles.logoLetter}>S</Text>
              </View>
            </LinearGradient>
            
            {/* Orbiting scissors */}
            <Animated.View style={styles.orbitingIcon}>
              <Ionicons name="cut" size={24} color="#E94560" />
            </Animated.View>
          </Animated.View>

          {/* App Name with shimmer */}
          <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
            <Text style={styles.appName}>Stylio</Text>
            <Animated.View
              style={[
                styles.shimmer,
                { transform: [{ translateX: shimmerTranslate }] },
              ]}
            />
          </Animated.View>

          {/* Tagline */}
          <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
            Your Style, Perfected
          </Animated.Text>

          {/* Decorative line */}
          <Animated.View style={[styles.decorLine, { opacity: taglineOpacity }]}>
            <View style={styles.lineLeft} />
            <Ionicons name="diamond" size={12} color="#E94560" />
            <View style={styles.lineRight} />
          </Animated.View>
        </View>

        {/* Bottom wave decoration */}
        <View style={styles.bottomDecor}>
          <View style={styles.wave1} />
          <View style={styles.wave2} />
        </View>

        {/* Version */}
        <Text style={styles.version}>v1.0.0</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
  },
  logoContainer: {
    width: 140,
    height: 140,
    marginBottom: 30,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    padding: 4,
    shadowColor: '#E94560',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  logoInner: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLetter: {
    fontSize: 72,
    fontWeight: '800',
    color: '#E94560',
    fontStyle: 'italic',
  },
  orbitingIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#E94560',
  },
  textContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  appName: {
    fontSize: 52,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: '#E94560',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 15,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 50,
  },
  tagline: {
    fontSize: 16,
    color: '#A0A0A0',
    marginTop: 12,
    letterSpacing: 3,
    fontWeight: '300',
    textTransform: 'uppercase',
  },
  decorLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  lineLeft: {
    width: 50,
    height: 1,
    backgroundColor: '#E94560',
    opacity: 0.5,
  },
  lineRight: {
    width: 50,
    height: 1,
    backgroundColor: '#E94560',
    opacity: 0.5,
  },
  bottomDecor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  wave1: {
    position: 'absolute',
    bottom: 0,
    left: -50,
    right: -50,
    height: 80,
    backgroundColor: '#E94560',
    opacity: 0.1,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    transform: [{ scaleX: 1.5 }],
  },
  wave2: {
    position: 'absolute',
    bottom: -20,
    left: -30,
    right: -30,
    height: 60,
    backgroundColor: '#E94560',
    opacity: 0.05,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    transform: [{ scaleX: 1.3 }],
  },
  version: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
  },
});

export default SplashScreen;

