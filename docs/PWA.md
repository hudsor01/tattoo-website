# PWA Implementation for Ink 37 Tattoo Website

This document describes the Progressive Web App (PWA) implementation for the Ink 37 Tattoo website.

## Overview

The website has been enhanced with PWA capabilities to provide a more app-like experience for users, including:

- Offline functionality
- Installation on home screen
- Push notifications
- Background sync

## Key Components

### 1. Web App Manifest

Located at `/public/manifest.json`, this file defines the app's appearance when installed:

- Name and short name
- Icons in various sizes
- Theme colors
- Start URL
- Display mode
- Shortcuts for quick access to key features

### 2. Service Worker

Located at `/public/sw.js`, the service worker handles:

- Caching of static assets for offline use
- Background sync for queued requests
- Push notification handling
- Offline fallback page

### 3. PWA Manager Component

Located at `/src/components/pwa/PWAManager.tsx`, this React component manages:

- Installation prompts
- Offline status indicators
- Push notification permissions
- Background sync status

### 4. Offline Support

The system includes:

- Offline fallback page at `/public/offline.html`
- Intelligent caching strategies in `/src/lib/pwa/offline-manager.ts`
- Queue system for requests made while offline

### 5. Push Notifications (Removed)

Push notifications have been removed in favor of sonner toast notifications. The system now uses:

The system now uses:

- Sonner toast notifications for real-time feedback
- In-app notification system via tRPC subscriptions
- Real-time dashboard updates using Server-Sent Events

All PWA functionality remains except for push notifications, which have been replaced with more modern and reliable toast notifications.

## Splash Screen Generation

For iOS devices, splash screens can be generated using the tool at `/public/icons/splash/generator.html`. This tool allows you to:

1. Upload your logo
2. Set background color
3. Adjust logo size
4. Generate optimized splash screens for all iOS device sizes

## Testing PWA Features

To test PWA functionality:

1. **Offline Mode**: Toggle offline mode in Chrome DevTools (Application tab > Service Workers > Offline) and reload the page
2. **Installation**: Look for the install prompt or use "Install app" in Chrome's menu
3. **Push Notifications**: Use the notification permission prompt in the app
4. **Background Sync**: Make a request while offline, then go back online to see it processed

## Implementation Notes

- The PWA is configured to work on all modern browsers that support service workers
- Push notifications require HTTPS and a VAPID key pair for authentication
- The offline fallback page is designed to match the site's aesthetics
- The service worker is configured to avoid caching dynamic content and authentication-related routes

## Future Enhancements

Potential improvements to the PWA implementation:

1. Add more sophisticated caching strategies for specific content types
2. Implement periodic background sync for content updates
3. Add more interactive push notification templates
4. Enhance offline data persistence with IndexedDB
5. Implement a notification center within the app