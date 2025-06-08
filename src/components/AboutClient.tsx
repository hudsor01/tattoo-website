'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Calendar, Heart, Shield, Star, Users } from 'lucide-react';
import Footer from '@/components/layouts/Footer';

export default function AboutClient() {
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
            About Ink 37
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed md:leading-loose">
            Discover the story behind the art and the passion that drives our mission 
            to create meaningful tattoos that tell your unique story.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20 md:mb-24"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-center">
            <div className="relative group">
              <Card className="overflow-hidden border-border/50 shadow-xl rounded-xl">
                <div className="relative h-[500px] md:h-[550px]">
                  <Image
                    src="/images/traditional.jpg"
                    alt="Fernando Govea - Professional Tattoo Artist at Ink 37"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    quality={90}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8">
                    <Card className="bg-black/70 backdrop-blur-md border-white/20 shadow-2xl rounded-lg">
                      <CardContent className="p-5 md:p-6">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1.5">Fernando Govea</h3>
                        <p className="text-white/90 text-sm md:text-base mb-1">Professional Tattoo Artist</p>
                        <p className="text-fernando-orange text-sm md:text-base font-semibold">10+ Years Experience</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </Card>
            </div>
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
                  A Dream Built on Passion & Precision
                </h2>
                <div className="space-y-5 text-muted-foreground text-base md:text-lg leading-relaxed md:leading-loose">
                  <p>
                    At Ink 37, I've cultivated more than just a tattoo studio; I've built a sanctuary—a
                    comfortable, welcoming environment where artistic vision flourishes and 
                    meaningful connections are forged. My unwavering mission is to provide exceptional 
                    custom tattoo services throughout the Dallas/Fort Worth metroplex.
                  </p>
                  <p>
                    Founded by Fernando Govea, a dedicated tattoo artist with over a decade of 
                    experience, Ink 37 stands as a testament to meticulous attention to detail, 
                    uncompromising cleanliness, and the art of building genuine, lasting relationships 
                    with every cherished client who walks through our doors.
                  </p>
                  <p>
                    When you choose Ink 37, you're not merely acquiring a tattoo – you're 
                    embraced into our extended family. We invest the time to deeply understand your vision, 
                    collaborating closely to bring it to life with unparalleled precision and artistry.
                  </p>
                </div>
                <div className="pt-8 md:pt-10">
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
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20 md:mb-24"
        >
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 fernando-gradient">
              Our Core Values
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed md:leading-loose">
              The principles that guide our work and ensure an exceptional 
              experience for every client.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Star,
                title: 'Artistic Excellence',
                description: 'Dedicated to creating high-quality tattoo art that stands the test of time, focusing on detail, composition, and masterful execution.'
              },
              {
                icon: Users,
                title: 'Personal Connection', 
                description: 'Building genuine relationships with our clients, taking the time to understand your vision, story, and personal meaning.'
              },
              {
                icon: Shield,
                title: 'Safe Environment',
                description: 'Your safety and comfort are paramount. We maintain the highest standards of cleanliness and follow all health regulations.'
              }
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full"
                >
                  <Card className="h-full text-center p-6 md:p-8 border-border/50 hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col items-center">
                    <div className="mb-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-fernando-gradient flex items-center justify-center shadow-lg">
                        <Icon className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{value.title}</h3>
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed flex-grow">
                      {value.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20 md:mb-24"
        >
          <Card className="border-border/50 bg-gradient-to-br from-background via-background/95 to-background/90 shadow-xl rounded-xl">
            <CardContent className="p-10 md:p-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 text-center">
                {[
                  { number: '10+', label: 'Years Experience' },
                  { number: '500+', label: 'Happy Clients' },
                  { number: '1000+', label: 'Tattoos Created' },
                  { number: '100%', label: 'Satisfaction Rate' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                  >
                    <div className="space-y-2.5">
                      <div className="text-4xl md:text-5xl font-bold fernando-gradient tracking-tight">
                        {stat.number}
                      </div>
                      <div className="text-muted-foreground font-medium text-sm md:text-base uppercase tracking-wider">
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                alt="Ink 37 Tattoo Studio"
                fill
                className="object-cover opacity-10"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/90" />
            </div>
            <CardContent className="relative p-10 md:p-16 text-center">
              <div className="max-w-16 mx-auto mb-8">
                <Heart className="h-12 w-12 md:h-16 md:w-16 mx-auto text-fernando-orange" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 fernando-gradient">
                Ready to Start Your Tattoo Journey?
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed md:leading-loose">
                Let's bring your vision to life with exceptional artistry and attention 
                to detail. Book a consultation to discuss your ideas and begin creating 
                your unique piece of art.
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
                  Professional tattoo artistry • 10+ years experience • Dallas/Fort Worth
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
