/**
 * Unified Layout System
 * 
 * This component provides a unified layout system for the application,
 * including responsive handling for different devices and page types.
 */

"use client";

import React, { ReactNode } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';

interface UnifiedLayoutProps {
  children: ReactNode;
  className?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  fullWidth?: boolean;
}

export const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({
  children,
  className = '',
  hideHeader = false,
  hideFooter = false,
  fullWidth = false,
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeader && <Header />}
      
      <main className={`flex-grow ${fullWidth ? 'w-full' : 'container mx-auto px-4 sm:px-6 lg:px-8'} ${className}`}>
        {children}
      </main>
      
      {!hideFooter && <Footer />}
    </div>
  );
};

/**
 * App Layout is the main layout used by the RootLayout
 */
export const AppLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <UnifiedLayout>
      {children}
    </UnifiedLayout>
  );
};

export default UnifiedLayout;