'use client';

import React, { useEffect, useCallback } from 'react';
import { useCalAtoms } from '@/providers/CalProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export function CalProviderTest() {
  const { isReady, isConfigured, error } = useCalAtoms();

  const debugCalStatus = useCallback(() => {
    console.warn('Cal.com Status:', { isReady, isConfigured, error });
  }, [isReady, isConfigured, error]);

  useEffect(() => {
    // Log debug status on mount
    debugCalStatus();
  }, [debugCalStatus]);

  const getStatusIcon = () => {
    if (error) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (!isReady) {
      return <Clock className="h-5 w-5 text-yellow-500" />;
    }
    if (isConfigured) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <AlertTriangle className="h-5 w-5 text-orange-500" />;
  };

  const getStatusText = () => {
    if (error) return 'Error';
    if (!isReady) return 'Loading';
    if (isConfigured) return 'Ready';
    return 'Not Configured';
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Cal.com Atoms Test
        </CardTitle>
        <CardDescription>
          Testing Cal.com Atoms integration status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Status:</span>
            <span className={`text-sm ${isConfigured ? 'text-green-500' : 'text-red-500'}`}>
              {getStatusText()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Ready:</span>
            <span className={`text-sm ${isReady ? 'text-green-500' : 'text-yellow-500'}`}>
              {isReady ? 'Yes' : 'Loading...'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Configured:</span>
            <span className={`text-sm ${isConfigured ? 'text-green-500' : 'text-orange-500'}`}>
              {isConfigured ? 'Yes' : 'No'}
            </span>
          </div>
          
          {error && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Error:</span>
              <span className="text-xs text-red-400 break-words">{error.message}</span>
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
            disabled={!isConfigured}
            variant="default" 
            size="sm"
            className="w-full"
          >
            {isConfigured ? 'Cal.com Atoms Ready' : 'Not Configured'}
          </Button>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">
            Cal.com Atoms integration for booking system
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
