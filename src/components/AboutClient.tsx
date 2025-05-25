'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Footer from '@/components/layouts/Footer';

// Animation variants - matching gallery's animations
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 0.8, 
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0
    }
  }
};

// AboutClient component
export default function AboutClient() {
  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
        <div className="w-full max-w-none px-6 py-16 pt-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h1 className="heading-large gradient-text-muted mb-4">
            About Ink 37
          </h1>
          <p className="paragraph-medium max-w-2xl mx-auto">
            Discover the story behind our studio and the passion that drives our art
          </p>
          <motion.div 
            className="mt-8 h-1 w-24 mx-auto bg-gradient-to-r from-red-500 via-orange-500 to-amber-500"
            variants={fadeInUp}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            className="relative h-[500px] rounded-xl overflow-hidden shadow-xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={imageVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/images/traditional.jpg"
              alt="Fernando, Tattoo Artist at Ink 37"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 p-4 bg-black/40 backdrop-blur-sm rounded-lg max-w-xs">
              <p className="text-lg font-bold text-white">Fernando Govea</p>
              <p className="text-white/80 text-sm">Tattoo Artist & Studio Owner</p>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="heading-medium mb-6 text-white" 
              variants={fadeInUp}
            >
              A Studio Built on Passion
            </motion.h2>
            
            <motion.div className="space-y-6" variants={staggerContainer}>
              <motion.p 
                className="paragraph-medium" 
                variants={fadeInUp}
              >
                At Ink 37, I have created more than just a tattoo studio. I've built a
                comfortable, home-like environment where artistic vision thrives. Our mission is to
                provide exceptional custom tattoo services in the Dallas/Fort Worth metroplex,
                focusing on creating meaningful art that tells your story.
              </motion.p>

              <motion.p 
                className="paragraph-medium" 
                variants={fadeInUp}
              >
                Founded by Fernando, a passionate tattoo artist with over 10 years of experience,
                our studio prides itself on attention to detail, cleanliness, and building genuine
                connections with our customers. We believe that the tattoo experience should be as
                memorable as the art itself.
              </motion.p>

              <motion.p 
                className="paragraph-medium" 
                variants={fadeInUp}
              >
                When you walk through our doors, you are not just another customer, you are part of
                the Ink 37 family. We take the time to understand your vision and work
                collaboratively to bring it to life on your skin.
              </motion.p>
            </motion.div>

            <motion.div 
              className="pt-6 flex justify-center" 
              variants={fadeInUp}
            >
              <Button 
                asChild 
                variant="default" 
                className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-600 hover:to-amber-600 shadow-lg group"
              >
                <Link href="/booking" className="flex items-center">
                  Book a Consultation
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Studio Values Section */}
        <section className="py-16 mt-12">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">Our Studio Values</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              The principles that guide our work and ensure an exceptional experience
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
                title: "Artistic Excellence",
                description: "We are dedicated to creating high-quality tattoo art that stands the test of time, focusing on detail, composition, and execution."
              },
              {
                title: "Personal Connection",
                description: "We believe in building genuine relationships with our clients, taking the time to understand your vision and story."
              },
              {
                title: "Safe Environment",
                description: "Your safety and comfort are paramount. We maintain the highest standards of cleanliness and follow all health regulations."
              }
            ].map((value, index) => (
              <motion.div 
                key={index}
                className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-orange-500/30 transition-colors shadow-lg"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                <p className="text-white/70">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Closing CTA Section */}
        <motion.section 
          className="py-16 mt-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
        >
          <div className="bg-gradient-to-br from-tattoo-black to-tattoo-black/90 rounded-2xl border border-tattoo-red/20 shadow-xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h2 
                className="text-2xl md:text-3xl font-bold text-white mb-4"
                variants={fadeInUp}
              >
                Ready to Start Your Tattoo Journey with Ink 37?
              </motion.h2>
              <motion.p 
                className="text-white/80 mb-8"
                variants={fadeInUp}
              >
                I am committed to creating a tattoo that you will love for years to come. Let's discuss your ideas and create something unique together.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp}>
                  <Button size="lg" asChild className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-600 hover:to-amber-600 group">
                    <Link href="/booking" className="inline-flex items-center">
                      Book a Consultation
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>
                
                <motion.div variants={fadeInUp}>
                  <Button variant="outline" size="lg" asChild className="relative border-2 border-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 text-white hover:from-red-500/20 hover:via-orange-500/20 hover:to-amber-500/20 hover:scale-105 transition-all duration-300 group overflow-hidden">
                    <Link href="/gallery" className="inline-flex items-center relative z-10">
                      <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent font-semibold">
                        View My Gallery
                      </span>
                      <ChevronRight className="ml-2 h-4 w-4 text-amber-400 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>
        </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}