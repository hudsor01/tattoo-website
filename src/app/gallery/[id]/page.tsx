/**
 * Gallery Design Detail Page
 * 
 * Real implementation that fetches tattoo design data directly from the database
 * using Prisma and displays detailed information about a specific design.
 */
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { getBuildSafeTattooDesigns, getBuildSafeTattooDesign, getFallbackGalleryMetadata } from '@/lib/db/build-safe-prisma';
import { DesignDetail } from '@/components/gallery/DesignDetail';
import { DesignDetailSkeleton } from '@/components/gallery/DesignDetailSkeleton';
import type { Metadata } from 'next';

// Enable static generation with revalidation every 6 hours
export const revalidate = 21600;

// Generate static paths for all approved designs with build-time safety
export async function generateStaticParams() {
  const designs = await getBuildSafeTattooDesigns({
    where: { isApproved: true },
    select: { id: true },
    take: 100,
    orderBy: { createdAt: 'desc' },
    fallback: [] // Empty array allows dynamic generation at runtime
  });
  
  console.warn(`Generated ${Array.isArray(designs) ? designs.length : 0} static params for gallery`);
  return Array.isArray(designs) ? designs.map((design: unknown) => ({
  id: (design as { id: string }).id
  })) : [];}

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata for SEO with build-time safety
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
const { id } = await params;
const design = await getBuildSafeTattooDesign(id, {
select: {
name: true,
description: true,
thumbnailUrl: true,
designType: true,
Artist: {
include: {
User: {
select: {
name: true,
}
}
}
}
},
fallback: null
}) as {
name: string;
description?: string;
thumbnailUrl?: string;
designType?: string;
Artist?: {
User?: {
name?: string;
};
};
} | null;

if (!design) {
// Return fallback metadata if design not found or database unavailable
return getFallbackGalleryMetadata(id);
}

const artistName = design.Artist?.User?.name ?? 'Ink 37 Artist';
const title = `${design.name} by ${artistName} | Ink 37 Tattoo Gallery`;
const description = design.description ?? `View this ${design.designType ?? 'tattoo'} design by ${artistName}. Professional tattoo art and custom designs.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: design.thumbnailUrl ? [
        {
          url: design.thumbnailUrl,
          width: 800,
          height: 600,
          alt: design.name,
        }
      ] : [],
      type: 'article',
      siteName: 'Ink 37 Tattoo Gallery',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: design.thumbnailUrl ? [design.thumbnailUrl] : [],
    },
    keywords: [
      'tattoo',
      'tattoo design',
      design.designType,
      'custom tattoo',
      'tattoo art',
      'ink 37',
      artistName,
    ].filter(Boolean) as string[],
  };
}

// Server component that fetches real data
export default async function DesignDetailPage({ params }: PageProps) {
  const { id } = await params;
  let design;
  
  try {
    // Fetch the design with all related data
    design = await prisma.tattooDesign.findUnique({
      where: { id },
      include: {
        Artist: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              }
            }
          }
        },
        Customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    // If design doesn't exist, return 404
    if (!design) {
      notFound();
    }

    // Check if design is approved for public viewing
    // Only approved designs or designs viewed by authorized users should be visible
    if (!design.isApproved) {
      // Check user authentication and authorization
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          // Not authenticated - can't view unapproved design
          notFound();
        }

        // Check if user is admin or the design owner
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const isAdmin = profile?.role === 'admin' || profile?.role === 'artist';
        const isOwner = design.Customer?.email === user.email;

        if (!isAdmin && !isOwner) {
          // User is not authorized to view this unapproved design
          notFound();
        }
      } catch (error) {
        void console.error('Error checking user authorization:', error);
        notFound();
      }
    }

  } catch (error) {
    void console.error('Error fetching design:', error);
    notFound();
  }

  // Get related designs from the same artist
  const relatedDesigns = await prisma.tattooDesign.findMany({
    where: {
      artistId: design.artistId,
      isApproved: true,
      id: { not: design.id }, // Exclude current design
    },
    take: 6,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      thumbnailUrl: true,
      designType: true,
      createdAt: true,
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<DesignDetailSkeleton />}>
          <DesignDetail 
            id={id} 
          />
        </Suspense>
        
        {/* Related Designs Section */}
        {relatedDesigns.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              More from {design.Artist?.User?.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedDesigns.map((related) => (
                <a
                  key={related.id}
                  href={`/gallery/${related.id}`}
                  className="group block bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {related.thumbnailUrl ? (
                      <img
                        src={related.thumbnailUrl}
                        alt={related.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 group-hover:text-tattoo-blue transition-colors">
                      {related.name}
                    </h3>
                    {related.designType && (
                      <p className="text-sm text-gray-500 mt-1">
                        {related.designType}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(related.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <a href="/" className="hover:text-gray-700 transition-colors">
              Home
            </a>
            <span>/</span>
            <a href="/gallery" className="hover:text-gray-700 transition-colors">
              Gallery
            </a>
            <span>/</span>
            <span className="text-gray-900 font-medium">{design.name}</span>
          </nav>
        </div>

        {/* Schema.org structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              "name": design.name,
              "description": design.description,
              "image": design.thumbnailUrl,
              "creator": {
                "@type": "Person",
                "name": design.Artist?.User?.name,
              },
              "dateCreated": design.createdAt,
              "genre": design.designType,
              "isPartOf": {
                "@type": "WebSite",
                "name": "Ink 37 Tattoo Gallery",
                "url": "https://ink37.com"
              }
            })
          }}
        />
      </div>
    </div>
  );
}