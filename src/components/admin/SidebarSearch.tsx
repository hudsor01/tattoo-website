'use client';

import * as React from 'react';
import { useCallback } from 'react';
import { Search, X, Command, Users, Calendar, CreditCard, Settings, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  path: string;
  category: 'navigation' | 'action' | 'setting' | 'customer' | 'booking';
  icon: typeof Search;
  keywords?: string[];
}

const searchData: SearchResult[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'View overview and analytics',
    path: '/admin',
    category: 'navigation',
    icon: Command,
    keywords: ['overview', 'analytics', 'stats', 'metrics'],
  },
  {
    id: 'bookings',
    title: 'Bookings',
    description: 'Manage appointment bookings',
    path: '/admin/bookings',
    category: 'navigation',
    icon: Calendar,
    keywords: ['appointments', 'schedule', 'calendar'],
  },
  {
    id: 'appointments',
    title: 'Appointments',
    description: 'View and manage appointments',
    path: '/admin/appointments',
    category: 'navigation',
    icon: Calendar,
    keywords: ['bookings', 'schedule', 'calendar', 'meetings'],
  },
  {
    id: 'customers',
    title: 'Customers',
    description: 'Manage customer database',
    path: '/admin/customers',
    category: 'navigation',
    icon: Users,
    keywords: ['clients', 'contacts', 'people', 'database'],
  },
  {
    id: 'gallery',
    title: 'Gallery',
    description: 'Manage tattoo gallery',
    path: '/admin/gallery',
    category: 'navigation',
    icon: Image,
    keywords: ['photos', 'images', 'portfolio', 'tattoos', 'designs'],
  },
  {
    id: 'payments',
    title: 'Payments',
    description: 'View payment history and invoices',
    path: '/admin/payments',
    category: 'navigation',
    icon: CreditCard,
    keywords: ['invoices', 'billing', 'money', 'transactions'],
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'System configuration',
    path: '/admin/settings',
    category: 'setting',
    icon: Settings,
    keywords: ['config', 'preferences', 'options'],
  },
  {
    id: 'setup',
    title: 'Setup',
    description: 'Initial system setup',
    path: '/admin/setup',
    category: 'setting',
    icon: Settings,
    keywords: ['configuration', 'install', 'initialize'],
  },
];

const categoryLabels = {
  navigation: 'Pages',
  action: 'Actions',
  setting: 'Settings',
  customer: 'Customers',
  booking: 'Bookings',
};

const categoryColors = {
  navigation: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  action: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  setting: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  customer: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  booking: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

export function SidebarSearch() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const router = useRouter();

  const handleSelect = useCallback(
    (result: SearchResult) => {
      router.push(result.path);
      setIsOpen(false);
      setQuery('');
    },
    [router]
  );

  // Search functionality
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const searchQuery = query.toLowerCase().trim();
    const filtered = searchData.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(searchQuery);
      const descriptionMatch = item.description.toLowerCase().includes(searchQuery);
      const keywordMatch = item.keywords?.some((keyword) => keyword.includes(searchQuery));

      return titleMatch || descriptionMatch || keywordMatch;
    });

    // Sort by relevance (title matches first, then description, then keywords)
    filtered.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(searchQuery);
      const bTitle = b.title.toLowerCase().includes(searchQuery);

      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;

      return a.title.localeCompare(b.title);
    });

    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        // Open search with Cmd/Ctrl + K
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          setQuery('');
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev === 0 ? results.length - 1 : prev - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelect]);

  const groupedResults = results.reduce(
    (acc, result) => {
      if (!result?.category) return acc;
      const category = result.category;
      acc[category] ??= [];
      acc[category].push(result);
      return acc;
    },
    {} as Record<string, SearchResult[]>
  );

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="w-full justify-start text-muted-foreground hover:text-foreground"
      >
        <Search className="h-4 w-4 mr-2" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Search Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg"
            >
              <Card className="p-0 shadow-lg border">
                {/* Search Input */}
                <div className="flex items-center border-b px-3">
                  <Search className="h-4 w-4 text-muted-foreground mr-3" />
                  <Input
                    ref={(el) => el?.focus()}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search admin panel..."
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Search Results */}
                <div className="max-h-80 overflow-y-auto">
                  {query && results.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No results found for "{query}"
                    </div>
                  ) : query && results.length > 0 ? (
                    <div className="p-2">
                      {Object.entries(groupedResults).map(([category, items]) => (
                        <div key={category} className="mb-4 last:mb-0">
                          <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {categoryLabels[category as keyof typeof categoryLabels]}
                          </h3>
                          <div className="space-y-1">
                            {items.map((result) => {
                              const globalIndex = results.findIndex((r) => r.id === result.id);
                              const isSelected = globalIndex === selectedIndex;
                              const Icon = result.icon;

                              return (
                                <motion.button
                                  key={result.id}
                                  onClick={() => handleSelect(result)}
                                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors ${
                                    isSelected
                                      ? 'bg-accent text-accent-foreground'
                                      : 'hover:bg-accent/50'
                                  }`}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Icon className="h-4 w-4 text-muted-foreground" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm">{result.title}</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {result.description}
                                    </div>
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${categoryColors[result.category]}`}
                                  >
                                    {categoryLabels[result.category]}
                                  </Badge>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="text-sm text-muted-foreground mb-2">Quick actions:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {searchData.slice(0, 6).map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelect(item)}
                              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent text-left transition-colors"
                            >
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{item.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <kbd className="h-5 w-5 bg-muted rounded flex items-center justify-center font-mono">
                          ↑
                        </kbd>
                        <kbd className="h-5 w-5 bg-muted rounded flex items-center justify-center font-mono">
                          ↓
                        </kbd>
                        to navigate
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="h-5 bg-muted rounded px-1.5 font-mono">enter</kbd>
                        to select
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <kbd className="h-5 bg-muted rounded px-1.5 font-mono">esc</kbd>
                      to close
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
