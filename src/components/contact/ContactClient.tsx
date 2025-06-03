'use client';

import React from 'react';
import ContactForm from '@/components/contact/ContactForm';
import { motion } from '@/components/performance/LazyMotion';
import { Mail, Instagram, MapPin, Clock, ChevronRight, Phone, Info, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Footer from '@/components/layouts/Footer';
import { TikTokIcon } from '@/components/icons';

export default function ContactClient() {
  // Animation variants matching the design system
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0,
      },
    },
  };

  // FAQ items for the contact page
  const faqItems = [
    {
      question: 'How much does a tattoo cost?',
      answer:
        'Pricing depends on size, detail, and placement. Small pieces start at $100. For an accurate quote, contact me with your design idea.',
    },
    {
      question: "What's your availability like?",
      answer:
        "I'm usually booked 2-3 weeks out. Contact me early for your preferred date. Consultations are scheduled within 1 week.",
    },
    {
      question: 'Do you do cover-ups?',
      answer:
        'Yes, I specialize in cover-ups. Send me a photo of your existing tattoo to discuss possibilities.',
    },
  ];

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Page Title */}
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInUp}
        >
          <h1 className="heading-large gradient-text-muted mb-4">Get In Touch</h1>
          <p className="paragraph-medium max-w-2xl mx-auto mb-6">
            Have questions? Ready to schedule a consultation? Reach out today.
          </p>
          <motion.div
            className="h-1 w-24 mx-auto bg-linear-to-r from-red-500 via-orange-500 to-amber-500"
            variants={fadeInUp}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form Section */}
          <motion.div
            className="lg:col-span-2 order-2 lg:order-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 shadow-xl p-6 md:p-8 h-full flex flex-col">
              <h2 className="heading-small mb-6 flex items-center text-white">
              <Phone className="mr-3 text-tattoo-red" size={24} />
              Send Me a Message
              </h2>

              <p className="paragraph-small mb-6">
                Have a question or want to discuss a custom tattoo design? Fill out the form below
                and I&apos;ll get back to you as soon as possible.
              </p>

              <div className="flex-grow">
                <ContactForm />
              </div>

              {/* Map Section */}
              <div className="mt-10 flex-grow flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <MapPin className="mr-2 text-tattoo-red" size={20} />
                Dallas/Fort Worth Service Area
                </h3>
                <div className="rounded-lg overflow-hidden border border-white/10 flex-grow min-h-[400px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d429075.96657545672d-97.203498202113393d32.811402816939152m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.13m3!1m2!1s0x864c19f77b45974b%3A0xb9ec9ba4f647678f!2sDallas-Fort%20Worth%20Metroplex%2C%20TX!5e0!3m2!1sen!2sus!4v1714578896054!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Dallas-Fort Worth Metroplex Map"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Info Section */}
          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 shadow-xl p-6 md:p-8 h-full flex flex-col">
              <h2 className="heading-small mb-6 flex items-center text-white">
              <Info className="mr-3 text-tattoo-red" size={24} />
              Contact Information
              </h2>

              <div className="space-y-6">
                {/* Social Links */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Connect With Me</h3>
                  <div className="flex items-center space-x-6">
                    {/* Email */}
                    <motion.a
                      href="mailto:fennyg83@gmail.com"
                      className="w-16 h-16 rounded-full bg-linear-to-r from-red-500/20 to-orange-500/20 flex items-center justify-center text-red-400 hover:text-white transition-colors border border-red-500/30 hover:border-red-400"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Send Email"
                    >
                      <Mail className="w-7 h-7" />
                    </motion.a>

                    {/* Instagram */}
                    <motion.a
                      href="https://instagram.com/fennyg83"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-16 h-16 rounded-full bg-linear-to-tr from-purple-600/20 via-pink-500/20 to-orange-400/20 flex items-center justify-center text-pink-400 hover:text-white transition-colors border border-pink-500/30 hover:border-pink-400"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Follow on Instagram"
                    >
                      <Instagram className="w-7 h-7" />
                    </motion.a>

                    {/* TikTok */}
                    <motion.a
                      href="https://tiktok.com/@fennyg83"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-16 h-16 rounded-full bg-linear-to-r from-black/40 to-red-500/20 flex items-center justify-center text-white hover:text-red-400 transition-colors border border-white/20 hover:border-red-400"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Follow on TikTok"
                    >
                      <TikTokIcon className="w-7 h-7" />
                    </motion.a>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-tattoo-red/20 flex items-center justify-center text-tattoo-red mr-4">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Working Hours</h3>
                    <p className="text-white/70">By appointment only</p>
                    <p className="text-xs text-white/50 mt-1">
                      Flexible scheduling for your convenience
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-tattoo-red/20 flex items-center justify-center text-tattoo-red mr-4">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Location</h3>
                    <p className="text-white/70">Dallas/Fort Worth metroplex</p>
                    <p className="text-xs text-white/50 mt-1">
                      Exact location details shared after booking confirmation
                    </p>
                  </div>
                </div>
              </div>

              {/* Book Button */}
              <motion.div className="mt-8 mb-6" variants={fadeInUp}>
                <Button
                  asChild
                  className="w-full bg-linear-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-600 hover:to-amber-600 hover:scale-105 transition-all duration-300 group"
                >
                  <Link href="/booking" className="flex items-center justify-center">
                    Book a Consultation
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>

              {/* FAQ Section */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <HelpCircle className="mr-2 text-tattoo-red" size={20} />
                Quick FAQs
                </h3>

                <motion.div
                  className="space-y-5"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {faqItems.map((faq) => (
                    <motion.div
                      key={faq.question}
                      className="bg-black/30 border border-white/10 rounded-lg p-6 hover:border-red-500/30 transition-colors"
                      variants={fadeInUp}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h4 className="font-medium text-white mb-3 text-base flex items-center">
                        <span className="w-7 h-7 rounded-full bg-linear-to-r from-red-500/20 to-orange-500/20 flex items-center justify-center text-red-400 mr-3 text-sm font-semibold">
                          Q
                        </span>
                        {faq.question}
                      </h4>
                      <p className="text-white/70 text-sm pl-10 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  ))}
                </motion.div>

                <div className="mt-4 text-center">
                  <a href="/faq" className="text-red-400 hover:text-red-300 text-sm font-medium">
                    View all FAQs
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Closing CTA Section */}
        <motion.section
          className="py-16 mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
        >
          <div className="bg-linear-to-br from-tattoo-black to-tattoo-black/90 rounded-2xl border border-tattoo-red/20 shadow-xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h2
                className="text-2xl md:text-3xl font-bold text-white mb-4"
                variants={fadeInUp}
              >
                Ready to Bring Your Vision to Life?
              </motion.h2>
              <motion.p className="text-white/80 mb-8" variants={fadeInUp}>
                Whether you have a clear design in mind or need help developing your concept, I'm
                here to guide you through every step of the tattoo process.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp}>
                  <Button
                    size="lg"
                    asChild
                    className="bg-linear-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-600 hover:to-amber-600 group"
                  >
                    <Link href="/booking" className="inline-flex items-center">
                      Book a Consultation
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="relative border-2 border-red-500 bg-linear-to-r from-var(--color-red-500)/10 via-var(--color-orange-500)/10 to-var(--color-amber-500)/10 text-white hover:bg-linear-to-r hover:from-var(--color-red-500)/20 hover:via-var(--color-orange-500)/20 hover:to-var(--color-amber-500)/20 hover:scale-105 transition-all duration-300 group overflow-hidden"
                  >
                    <Link href="/gallery" className="inline-flex items-center relative z-10">
                      <span className="bg-linear-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent font-semibold">
                        View My Gallery
                      </span>
                      <ChevronRight className="ml-2 h-4 w-4 text-amber-400 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-linear-to-r from-red-500/5 via-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </motion.div>
      <Footer />
    </div>
  );
}
