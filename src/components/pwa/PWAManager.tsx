/**
 * PWA Manager Component
 *
 * Manages all PWA functionality including offline support,
 * push notifications, and installation prompts.
 */
'use client';

import { useEffect, useState } from 'react';

// Type declaration for PWA install prompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
import { initializePushNotifications, getNotificationStats } from '@/lib/pwa/push-notifications';
import {
  addConnectionListeners,
  isOnline,
  getOfflineStatus,
  clearExpiredCache,
  processOfflineQueue,
} from '@/lib/pwa/offline-manager';

interface PWAStatus {
  isOnline: boolean;
  canInstall: boolean;
  notificationsEnabled: boolean;
  queuedRequests: number;
  hasOfflineData: boolean;
}

export default function PWAManager() {
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isOnline: true,
    canInstall: false,
    notificationsEnabled: false,
    queuedRequests: 0,
    hasOfflineData: false,
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    void initializePWA();
  }, []);

  const initializePWA = async () => {
    try {
      // Initialize push notifications
      await initializePushNotifications();

      // Get notification stats
      const notificationStats = await getNotificationStats();

      // Get offline status
      const offlineStatus = getOfflineStatus();

      // Set up connection listeners
      const removeListeners = addConnectionListeners(
        () => {
          setPwaStatus((prev) => ({ ...prev, isOnline: true }));
          setShowOfflineToast(false);
          void processOfflineQueue();
        },
        () => {
          setPwaStatus((prev) => ({ ...prev, isOnline: false }));
          setShowOfflineToast(true);
        }
      );

      // Set up install prompt listener
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setPwaStatus((prev) => ({ ...prev, canInstall: true }));

        // Show install prompt after a delay (don't be too aggressive)
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 30000); // Show after 30 seconds
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Handle successful app installation
      const handleAppInstalled = () => {
        void console.error('PWA was installed');
        setDeferredPrompt(null);
        setPwaStatus((prev) => ({ ...prev, canInstall: false }));
        setShowInstallPrompt(false);
      };

      window.addEventListener('appinstalled', handleAppInstalled);

      // Update PWA status
      setPwaStatus({
        isOnline: isOnline(),
        canInstall: false, // Will be updated by beforeinstallprompt
        notificationsEnabled: notificationStats.subscribed,
        queuedRequests: offlineStatus.queuedRequests,
        hasOfflineData: offlineStatus.hasOfflineData,
      });

      // Clean expired cache on startup
      await clearExpiredCache();

      // Set up periodic cache cleanup (every hour)
      const cacheCleanupInterval = setInterval(
        () => {
          void clearExpiredCache();
        },
        60 * 60 * 1000
      );

      // Set up periodic status updates
      const statusUpdateInterval = setInterval(() => {
        const offlineStatus = getOfflineStatus();
        setPwaStatus((prev) => ({
          ...prev,
          isOnline: isOnline(),
          queuedRequests: offlineStatus.queuedRequests,
          hasOfflineData: offlineStatus.hasOfflineData,
        }));
      }, 30000); // Update every 30 seconds

      // Cleanup function
      return () => {
        removeListeners();
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
        clearInterval(cacheCleanupInterval);
        clearInterval(statusUpdateInterval);
      };
    } catch (error) {
      void console.error('Failed to initialize PWA:', error);
      return () => {}; // Return cleanup function even on error
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      const result = await deferredPrompt.prompt();
      void console.error('Install prompt result:', result);

      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      setPwaStatus((prev) => ({ ...prev, canInstall: false }));
    } catch (error) {
      void console.error('Installation failed:', error);
    }
  };

  const enableNotifications = async () => {
    try {
      const initialized = await initializePushNotifications();
      setPwaStatus((prev) => ({ ...prev, notificationsEnabled: initialized }));
    } catch (error) {
      void console.error('Failed to enable notifications:', error);
    }
  };

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && pwaStatus.canInstall && (
        <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 md:left-auto md:right-4 md:max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">Install Ink 37 App</h3>
              <p className="text-sm text-gray-500 mt-1">
                Install our app for faster access and offline browsing
              </p>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => void handleInstallClick()}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Install
                </button>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="text-sm text-gray-500 px-3 py-1 hover:text-gray-700"
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Offline Toast */}
      {showOfflineToast && (
        <div className="fixed top-4 left-4 right-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4 z-50 md:left-auto md:right-4 md:max-w-sm">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">You're offline</p>
              <p className="text-sm text-yellow-700">
                {pwaStatus.queuedRequests > 0
                  ? `${pwaStatus.queuedRequests} actions queued for when you're back online`
                  : 'Some features may be limited'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notification Permission Prompt */}
      {!pwaStatus.notificationsEnabled && (
        <div className="fixed bottom-4 left-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 z-40 md:left-auto md:right-4 md:max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900">Stay Updated</h3>
              <p className="text-sm text-blue-700 mt-1">
                Enable notifications for appointment reminders and updates
              </p>
              <button
                onClick={() => void enableNotifications()}
                className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Enable Notifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Status Indicator (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-50">
          <div>Online: {pwaStatus.isOnline ? '✅' : '❌'}</div>
          <div>Install: {pwaStatus.canInstall ? '✅' : '❌'}</div>
          <div>Push: {pwaStatus.notificationsEnabled ? '✅' : '❌'}</div>
          <div>Queue: {pwaStatus.queuedRequests}</div>
        </div>
      )}
    </>
  );
}
