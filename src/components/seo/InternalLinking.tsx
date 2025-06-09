'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InternalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
  priority?: 'high' | 'medium' | 'low';
  context?: string;
}

interface RelatedContentProps {
  title: string;
  links: Array<{
    title: string;
    href: string;
    description?: string;
    priority?: 'high' | 'medium' | 'low';
  }>;
  className?: string;
}

/**
 * SEO-optimized internal link component
 */
export function InternalLink({ 
  href, 
  children, 
  className,
  showIcon = false,
  priority = 'medium',
  context
}: InternalLinkProps) {
  // Add analytics tracking for internal link clicks
  const handleClick = () => {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
      gtag?.('event', 'internal_link_click', {
        link_text: typeof children === 'string' ? children : href,
        link_url: href,
        link_priority: priority,
        link_context: context
      });
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline',
        priority === 'high' && 'font-semibold',
        className
      )}
    >
      {children}
      {showIcon && (
        <ArrowRight className="ml-1 h-3 w-3" />
      )}
    </Link>
  );
}

/**
 * Related content section for SEO
 */
export function RelatedContent({ title, links, className }: RelatedContentProps) {
  return (
    <section className={cn('mt-12 p-6 bg-muted/50 rounded-lg', className)}>
      <h3 className="text-xl font-semibold mb-4 text-foreground">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((link, index) => (
          <div key={index} className="space-y-2">
            <InternalLink
              href={link.href}
              priority={link.priority}
              context="related_content"
              className="text-base font-medium"
              showIcon
            >
              {link.title}
            </InternalLink>
            {link.description && (
              <p className="text-sm text-muted-foreground">
                {link.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Service cross-promotion component
 */
export function ServiceCrossPromotion() {
  const services = [
    {
      title: 'Custom Tattoo Design',
      href: '/services#custom-design',
      description: 'Unique designs created specifically for you',
      priority: 'high' as const
    },
    {
      title: 'Cover-up Tattoos',
      href: '/services#cover-ups',
      description: 'Transform existing tattoos with expert cover-up work',
      priority: 'high' as const
    },
    {
      title: 'Traditional Tattoos',
      href: '/services#traditional',
      description: 'Classic American traditional style tattoos',
      priority: 'medium' as const
    },
    {
      title: 'Japanese Tattoos',
      href: '/services#japanese',
      description: 'Authentic Japanese tattoo artistry and irezumi',
      priority: 'medium' as const
    }
  ];

  return (
    <RelatedContent
      title="Explore Our Tattoo Services"
      links={services}
      className="my-8"
    />
  );
}

/**
 * Location-based internal linking
 */
export function LocationLinks() {
  const locations = [
    {
      title: 'Serving Crowley, TX',
      href: '/locations/crowley',
      description: 'Our home base in Crowley, Texas - convenient parking and comfortable atmosphere',
      priority: 'high' as const
    },
    {
      title: 'Fort Worth Area Clients',
      href: '/locations/fort-worth',
      description: 'Serving Fort Worth and surrounding Tarrant County areas',
      priority: 'high' as const
    },
    {
      title: 'Burleson Tattoo Services',
      href: '/locations/burleson',
      description: 'Professional tattoo services for Burleson, TX residents',
      priority: 'medium' as const
    },
    {
      title: 'DFW Metroplex Coverage',
      href: '/locations/dfw',
      description: 'Tattoo services throughout the Dallas-Fort Worth metroplex',
      priority: 'medium' as const
    }
  ];

  return (
    <RelatedContent
      title="Service Areas"
      links={locations}
      className="my-8"
    />
  );
}

/**
 * Gallery navigation component
 */
export function GalleryNavigation() {
  const galleryCategories = [
    {
      title: 'Traditional Tattoo Gallery',
      href: '/gallery?category=traditional',
      description: 'Bold, classic American traditional tattoo designs',
      priority: 'high' as const
    },
    {
      title: 'Japanese Tattoo Portfolio',
      href: '/gallery?category=japanese',
      description: 'Authentic Japanese style tattoos and sleeve work',
      priority: 'high' as const
    },
    {
      title: 'Realistic Tattoo Examples',
      href: '/gallery?category=realistic',
      description: 'Photorealistic portraits and detailed artwork',
      priority: 'medium' as const
    },
    {
      title: 'Cover-up Transformations',
      href: '/gallery?category=coverups',
      description: 'Before and after examples of expert cover-up work',
      priority: 'medium' as const
    }
  ];

  return (
    <RelatedContent
      title="Browse Our Tattoo Gallery"
      links={galleryCategories}
      className="my-8"
    />
  );
}

/**
 * Call-to-action internal links
 */
export function CTALinks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
      {/* Primary CTA */}
      <div className="bg-fernando-gradient text-white p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-2">Ready to Get Started?</h3>
        <p className="mb-4 opacity-90">
          Schedule your free consultation to discuss your tattoo ideas.
        </p>
        <InternalLink
          href="/book-consultation"
          priority="high"
          context="cta_primary"
          className="inline-flex items-center bg-white text-black px-4 py-2 rounded font-medium hover:bg-gray-100 no-underline"
        >
          Book Consultation
          <ArrowRight className="ml-2 h-4 w-4" />
        </InternalLink>
      </div>

      {/* Secondary CTA */}
      <div className="bg-muted p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-2">Explore Our Work</h3>
        <p className="mb-4 text-muted-foreground">
          Browse our portfolio to see examples of our tattoo artistry.
        </p>
        <InternalLink
          href="/gallery"
          priority="medium"
          context="cta_secondary"
          className="inline-flex items-center text-primary font-medium"
          showIcon
        >
          View Gallery
        </InternalLink>
      </div>
    </div>
  );
}

/**
 * Contextual linking based on current page
 */
export function ContextualLinks({ currentPage }: { currentPage: string }) {
  const getContextualLinks = (page: string) => {
    switch (page) {
      case 'home':
        return [
          { title: 'View Our Gallery', href: '/gallery', priority: 'high' as const },
          { title: 'Our Services', href: '/services', priority: 'high' as const },
          { title: 'Book Consultation', href: '/book-consultation', priority: 'high' as const },
          { title: 'About Fernando', href: '/about', priority: 'medium' as const }
        ];
      case 'gallery':
        return [
          { title: 'Book Your Tattoo', href: '/book-consultation', priority: 'high' as const },
          { title: 'Our Services', href: '/services', priority: 'medium' as const },
          { title: 'FAQ', href: '/faq', priority: 'medium' as const },
          { title: 'Contact Us', href: '/contact', priority: 'low' as const }
        ];
      case 'services':
        return [
          { title: 'See Our Work', href: '/gallery', priority: 'high' as const },
          { title: 'Schedule Consultation', href: '/book-consultation', priority: 'high' as const },
          { title: 'Pricing Info', href: '/faq#pricing', priority: 'medium' as const },
          { title: 'About Our Process', href: '/about', priority: 'medium' as const }
        ];
      default:
        return [
          { title: 'Home', href: '/', priority: 'medium' as const },
          { title: 'Gallery', href: '/gallery', priority: 'medium' as const },
          { title: 'Services', href: '/services', priority: 'medium' as const },
          { title: 'Contact', href: '/contact', priority: 'medium' as const }
        ];
    }
  };

  const links = getContextualLinks(currentPage);

  return (
    <nav className="flex flex-wrap gap-4 mb-8">
      {links.map((link, index) => (
        <InternalLink
          key={index}
          href={link.href}
          priority={link.priority}
          context={`contextual_${currentPage}`}
          className="text-sm"
        >
          {link.title}
        </InternalLink>
      ))}
    </nav>
  );
}

/**
 * Footer internal links for SEO
 */
export function FooterInternalLinks() {
  const sections = [
    {
      title: 'Services',
      links: [
        { title: 'Custom Tattoos', href: '/services#custom' },
        { title: 'Traditional Tattoos', href: '/services#traditional' },
        { title: 'Cover-ups', href: '/services#coverups' },
        { title: 'Japanese Tattoos', href: '/services#japanese' }
      ]
    },
    {
      title: 'Locations',
      links: [
        { title: 'Crowley, TX', href: '/locations/crowley' },
        { title: 'Fort Worth Area', href: '/locations/fort-worth' },
        { title: 'Burleson, TX', href: '/locations/burleson' },
        { title: 'DFW Service Area', href: '/locations/dfw' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { title: 'FAQ', href: '/faq' },
        { title: 'Gallery', href: '/gallery' },
        { title: 'About', href: '/about' },
        { title: 'Contact', href: '/contact' }
      ]
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
      {sections.map((section, index) => (
        <div key={index}>
          <h4 className="font-semibold mb-3 text-foreground">{section.title}</h4>
          <ul className="space-y-2">
            {section.links.map((link, linkIndex) => (
              <li key={linkIndex}>
                <InternalLink
                  href={link.href}
                  context="footer"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.title}
                </InternalLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}