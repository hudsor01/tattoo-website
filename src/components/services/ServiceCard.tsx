'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { BookNowButton } from '@/components/ui/BookNowButton';
import type { Service } from '@/data/services-data';

interface ServiceCardProps {
  service: Service;
  index: number;
  onBookService?: (serviceId: string) => void;
}

/**
 * ServiceCard Component
 * 
 * Purpose: Enhanced service card with features and process
 * Features: Animations, booking integration, responsive design
 */
export function ServiceCard({ 
  service, 
  index, 
  onBookService 
}: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-fernando-red/30 transition-all duration-300 hover:shadow-lg hover:shadow-fernando-red/10">
        <CardContent className="p-8 h-full flex flex-col">
          {/* Service Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-fernando-gradient/10 border border-fernando-red/20 shrink-0">
              <Icon className="h-8 w-8 text-fernando-red" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{service.title}</h2>
              {service.startingPrice && (
                <p className="text-fernando-orange font-semibold">
                  Starting at ${service.startingPrice}
                </p>
              )}
            </div>
          </div>
          
          <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
            {service.description}
          </p>
          
          {/* Features */}
          {service.features && service.features.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-foreground">What's Included:</h3>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-fernando-orange mt-0.5 shrink-0" />
                    <span className="text-muted-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Process */}
          {service.process && service.process.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-foreground">Process:</h3>
              <ol className="space-y-2">
                {service.process.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-fernando-orange font-semibold text-sm mt-0.5 shrink-0">
                      {idx + 1}.
                    </span>
                    <span className="text-muted-foreground text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          
          {/* CTA Button */}
          <div className="mt-auto pt-4">
            <BookNowButton
              useModal={true}
              serviceId={service.id}
              fullWidth={true}
              size="sm"
              className="bg-fernando-gradient hover:opacity-90 text-white text-sm lg:text-base group-hover:scale-105 transition-transform duration-300"
              onClick={() => onBookService?.(service.id)}
            >
              Book {service.title}
              <ArrowRight className="ml-2 h-4 w-4" />
            </BookNowButton>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ServiceCard;
