'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Admin permission verification and fix page
 */
export default function VerifyPermissionsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    user: {
      id: string;
      email: string;
      isAdmin: boolean;
      metadata: Record<string, unknown>;
    };
    fixes: Record<string, unknown>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    // First, ensure we're logged in via localStorage method
    if (typeof window !== 'undefined') {
      localStorage.setItem('ink37_admin_dev_access', 'true');
      localStorage.setItem('ink37_admin_dev_role', 'admin');
      localStorage.setItem('ink37_admin_dev_name', 'Fernando Govea');
      localStorage.setItem('ink37_admin_dev_email', 'fennyg83@gmail.com');
    }

    const checkPermissions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/verify-permissions');

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const responseData = await response.json();
        setData(responseData);
        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [refreshCount]);

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  // Helper function to determine status indicator color
  const getStatusColor = (value: boolean) => {
    return value ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Permissions Verification</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-tattoo-red border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-tattoo-white/70">Checking permissions...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div>
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-2">Authentication Status</h2>
            <div className="mb-2">
              <span className="font-semibold">User ID:</span> {data?.user?.id}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Email:</span> {data?.user?.email}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Admin Status:</span>
              <span className={getStatusColor(Boolean(data?.user?.isAdmin))}>
                {data?.user?.isAdmin ? ' ✓ Is Admin' : ' ✗ Not Admin'}
              </span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Metadata:</span>
              <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                {JSON.stringify(data?.user?.metadata, null, 2)}
              </pre>
            </div>
          </div>

          {data?.fixes && Object.keys(data.fixes).length > 0 && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              <h2 className="text-lg font-bold mb-2">Fixes Applied</h2>
              <pre className="bg-white p-2 rounded overflow-x-auto">
                {JSON.stringify(data.fixes, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={handleRefresh}
              className="bg-tattoo-red text-white px-4 py-2 rounded hover:bg-tattoo-red/90"
            >
              Refresh Status
            </button>

            <Link
              href="/admin"
              className="bg-tattoo-black text-white px-4 py-2 rounded hover:bg-tattoo-black/90"
            >
              Go to Admin Dashboard
            </Link>

            <Link
              href="/admin/test-mapping"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test Table Mapping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
