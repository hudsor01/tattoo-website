/**
 * Admin Client Wrapper - Simplified after Dashboard Consolidation
 * 
 * Purpose: Simplified admin wrapper that delegates auth and error handling
 * to AdminDashboardClient for better consolidation.
 * 
 * Cleanup Phase: Dashboard Consolidation (Phase 1)
 * Date: June 2, 2025
 */

'use client';

import React from 'react';
import { ErrorBoundary } from '@/components/error/error-boundary';
import AdminDashboardClient from '@/components/admin/dashboard/Analytics-View';
import ClientHydration from '@/components/admin/auth/ClientHydration';
import { logger } from "@/lib/logger";

// Simplified hydration-safe loading component
function HydrationLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="h-8 w-8 animate-spin text-gray-500 mb-4">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
          <path 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
            fill="currentColor"
          />
        </svg>
      </div>
      <p className="text-gray-400">Loading admin dashboard...</p>
    </div>
  );
}

// Simplified error fallback
function AdminErrorFallback({ error }: { error?: Error }) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-white">
          <div className="text-[#dc2626] mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2 text-center">Dashboard Error</h3>
          <p className="text-white/70 mb-4 text-center">
            Unable to load the admin dashboard.
          </p>
          {error && (
            <details className="text-left mb-4">
              <summary className="cursor-pointer text-sm font-medium text-white/70">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs bg-gray-900 p-2 rounded overflow-auto text-white/70">
                {error.message}
              </pre>
            </details>
          )}
          <div className="flex justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#dc2626] hover:bg-[#b91c1c] focus:outline-none"
            >
              Refresh Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClientWrapper() {
  return (
    <ErrorBoundary
      fallback={<AdminErrorFallback />}
      onError={(error) => {
        void logger.error('Admin client wrapper error:', error);
      }}
    >
      <ClientHydration fallback={<HydrationLoader />}>
        <AdminDashboardClient />
      </ClientHydration>
    </ErrorBoundary>
  );
}
