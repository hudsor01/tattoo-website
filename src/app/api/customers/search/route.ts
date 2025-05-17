import { NextRequest, NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase/server-client';
import { apiRoute } from '@/lib/validations/api';
// Import all of Zod as a namespace to avoid tree-shaking issues
import * as z from 'zod';

export const dynamic = 'force-dynamic';

// Define search result type based on expected fields from search_customers function
interface CustomerSearchResult {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  city: string | null;
  state: string | null;
  createdAt: Date;
}

// Search query schema
const searchQuerySchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters long'),
});

/**
 * GET /api/customers/search?q=search_term
 *
 * Fuzzy search for customers using PostgreSQL trigram functions
 */
export const GET = apiRoute({
  GET: {
    querySchema: searchQuerySchema,
    handler: async (query, request) => {
      try {
        // Get authenticated session from Supabase
        const supabase = serverClient();
        const { data: { session } } = await supabase.auth.getSession();

        // Check for authentication
        if (!session?.user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify user has admin role
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!userData || !['admin', 'artist'].includes(userData.role)) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        // The query is now validated through the schema
        const searchTerm = query.q;

        // Use the PostgreSQL function to search for customers
        const { data: results, error } = await supabase
          .rpc('search_customers', { search_term: searchTerm });

        if (error) {
          console.error('Error searching customers:', error);
          return NextResponse.json({ error: 'Failed to search customers' }, { status: 500 });
        }

        return NextResponse.json(results as CustomerSearchResult[]);
      } catch (error) {
        console.error('Error searching customers:', error);
        return NextResponse.json({ error: 'Failed to search customers' }, { status: 500 });
      }
    },
  },
});