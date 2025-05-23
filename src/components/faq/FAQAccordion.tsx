'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import type { FAQAccordionProps } from '@/types/component-types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function FAQAccordion({ items }: FAQAccordionProps) {
  // Track which questions have received feedback
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean | null>>({});

  // Function to handle feedback
  const handleFeedback = (index: number, isHelpful: boolean) => {
    setFeedbackGiven(prev => ({
      ...prev,
      [index]: isHelpful,
    }));
  };

  // Find related questions (simplified implementation)
  const getRelatedQuestions = (currentIndex: number) => {
    // This is a simple implementation - in a real app, you might use tags or categories
    // to determine truly related questions
    const allQuestions = items.map(item => item.question);
    const filtered = allQuestions.filter((_, idx) => idx !== currentIndex).slice(0, 2);
    return filtered;
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, index) => {
        const relatedQuestions = getRelatedQuestions(index);
        const hasFeedback = feedbackGiven[index] !== null;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <AccordionItem value={`item-${index}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p className="text-white/80 leading-relaxed">{item.answer}</p>

                  {/* Related questions section */}
                  {relatedQuestions.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-tattoo-white/10">
                      <h4 className="text-sm font-medium text-tattoo-white mb-2 flex items-center">
                        <MessageCircle className="h-4 w-4 mr-2 text-tattoo-blue" />
                        Related Questions
                      </h4>
                      <ul className="space-y-2">
                        {relatedQuestions.map((question, idx) => (
                          <li key={idx} className="pl-6 relative">
                            <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-tattoo-blue/40"></div>
                            <button
                              className="text-sm text-tattoo-blue hover:text-tattoo-red transition-colors duration-200 text-left"
                              onClick={() => {
                                // Find the accordion item with this question and open it
                                const questionIndex = items.findIndex(
                                  item => item.question === question,
                                );
                                if (questionIndex >= 0) {
                                  document.getElementById(`item-${questionIndex}`)?.click();
                                }
                              }}
                            >
                              {question}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Feedback section */}
                  <div className="mt-4 pt-4 border-t border-tattoo-white/10">
                    {!hasFeedback ? (
                      <div className="flex flex-wrap items-center justify-between">
                        <p className="text-sm text-white/60">Was this answer helpful?</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleFeedback(index, true)}
                            className="flex items-center px-3 py-1.5 text-xs bg-tattoo-blue/10 hover:bg-tattoo-blue/20 text-white rounded-full transition"
                          >
                            <ThumbsUp className="h-3 w-3 mr-1.5" />
                            Yes
                          </button>
                          <button
                            onClick={() => handleFeedback(index, false)}
                            className="flex items-center px-3 py-1.5 text-xs bg-tattoo-black/30 hover:bg-tattoo-black/50 text-white rounded-full transition"
                          >
                            <ThumbsDown className="h-3 w-3 mr-1.5" />
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-white/60 p-3 rounded-lg bg-tattoo-blue/5 border border-tattoo-blue/10">
                        {feedbackGiven[index] ? (
                          <p className="flex items-center">
                            <ThumbsUp className="h-3.5 w-3.5 mr-2 text-tattoo-blue" />
                            Thanks for your feedback! We&apos;re glad this was helpful.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <p className="flex items-center">
                              <ThumbsDown className="h-3.5 w-3.5 mr-2 text-tattoo-red" />
                              Sorry this wasn't helpful. Need more information?
                            </p>
                            <Button variant="default" size="sm" asChild className="mt-2">
                              <Link href="/contact" >Contact Me</Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        );
      })}
    </Accordion>
  );
}
