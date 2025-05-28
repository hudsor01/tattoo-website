/**
 * Enhanced Push Notifications for PWA
 *
 * Implements comprehensive push notification functionality
 * for appointment reminders, promotions, and updates.
 */
'use client';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string | undefined;
  badge?: string | undefined;
  image?: string | undefined;
  tag?: string | undefined;
  url?: string | undefined;
  actions?: NotificationAction[] | undefined;
  requireInteraction?: boolean | undefined;
  silent?: boolean | undefined;
  vibrate?: number[] | undefined;
  timestamp?: number | undefined;
  data?: Record<string, unknown> | undefined;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// Notification types with predefined templates
export const NOTIFICATION_TEMPLATES = {
  APPOINTMENT_REMINDER: {
    title: 'Tattoo Appointment Reminder',
    body: 'Your appointment is coming up tomorrow at {time}',
    tag: 'appointment-reminder',
    actions: [
      { action: 'reschedule', title: 'Reschedule', icon: '/icons/reschedule.png' },
      { action: 'confirm', title: 'Confirm', icon: '/icons/confirm.png' },
    ] as NotificationAction[],
    requireInteraction: true,
  },
  NEW_GALLERY_ITEM: {
    title: 'New Tattoo Design',
    body: 'Check out our latest tattoo work in the gallery',
    tag: 'new-gallery',
    url: '/gallery',
    actions: [
      { action: 'view', title: 'View Gallery', icon: '/icons/gallery-icon.png' },
    ] as NotificationAction[],
  },
  BOOKING_CONFIRMATION: {
    title: 'Booking Confirmed',
    body: 'Your tattoo consultation has been scheduled for {date}',
    tag: 'booking-confirmed',
    url: '/booking',
    requireInteraction: true,
  },
  PROMOTION: {
    title: 'Special Offer',
    body: 'Limited time offer on custom tattoo designs',
    tag: 'promotion',
    url: '/',
    actions: [
      { action: 'learn-more', title: 'Learn More', icon: '/icons/info.png' },
      { action: 'book-now', title: 'Book Now', icon: '/icons/booking-icon.png' },
    ] as NotificationAction[],
  },
};

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported');
  }

  const permission = await Notification.requestPermission();

  if (permission === 'granted') {
    void console.error('Notification permission granted');
  } else {
    void console.warn('Notification permission denied');
  }

  return permission;
}

/**
 * Get or create push subscription
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      return subscription;
    }

    // Create new subscription if none exists
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      void console.warn('VAPID public key not configured');
      return null;
    }

    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // Send subscription to server
    await sendSubscriptionToServer(newSubscription);

    return newSubscription;
  } catch (error) {
    void console.error('Failed to get push subscription:', error);
    return null;
  }
}

/**
 * Send subscription to server for storage
 */
async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    void console.error('Failed to send subscription to server:', error);
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const successful = await subscription.unsubscribe();

      if (successful) {
        // Notify server about unsubscription
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subscription }),
        });
      }

      return successful;
    }

    return true;
  } catch (error) {
    void console.error('Failed to unsubscribe:', error);
    return false;
  }
}

/**
 * Show local notification (for testing or immediate feedback)
 */
export async function showLocalNotification(payload: NotificationPayload): Promise<void> {
  if (getNotificationPermission() !== 'granted') {
    throw new Error('Notification permission not granted');
  }

  // Build options object carefully to avoid undefined values
  const options: NotificationOptions = {
    body: payload.body,
    ...(payload.icon && { icon: payload.icon }),
    ...(payload.badge && { badge: payload.badge }),
    ...(payload.image && { image: payload.image }),
    ...(payload.tag && { tag: payload.tag }),
    ...(payload.requireInteraction !== undefined && {
      requireInteraction: payload.requireInteraction,
    }),
    ...(payload.silent !== undefined && { silent: payload.silent }),
    ...(payload.actions && { actions: payload.actions }),
    data: {
      ...payload.data,
      timestamp: payload.timestamp ?? Date.now(),
    },
  };

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(payload.title, options);
  } catch (error) {
    void console.error('Failed to show notification:', error);
    throw error;
  }
}

/**
 * Schedule a notification using a template
 */
export async function scheduleNotification(
  templateKey: keyof typeof NOTIFICATION_TEMPLATES,
  customData: Record<string, string> = {},
  delay: number = 0
): Promise<void> {
  const template = NOTIFICATION_TEMPLATES[templateKey];

  let body = template.body;
  Object.entries(customData).forEach(([key, value]) => {
    body = body.replace(new RegExp(`{${key}}`, 'g'), value);
  });

  const notification: NotificationPayload = {
    title: template.title,
    body,
    tag: template.tag,
    url: ('url' in template ? template.url : undefined) as string | undefined,
    actions: ('actions' in template ? template.actions : undefined) as
      | NotificationAction[]
      | undefined,
    requireInteraction: ('requireInteraction' in template
      ? template.requireInteraction
      : undefined) as boolean | undefined,
    data: { templateKey, customData },
  };

  if (delay > 0) {
    setTimeout(() => {
      void showLocalNotification(notification);
    }, delay);
  } else {
    await showLocalNotification(notification);
  }
}

/**
 * Initialize push notifications for the app
 */
export async function initializePushNotifications(): Promise<boolean> {
  try {
    if (!isPushSupported()) {
      void console.error('Push notifications not supported');
      return false;
    }

    // Request permission if not already granted
    let permission = getNotificationPermission();
    if (permission === 'default') {
      permission = await requestNotificationPermission();
    }

    if (permission !== 'granted') {
      void console.error('Notification permission not granted');
      return false;
    }

    // Get or create subscription
    const subscription = await getPushSubscription();

    if (subscription) {
      void console.error('Push notifications initialized successfully');
      return true;
    } else {
      void console.warn('Failed to create push subscription');
      return false;
    }
  } catch (error) {
    void console.error('Failed to initialize push notifications:', error);
    return false;
  }
}

/**
 * Utility function to convert VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if user has notifications enabled
 */
export function hasNotificationsEnabled(): boolean {
  return getNotificationPermission() === 'granted';
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(): Promise<{
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
}> {
  const supported = isPushSupported();
  const permission = getNotificationPermission();
  const subscription = supported ? await getPushSubscription() : null;

  return {
    supported,
    permission,
    subscribed: Boolean(subscription),
  };
}
