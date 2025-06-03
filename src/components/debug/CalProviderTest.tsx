'use client';

import React, { useEffect } from 'react';
import { useCalContext, useCalBooking } from '@/providers/CalProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export function CalProviderTest() {
  const { isInitialized, error, mode, retryInitialization } = useCalContext();
  const { debugCalStatus, createBookingLink, openBookingPopup } = useCalBooking();

  useEffect(() => {
    // Log debug status on mount
    debugCalStatus();
  }, [debugCalStatus]);

  const getStatusIcon = () => {
    switch (mode) {
      case 'embed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'loading':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    }
  };

  const testBookingLink = createBookingLink('consultation');

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Cal.com Provider Test
        </CardTitle>
        <CardDescription>
          Testing Cal.com integration status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Initialized:</span>
            <span className={`text-sm ${isInitialized ? 'text-green-500' : 'text-red-500'}`}>
              {isInitialized ? 'Yes' : 'No'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Mode:</span>
            <span className="text-sm capitalize">{mode}</span>
          </div>
          
          {error && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Error:</span>
              <span className="text-xs text-red-400 break-words">{error}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button 
            onClick={() => debugCalStatus()} 
            variant="outline" 
            size="sm"
            className="w-full"
          >
            Debug Status
          </Button>
          
          <Button 
            onClick={() => openBookingPopup('consultation')} 
            variant="default" 
            size="sm"
            className="w-full"
          >
            Test Booking Popup
          </Button>
          
          {error && (
            <Button 
              onClick={retryInitialization} 
              variant="secondary" 
              size="sm"
              className="w-full"
            >
              Retry Initialization
            </Button>
          )}
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">
            Test Link: {testBookingLink.substring(0, 50)}...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
