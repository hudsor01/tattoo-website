import React from 'react';

// CONVERTED TO SERVER COMPONENT: Static service list rendering
import { ServiceCard } from '@/components/services/ServiceCard';
import { CTASection } from '@/components/CTASection';
import type { Service } from '@/data/services-data';

interface ServiceListProps {
  services: Service[];
}

export function ServiceList({ services }: ServiceListProps) {
  return (
    <div className="space-y-32">
      {services.map((service, index) => (
        <ServiceCard key={service.id} service={service} index={index} />
      ))}

      <CTASection
        title="Ready to Start Your Tattoo Journey with Ink 37?"
        description="I am committed to creating a tattoo that you will love for years to come. Let's discuss your ideas and create something unique together."
        primaryButtonText="Book a Consultation"
        primaryButtonLink="/booking"
        secondaryButtonText="View My Gallery"
        secondaryButtonLink="/gallery"
        customClassName="mt-24"
      />
    </div>
  );
}
