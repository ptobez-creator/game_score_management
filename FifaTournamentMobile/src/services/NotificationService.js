import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationService = {
  // Initialize notifications
  initialize: async () => {
    try {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Failed to get push token for push notification!');
          return null;
        }

        try {
          const projectId = Constants.expoConfig?.extra?.eas?.projectId;
          if (!projectId) {
            throw new Error('Project ID is not set');
          }

          const token = await Notifications.getExpoPushTokenAsync({ projectId });
          console.log('Push token:', token.data);
          
          // Save token locally
          await AsyncStorage.setItem('expoPushToken', token.data);
          return token.data;
        } catch (e) {
          console.error('Error getting push token:', e);
          return null;
        }
      } else {
        console.log('Must use physical device for push notifications');
        return null;
      }
    } catch (error) {
      console.error('Notification initialization error:', error);
      return null;
    }
  },

  // Send local notification
  sendLocalNotification: async (title, body, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          badge: 1,
        },
        trigger: { seconds: 2 },
      });
    } catch (error) {
      console.error('Local notification error:', error);
    }
  },

  // Get all notifications
  getAllNotifications: async () => {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Get notifications error:', error);
      return [];
    }
  },

  // Cancel notification
  cancelNotification: async (notificationId) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Cancel notification error:', error);
    }
  },

  // Cancel all notifications
  cancelAllNotifications: async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Cancel all notifications error:', error);
    }
  },

  // Listen to notifications (use in useEffect)
  addNotificationListener: (callback) => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        callback(response.notification);
      }
    );

    return subscription;
  },

  // Remove notification listener
  removeNotificationListener: (subscription) => {
    if (subscription) {
      subscription.remove();
    }
  },
};
