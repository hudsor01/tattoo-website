/**
 * Admin Dashboard Layout
 * 
 * Purpose: Protected layout for admin dashboard interface
 * Features: Authentication check, consistent admin UI
 * Note: This is a separate admin interface outside of the main app
 */

import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';
import type { User } from '@prisma/client';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default async function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  // Server-side authentication check using cookies
  const cookieStore = await cookies();
  const cookieString = cookieStore.getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');
    
  const headers = new Headers();
  headers.set('cookie', cookieString);
  const session = await auth.api.getSession({ headers });

  // Redirect if not authenticated
  if (!session?.user) {
    redirect('/unauthorized');
  }

  // Check if user is admin
  const user = session.user as User;
  if (user.role !== 'admin') {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}