import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { GalleryFilesResponse } from '@/lib/prisma-types';

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const imagesDir = path.join(publicDir, 'images');
    const videosDir = path.join(publicDir, 'videos');

    // Read image files
    const imageFiles = fs.existsSync(imagesDir) 
      ? fs.readdirSync(imagesDir)
          .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
          .map(file => ({
            id: `img-${file.split('.')[0]}`,
            type: 'image' as const,
            src: `/images/${file}`,
            name: (file.split('.')[0] ?? file).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: `Tattoo artwork by Fernando Govea`,
            designType: 'Custom',
            size: 'Medium'
          }))
      : [];

    // Read video files
    const videoFiles = fs.existsSync(videosDir)
      ? fs.readdirSync(videosDir)
          .filter(file => /\.(mp4|mov|webm)$/i.test(file))
          .map(file => ({
            id: `vid-${file.split('.')[0]}`,
            type: 'video' as const,
            src: `/videos/${file}`,
            name: (file.split('.')[0] ?? file).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: `Tattoo process video by Fernando Govea`,
            designType: 'Process',
            size: 'Large'
          }))
      : [];

    const allFiles = [...imageFiles, ...videoFiles];

    const response: GalleryFilesResponse = {
      success: true,
      files: allFiles,
      total: allFiles.length
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Failed to read gallery files:', error);
    const errorResponse: Partial<GalleryFilesResponse> = {
      success: false,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}