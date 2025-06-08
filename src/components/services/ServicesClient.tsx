'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Star } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/layouts/Footer';
import { services } from '@/data/services-data';
import Image from 'next/image';

const getServiceImage = (serviceId: string): string => {
  const imageMap: Record<string, string> = {
    'custom-designs': '/images/custom-designs.jpg',
    'portraits': '/images/realism.jpg',
    'fine-line': '/images/japanese.jpg',
    'cover-ups': '/images/cover-ups.jpg'
  };
  
  return imageMap[serviceId] ?? '/images/services/tattoo-gun-grayscale.jpg';
};

export default function ServicesClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <motion.div 
          className="text-center mb-20 md:mb-24 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-8 fernando-gradient">
            Our Tattoo Services
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed md:leading-loose">
            Professional tattoo services crafted with artistic excellence and precision. 
            From custom designs to expert cover-ups, each piece is a unique work of art 
            created to reflect your personal vision and story.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => {
            const Icon = service.icon;
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full group hover:shadow-2xl transition-all duration-300 border-border/50 hover:border-primary/30 overflow-hidden flex flex-col">
                  <div className="relative h-72 overflow-hidden">
                    <Image
                      src={getServiceImage(service.id)}
                      alt={`${service.title} - Professional tattoo service`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      quality={85}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute top-4 right-4 p-3 rounded-lg bg-black/50 backdrop-blur-md border border-white/20">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-5 flex-grow flex flex-col">
                    <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base flex-grow">
                      {service.shortDescription}
                    </p>
                    <div className="space-y-3 pt-2">
                      <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground/80">
                        Key Features
                      </h4>
                      <ul className="space-y-1.5">
                        {service.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2.5">
                            <Star className="h-4 w-4 text-fernando-orange fill-current flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-5 mt-auto">
                      <Button 
                        asChild 
                        className="w-full bg-fernando-gradient hover:bg-fernando-gradient-hover text-white"
                      >
                        <Link href={`/book-consultation?service=${service.id}`}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Book This Service
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Tattoo Process
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every tattoo journey follows a carefully planned process to ensure 
              exceptional results and your complete satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Consultation",
                description: "Discuss your vision, placement, and design preferences in detail."
              },
              {
                step: "02", 
                title: "Design Creation",
                description: "Custom artwork developed based on your ideas and feedback."
              },
              {
                step: "03",
                title: "Approval & Prep",
                description: "Final design approval and preparation for your tattoo session."
              },
              {
                step: "04",
                title: "Tattoo Session",
                description: "Professional application with attention to detail and comfort."
              }
            ].map((process, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <Card className="text-center p-6 md:p-8 h-full border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col items-center justify-start">
                  <div className="mb-5">
                    <div className="w-20 h-20 mx-auto rounded-full bg-fernando-gradient flex items-center justify-center text-white font-bold text-2xl shadow-md">
                      {process.step}
                    </div>
                  </div>
                  <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors">{process.title}</h3>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                    {process.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="relative overflow-hidden border-border/50">
            <div className="absolute inset-0">
              <Image
                src="/images/services/neon-sign.jpg"
                alt="Professional tattoo studio"
                fill
                className="object-cover opacity-10"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/90" />
            </div>
            
            <CardContent className="relative p-10 md:p-16 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 fernando-gradient">
                Ready to Start Your Tattoo Journey?
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed md:leading-loose">
                Let's bring your vision to life with exceptional artistry and attention to detail. 
                Book a consultation to discuss your ideas and begin creating your unique piece.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <Button 
                  asChild 
                  size="lg"
                  className="bg-fernando-gradient hover:opacity-90 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/book-consultation">
                    <Calendar className="h-5 w-5 mr-2.5" />
                    Book a Consultation
                    <ArrowRight className="h-5 w-5 ml-2.5" />
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline"
                  className="font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-border hover:bg-muted/50 hover:text-primary"
                >
                  <Link href="/gallery">
                    View Portfolio
                    <ArrowRight className="h-5 w-5 ml-2.5" />
                  </Link>
                </Button>
              </div>
              
              <div className="mt-12 pt-10 border-t border-border/30 text-center">
                <p className="text-sm text-muted-foreground">
                  Professional tattoo services • Custom designs • Expert consultation
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
