import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { useAuth } from '../hooks';
import { colors } from '../utils/theme';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// Screens
import SalonDetailsScreen from '../screens/SalonDetailsScreen';
import SlotSelectionScreen from '../screens/SlotSelectionScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SplashScreen from '../screens/SplashScreen';

// New V1 Screens
import ServiceListingScreen from '../screens/ServiceListingScreen';
import HomeServicesScreen from '../screens/HomeServicesScreen';
import HomeProviderDetailsScreen from '../screens/HomeProviderDetailsScreen';
import PaymentMethodScreen from '../screens/PaymentMethodScreen';
import CategoryScreen from '../screens/CategoryScreen';
import FavoritesScreen from '../screens/FavoritesScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { isLoading, isAuthenticated, checkAuth } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          {/* Main Tab Navigator */}
          <Stack.Screen name="Main" component={MainNavigator} />
          
          {/* Salon Flow */}
          <Stack.Screen
            name="Categories"
            component={CategoryScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ServiceListing"
            component={ServiceListingScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="SalonDetails"
            component={SalonDetailsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="SlotSelection"
            component={SlotSelectionScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="PaymentMethod"
            component={PaymentMethodScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="BookingConfirmation"
            component={BookingConfirmationScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          
          {/* Home Services Flow */}
          <Stack.Screen
            name="HomeServices"
            component={HomeServicesScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="HomeProviderDetails"
            component={HomeProviderDetailsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="AllProviders"
            component={HomeServicesScreen}
            options={{ animation: 'slide_from_right' }}
          />
          
          {/* Notifications */}
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          
          {/* Favorites */}
          <Stack.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default RootNavigator;
