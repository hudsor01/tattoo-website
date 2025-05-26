'use client';

import { api } from '@/lib/api';
import type { TattooImage, VideoProcess } from '@/types/gallery-types';

// Endpoint URLs
const ENDPOINTS = {
  TATTOOS: '/api/gallery/tattoos',
  VIDEOS: '/api/gallery/videos',
  TATTOO_ACTIONS: '/api/gallery/tattoos/actions',
  USER_INTERACTIONS: '/api/gallery/user-interactions',
  SHARE: '/api/gallery/share',
};

/**
 * Fetch all tattoo images from the gallery
 */
export async function fetchTattooImages(): Promise<TattooImage[]> {
  return api.get<TattooImage[]>(ENDPOINTS.TATTOOS);
}

/**
 * Fetch all video processes
 */
export async function fetchVideoProcesses(): Promise<VideoProcess[]> {
  return api.get<VideoProcess[]>(ENDPOINTS.VIDEOS);
}

/**
 * Toggle like status for a tattoo
 */
export async function likeTattoo(tattooId: number): Promise<{ likes: number }> {
  return api.post<{ likes: number }>(`${ENDPOINTS.TATTOO_ACTIONS}/like`, { tattooId });
}

/**
 * Toggle bookmark status for a tattoo
 */
export async function bookmarkTattoo(tattooId: number): Promise<{ bookmarked: boolean }> {
  return api.post<{ bookmarked: boolean }>(`${ENDPOINTS.TATTOO_ACTIONS}/bookmark`, { tattooId });
}

/**
 * Get user interactions (likes, bookmarks) for the gallery
 */
export async function getUserInteractions(): Promise<{
  likes: Record<number, boolean>;
  bookmarks: Record<number, boolean>;
}> {
  return api.get<{
    likes: Record<number, boolean>;
    bookmarks: Record<number, boolean>;
  }>(ENDPOINTS.USER_INTERACTIONS);
}

/**
 * Share content via different platforms
 */
export async function shareContent(
  contentType: 'tattoo' | 'video',
  contentId: number,
  platform: 'facebook' | 'twitter' | 'instagram' | 'pinterest' | 'email' | 'linkedin'
): Promise<{ shareUrl: string }> {
  return api.post<{ shareUrl: string }>(ENDPOINTS.SHARE, { contentType, contentId, platform });
}

/**
 * Track a video view
 */
export async function trackVideoView(videoId: number): Promise<{ success: boolean }> {
  return api.post<{ success: boolean }>(`${ENDPOINTS.VIDEOS}/${videoId}/view`, { videoId });
}
