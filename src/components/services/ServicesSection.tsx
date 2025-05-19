'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import Image from "next/image";

// Dynamically import framer-motion to prevent SSR issues
const motion = dynamic(() => import('framer-motion').then((mod) => mod), { 
  ssr: false 
});

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  route: string;
}

// Service offerings
const services: Service[] = [
  {
    id: 'traditional',
    title: 'Traditional Tattoos',
    description: 'Bold lines, classic designs, and timeless artistry that never goes out of style.',
    image: '/images/traditional.jpg',
    route: '/services#traditional'
  },
  {
    id: 'realism',
    title: 'Realism & Portraits',
    description: 'Life-like details and photorealistic artwork that captures every nuance.',
    image: '/images/realism.jpg',
    route: '/services#realism'
  },
  {
    id: 'custom',
    title: 'Custom Designs',
    description: 'Unique pieces tailored to your vision. From concept to creation.',
    image: '/images/custom-designs.jpg',
    route: '/services#custom'
  },
  {
    id: 'japanese',
    title: 'Japanese Style',
    description: 'Traditional Japanese motifs and modern interpretations with rich storytelling.',
    image: '/images/japanese.jpg',
    route: '/services#japanese'
  },
  {
    id: 'coverups',
    title: 'Cover-ups',
    description: 'Transform old tattoos into new masterpieces with expert cover-up work.',
    image: '/images/cover-ups.jpg',
    route: '/services#coverups'
  },
  {
    id: 'consultations',
    title: 'Free Consultations',
    description: 'Discuss your ideas, get expert advice, and plan your perfect tattoo.',
    image: '/images/consultation.jpg',
    route: '/booking'
  }
];

export default function ServicesSection() {
  const router = useRouter();
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-pacifico">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From traditional to contemporary, we offer a wide range of tattoo styles 
            to bring your vision to life.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all duration-300 ${
                hoveredService === service.id ? 'scale-105 shadow-xl' : ''
              }`}
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
              onClick={() => router.push(service.route)}
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>
                <Button variant="outline" className="w-full">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg"
            onClick={() => router.push('/services')}
            className="min-w-[200px]"
          >
            View All Services
          </Button>
        </div>
      </div>
    </div>
  );
}