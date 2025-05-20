'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Footer from '@/components/layouts/Footer';
import { ChevronRight } from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for smoother animation
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
      delayChildren: 0.3
    }
  }
};

// AboutClient component
export default function AboutClient() {
  return (
    <>
      <main className="bg-tattoo-black min-h-screen">
        <section id="about" className="py-16 md:py-24 bg-gradient-to-b from-tattoo-black to-tattoo-black/90">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                About <span className="text-tattoo-red">Ink 37</span>
              </h1>
              <p className="text-white/70 max-w-2xl mx-auto text-lg">
                Discover the story behind our studio and the passion that drives our art
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <motion.div
                className="relative h-[500px] rounded-xl overflow-hidden shadow-2xl"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={imageVariants}
              >
                <Image
                  src="/images/fernando-tattoo-artist.jpg"
                  alt="Fernando, Tattoo Artist at Ink 37"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-tattoo-black to-transparent opacity-60" />
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
                  className="text-3xl font-bold text-white mb-6" 
                  variants={fadeInUp}
                >
                  A Studio Built on Passion
                </motion.h2>
                
                <motion.div className="space-y-6" variants={staggerContainer}>
                  <motion.p 
                    className="text-white/80 text-lg leading-relaxed" 
                    variants={fadeInUp}
                  >
                    At Ink 37, I have created more than just a tattoo studio. I've built a
                    comfortable, home-like environment where artistic vision thrives. Our mission is to
                    provide exceptional custom tattoo services in the Dallas/Fort Worth metroplex,
                    focusing on creating meaningful art that tells your story.
                  </motion.p>

                  <motion.p 
                    className="text-white/80 text-lg leading-relaxed" 
                    variants={fadeInUp}
                  >
                    Founded by Fernando, a passionate tattoo artist with over 10 years of experience,
                    our studio prides itself on attention to detail, cleanliness, and building genuine
                    connections with our customers. We believe that the tattoo experience should be as
                    memorable as the art itself.
                  </motion.p>

                  <motion.p 
                    className="text-white/80 text-lg leading-relaxed" 
                    variants={fadeInUp}
                  >
                    When you walk through our doors, you are not just another customer, you are part of
                    the Ink 37 family. We take the time to understand your vision and work
                    collaboratively to bring it to life on your skin.
                  </motion.p>
                </motion.div>

                <motion.div 
                  className="pt-6" 
                  variants={fadeInUp}
                >
                  <Button 
                    asChild 
                    variant="default" 
                    className="bg-tattoo-blue hover:bg-tattoo-blue/90 shadow-lg group"
                  >
                    <Link href="/booking" className="flex items-center">
                      Book a Consultation
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Studio Values Section */}
        <section className="py-16 bg-tattoo-black/70">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold text-white mb-4">Our Studio Values</h2>
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
                  className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-tattoo-blue/30 transition-colors"
                  variants={fadeInUp}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                  <p className="text-white/70">{value.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}