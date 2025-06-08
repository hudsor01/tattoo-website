/**
 * Gallery Design Detail Page
 *
 * Displays detailed information about tattoo designs and reference images.
 * This includes both completed tattoo work and customer reference images
 * uploaded through contact forms for consultation purposes.
 */
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Image as ImageIcon } from 'lucide-react';
import { prisma } from '@/lib/db/prisma';
import { logger } from "@/lib/logger";
import {
  getBuildSafeTattooDesigns,
  getBuildSafeTattooDesign,
  getFallbackGalleryMetadata,
} from '@/lib/db/build-safe-prisma';
import { DesignDetail } from '@/components/gallery/DesignDetail';
import { DesignDetailSkeleton } from '@/components/gallery/DesignDetailSkeleton';
import type { Metadata } from 'next';


type PageProps = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

// Enable static generation with revalidation every 6 hours
export const revalidate = 21600;

// Generate static paths for all designs with build-time safety
export async function generateStaticParams() {
  const designs = await getBuildSafeTattooDesigns({
    where: {},
    select: { id: true },
    take: 100,
    orderBy: { createdAt: 'desc' },
    fallback: [], // Empty array allows dynamic generation at runtime
  });

  void logger.warn(
    `Generated ${Array.isArray(designs) ? designs.length : 0} static params for gallery`
  );
  return Array.isArray(designs)
    ? designs.map((design) => ({
        id: (design as { id: string }).id,
      }))
    : [];
}

// Generate metadata for SEO with build-time safety
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params;
  const design = (await getBuildSafeTattooDesign(id, {
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
            },
          },
        },
      },
    },
    fallback: null,
  })) as Partial<GalleryDesign> | null;

  if (!design) {
    return getFallbackGalleryMetadata(id);
  }

  const artistName = design.artistName ?? 'Ink 37 Artist';
  const title = `${design.name} by ${artistName} | Ink 37 Tattoo Gallery`;
  const description =
    design.description ??
    `View this ${design.designType ?? 'tattoo'} design by ${artistName}. Professional tattoo art and custom designs.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: design.thumbnailUrl
        ? [
            {
              url: design.thumbnailUrl,
              width: 800,
              height: 600,
              alt: design.name,
            },
          ]
        : [],
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

// Import required types
import type { TattooDesign } from '@prisma/client';
type GalleryDesign = TattooDesign;

// Server component that fetches design data
export default async function DesignDetailPage({ params }: PageProps) {
  const { id } = params;
  let design: GalleryDesign | null = null;

  try {
    // Fetch the design with basic data
    design = await prisma.tattooDesign.findUnique({
      where: { id },
    });

    // If design doesn't exist, return 404
    if (!design) {
      notFound();
    }
  } catch (error) {
    void logger.error('Error fetching design:', error);
    notFound();
  }

  // Get related designs from the same artist
  const relatedDesigns: {
    id: string;
    name: string;
    thumbnailUrl: string | null;
    designType: string | null;
    createdAt: Date;
  }[] = await prisma.tattooDesign.findMany({
    where: {
      artistId: design.artistId,
      id: { not: design.id },
    },
    take: 6,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      thumbnailUrl: true,
      designType: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<DesignDetailSkeleton />}>
          <DesignDetail id={id} />
        </Suspense>

        {/* Related Designs Section */}
        {relatedDesigns.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              More from this collection
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
                        className="w-full h-full group-hover:scale-105 transition-transform duration-300 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 group-hover:text-tattoo-blue transition-colors">
                      {related.name}
                    </h3>
                    {related.designType && (
                      <p className="text-sm text-gray-500 mt-1">{related.designType}</p>
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
              '@context': 'https://schema.org',
              '@type': 'CreativeWork',
              name: design.name,
              description: design.description,
              image: design.thumbnailUrl,
              creator: {
                '@type': 'Person',
                name: design.artistName ?? 'Ink 37 Artist',
              },
              dateCreated: design.createdAt,
              genre: design.designType,
              isPartOf: {
                '@type': 'Website',
                name: 'Ink 37 Tattoos Gallery',
                url: 'https://ink37tattoos.com',
              },
            }),
          }}
        />
      </div>
    </div>
  );
}
