'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { EnhancedErrorBoundary } from '@/components/error/enhanced-error-boundary';

interface Design {
  id: string;
  title: string;
  imageUrl: string;
  status: 'draft' | 'approved' | 'completed';
  createdAt: string;
  artist: string;
}

interface TattooDesignViewerProps {
  designs?: Design[];
}

const defaultDesigns: Design[] = [
  {
    id: '1',
    title: 'Japanese Dragon Sleeve',
    imageUrl: '/images/gallery/IMG_3534.JPG',
    status: 'approved',
    createdAt: '2025-03-15',
    artist: 'Fernando'
  },
  {
    id: '2',
    title: 'Custom Rose Design',
    imageUrl: '/images/gallery/IMG_2889.JPG',
    status: 'draft',
    createdAt: '2025-04-02',
    artist: 'Fernando'
  },
  {
    id: '3',
    title: 'Geometric Mandala',
    imageUrl: '/images/gallery/IMG_3896.JPG',
    status: 'completed',
    createdAt: '2025-02-10',
    artist: 'Fernando'
  }
];

/**
 * Content component for the tattoo design viewer
 * Extracted to be wrapped with error boundary
 */
const TattooDesignViewerContent: React.FC<TattooDesignViewerProps> = ({ designs = defaultDesigns }) => {
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  
  const statusColors = {
    draft: 'bg-yellow-500',
    approved: 'bg-green-500',
    completed: 'bg-blue-500'
  };
  
  const statusText = {
    draft: 'Under Review',
    approved: 'Ready for Appointment',
    completed: 'Tattooed'
  };
  
  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-red-500">Your Tattoo Designs</h2>
      
      {selectedDesign ? (
        <div className="mb-8">
          <button 
            onClick={() => setSelectedDesign(null)}
            className="mb-4 px-4 py-2 text-sm bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            ← Back to All Designs
          </button>
          
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="relative h-80 w-full">
              <Image
                src={selectedDesign.imageUrl}
                alt={selectedDesign.title}
                fill
                sizes="100vw"
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{selectedDesign.title}</h3>
                <span className={`${statusColors[selectedDesign.status]} px-3 py-1 text-xs text-white rounded-full`}>
                  {statusText[selectedDesign.status]}
                </span>
              </div>
              <div className="text-gray-400 space-y-2">
                <p><span className="text-gray-500">Created:</span> {selectedDesign.createdAt}</p>
                <p><span className="text-gray-500">Artist:</span> {selectedDesign.artist}</p>
              </div>
              
              {selectedDesign.status === 'approved' && (
                <div className="mt-6">
                  <button className="w-full py-3 bg-red-600 text-white rounded hover:bg-red-700">
                    Book Appointment for This Design
                  </button>
                </div>
              )}
              
              {selectedDesign.status === 'draft' && (
                <div className="mt-6 bg-gray-800 p-4 rounded text-gray-300 text-sm">
                  <p>This design is currently under review by the artist. You'll receive a notification when it's ready for approval.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map(design => (
            <div 
              key={design.id}
              className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition transform hover:scale-105"
              onClick={() => setSelectedDesign(design)}
            >
              <div className="relative h-48">
                <Image
                  src={design.imageUrl}
                  alt={design.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{design.title}</h3>
                  <span className={`${statusColors[design.status]} px-2 py-1 text-xs text-white rounded-full`}>
                    {statusText[design.status]}
                  </span>
                </div>
                <p className="text-sm text-gray-400">Created: {design.createdAt}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * TattooDesignViewer component with error boundary
 * Displays tattoo designs with their details and status
 */
const TattooDesignViewer: React.FC<TattooDesignViewerProps> = (props) => {
  return (
    <EnhancedErrorBoundary
      componentName="TattooDesignViewer"
      title="Unable to load tattoo designs"
      description="We're having trouble displaying your tattoo designs. Please refresh the page to try again."
      showToast={true}
      severity="high"
    >
      <TattooDesignViewerContent {...props} />
    </EnhancedErrorBoundary>
  );
};

export default TattooDesignViewer;