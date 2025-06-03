/**
 * Admin Gallery Management Page
 * 
 * Purpose: Manage gallery images, approve uploads, and organize tattoo portfolio
 * Rendering: CSR with real-time image management
 */

import { Metadata } from 'next';
import { GalleryPageClient } from './client';

export const metadata: Metadata = {
  title: 'Gallery Management | Admin Dashboard',
  description: 'Manage gallery images and tattoo portfolio',
};

export default function AdminGalleryPage() {
  return <GalleryPageClient />;
}