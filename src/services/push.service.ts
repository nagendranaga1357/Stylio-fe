import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

/**
 * Push Notification Service
 * 
 * Handles Expo push notifications for both Android and iOS.
 * Features:
 * - Request permissions
 * - Get Expo push token
 * - Save token to server
 * - Handle foreground notifications
 * - Handle notification responses (when user taps)
 */

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushNotificationData {
  type?: 'booking' | 'reminder' | 'promo' | 'general';
  bookingId?: string;
  salonId?: string;
  [key: string]: any;
}

class PushService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  /**
   * Initialize push notifications
   * Call this on app startup
   */
  async initialize(): Promise<string | null> {
    try {
      // Check if running on physical device
      if (!Device.isDevice) {
        console.log('📱 Push notifications require a physical device');
        return null;
      }

      // Get or request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('📱 Push notification permission not granted');
        return null;
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: undefined, // Will use projectId from app.json
      });
      this.expoPushToken = tokenData.data;
      console.log('📱 Expo Push Token:', this.expoPushToken);

      // Setup Android notification channel
      if (Platform.OS === 'android') {
        await this.setupAndroidChannel();
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('📱 Failed to initialize push notifications:', error);
      return null;
    }
  }

  /**
   * Setup Android notification channel
   */
  private async setupAndroidChannel() {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E94560',
    });

    await Notifications.setNotificationChannelAsync('bookings', {
      name: 'Bookings',
      description: 'Booking confirmations and reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E94560',
    });

    await Notifications.setNotificationChannelAsync('promos', {
      name: 'Promotions',
      description: 'Special offers and promotions',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  /**
   * Get the current push token
   */
  getToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Save push token to server for the authenticated user
   */
  async saveTokenToServer(): Promise<boolean> {
    if (!this.expoPushToken) {
      console.log('📱 No push token available to save');
      return false;
    }

    try {
      await api.post('/auth/push-token', {
        pushToken: this.expoPushToken,
        platform: Platform.OS,
      });
      console.log('📱 Push token saved to server');
      return true;
    } catch (error) {
      console.error('📱 Failed to save push token to server:', error);
      return false;
    }
  }

  /**
   * Remove push token from server (on logout)
   */
  async removeTokenFromServer(): Promise<boolean> {
    try {
      await api.delete('/auth/push-token');
      console.log('📱 Push token removed from server');
      return true;
    } catch (error) {
      console.error('📱 Failed to remove push token:', error);
      return false;
    }
  }

  /**
   * Add listener for foreground notifications
   */
  addNotificationListener(
    callback: (notification: Notifications.Notification) => void
  ): void {
    this.notificationListener = Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add listener for notification responses (when user taps notification)
   */
  addResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): void {
    this.responseListener = Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Remove all listeners
   */
  removeListeners(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: PushNotificationData,
    triggerSeconds?: number
  ): Promise<string> {
    const trigger = triggerSeconds ? { seconds: triggerSeconds } : null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger,
    });

    return id;
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllScheduledNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear badge
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }
}

// Export singleton instance
const pushService = new PushService();
export default pushService;

