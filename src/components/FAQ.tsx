'use client';

import React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMinus } from 'react-icons/fa';
import type { FAQItemType } from '@/types/ui/component-types';

// FAQ data
const faqItems: FAQItemType[] = [
  {
    question: 'What is the consultation process like?',
    answer: `My consultation process is designed to be thorough and collaborative. You will meet with me to discuss your tattoo idea, placement, size, and design elements. We'll explore reference materials and talk about how to make your tattoo unique. I will provide insights on what works well for your specific idea and may sketch preliminary concepts. This is also the time to address any questions or concerns you might have before scheduling your tattoo session.`,
  },
  {
    question: 'How should I prepare for my tattoo appointment?',
    answer:
      "To prepare for your appointment: 1) Stay hydrated and avoid alcohol for 24 hours before. 2) Eat a good meal before arriving. 3) Wear comfortable, appropriate clothing that allows easy access to the tattoo area. 4) Get a good night's sleep. 5) Showering before your appointment is appreciated. 6) Consider any pain management strategies (but avoid blood thinners like aspirin). 7) Bring snacks and entertainment for longer sessions.",
  },
  {
    question: 'What is your aftercare process?',
    answer:
      'After your tattoo is complete, I will clean the area and apply a protective covering. I provide detailed written aftercare instructions, but generally: Keep the bandage on for the recommended time (usually 2-24 hours depending on the type). Wash gently with unscented soap and water. Apply a thin layer of recommended aftercare product. Avoid swimming, direct sunlight, and tight clothing on the area while healing. No picking or scratching the tattoo. I recommend scheduling a follow-up appointment for any touch-ups if needed after full healing.',
  },
  {
    question: 'How does your deposit policy work?',
    answer: `I require a non-refundable $50 deposit to secure your tattoo appointment. This deposit is applied toward your final tattoo cost. The deposit ensures commitment to the appointment and compensates for time spent preparing your custom design. Deposits are required before I can confirm and schedule your appointment. If you need to reschedule, please provide at least 48 hours notice, and your deposit will transfer to your new appointment date.`,
  },
  {
    question: 'How do you approach pricing?',
    answer:
      'My pricing is based on several factors: size, complexity, placement, amount of detail, color vs. black and grey, and estimated time needed. I do nott have fixed prices for specific designs because each tattoo is custom-created for you. After your consultation, I can provide a price range, and I will confirm the exact price before beginning work. My minimum charge is $100, and my hourly rate starts at $150, depending on the complexity.',
  },
  {
    question: 'Are there any age restrictions?',
    answer:
      'Yes, I strictly adhere to legal age requirements. All clients must be 18 years or older with valid government-issued photo ID. I do not tattoo minors even with parental consent. There is no maximum age limit, but I assess each clients skin condition to ensure it will hold ink properly. Some health conditions may affect eligibility, which I evaluate during consultation.',
  },
  {
    question: 'Do you work on cover-ups or reworks of existing tattoos?',
    answer:
      'Yes, I specialize in cover-ups and reworks. Cover-ups transform an existing tattoo into a new design, while reworks enhance or fix issues with existing tattoos. These projects require special expertise, as I work with what is already in your skin. I will evaluate your existing tattoo during consultation to determine the best approach. Cover-ups typically need to be larger and darker than the original tattoo. Please bring clear photos of your existing tattoo to your consultation so I can assess it properly.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: `I accept deposits through Cash App, Venmo, and PayPal. For final payments on the day of your appointment, I accept cash, credit/debit cards, and the same digital payment platforms used for deposits. I also offer payment plans for larger pieces that require multiple sessions.`,
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Toggle FAQ item
  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="section py-24 bg-gradient-to-b from-tattoo-black/90 to-tattoo-black"
    >
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="tattoo-section-title">Frequently Asked Questions</h2>
          <p className="tattoo-paragraph max-w-xl mx-auto">
            Here are answers to some of the most common questions I receive. If you do not see your
            question here, feel free to reach out to me directly.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              className="mb-4 border-b border-tattoo-white/10 pb-4 last:border-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <button
                className="w-full flex justify-between items-center text-left py-4 focus:outline-none"
                onClick={() => toggleItem(index)}
                aria-expanded={activeIndex === index}
              >
                <h3 className="text-xl font-semibold text-tattoo-white">{item.question}</h3>
                <span className="text-tattoo-red flex-shrink-0 ml-4">
                  {activeIndex === index ? <FaMinus /> : <FaPlus />}
                </span>
              </button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-4 text-tattoo-white/70">{item.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-lg text-tattoo-white/70 mb-6">
            Have more questions? I am happy to help!
          </p>
          <a href="/contact" className="btn btn-primary">
            Contact Me
          </a>
        </motion.div>
      </div>
    </section>
  );
}
