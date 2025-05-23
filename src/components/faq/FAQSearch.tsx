'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, HelpCircle, ArrowRight } from 'lucide-react';
import type { FAQItemType, FAQSearchProps, FAQCategory, AllFAQItem } from '@/types/component-types';

export default function FAQSearch({ categories }: FAQSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<AllFAQItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const allFAQs: AllFAQItem[] = categories.flatMap((category: FAQCategory): AllFAQItem[] =>
    category.items.map(
      (item: FAQItemType): AllFAQItem => ({
        category: category.title,
        id: category.id,
        item,
      }),
    ),
  );

  // Search function
  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (!term.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Simple search implementation - you might want to use a more sophisticated approach
    const searchResults = allFAQs.filter(faq => {
      const questionMatch = faq.item.question.toLowerCase().includes(term.toLowerCase());
      const answerMatch = faq.item.answer.toLowerCase().includes(term.toLowerCase());
      return questionMatch || answerMatch;
    });

    setResults(searchResults);
  };

  // Highlight matching text in search results
  const highlightMatch = (text: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} className="bg-tattoo-blue/30 text-white font-medium px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  // Scroll to FAQ when clicking a search result
  const scrollToFAQ = (id: string, question: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Find the specific accordion item and expand it
      // Immediately expand accordion item
      const accordionItems = element.querySelectorAll('[data-state="closed"]');
      for (let i = 0; i < accordionItems.length; i++) {
        const trigger = accordionItems[i] as HTMLElement;
        const triggerText = trigger.textContent || '';

        if (triggerText.includes(question)) {
          trigger.click();
          break;
        }
      }
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-tattoo-blue" />
        </div>
        <input
          type="search"
          className="block w-full pl-12 pr-4 py-4 bg-tattoo-black/50 border border-tattoo-white/10 rounded-xl focus:ring-2 focus:ring-tattoo-blue focus:border-transparent text-white placeholder-white/50 transition-all duration-200"
          placeholder="Search for questions like 'pricing' or 'aftercare'..."
          value={searchTerm}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {results.length > 0 ? (
              <div>
                <p className="text-white/70 text-sm mb-2 flex items-center">
                  <span className="bg-tattoo-blue/20 text-tattoo-blue px-2 py-0.5 rounded text-xs font-medium mr-2">
                    {results.length}
                  </span>
                  results found for "{searchTerm}"
                </p>
                <div className="bg-tattoo-black/70 backdrop-blur-md rounded-xl border border-tattoo-white/10 overflow-hidden shadow-lg">
                  {results.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`p-4 hover:bg-tattoo-blue/10 transition cursor-pointer group ${
                        index < results.length - 1 ? 'border-b border-white/10' : ''
                      }`}
                      onClick={() => scrollToFAQ(result.id, result.item.question)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1 bg-tattoo-blue/10 rounded-full p-1.5">
                          <HelpCircle className="h-4 w-4 text-tattoo-blue" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-white font-medium mb-1 group-hover:text-tattoo-blue transition-colors">
                              {highlightMatch(result.item.question)}
                            </p>
                            <ArrowRight className="h-4 w-4 text-tattoo-blue opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                          </div>
                          <p className="text-white/60 text-sm line-clamp-2">
                            {highlightMatch(result.item.answer.slice(0, 120))}
                            {result.item.answer.length > 120 ? '...' : ''}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-tattoo-red/10 text-tattoo-red/80">
                              {result.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : searchTerm ? (
              <motion.div
                className="text-center py-8 px-6 bg-tattoo-black/70 backdrop-blur-md rounded-xl border border-white/10 shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4 rounded-full bg-tattoo-black/50 inline-flex items-center justify-center mb-4">
                  <HelpCircle className="h-8 w-8 text-tattoo-blue/40" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                <p className="text-white/60 mb-4 max-w-md mx-auto">
                  We couldn't find any answers matching "{searchTerm}". Try different keywords or
                  browse the categories below.
                </p>
                <div className="flex flex-wrap items-center gap-2 justify-center">
                  {categories.map((category: FAQCategory, index: number) => (
                    <a
                      key={index}
                      href={`#${category.id}`}
                      className="px-3 py-1 text-sm bg-tattoo-blue/10 hover:bg-tattoo-blue/20 text-tattoo-blue rounded-full transition flex items-center gap-1"
                    >
                      {category.title}
                    </a>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
