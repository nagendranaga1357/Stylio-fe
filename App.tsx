import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, NavigationContainerRef } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';

import RootNavigator from './src/navigation/RootNavigator';
import { toastConfig } from './src/utils/toast';
import { colors } from './src/utils/theme';
import { pushService } from './src/services';

// Custom navigation theme
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    notification: colors.error,
  },
};

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    // Initialize push notifications
    pushService.initialize();

    // Handle notification received while app is in foreground
    pushService.addNotificationListener((notification) => {
      console.log('📱 Notification received:', notification);
    });

    // Handle when user taps on notification
    pushService.addResponseListener((response) => {
      const data = response.notification.request.content.data;
      console.log('📱 Notification tapped:', data);

      // Navigate based on notification type
      if (data?.type === 'booking' && data?.bookingId) {
        navigationRef.current?.navigate('Bookings');
      } else if (data?.type === 'promo') {
        navigationRef.current?.navigate('Search', { promo: data?.promoCode });
      }
    });

    return () => {
      pushService.removeListeners();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef} theme={navigationTheme}>
        <StatusBar style="auto" />
        <RootNavigator />
        <Toast config={toastConfig} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
