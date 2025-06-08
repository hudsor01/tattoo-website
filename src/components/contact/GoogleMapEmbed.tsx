/**
 * Google Map Embed Component
 * 
 * Purpose: Displays an embedded Google Map with proper error handling and fallback
 * Features: Environment variable support, fallback to static map, error handling
 */

'use client';

import React, { useState } from 'react';
import { MapPin, ExternalLink, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GoogleMapEmbedProps {
  location?: string;
  className?: string;
  height?: string;
  zoom?: number;
  mapType?: 'roadmap' | 'satellite' | 'terrain' | 'hybrid';
  showCustomization?: boolean;
}

export default function GoogleMapEmbed({ 
  location = 'Dallas-Fort Worth Metroplex, TX, USA',
  className = '',
  height = '100%',
  zoom = 10,
  mapType = 'roadmap',
  showCustomization = false
}: GoogleMapEmbedProps) {
  const [mapError, setMapError] = useState(false);
  const [currentMapType, setCurrentMapType] = useState(mapType);
  
  // Check if we have a Google Maps API key
  const apiKey = process.env['NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'];
  
  // Construct the embed URL
  const getMapUrl = () => {
    if (apiKey) {
      // Use the official Maps Embed API with API key for more features
      const params = new URLSearchParams({
        key: apiKey,
        q: location,
        zoom: zoom.toString(),
        maptype: currentMapType
      });
      return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
    } else {
      // Use the legacy embed URL (may have limitations but works without API key)
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d430647.77041463253!2d-97.4010818!3d32.77665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864c19f77b45974b%3A0xb9ec9ba4f647678f!2sDallas-Fort%20Worth%20Metroplex%2C%20TX%2C%20USA!5e0!3m2!1sen!2sus!4v1735776000000!5m2!1sen!2sus`;
    }
  };

  const handleMapError = () => {
    setMapError(true);
  };

  const openInGoogleMaps = () => {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(location)}`, '_blank');
  };

  const mapTypeOptions = [
    { value: 'roadmap', label: 'Road' },
    { value: 'satellite', label: 'Satellite' },
    { value: 'terrain', label: 'Terrain' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  if (mapError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-muted rounded-lg p-8 ${className}`} style={{ height }}>
        <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4 text-center">
          Unable to load map. Click below to view in Google Maps.
        </p>
        <Button 
          onClick={openInGoogleMaps}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Open in Google Maps
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Map Type Controls (only show if API key is available and customization is enabled) */}
      {apiKey && showCustomization && (
        <div className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-sm rounded-lg p-2 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="h-4 w-4 text-white" />
            <span className="text-xs text-white font-medium">Map Type</span>
          </div>
          <div className="flex gap-1">
            {mapTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setCurrentMapType(option.value as typeof mapType)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  currentMapType === option.value
                    ? 'bg-[#E63A35] text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* API Key Status Indicator */}
      {!apiKey && (
        <div className="absolute top-3 right-3 z-10 bg-amber-500/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-amber-500/40">
          <span className="text-xs text-amber-200">Basic Map</span>
        </div>
      )}

      <iframe
        src={getMapUrl()}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map of ${location}`}
        onError={handleMapError}
      />
    </div>
  );
}
