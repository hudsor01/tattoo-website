'use client';

import React from 'react';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import { ServicesHeader } from '@/components/services/ServicesHeader';
import { ServiceList } from '@/components/services/ServiceList';
import { services } from '@/data/services-data';

/**
 * Services Page
 * 
 * Displays all services offered by the tattoo studio.
 */
export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="bg-tattoo-black">
        <section className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <ServicesHeader
              title="Tattoo Services"
              description="From custom designs to portrait work, I offer a range of specialized tattooing 
                services to bring your vision to life. Each service is delivered with meticulous 
                attention to detail and artistic excellence."
            />
            <ServiceList services={services} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}