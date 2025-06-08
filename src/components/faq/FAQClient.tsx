'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Clock, DollarSign, Palette } from 'lucide-react';
import Footer from '@/components/layouts/Footer';

const faqData = [
  {
    category: 'General Questions',
    icon: <HelpCircle className="h-5 w-5" />,
    items: [
      {
        question: 'What are your working hours?',
        answer: 'I work by appointment only, which allows me to provide dedicated attention to each client. This flexible scheduling means I can accommodate various time preferences based on availability.'
      },
      {
        question: 'Where are you located?',
        answer: "I'm based in the Dallas/Fort Worth area. The exact location details will be shared with you after your booking is confirmed. I have created a comfortable, private space that feels more like a home than a typical tattoo shop."
      },
      {
        question: 'How do I book an appointment?',
        answer: 'You can book an appointment through our online booking system powered by Cal.com. Simply select your preferred time, and I\'ll confirm your appointment within 24 hours.'
      }
    ]
  },
  {
    category: 'Pricing & Payment',
    icon: <DollarSign className="h-5 w-5" />,
    items: [
      {
        question: 'How much do tattoos cost?',
        answer: 'Pricing varies based on size, complexity, and placement. I provide detailed quotes after our consultation where we discuss your design ideas. I believe in transparent pricing with no hidden fees.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'I accept cash, credit/debit cards, and digital payments. A deposit is required to secure your appointment, which goes toward your final tattoo cost.'
      },
      {
        question: 'Do you offer payment plans?',
        answer: 'For larger pieces, I can work with you on a payment plan. We can discuss options during your consultation to make your dream tattoo accessible.'
      }
    ]
  },
  {
    category: 'Tattoo Process',
    icon: <Palette className="h-5 w-5" />,
    items: [
      {
        question: 'How long does a tattoo take?',
        answer: 'Session length depends on the size and complexity of your design. Small tattoos may take 1-2 hours, while larger pieces could require multiple sessions over several hours each.'
      },
      {
        question: 'Does it hurt?',
        answer: 'Pain tolerance varies by person and tattoo location. I use high-quality equipment and techniques to minimize discomfort. Most clients find the experience very manageable.'
      },
      {
        question: 'What should I expect during my first tattoo?',
        answer: 'We\'ll start with a consultation to discuss your design, placement, and any concerns. I\'ll walk you through the entire process so you feel comfortable and informed every step of the way.'
      }
    ]
  },
  {
    category: 'Aftercare',
    icon: <Clock className="h-5 w-5" />,
    items: [
      {
        question: 'How do I care for my new tattoo?',
        answer: 'I provide detailed aftercare instructions with every tattoo. This includes keeping it clean, applying recommended ointments, and avoiding certain activities during the healing process.'
      },
      {
        question: 'How long does healing take?',
        answer: 'Initial healing typically takes 2-3 weeks, with complete healing occurring over 2-3 months. Following proper aftercare ensures the best results and vibrant colors.'
      },
      {
        question: 'When can I swim or exercise?',
        answer: 'Avoid swimming, hot tubs, and intensive exercise for at least 2-3 weeks. Light exercise is usually fine after the first week, but listen to your body and follow the aftercare guidelines.'
      }
    ]
  }
];

export default function FAQClient() {
  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
        <div className="container mx-auto px-6 py-16 pt-24">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Everything you need to know about the tattoo experience at Ink 37
            </p>
          </motion.div>

          {/* FAQ Categories */}
          <div className="max-w-4xl mx-auto space-y-12">
            {faqData.map((category, categoryIndex) => (
              <motion.section
                key={category.category}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                className="space-y-6"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-fernando-gradient/10 flex items-center justify-center text-fernando-red">
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{category.category}</h2>
                </div>

                {/* FAQ Items */}
                <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                  <Accordion type="single" collapsible className="w-full">
                    {category.items.map((item, itemIndex) => (
                      <AccordionItem 
                        key={`${categoryIndex}-${itemIndex}`} 
                        value={`item-${categoryIndex}-${itemIndex}`}
                        className="border-white/10"
                      >
                        <AccordionTrigger className="px-6 py-4 text-left hover:text-red-400 transition-colors">
                          <span className="font-medium">{item.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          <p className="text-white/80 leading-relaxed">{item.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </motion.section>
            ))}
          </div>

          {/* Contact CTA */}
          <motion.section
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-fernando-gradient/10 rounded-2xl border border-fernando-red/20 p-8">
              <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
              <p className="text-white/80 mb-6">
                I'm here to help! Feel free to reach out with any questions about your tattoo journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="bg-fernando-gradient hover:bg-fernando-gradient-hover text-white font-semibold px-6 py-3 rounded-lg transition-all"
                >
                  Contact Me
                </a>
                <a
                  href="/booking"
                  className="border border-fernando-red text-fernando-red hover:bg-fernando-gradient/10 font-semibold px-6 py-3 rounded-lg transition-all"
                >
                  Book Consultation
                </a>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
      <Footer />
    </>
  );
}