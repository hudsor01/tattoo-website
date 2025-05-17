// This file was corrupted and has been rebuilt with placeholders
// TODO: Review and complete the type definitions

interface SupabaseSubscriptionOptions {
  table?: string;
  schema?: string;
  filter?: string;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  filterColumn?: string;
  filterValue?: string | number;
  event?: 'INSERT' | 'UPDATE' | 'DELETE';
}

export type { SupabaseSubscriptionOptions };
