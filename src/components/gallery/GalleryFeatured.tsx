'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TATTOO_BLUE_PLACEHOLDER, getImageSizes } from '@/lib/utils/image';

// Featured gallery images (preloaded)
const featuredGalleryImages = [
  {
    id: 'japanese',
    src: '/images/japanese.jpg',
    alt: 'Japanese style tattoo artwork',
    title: 'Japanese Art',
    description: 'Traditional Japanese-inspired tattoo design with modern elements.',
  },
  {
    id: 'christ-crosses',
    src: '/images/christ-crosses.JPG',
    alt: 'Religious themed tattoo with crosses',
    title: 'Religious Theme',
    description: 'Detailed religious artwork combining symbols and portraits.',
  },
  {
    id: 'clock-roses',
    src: '/images/clock-roses-left-forearm.jpg',
    alt: 'Clock and roses tattoo design',
    title: 'Clock & Roses',
    description: 'Symbolism of time and beauty in this elegant forearm piece.',
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function GalleryFeatured() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="py-20 bg-tattoo-black relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full z-0"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-tattoo-red/5 blur-[150px] rounded-full z-0"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-4xl mx-auto"
        >
          {/* Section header */}
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Featured Artwork</h2>
            <p className="text-lg text-white/70">
              Browse a selection of recent custom tattoo designs showcasing different styles and techniques.
            </p>
          </motion.div>

          {/* Gallery grid */}
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
            {featuredGalleryImages.map((image, index) => (
              <motion.div
                key={image.id}
                variants={itemVariants}
                className="bg-black/50 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative h-64">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes={getImageSizes('gallery-card')}
                    loading={index === 0 ? "eager" : "lazy"}
                    placeholder="blur"
                    blurDataURL={TATTOO_BLUE_PLACEHOLDER}
                    quality={85}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-1 text-white">{image.title}</h3>
                  <p className="text-white/70 text-sm mb-0">{image.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA button */}
          <motion.div className="text-center mt-10" variants={itemVariants}>
            <Button asChild size="lg" className="bg-tattoo-red hover:bg-tattoo-red-dark">
              <Link href="/gallery" className="inline-flex items-center">
                View Full Gallery
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
