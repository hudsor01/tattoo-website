'use client';

import React, { useRef, Fragment } from 'react';
import { motion, useInView } from 'framer-motion';
import { Brush, User, Star, Shield, Clock, Sparkles } from 'lucide-react';

// Feature data
const features = [
  {
    icon: Brush,
    title: "Custom Designs",
    description: "Every tattoo is a unique creation tailored to your vision and story."
  },
  {
    icon: User,
    title: "Personal Experience",
    description: "One-on-one sessions in a comfortable, private studio environment."
  },
  {
    icon: Star,
    title: "Quality Art",
    description: "Detailed, high-quality tattoos with exceptional line work and shading."
  },
  {
    icon: Shield,
    title: "Safe & Clean",
    description: "Fully licensed and sterilized equipment for your health and safety."
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Appointments scheduled to fit your calendar and needs."
  },
  {
    icon: Sparkles,
    title: "Artistic Vision",
    description: "Turning your ideas into beautiful, wearable art that lasts a lifetime."
  }
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function HomeFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-12"
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4 text-white"
            variants={itemVariants}
          >
            Why Choose Ink 37
          </motion.h2>
          <motion.p 
            className="text-lg text-white/70 max-w-xl mx-auto"
            variants={itemVariants}
          >
            Experience tattoo artistry that combines technical excellence with personal attention.
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300"
              variants={itemVariants}
            >
              <div className="flex items-start gap-4">
                <div className="bg-tattoo-red/20 text-tattoo-red p-3 rounded-lg">
                  <feature.icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
