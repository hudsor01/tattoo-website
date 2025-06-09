'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { generateBreadcrumbStructuredData } from '@/lib/seo/structured-data';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function BreadcrumbNavigation({ items, className = '' }: BreadcrumbNavigationProps) {
  const breadcrumbs = [
    { name: 'Home', url: 'https://ink37tattoos.com' },
    ...items.map(item => ({ name: item.name, url: `https://ink37tattoos.com${item.href}` }))
  ];

  const structuredData = generateBreadcrumbStructuredData(breadcrumbs);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Visual Breadcrumb Navigation */}
      <nav 
        aria-label="Breadcrumb navigation"
        className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}
      >
        <Link 
          href="/"
          className="flex items-center hover:text-primary transition-colors"
          aria-label="Return to homepage"
        >
          <Home className="w-4 h-4" />
          <span className="sr-only">Home</span>
        </Link>
        
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-2" aria-hidden="true" />
            {index === items.length - 1 ? (
              <span 
                className="text-foreground font-medium"
                aria-current="page"
              >
                {item.name}
              </span>
            ) : (
              <Link 
                href={item.href}
                className="hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}