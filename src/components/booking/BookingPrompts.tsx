'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { BookNowButton } from '@/components/ui/BookNowButton';
import { Calendar, Clock, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingPromptProps {
  variant?: 'inline' | 'banner' | 'card' | 'hero' | 'sticky' | 'modal';
  title?: string;
  description?: string;
  className?: string;
  showStats?: boolean;
  context?: 'gallery' | 'services' | 'about' | 'general';
}

export function BookingPrompt({
  variant = 'inline',
  title = 'Ready to Get Inked?',
  description = 'Book your consultation today and let\'s create something amazing together.',
  className,
  showStats = false,
  context = 'general',
}: BookingPromptProps) {
  const stats = [
    { icon: Users, label: '500+ Happy Clients', value: '500+' },
    { icon: Star, label: '5-Star Reviews', value: '5.0' },
    { icon: Clock, label: 'Same Week Availability', value: 'Fast' },
  ];

  const contextualMessages = {
    gallery: {
      title: 'Love What You See?',
      description: 'Let\'s create your custom tattoo. Book a free consultation to discuss your ideas.',
    },
    services: {
      title: 'Found Your Style?',
      description: 'Schedule your appointment and bring your vision to life.',
    },
    about: {
      title: 'Let\'s Work Together',
      description: 'Book your session with our experienced artists.',
    },
    general: {
      title,
      description,
    },
  };

  const message = contextualMessages[context];

  if (variant === 'inline') {
    return (
      <div className={cn('text-center py-8', className)}>
        <h3 className="text-2xl font-bold mb-3">{message.title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {message.description}
        </p>
        <BookNowButton size="lg" />
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'bg-fernando-gradient/10 border border-primary/20 rounded-lg p-6 md:p-8',
          className
        )}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">{message.title}</h3>
            <p className="text-muted-foreground">{message.description}</p>
          </div>
          <BookNowButton size="lg" className="shrink-0" />
        </div>
        
        {showStats && (
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-primary/10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <div className="absolute inset-0 bg-fernando-gradient/5" />
        <CardContent className="relative p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{message.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {message.description}
              </p>
              <BookNowButton size="sm" fullWidth />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={cn('relative overflow-hidden rounded-2xl', className)}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/images/traditional.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 p-8 md:p-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{message.title}</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              {message.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BookNowButton size="lg">
                Book Consultation
              </BookNowButton>
              <BookNowButton size="lg" variant="outline">
                View Services
              </BookNowButton>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (variant === 'sticky') {
    return (
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t z-40',
          'md:hidden', // Mobile only
          className
        )}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium text-sm">{message.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {message.description}
              </p>
            </div>
            <BookNowButton size="sm" />
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}

// Section booking prompt for use between content sections
export function SectionBookingPrompt({ 
  className,
  ...props 
}: BookingPromptProps) {
  return (
    <section className={cn('py-16 px-4', className)}>
      <div className="container mx-auto max-w-4xl">
        <BookingPrompt variant="banner" showStats {...props} />
      </div>
    </section>
  );
}

// Floating prompt that appears after scrolling
export function ScrollTriggeredBookingPrompt() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      
      // Show after 50% scroll, hide if dismissed
      if (scrollPercentage > 50 && !hasBeenDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasBeenDismissed]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="fixed bottom-20 right-4 z-50 max-w-sm"
        >
          <Card className="shadow-lg border-primary/20">
            <CardContent className="p-4">
              <button
                onClick={() => {
                  setIsVisible(false);
                  setHasBeenDismissed(true);
                }}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm mb-1">
                    Limited Availability
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Book now to secure your spot this month
                  </p>
                  <BookNowButton size="sm" fullWidth />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
