'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

type IntegrationStatus =
  | { status: 'loading' }
  | { status: 'not_connected' }
  | {
      status: 'connected';
      data: {
        id: string;
        providerAccountName: string;
        providerAccountId: string;
        lastSyncedAt: Date;
      };
    }
  | { status: 'error'; error: string };

export default function GoogleCalendarIntegration() {
  const [integration, setIntegration] = useState<IntegrationStatus>({ status: 'loading' });
  const router = useRouter();

  // Fetch integration status
  useEffect(() => {
    const fetchIntegration = async () => {
      try {
        const response = await fetch('/api/user/integrations?provider=google_calendar');

        if (!response.ok) {
          throw new Error('Failed to fetch integration status');
        }

        const data = await response.json();

        if (data && data.active) {
          setIntegration({
            status: 'connected',
            data: {
              id: data.id,
              providerAccountName: data.providerAccountName,
              providerAccountId: data.providerAccountId,
              lastSyncedAt: new Date(data.lastSyncedAt),
            },
          });
        } else {
          setIntegration({ status: 'not_connected' });
        }
      } catch (err) {
        console.error('Error fetching integration:', err);
        setIntegration({
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    };

    fetchIntegration();

    // Check for success or error params in URL (from OAuth callback)
    const url = new URL(window.location.href);
    const success = url.searchParams.get('success');
    const error = url.searchParams.get('error');

    if (success || error) {
      // Clear params from URL
      url.searchParams.delete('success');
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());

      // Refresh integration status after callback
      fetchIntegration();
    }
  }, []);

  // Handle connect button click
  const handleConnect = () => {
    window.location.href = '/api/integrations/google-calendar/auth';
  };

  // Handle disconnect button click
  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/user/integrations/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'google_calendar',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect Google Calendar');
      }

      // Update state
      setIntegration({ status: 'not_connected' });
    } catch (err) {
      console.error('Error disconnecting:', err);
      setIntegration({
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to disconnect',
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="bg-indigo-100 p-3 rounded-lg mr-4">
            <CalendarIcon className="h-6 w-6 text-indigo-600" />
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">Google Calendar</h3>
            <p className="text-sm text-gray-500">Sync your appointments with Google Calendar</p>
          </div>
        </div>

        <div>
          {integration.status === 'connected' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Connected
            </span>
          )}

          {integration.status === 'not_connected' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <XCircleIcon className="h-4 w-4 mr-1" />
              Not Connected
            </span>
          )}

          {integration.status === 'error' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <XCircleIcon className="h-4 w-4 mr-1" />
              Error
            </span>
          )}
        </div>
      </div>

      {integration.status === 'loading' && (
        <div className="mt-4 flex justify-center">
          <div className="animate-pulse flex space-x-2">
            <div className="h-2 w-2 bg-indigo-600 rounded-full"></div>
            <div className="h-2 w-2 bg-indigo-600 rounded-full"></div>
            <div className="h-2 w-2 bg-indigo-600 rounded-full"></div>
          </div>
        </div>
      )}

      {integration.status === 'connected' && (
        <div className="mt-4">
          <div className="bg-gray-50 rounded-md p-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Calendar:</span>
                <span className="font-medium">{integration.data.providerAccountName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium">{integration.data.providerAccountId}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Last synced:</span>
                <span className="font-medium">
                  {integration.data.lastSyncedAt.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleDisconnect}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {integration.status === 'not_connected' && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-4">
            Connect your Google Calendar to automatically sync appointments.
          </p>

          <div className="flex justify-end">
            <button
              onClick={handleConnect}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Connect Google Calendar
            </button>
          </div>
        </div>
      )}

      {integration.status === 'error' && (
        <div className="mt-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{integration.error}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleConnect}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
