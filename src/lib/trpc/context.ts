/**
 * TRPC Context Creation
 * 
 * This file handles the creation of context for TRPC procedures.
 * The context includes the user session (if authenticated) and 
 * access to the database via Prisma.
 * 
 * THIS IS A SERVER-SIDE ONLY FILE
 */
import 'server-only';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';
import { fixSupabaseUrl, ensureCorrectSupabaseUrl } from '@/lib/utils/url-utils';
import { logger } from '@/lib/logger';

/**
 * Creates context for TRPC API route handlers
 */
export async function createTRPCContext({
  req,
  resHeaders,
}: {
  req: NextRequest;
  resHeaders: Headers;
}) {
  try {
    // Get request headers
    const requestHeaders = Object.fromEntries(req.headers.entries());
    
    // Log URL for debugging
    const url = req.url || '';
    const requestUrl = fixSupabaseUrl(ensureCorrectSupabaseUrl(url));
    const referer = req.headers.get('referer') || '';
    
    // Use our universal logger
    logger.debug('Creating tRPC context', {
      url: requestUrl,
      referer
    });

    // Create a Supabase client with server-side context
    const supabase = await createClient();

    // Get the user session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Log session for debugging
    logger.debug('Session in tRPC context', {
      hasSession: !!session,
      userId: session?.user?.id || null
    });

    // Return the context with user & supabase client
    return {
      req,
      resHeaders,
      headers: requestHeaders,
      supabase,
      prisma,
      user: session?.user || null,
      url: requestUrl
    };
  } catch (error) {
    logger.error('Error creating TRPC context:', error);
    
    // Return a basic context even if there's an error
    return {
      req,
      resHeaders,
      headers: Object.fromEntries(req.headers.entries()),
      prisma,
      user: null,
      url: '',
    };
  }
}

/**
 * Context type based on the return value of createTRPCContext
 * with additional types for middleware-added properties
 */
export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>> & {
  // Include the db alias for prisma since middleware adds this
  db?: typeof prisma;
};

/**
 * Exported Context type for use in tRPC initialization
 */
export type Context = TRPCContext;

/**
 * Creates context for React Server Components
 * This is used when calling TRPC procedures from RSCs
 */
export async function createContextForRSC() {
  
  try {
    const supabase = await createClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    
    return {
      supabase,
      prisma,
      user: session?.user || null
    };
  } catch (error) {
    logger.error('Error creating RSC context:', error);
    
    // Create a supabase client even in the error case
    const supabase = await createClient();
    
    return {
      prisma,
      user: null,
      supabase
    };
  }
}