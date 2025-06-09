import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '@/lib/logger';
import type { GalleryFilesResponse, GalleryFile } from '@/lib/prisma-types';

// GET /api/gallery/files - Get all images and videos from filesystem
export async function GET(_request: NextRequest) {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    const videosDir = path.join(process.cwd(), 'public', 'videos');

    // Function to read files from a directory
    async function getFilesFromDirectory(dir: string, type: 'image' | 'video'): Promise<GalleryFile[]> {
      try {
        const files = await fs.readdir(dir);
        const validExtensions = type === 'image' 
          ? ['.jpg', '.jpeg', '.png', '.webp', '.gif']
          : ['.mp4', '.mov', '.webm', '.avi'];

        return files
          .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return validExtensions.includes(ext) && !file.startsWith('.');
          })
          .map((file, index) => {
            const fileName = path.parse(file).name;
            const publicPath = type === 'image' ? `/images/${file}` : `/videos/${file}`;
            
            // Generate a readable name from filename
            const displayName = fileName
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');

            // Determine design type based on filename patterns
            let designType = 'custom';
            if (fileName.includes('traditional')) designType = 'traditional';
            else if (fileName.includes('japanese')) designType = 'japanese';
            else if (fileName.includes('realism')) designType = 'realism';
            else if (fileName.includes('cover')) designType = 'cover-up';
            else if (fileName.includes('christ') || fileName.includes('praying') || fileName.includes('nun')) designType = 'religious';

            // Determine size based on filename patterns
            let size = 'medium';
            if (fileName.includes('sleeve') || fileName.includes('arm')) size = 'large';
            else if (fileName.includes('small') || fileName.includes('mini')) size = 'small';

            return {
              id: `${type}-${index}-${fileName}`,
              type,
              src: publicPath,
              name: displayName,
              description: `${displayName} - Professional tattoo design by Fernando Govea`,
              designType,
              size,
            };
          });
      } catch (error) {
        void logger.warn(`Could not read ${type} directory: ${dir}`, error);
        return [];
      }
    }

    // Get files from both directories
    const [images, videos] = await Promise.all([
      getFilesFromDirectory(imagesDir, 'image'),
      getFilesFromDirectory(videosDir, 'video'),
    ]);

    // Combine and sort files
    const allFiles = [...images, ...videos].sort((a, b) => a.name.localeCompare(b.name));

    const response: GalleryFilesResponse = {
      success: true,
      files: allFiles,
      total: allFiles.length,
    };

    const result = NextResponse.json(response);
    
    // Set cache headers (shorter cache for filesystem-based content)
    result.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');
    return result;

  } catch (error) {
    void logger.error('Gallery files API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch gallery files from filesystem',
        files: [],
        total: 0
      } as GalleryFilesResponse,
      { status: 500 }
    );
  }
}
