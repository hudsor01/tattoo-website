// Process-uploads Edge Function
// Handles image processing, thumbnail generation, and metadata extraction

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
// Imported for potential future use in handling base64 encoded files
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { decode as decodeBase64 } from "https://deno.land/std@0.82.0/encoding/base64.ts"
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts"

// Set up constants
const THUMBNAIL_WIDTH = 300;
const THUMBNAIL_HEIGHT = 300;
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf'
];

// Create Supabase client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

interface WebhookPayload {
  type: string;
  table: string;
  record: {
    id: string;
    name: string;
    bucket_id: string;
    owner: string;
    created_at: string;
    updated_at: string;
    path_tokens: string[];
    metadata: {
      size: number;
      mimetype: string;
      [key: string]: unknown;
    };
  };
  schema: string;
}

// Process uploaded image and generate thumbnail
async function processImage(payload: WebhookPayload) {
  try {
    const { record } = payload;
    
    // Ignore if not an image or not a supported file type
    if (!record.metadata.mimetype || !ALLOWED_MIME_TYPES.includes(record.metadata.mimetype)) {
      console.log(`Unsupported file type: ${record.metadata.mimetype}`);
      return {
        success: false,
        message: 'Unsupported file type'
      };
    }
    
    // Get the file data from storage
    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from(record.bucket_id)
      .download(record.path_tokens.join('/'));
    
    if (fileError || !fileData) {
      throw new Error(`Error downloading file: ${fileError?.message || 'No file data'}`);
    }
    
    // Skip PDFs - we'll just update the metadata
    if (record.metadata.mimetype === 'application/pdf') {
      return updateFileMetadata(record, null);
    }
    
    // Process image and create thumbnail
    const buffer = await fileData.arrayBuffer();
    const image = await Image.decode(new Uint8Array(buffer));
    
    // Extract metadata
    const originalWidth = image.width;
    const originalHeight = image.height;
    const aspectRatio = originalWidth / originalHeight;
    
    // Resize to create thumbnail
    let thumbnailImage;
    
    if (aspectRatio > 1) {
      // Landscape
      thumbnailImage = image.resize(THUMBNAIL_WIDTH, Math.round(THUMBNAIL_WIDTH / aspectRatio));
    } else {
      // Portrait or square
      thumbnailImage = image.resize(Math.round(THUMBNAIL_HEIGHT * aspectRatio), THUMBNAIL_HEIGHT);
    }
    
    // Encode the thumbnail as WebP for better compression
    const thumbnailBuffer = await thumbnailImage.encode(Image.WebP);
    
    // Build the thumbnail path
    // originalPath is declared but not used in current implementation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const originalPath = record.path_tokens.join('/');
    const pathTokens = [...record.path_tokens];
    const fileName = pathTokens.pop() || '';
    const fileNameWithoutExt = fileName.split('.').slice(0, -1).join('.');
    const thumbnailPath = [...pathTokens, `${fileNameWithoutExt}_thumbnail.webp`].join('/');
    
    // Upload thumbnail
    const { error: uploadError } = await supabaseAdmin.storage
      .from(record.bucket_id)
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });
    
    if (uploadError) {
      throw new Error(`Error uploading thumbnail: ${uploadError.message}`);
    }
    
    // Get public URL for the thumbnail
    const { data: thumbnailUrl } = supabaseAdmin.storage
      .from(record.bucket_id)
      .getPublicUrl(thumbnailPath);
    
    // Update metadata with image dimensions and thumbnail URL
    return updateFileMetadata(record, {
      width: originalWidth,
      height: originalHeight,
      thumbnailUrl: thumbnailUrl.publicUrl,
      thumbnailPath: thumbnailPath,
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Update file metadata in the database 
async function updateFileMetadata(record: WebhookPayload['record'], imageData: {
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  thumbnailPath?: string;
} | null) {
  try {
    // Get public URL for original file
    const { data: urlData } = supabaseAdmin.storage
      .from(record.bucket_id)
      .getPublicUrl(record.path_tokens.join('/'));
    
    // Determine file type category
    let fileType = 'other';
    if (record.metadata.mimetype) {
      if (record.metadata.mimetype.startsWith('image/')) {
        fileType = 'image';
      } else if (record.metadata.mimetype === 'application/pdf') {
        fileType = 'document';
      }
    }
    
    // Update database record if it's a TattooDesign file
    if (record.path_tokens[0] === 'tattoo-designs') {
      const designId = record.path_tokens[1];
      
      if (designId) {
        const updateData: Record<string, unknown> = {
          fileUrl: urlData.publicUrl,
          updatedAt: new Date().toISOString(),
        };
        
        // Add thumbnail URL if available
        if (imageData?.thumbnailUrl) {
          updateData.thumbnailUrl = imageData.thumbnailUrl;
        }
        
        const { error: updateError } = await supabaseAdmin
          .from('TattooDesign')
          .update(updateData)
          .eq('id', designId);
        
        if (updateError) {
          throw new Error(`Error updating TattooDesign: ${updateError.message}`);
        }
      }
    }
    
    return {
      success: true,
      fileId: record.id,
      publicUrl: urlData.publicUrl,
      fileType,
      ...(imageData ? { 
        width: imageData.width, 
        height: imageData.height,
        thumbnailUrl: imageData.thumbnailUrl
      } : {})
    };
  } catch (error) {
    console.error('Error updating metadata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Handle HTTP request
serve(async (req) => {
  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
    
    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Parse the request body
    const payload: WebhookPayload = await req.json();
    
    // Only process file inserts
    if (payload.type === 'INSERT' && payload.schema === 'storage') {
      // Process the file based on its type
      const result = await processImage(payload);
      
      return new Response(
        JSON.stringify(result),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // Unsupported operation
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Unsupported operation' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    // Handle any errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error processing upload:`, errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
