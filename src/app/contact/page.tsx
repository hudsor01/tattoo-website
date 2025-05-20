'use client';

import React from 'react';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import ContactForm from '@/components/ContactForm';
import EmailLink from '@/emails/EmailLink';
import { motion } from 'framer-motion';
import { Mail, Instagram, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
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
    <>
      <Header />

      <main className="bg-tattoo-black pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Title */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Get In Touch</h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              Have questions? Ready to schedule a consultation? Reach out today.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form Section */}
            <motion.div
              className="lg:col-span-2 order-2 lg:order-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 shadow-xl p-6 md:p-8 h-full flex flex-col">
                <h2 className="text-2xl font-bold text-tattoo-white mb-6 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-3 text-tattoo-red"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Send Me a Message
                </h2>

                <p className="text-white/80 text-sm mb-6">
                  Have a question or want to discuss a custom tattoo design? Fill out the form below
                  and I&apos;ll get back to you as soon as possible.
                </p>

                <div className="flex-grow">
                  <ContactForm />
                </div>

                {/* Map Section */}
                <div className="mt-10 flex-grow flex flex-col">
                  <h3 className="text-lg font-semibold text-tattoo-white mb-3 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 text-tattoo-red"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Dallas/Fort Worth Service Area
                  </h3>
                  <div className="rounded-lg overflow-hidden border border-white/10 flex-grow min-h-[400px]">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d429075.9665754567!2d-97.20349820211339!3d32.81140281693915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864c19f77b45974b%3A0xb9ec9ba4f647678f!2sDallas-Fort%20Worth%20Metroplex%2C%20TX!5e0!3m2!1sen!2sus!4v1714578896054!5m2!1sen!2sus"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Dallas-Fort Worth Metroplex Map"
                    ></iframe>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Info Section */}
            <motion.div
              className="order-1 lg:order-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 shadow-xl p-6 md:p-8 h-full flex flex-col">
                <h2 className="text-2xl font-bold text-tattoo-white mb-6 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-3 text-tattoo-red"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                  Contact Information
                </h2>

                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-tattoo-red/20 flex items-center justify-center text-tattoo-red mr-4">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-tattoo-white mb-1">Email</h3>
                      <EmailLink
                        email="fennyg83@gmail.com"
                        className="text-tattoo-white/70 hover:text-tattoo-red transition-colors"
                        showIcon
                      >
                        Get in touch via email
                      </EmailLink>
                      <p className="text-xs text-tattoo-white/50 mt-1">
                        Response time: 24-48 hours
                      </p>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center text-white mr-4">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-tattoo-white mb-1">Instagram</h3>
                      <a
                        href="https://instagram.com/fennyg83"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-tattoo-white/70 hover:text-tattoo-red transition-colors"
                      >
                        @fennyg83
                      </a>
                      <p className="text-xs text-tattoo-white/50 mt-1">Follow for latest artwork</p>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-tattoo-red/20 flex items-center justify-center text-tattoo-red mr-4">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-tattoo-white mb-1">
                        Working Hours
                      </h3>
                      <p className="text-tattoo-white/70">By appointment only</p>
                      <p className="text-xs text-tattoo-white/50 mt-1">
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
                      <h3 className="text-lg font-semibold text-tattoo-white mb-1">Location</h3>
                      <p className="text-tattoo-white/70">Dallas/Fort Worth metroplex</p>
                      <p className="text-xs text-tattoo-white/50 mt-1">
                        Exact location details shared after booking confirmation
                      </p>
                    </div>
                  </div>
                </div>

                {/* Book Button */}
                <div className="mt-8 mb-6">
                  <a
                    href="/booking"
                    className="block text-center py-3 px-6 rounded-lg bg-tattoo-red hover:bg-tattoo-red/90 text-white font-medium transition-colors"
                  >
                    Book a Consultation
                  </a>
                </div>

                {/* FAQ Section */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-tattoo-white mb-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 text-tattoo-red"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <path d="M12 17h.01" />
                    </svg>
                    Quick FAQs
                  </h3>

                  <div className="space-y-4">
                    {faqItems.map((faq, index) => (
                      <motion.div
                        key={index}
                        className="bg-tattoo-black/30 border border-white/10 rounded-md p-4 hover:border-tattoo-red/30 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <h4 className="font-medium text-white mb-1.5 text-sm flex items-center">
                          <span className="w-5 h-5 rounded-full bg-tattoo-red/20 flex items-center justify-center text-tattoo-red mr-2 text-xs">
                            Q
                          </span>
                          {faq.question}
                        </h4>
                        <p className="text-white/70 text-xs pl-7">{faq.answer}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 text-center">
                    <a
                      href="/faq"
                      className="text-tattoo-red hover:text-tattoo-red/80 text-sm font-medium"
                    >
                      View all FAQs
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
