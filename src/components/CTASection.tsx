'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CTASectionProps } from '@/lib/prisma-types';

/**
 * CTA Section Component
 *
 * A reusable call-to-action section for use across different pages.
 */
export function CTASection({
  title,
  description,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  customClassName = '',
}: CTASectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7 }}
      className={`bg-linear-to-br from-tattoo-black to-tattoo-black/90 rounded-2xl border border-tattoo-red/20 shadow-xl p-8 md:p-12 ${customClassName}`}
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-white/80 mb-8">{description}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            asChild
            className="bg-linear-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-600 hover:to-amber-600 group"
          >
            <Link href={primaryButtonLink ?? '#'} className="inline-flex items-center">
              {primaryButtonText}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          {secondaryButtonText && secondaryButtonLink && (
            <Button
              variant="outline"
              size="lg"
              asChild
              className="relative border-2 border-red-500 bg-linear-to-r from-var(--color-red-500)/10 via-var(--color-orange-500)/10 to-var(--color-amber-500)/10 text-white hover:from-var(--color-red-500)/20 hover:via-var(--color-orange-500)/20 hover:to-var(--color-amber-500)/20 hover:scale-105 transition-all duration-300 group overflow-hidden"
            >
              <Link href={secondaryButtonLink ?? '#'} className="inline-flex items-center relative z-10">
                <span className="bg-linear-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent font-semibold">
                  {secondaryButtonText}
                </span>
                <ArrowRight className="ml-2 h-4 w-4 text-amber-400 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                <div className="absolute inset-0 bg-linear-to-r from-red-500/5 via-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.section>
  );
}
