import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * Initializes Capacitor Push Notifications and sets up listeners.
 * Only runs on native platforms (Android/iOS).
 * 
 * @param userId The MongoDB _id of the current user to link the token to.
 * @param router Next.js router instance for deep linking (passed from component).
 */
export async function initPushNotifications(userId: string, router: any) {
  if (!Capacitor.isNativePlatform()) return;
  
  console.log('🔔 Initializing Push Notifications for user:', userId);

  // 1. Request Permissions
  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== 'granted') {
    console.warn('🔔 Push Notifications permission denied');
    return;
  }
  
  // 2. Register with FCM/APNS
  await PushNotifications.register();
  
  // 3. LISTENERS
  
  // Token registration
  PushNotifications.addListener('registration', async (token) => {
    console.log('🔔 Push registration success, token:', token.value);
    
    // Update the user profile with the new FCM token
    try {
      await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fcmToken: token.value })
      });
    } catch (err) {
      console.error('🔔 Failed to save FCM token to backend:', err);
    }
  });

  // Registration error
  PushNotifications.addListener('registrationError', (error) => {
    console.error('🔔 Push registration error:', error);
  });
  
  // Notification received while app is OPEN
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('🔔 Push notification received:', notification);
    // You can implement an in-app toast notification here if desired
    // showInAppNotification(notification);
  });
  
  // Notification ACTION performed (Tapping the notification)
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('🔔 Push action performed:', action);
    const data = action.notification.data;
    
    if (data.type === 'booking' && data.bookingId) {
      router.push(`/profile`); // Deep link to profile or specific booking if URL pattern exists
    } else if (data.type === 'message' && data.senderId) {
      router.push(`/messenger?monkId=${data.senderId}`);
    } else if (data.link) {
      router.push(data.link);
    }
  });
}
