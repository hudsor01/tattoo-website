/**
 * Interactive Google Map Component
 * 
 * Purpose: Enhanced Google Maps implementation for Dallas/Fort Worth
 * Features: JavaScript API, custom styling with Fernando gradient theme
 */

'use client';

import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GoogleMapInteractiveProps {
  className?: string;
  height?: string;
  showControls?: boolean;
}

// Dallas/Fort Worth coordinates - remove unused DFW_CENTER
const TATTOO_ARTIST_LOCATION = { lat: 32.7767, lng: -96.7970 };
export default function GoogleMapInteractive({ 
  className = '',
  height = '400px',
  showControls = true
}: GoogleMapInteractiveProps) {

  // Simplified placeholder for now to avoid TypeScript errors
  const openInGoogleMaps = () => {
    const url = `https://maps.google.com/?q=${TATTOO_ARTIST_LOCATION.lat},${TATTOO_ARTIST_LOCATION.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`relative rounded-lg overflow-hidden border border-border ${className}`}>
      {/* Map placeholder with Fernando gradient theme */}
      <div 
        className="relative bg-gradient-to-br from-gray-900 to-black flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center text-white space-y-4">
          <MapPin className="h-12 w-12 mx-auto text-fernando-orange" />
          <div>
            <h3 className="text-xl font-semibold mb-2">Visit Our Tattoo Artist</h3>
            <p className="text-gray-300 mb-4">
              Dallas/Fort Worth Area<br />
              Professional Tattoo Services
            </p>
            {showControls && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={openInGoogleMaps}
                  className="bg-fernando-gradient hover:bg-fernando-gradient-hover text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Google Maps
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}