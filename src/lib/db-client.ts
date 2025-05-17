/**
 * Database Client - Unified import for Supabase database access
 *
 * This provides a single point of entry for database operations, using Supabase.
 */

import { serverClient } from '@/lib/supabase/server-client';

// Export the serverClient as prisma for backward compatibility
export const prisma = {
  // NotificationQueue operations
  notificationQueue: {
    create: async (data: { data: any }) => {
      const supabase = serverClient();
      const { data: result, error } = await supabase
        .from('NotificationQueue')
        .insert(data.data)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return result;
    },
    findMany: async (params: { where: any; take?: number }) => {
      const supabase = serverClient();
      let query = supabase.from('NotificationQueue').select('*');
      
      // Apply filters from the where clause
      if (params.where) {
        Object.entries(params.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      // Apply limit if specified
      if (params.take) {
        query = query.limit(params.take);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    update: async (params: { where: { id: string }; data: any }) => {
      const supabase = serverClient();
      const { data: result, error } = await supabase
        .from('NotificationQueue')
        .update(params.data)
        .eq('id', params.where.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return result;
    }
  },
  
  // Appointment operations
  appointment: {
    findUnique: async (params: { where: { id: string }; include?: any }) => {
      const supabase = serverClient();
      
      // Build the query with proper joins if includes are specified
      let query = supabase.from('Appointment').select('*');
      
      if (params.include) {
        let select = '*';
        
        if (params.include.customer) {
          select += ', customer:Customer(*)';
        }
        
        if (params.include.artist) {
          if (params.include.artist.include?.user) {
            select += ', artist:Artist(*, user:User(*))';
          } else {
            select += ', artist:Artist(*)';
          }
        }
        
        query = supabase.from('Appointment').select(select);
      }
      
      const { data, error } = await query.eq('id', params.where.id).single();
      
      if (error) {
        console.error('Error fetching appointment:', error);
        return null;
      }
      
      return data;
    },
    update: async (params: { where: { id: string }; data: any }) => {
      const supabase = serverClient();
      const { data: result, error } = await supabase
        .from('Appointment')
        .update(params.data)
        .eq('id', params.where.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return result;
    }
  },
  
  // Customer operations
  customer: {
    findUnique: async (params: { where: { id: string } }) => {
      const supabase = serverClient();
      const { data, error } = await supabase
        .from('Customer')
        .select('*')
        .eq('id', params.where.id)
        .single();
      
      if (error) {
        console.error('Error fetching customer:', error);
        return null;
      }
      
      return data;
    }
  },
  
  // Payment operations
  payment: {
    updateMany: async (params: { where: any; data: any }) => {
      const supabase = serverClient();
      let query = supabase.from('Payment').update(params.data);
      
      // Apply filters from the where clause
      if (params.where) {
        Object.entries(params.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return { count: 1 }; // Simulate Prisma's return value
    }
  },
  
  // Booking operations
  booking: {
    update: async (params: { where: { id: number }; data: any }) => {
      const supabase = serverClient();
      const { data: result, error } = await supabase
        .from('Booking')
        .update(params.data)
        .eq('id', params.where.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return result;
    },
    findUnique: async (params: { where: { id: number } }) => {
      const supabase = serverClient();
      const { data, error } = await supabase
        .from('Booking')
        .select('*')
        .eq('id', params.where.id)
        .single();
      
      if (error) {
        console.error('Error fetching booking:', error);
        return null;
      }
      
      return data;
    }
  },
  
  // Transaction operations
  transaction: {
    create: async (params: { data: any }) => {
      const supabase = serverClient();
      const { data: result, error } = await supabase
        .from('Transaction')
        .insert(params.data)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return result;
    }
  }
};

export default serverClient;