'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookingPopupButton } from '@/components/booking/BookingPopupButton';
import { 
  ArrowRight, 
  Calendar, 
  Heart, 
  Shield, 
  Star, 
  Users, 
  Award,
  Clock,
  Target,
  Brush,
  Palette,
  Sparkles,
  CheckCircle,
  Eye,
  MapPin,
  Trophy,
  Zap
} from 'lucide-react';
import Footer from '@/components/layouts/Footer';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

// Fernando's journey milestones
const journeyMilestones = [
  {
    year: '2013',
    title: 'Artistic Foundation',
    description: 'Began apprenticeship under master tattoo artists, learning traditional techniques and developing artistic vision',
    icon: Brush
  },
  {
    year: '2016',
    title: 'Professional Recognition',
    description: 'Established reputation for detailed custom work and client relationships in the Dallas tattoo community',
    icon: Award
  },
  {
    year: '2020',
    title: 'Ink 37 Founded',
    description: 'Opened Ink 37 Tattoos, creating a premium studio focused on artistic excellence and client experience',
    icon: Star
  },
  {
    year: '2024',
    title: 'Master Craftsman',
    description: 'Now recognized as one of DFW\'s premier custom tattoo artists with 1000+ completed pieces',
    icon: Trophy
  }
];

// Core specializations
const specializations = [
  {
    icon: Eye,
    title: 'Photorealistic Portraits',
    description: 'Master-level skill in creating lifelike portraits that capture every detail and emotion',
    expertise: '95%'
  },
  {
    icon: Palette,
    title: 'Custom Design Work',
    description: 'Collaborative design process turning your vision into unique, meaningful artwork',
    expertise: '98%'
  },
  {
    icon: Sparkles,
    title: 'Cover-Up Transformations',
    description: 'Strategic redesign and execution to transform unwanted tattoos into beautiful new art',
    expertise: '90%'
  },
  {
    icon: Target,
    title: 'Traditional Styles',
    description: 'Authentic American and Japanese traditional work with bold lines and vibrant colors',
    expertise: '92%'
  }
];

export default function AboutClient() {
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
              Professional Tattoo Artist
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-montserrat font-bold mb-6 leading-tight text-balance">
              <span className="text-ink-black dark:text-white">
                About
              </span>
              <br />
              <span className="bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange bg-clip-text text-transparent">
                Fernando Govea
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-steel dark:text-silver max-w-3xl mx-auto mb-8 leading-relaxed text-pretty">
              Discover the journey of a passionate artist dedicated to transforming visions into 
              timeless body art. With over a decade of experience, Fernando Govea has established 
              Ink 37 as Dallas-Fort Worth's premier destination for custom tattoo artistry.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BookingPopupButton
                eventSlug="consultation"
                size="lg"
                className="bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange hover:opacity-90 transition-opacity text-white font-montserrat font-semibold px-8 py-4"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Meet with Fernando
              </BookingPopupButton>
              
              <Link href="/gallery">
                <motion.button
                  className="px-8 py-4 border-2 border-fernando-red text-fernando-red hover:bg-fernando-red hover:text-white transition-all duration-300 rounded-lg font-montserrat font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View His Work
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Artist Story Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div className="relative group" variants={fadeInUp}>
              <Card className="overflow-hidden border-border/50 dark:border-white/10 shadow-xl rounded-xl">
                <div className="relative h-[500px] md:h-[600px]">
                  <Image
                    src="/images/traditional.jpg"
                    alt="Fernando Govea - Master Tattoo Artist and Founder of Ink 37 Tattoos"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    quality={95}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8">
                    <Card className="bg-black/80 backdrop-blur-md border-white/20 shadow-2xl rounded-lg">
                      <CardContent className="p-5 md:p-6">
                        <h3 className="text-xl md:text-2xl font-montserrat font-bold text-white mb-1.5">Fernando Govea</h3>
                        <p className="text-white/90 text-sm md:text-base mb-1">Master Tattoo Artist & Founder</p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-fernando-red text-white text-xs">10+ Years</Badge>
                          <Badge className="bg-fernando-orange text-white text-xs">1000+ Pieces</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </Card>
            </motion.div>
            
            <motion.div className="space-y-8" variants={fadeInUp}>
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-montserrat font-bold mb-6 text-ink-black dark:text-white text-balance">
                  A Legacy Built on 
                  <span className="bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange bg-clip-text text-transparent block">
                    Passion & Precision
                  </span>
                </h2>
                <div className="space-y-5 text-steel dark:text-silver text-base md:text-lg leading-relaxed">
                  <p className="text-pretty">
                    At Ink 37, Fernando has cultivated more than just a tattoo studio—he's created a sanctuary 
                    where artistic vision flourishes and meaningful connections are forged. His unwavering mission 
                    is to provide exceptional custom tattoo services that honor both the art form and the individual story.
                  </p>
                  <p className="text-pretty">
                    With over a decade of dedicated practice, Fernando has established Ink 37 as a testament to 
                    meticulous attention to detail, uncompromising safety standards, and the art of building 
                    genuine, lasting relationships with every client who trusts him with their vision.
                  </p>
                  <p className="text-pretty">
                    When you choose Fernando and Ink 37, you're not merely acquiring a tattoo—you're partnering 
                    with an artist who invests time to deeply understand your vision, collaborating closely to 
                    bring it to life with unparalleled precision and artistic integrity.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <BookingPopupButton
                  eventSlug="consultation"
                  className="bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange hover:opacity-90 transition-opacity text-white font-montserrat font-semibold px-6 py-3"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Consultation
                </BookingPopupButton>
                
                <Link href="/gallery">
                  <motion.button
                    className="px-6 py-3 border-2 border-fernando-red text-fernando-red hover:bg-fernando-red hover:text-white transition-all duration-300 rounded-lg font-montserrat font-semibold flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Portfolio
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Journey Timeline Section */}
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
              Fernando's Artistic Journey
            </h2>
            <p className="text-lg text-steel dark:text-silver max-w-2xl mx-auto">
              Over a decade of growth, learning, and mastering the craft of tattooing
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {journeyMilestones.map((milestone, index) => {
              const IconComponent = milestone.icon;
              
              return (
                <motion.div
                  key={milestone.year}
                  variants={fadeInUp}
                  className="relative"
                >
                  {index < journeyMilestones.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-fernando-red/50 to-fernando-orange/50 z-0" />
                  )}
                  
                  <Card className="relative z-10 p-6 h-full hover:shadow-lg transition-all duration-300 border-border/50 dark:border-white/10">
                    <CardContent className="space-y-4 text-center">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange rounded-full flex items-center justify-center">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      
                      <Badge className="bg-fernando-red/10 text-fernando-red border-fernando-red/20">
                        {milestone.year}
                      </Badge>
                      
                      <h3 className="text-lg font-montserrat font-semibold text-ink-black dark:text-white">
                        {milestone.title}
                      </h3>
                      
                      <p className="text-steel dark:text-silver text-sm leading-relaxed text-pretty">
                        {milestone.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Specializations Section */}
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
              Artistic Specializations
            </h2>
            <p className="text-lg text-steel dark:text-silver max-w-2xl mx-auto">
              Master-level expertise across diverse tattoo styles and techniques
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {specializations.map((spec, index) => {
              const IconComponent = spec.icon;
              
              return (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 border-border/50 dark:border-white/10 group">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-fernando-red/10 dark:bg-fernando-red/20 rounded-full flex items-center justify-center group-hover:bg-fernando-red/20 dark:group-hover:bg-fernando-red/30 transition-colors">
                          <IconComponent className="w-6 h-6 text-fernando-red" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-montserrat font-bold text-ink-black dark:text-white">
                            {spec.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-sm text-steel dark:text-silver">Expertise:</div>
                            <Badge className="bg-fernando-red text-white text-xs">{spec.expertise}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-steel dark:text-silver leading-relaxed text-pretty">
                        {spec.description}
                      </p>
                      
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-ink-black dark:text-white">Skill Level</span>
                          <span className="text-sm text-fernando-red font-semibold">{spec.expertise}</span>
                        </div>
                        <div className="w-full bg-platinum/20 dark:bg-charcoal/40 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-fernando-red to-fernando-orange h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: spec.expertise }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Achievement Stats Section */}
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
              Fernando's Proven Excellence
            </h2>
            <p className="text-lg text-steel dark:text-silver max-w-2xl mx-auto">
              Numbers that reflect a decade of dedication to the craft and client satisfaction
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <Card className="border-border/50 dark:border-white/10 bg-gradient-to-br from-white via-white/95 to-platinum/20 dark:from-ink-black dark:via-charcoal/95 dark:to-charcoal/20 shadow-xl rounded-xl">
              <CardContent className="p-10 md:p-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 text-center">
                  {[
                    { 
                      number: '10+', 
                      label: 'Years Mastering the Craft', 
                      icon: Clock,
                      color: 'from-fernando-red to-fernando-orange'
                    },
                    { 
                      number: '1000+', 
                      label: 'Custom Pieces Created', 
                      icon: Brush,
                      color: 'from-fernando-orange-red to-fernando-orange'
                    },
                    { 
                      number: '500+', 
                      label: 'Satisfied Clients', 
                      icon: Users,
                      color: 'from-fernando-red to-fernando-orange-red'
                    },
                    { 
                      number: '98%', 
                      label: 'Client Return Rate', 
                      icon: Heart,
                      color: 'from-fernando-orange to-fernando-red'
                    }
                  ].map((stat, index) => {
                    const IconComponent = stat.icon;
                    
                    return (
                      <motion.div
                        key={index}
                        variants={fadeInUp}
                        className="group"
                      >
                        <div className="space-y-4">
                          <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                          <div className={`text-4xl md:text-5xl font-montserrat font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent tracking-tight`}>
                            {stat.number}
                          </div>
                          <div className="text-steel dark:text-silver font-medium text-sm md:text-base leading-tight">
                            {stat.label}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Philosophy & Values Section */}
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
              Core Values & Philosophy
            </h2>
            <p className="text-lg text-steel dark:text-silver max-w-2xl mx-auto">
              The principles that guide every interaction and ensure exceptional experiences
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                icon: Star,
                title: 'Artistic Excellence',
                description: 'Dedicated to creating high-quality tattoo art that stands the test of time, focusing on detail, composition, and masterful execution.',
                features: ['Master-level technique', 'Attention to detail', 'Timeless designs']
              },
              {
                icon: Users,
                title: 'Personal Connection', 
                description: 'Building genuine relationships with clients, taking time to understand your vision, story, and the personal meaning behind your tattoo.',
                features: ['One-on-one consultation', 'Active listening', 'Collaborative design']
              },
              {
                icon: Shield,
                title: 'Safety & Comfort',
                description: 'Your safety and comfort are paramount. Maintaining the highest standards of cleanliness and following all health regulations.',
                features: ['Sterile environment', 'Medical-grade equipment', 'Licensed & insured']
              }
            ].map((value, index) => {
              const IconComponent = value.icon;
              
              return (
                <motion.div key={index} variants={fadeInUp} className="h-full">
                  <Card className="h-full text-center p-6 md:p-8 border-border/50 dark:border-white/10 hover:shadow-xl hover:border-fernando-red/30 transition-all duration-300 group">
                    <CardContent className="space-y-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="h-10 w-10 text-white" />
                      </div>
                      
                      <h3 className="text-xl md:text-2xl font-montserrat font-bold text-ink-black dark:text-white group-hover:text-fernando-red transition-colors">
                        {value.title}
                      </h3>
                      
                      <p className="text-steel dark:text-silver text-sm md:text-base leading-relaxed">
                        {value.description}
                      </p>
                      
                      <div className="space-y-2">
                        {value.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center justify-center gap-2 text-sm text-steel dark:text-silver">
                            <CheckCircle className="w-3 h-3 text-fernando-red shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Studio Location & CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Card className="relative overflow-hidden border-border/50 dark:border-white/10">
              <div className="absolute inset-0">
                <Image
                  src="/images/services/neon-sign.jpg"
                  alt="Ink 37 Tattoos Studio - Professional Tattoo Environment in Dallas Fort Worth"
                  fill
                  className="object-cover opacity-10"
                  sizes="100vw"
                  quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 to-white/90 dark:from-ink-black/95 dark:to-ink-black/90" />
              </div>
              <CardContent className="relative p-10 md:p-16 text-center">
                <div className="max-w-4xl mx-auto">
                  <div className="w-16 h-16 mx-auto mb-8 bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange rounded-full flex items-center justify-center">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-montserrat font-bold mb-6">
                    <span className="bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange bg-clip-text text-transparent">
                      Ready to Begin
                    </span>
                    <br />
                    <span className="text-ink-black dark:text-white">
                      Your Tattoo Journey?
                    </span>
                  </h2>
                  
                  <p className="text-steel dark:text-silver text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
                    Let Fernando bring your vision to life with exceptional artistry and attention to detail. 
                    Schedule a consultation to discuss your ideas and begin creating your unique piece of art 
                    in the heart of the Dallas-Fort Worth metroplex.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12">
                    <BookingPopupButton
                      eventSlug="consultation"
                      size="lg"
                      className="bg-gradient-to-r from-fernando-red via-fernando-orange-red to-fernando-orange hover:opacity-90 transition-opacity text-white font-montserrat font-semibold px-8 py-4"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Schedule Consultation
                    </BookingPopupButton>
                    
                    <Link href="/gallery">
                      <motion.button
                        className="px-8 py-4 border-2 border-fernando-red text-fernando-red hover:bg-fernando-red hover:text-white transition-all duration-300 rounded-lg font-montserrat font-semibold flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        View Fernando's Portfolio
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </Link>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8 border-t border-border/30 dark:border-white/10">
                    <div className="flex items-center gap-2 text-steel dark:text-silver">
                      <MapPin className="w-4 h-4 text-fernando-red" />
                      <span className="text-sm font-medium">Dallas/Fort Worth Metroplex</span>
                    </div>
                    <div className="flex items-center gap-2 text-steel dark:text-silver">
                      <Zap className="w-4 h-4 text-fernando-red" />
                      <span className="text-sm font-medium">10+ Years Professional Experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-steel dark:text-silver">
                      <Award className="w-4 h-4 text-fernando-red" />
                      <span className="text-sm font-medium">Licensed & Insured Studio</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
