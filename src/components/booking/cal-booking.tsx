'use client';

import React from 'react';
import { getCalServices } from '@/lib/cal/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import type { CalService } from '@prisma/client';

interface CalBookingUnifiedProps {
  selectedService?: string | undefined;
  onServiceSelect?: (service: CalService) => void;
  className?: string;
}

export function CalBookingUnified({ 
  selectedService,
  onServiceSelect,
  className = ''
}: CalBookingUnifiedProps) {
  const services = getCalServices();
  const currentService = selectedService ? services.find(s => s.id === selectedService) : services[0];
  
  // Handle service selection
  const handleServiceSelect = (service: CalService) => {
    onServiceSelect?.(service);
  };

  // Generate the Cal.com iframe URL
  const getIframeUrl = (service: CalService) => {
    const baseUrl = `https://cal.com/ink37tattoos/${service.eventTypeSlug}`;
    const params = new URLSearchParams({
      embed: 'true',
      theme: 'dark',
    });
    return `${baseUrl}?${params.toString()}`;
  };

  if (!currentService) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-red-400">No booking services available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Service Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card 
            key={service.id}
            className={`cursor-pointer transition-all ${
              currentService.id === service.id 
                ? 'ring-2 ring-blue-500 bg-blue-50@light bg-blue-950@dark' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => handleServiceSelect(service)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                {service.price > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {service.price}
                  </Badge>
                )}
                {service.price === 0 && (
                  <Badge variant="outline" className="text-green-600">
                    Free
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">
                {service.description}
              </CardDescription>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {service.duration} min
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Available
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Service Details */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {currentService.name}
        </h2>
        <p className="text-muted-foreground">{currentService.description}</p>
      </div>

      {/* Cal.com Iframe Embed */}
      <div className="bg-background rounded-xl overflow-hidden shadow-lg border">
        <iframe
          src={getIframeUrl(currentService)}
          width="100%"
          height="700px"
          frameBorder="0"
          title={`Book ${currentService.name}`}
          className="w-full"
          allow="camera; microphone; fullscreen; payment"
        />
      </div>
    </div>
  );
}