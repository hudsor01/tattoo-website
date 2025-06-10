'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookingPopupButton } from '@/components/booking/BookingPopupButton';
import { 
  Palette, 
  Heart, 
  Brush, 
  Star, 
  Clock, 
  Shield, 
  Award,
  Sparkles,
  Layers,
  Eye,
  CheckCircle,
  ArrowRight,
  Calendar,
  Users,
  Target
} from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/layouts/Footer';
import Image from 'next/image';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0, delayChildren: 0 }
  }
};

const _scaleOnHover = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeInOut" }
  }
};

// Premium service data with SEO-optimized content
const premiumServices = [
  {
    id: 'custom-designs',
    title: 'Custom Tattoo Designs',
    shortDescription: 'Unique, personalized artwork created exclusively for you',
    fullDescription: 'Transform your vision into reality with completely custom tattoo designs. Our collaborative process ensures every detail reflects your personal story, from initial concept sketches to the final masterpiece on your skin.',
    features: [
      'One-on-one design consultation',
      'Unlimited revision rounds',
      'Original artwork ownership',
      'Digital design delivery',
      'Sizing and placement guidance'
    ],
    icon: Palette,
    image: '/images/custom-designs.jpg',
    priceRange: '$150 - $2000+',
    duration: '2-8 hours',
    category: 'Design & Planning',
    seoKeywords: ['custom tattoo design', 'personalized tattoo art', 'unique tattoo artwork'],
    featured: true
  },
  {
    id: 'traditional',
    title: 'Traditional American Tattoos',
    shortDescription: 'Classic bold lines and vibrant colors in timeless American style',
    fullDescription: 'Experience the heritage of American tattooing with bold, clean lines and vibrant colors. Traditional tattoos feature iconic imagery like eagles, roses, anchors, and pin-ups that have defined tattoo culture for generations.',
    features: [
      'Bold, clean line work',
      'Traditional color palette',
      'Timeless design elements',
      'Flash sheet options available',
      'Quick healing process'
    ],
    icon: Star,
    image: '/images/traditional.jpg',
    priceRange: '$100 - $800',
    duration: '1-4 hours',
    category: 'Classic Styles',
    seoKeywords: ['traditional tattoo', 'American traditional', 'bold line tattoos']
  },
  {
    id: 'japanese',
    title: 'Japanese Traditional',
    shortDescription: 'Authentic Japanese artistry with cultural depth and meaning',
    fullDescription: 'Immerse yourself in the rich tradition of Japanese tattooing (Irezumi) featuring dragons, koi fish, cherry blossoms, and geometric patterns. Each piece honors centuries-old techniques and cultural significance.',
    features: [
      'Authentic Japanese motifs',
      'Cultural significance respected',
      'Large-scale compositions',
      'Traditional color schemes',
      'Symbolic meaning integration'
    ],
    icon: Layers,
    image: '/images/japanese.jpg',
    priceRange: '$200 - $3000+',
    duration: '3-12 hours',
    category: 'Cultural Art',
    seoKeywords: ['Japanese tattoo', 'Irezumi', 'traditional Japanese art']
  },
  {
    id: 'realism',
    title: 'Photorealistic Portraits',
    shortDescription: 'Lifelike portraits and realistic imagery with stunning detail',
    fullDescription: 'Capture memories forever with photorealistic portrait tattoos. Using advanced shading techniques and attention to detail, we create stunning lifelike representations of loved ones, pets, or meaningful imagery.',
    features: [
      'Photo-reference accuracy',
      'Advanced shading techniques',
      'Fine detail work',
      'Black & grey or color options',
      'Memorial tribute specialization'
    ],
    icon: Eye,
    image: '/images/realism.jpg',
    priceRange: '$300 - $1500+',
    duration: '4-8 hours',
    category: 'Specialized Art',
    seoKeywords: ['realistic tattoo', 'portrait tattoo', 'photorealistic ink'],
    featured: true
  },
  {
    id: 'cover-ups',
    title: 'Expert Cover-Up Work',
    shortDescription: 'Transform old tattoos into beautiful new artwork',
    fullDescription: 'Give new life to unwanted tattoos with expert cover-up work. Our strategic approach analyzes existing ink to create stunning new designs that completely transform and enhance your skin art.',
    features: [
      'Free consultation assessment',
      'Strategic design planning',
      'Color theory application',
      'Existing ink incorporation',
      'Guaranteed coverage results'
    ],
    icon: Brush,
    image: '/images/cover-ups.jpg',
    priceRange: '$200 - $1200+',
    duration: '3-6 hours',
    category: 'Restoration',
    seoKeywords: ['tattoo cover up', 'tattoo renovation', 'ink transformation']
  },
  {
    id: 'fine-line',
    title: 'Fine Line & Minimalist',
    shortDescription: 'Delicate, precise artwork for subtle yet impactful designs',
    fullDescription: 'Perfect for those seeking understated elegance, fine line tattoos offer intricate detail work with minimal visual weight. Ideal for meaningful symbols, delicate florals, and geometric patterns.',
    features: [
      'Precise line work',
      'Minimalist aesthetic',
      'Delicate detail focus',
      'Quick healing time',
      'Professional workplace friendly'
    ],
    icon: Sparkles,
    image: '/images/japanese.jpg',
    priceRange: '$80 - $500',
    duration: '1-3 hours',
    category: 'Modern Styles',
    seoKeywords: ['fine line tattoo', 'minimalist tattoo', 'delicate ink work']
  }
];

// Quality assurance features
const qualityFeatures = [
  {
    icon: Shield,
    title: 'Sterile Environment',
    description: 'Medical-grade sterilization and single-use equipment ensure your safety'
  },
  {
    icon: Award,
    title: 'Professional Certification',
    description: 'Licensed and insured with continuous education in latest techniques'
  },
  {
    icon: Heart,
    title: 'Aftercare Support',
    description: 'Comprehensive healing guidance and follow-up care included'
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Convenient appointment times to fit your busy lifestyle'
  }
];

// Process steps
const processSteps = [
  {
    step: 1,
    title: 'Consultation',
    description: 'Discuss your vision, style preferences, and placement options',
    duration: '30-60 mins',
    icon: Users
  },
  {
    step: 2,
    title: 'Design Creation',
    description: 'Custom artwork development with your feedback and revisions',
    duration: '1-3 days',
    icon: Palette
  },
  {
    step: 3,
    title: 'Appointment Booking',
    description: 'Schedule your tattoo session at your convenience',
    duration: '5 mins',
    icon: Calendar
  },
  {
    step: 4,
    title: 'Tattoo Session',
    description: 'Professional application in our sterile, comfortable studio',
    duration: 'Varies',
    icon: Target
  }
];

export default function ServicesClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-platinum/5 to-white dark:from-ink-black dark:via-charcoal/5 dark:to-ink-black">
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Badge className="mb-6 bg-fernando-red/10 text-fernando-red border-fernando-red/20 px-4 py-2">
              Professional Tattoo Services
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-montserrat font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange bg-clip-text text-transparent">
                Artistic Excellence
              </span>
              <br />
              <span className="text-ink-black dark:text-white">
                Meets Precision
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-steel dark:text-silver max-w-3xl mx-auto mb-8 leading-relaxed">
              Transform your vision into stunning body art with our comprehensive tattoo services. 
              From custom designs to expert cover-ups, every piece is crafted with artistic excellence, 
              precision, and respect for your unique story.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <BookingPopupButton
                  eventSlug="consultation"
                  size="icon"
                  className="!h-14 !w-auto bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange hover:opacity-90 transition-all duration-300 text-white font-montserrat font-semibold px-8 py-4 rounded-lg flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Book Free Consultation
                </BookingPopupButton>
              </motion.div>
              
              <Link href="/gallery">
                <motion.button
                  className="h-14 px-8 py-4 border-2 border-transparent bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange text-white hover:opacity-90 transition-all duration-300 rounded-lg font-montserrat font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Our Work
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Services Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-4 text-ink-black dark:text-white">
              Our Signature Services
            </h2>
            <p className="text-lg text-steel dark:text-silver max-w-2xl mx-auto">
              Specializing in diverse tattoo styles with uncompromising quality and artistic integrity
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {premiumServices.map((service) => {
              const IconComponent = service.icon;
              
              return (
                <motion.div
                  key={service.id}
                  variants={fadeInUp}
                  whileHover="hover"
                  initial="rest"
                >
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 border-border/50 dark:border-white/10 overflow-hidden group">
                    {service.featured && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-fernando-red text-white">Featured</Badge>
                      </div>
                    )}
                    
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={service.image}
                        alt={`${service.title} - Professional tattoo service by Ink 37`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        quality={90}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent className="w-6 h-6 text-fernando-red" />
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            {service.category}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <CardHeader>
                      <CardTitle className="text-xl font-montserrat font-bold mb-2">
                        {service.title}
                      </CardTitle>
                      <p className="text-steel dark:text-silver text-sm">
                        {service.shortDescription}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium text-fernando-red">Duration:</span>
                          <span className="ml-2 text-steel dark:text-silver">{service.duration}</span>
                        </div>
                        <div>
                          <span className="font-medium text-fernando-red">From:</span>
                          <span className="ml-2 text-steel dark:text-silver">{service.priceRange.split(' - ')[0]}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-ink-black dark:text-white">Key Features:</h4>
                        <ul className="space-y-1">
                          {service.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-steel dark:text-silver">
                              <CheckCircle className="w-3 h-3 text-fernando-red shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <BookingPopupButton
                        eventSlug="consultation"
                        designName={service.title}
                        className="w-full bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange hover:opacity-90 transition-opacity text-white font-montserrat font-medium"
                        size="sm"
                      >
                        Book Consultation
                      </BookingPopupButton>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Quality Assurance Section */}
      <section className="py-16 md:py-24 bg-platinum/10 dark:bg-charcoal/20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-4 text-ink-black dark:text-white">
              Why Choose Ink 37 Tattoos
            </h2>
            <p className="text-lg text-steel dark:text-silver max-w-2xl mx-auto">
              Your safety, satisfaction, and artistic vision are our top priorities
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {qualityFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="text-center"
                >
                  <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 border-border/50 dark:border-white/10">
                    <CardContent className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-fernando-red/10 dark:bg-fernando-red/20 rounded-full flex items-center justify-center">
                        <IconComponent className="w-8 h-8 text-fernando-red" />
                      </div>
                      <h3 className="text-lg font-montserrat font-semibold text-ink-black dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-steel dark:text-silver text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-4 text-ink-black dark:text-white">
              Our Professional Process
            </h2>
            <p className="text-lg text-steel dark:text-silver max-w-2xl mx-auto">
              From initial consultation to final masterpiece, every step is designed for your comfort and satisfaction
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {processSteps.map((step, index) => {
              const IconComponent = step.icon;
              
              return (
                <motion.div
                  key={step.step}
                  variants={fadeInUp}
                  className="relative"
                >
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-fernando-red/50 to-fernando-orange/50 z-0" />
                  )}
                  
                  <Card className="relative z-10 p-6 h-full hover:shadow-lg transition-all duration-300 border-border/50 dark:border-white/10">
                    <CardContent className="space-y-4 text-center">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {step.step}
                      </div>
                      
                      <IconComponent className="w-8 h-8 mx-auto text-fernando-red" />
                      
                      <h3 className="text-lg font-montserrat font-semibold text-ink-black dark:text-white">
                        {step.title}
                      </h3>
                      
                      <p className="text-steel dark:text-silver text-sm leading-relaxed">
                        {step.description}
                      </p>
                      
                      <Badge variant="outline" className="border-fernando-red/30 text-fernando-red">
                        {step.duration}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            className="max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-white mb-6 text-balance">
              Ready to Begin Your Tattoo Journey?
            </h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed text-pretty">
              Schedule a free consultation to discuss your vision and let us create something extraordinary together. 
              Your story deserves to be told with artistic excellence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <BookingPopupButton
                  eventSlug="consultation"
                  size="icon"
                  className="!h-14 !w-auto bg-white text-fernando-red hover:bg-white/90 transition-all duration-300 font-montserrat font-semibold px-8 py-4 rounded-lg flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Free Consultation
                </BookingPopupButton>
              </motion.div>
              
              <Link href="/gallery">
                <motion.button
                  className="h-14 px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-fernando-red transition-all duration-300 rounded-lg font-montserrat font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Explore Our Portfolio
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}