'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/layouts/Footer';
import { services } from '@/data/services-data';

/**
 * ServicesClient Component
 * 
 * Purpose: Services page using proper Tailwind CSS v4 conventions
 * Features: Aligned buttons, consistent spacing, proper responsive design
 */

// High-quality atmospheric tattoo images from Unsplash
const getServiceImage = (serviceId: string): string => {
  const imageMap: Record<string, string> = {
    'custom-designs': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&crop=center&auto=format&q=80', // Tattoo machine close-up
    'portraits': 'https://images.unsplash.com/photo-1599582909646-e013108d2b46?w=800&h=600&fit=crop&crop=center&auto=format&q=80', // Tattoo equipment setup
    'fine-line': 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=600&fit=crop&crop=center&auto=format&q=80', // Tattoo needles and precision work
    'cover-ups': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop&crop=center&auto=format&q=80'
  };

  return imageMap[serviceId] ?? 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&crop=center&auto=format&q=80';
};

export default function ServicesClient() {
  return (
    <>
      {/* Header Section */}
      <section className="relative container mx-auto px-4 py-8">
        {/* Background overlay */}
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&h=400&fit=crop&crop=center&auto=format&q=80"
            alt="Professional tattoo equipment background"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-background/80" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Tattoo Services
          </h1>
          <p className="text-xl text-muted-foreground">
            From custom designs to portrait work, I offer a range of specialized tattooing 
            services to bring your vision to life. Each service is delivered with meticulous 
            attention to detail and artistic excellence.
          </p>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 pb-8">
        <div className="space-y-20">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isEven = index % 2 === 0;
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                {/* Content */}
                <div className={`space-y-6 ${isEven ? '' : 'lg:order-2'}`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold">{service.title}</h2>
                  </div>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div>
                    <h3 className="font-semibold mb-3">What's Included:</h3>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {service.process && (
                    <div>
                      <h3 className="font-semibold mb-3">Process:</h3>
                      <ol className="space-y-2">
                        {service.process.map((step, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-primary mr-2">{idx + 1}.</span>
                            <span className="text-muted-foreground">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  <div className="flex gap-4 pt-4">
                    <Button 
                      asChild 
                      size="sm"
                      className="bg-fernando-gradient hover:opacity-90 text-white text-sm lg:text-base"
                    >
                      <Link href={`/booking?service=${service.id}`}>
                        Book This Service
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                
                {/* Image Section */}
                <div className={isEven ? '' : 'lg:order-1'}>
                  <Card className="aspect-[4/3] bg-muted/20 border-muted overflow-hidden">
                    <CardContent className="h-full p-0">
                      <img
                        src={getServiceImage(service.id)}
                        alt={`${service.title} - Professional tattoo service`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="relative bg-card border-border overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1200&h=400&fit=crop&crop=center&auto=format&q=80"
              alt="Professional tattoo studio background"
              className="w-full h-full object-cover opacity-5"
            />
            <div className="absolute inset-0 bg-card/90" />
          </div>
          
          <CardContent className="relative p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Your Tattoo Journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              I am committed to creating a tattoo that you will love for years to come. 
              Let's discuss your ideas and create something unique together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="sm" 
                className="bg-fernando-gradient hover:opacity-90 text-white text-sm lg:text-base"
              >
                <Link href="/booking">
                  Book a Consultation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/gallery">View My Gallery</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </>
  );
}
