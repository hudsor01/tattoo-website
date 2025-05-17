/**
 * Database Functions
 *
 * This module provides utility functions that wrap database operations.
 * These functions include common queries and business logic that involve
 * database interactions.
 * 
 * Note: Functions in this file should be used in server contexts only.
 * For client components, use hooks from the trpc client.
 */

import { serverClient } from './supabase/server-client';
import { UserRole } from '@/types/enum-types';

/**
 * Check if a user has admin role
 */
export async function isAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const supabase = await serverClient();
    const { data, error } = await supabase
      .from('User')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data.role === UserRole.ADMIN;
  } catch (error) {
    console.error('Error in isAdmin function:', error);
    return false;
  }
}

/**
 * Check if a user has artist role
 */
export async function isArtist(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const supabase = await serverClient();
    const { data, error } = await supabase
      .from('User')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error checking artist status:', error);
      return false;
    }

    return data.role === UserRole.ARTIST;
  } catch (error) {
    console.error('Error in isArtist function:', error);
    return false;
  }
}

/**
 * Get all accessible customer IDs for a user
 * Admins and artists can access all customers
 * Regular users can only access their own customer profile
 */
export async function getAccessibleCustomerIds(userId: string): Promise<string[]> {
  if (!userId) return [];

  try {
    const supabase = await serverClient();
    
    // Check if user is admin or artist
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error checking user role:', userError);
      return [];
    }

    // Admins and artists can access all customers
    if (userData.role === UserRole.ADMIN || userData.role === UserRole.ARTIST) {
      const { data: customers, error: customersError } = await supabase
        .from('Customer')
        .select('id');

      if (customersError || !customers) {
        console.error('Error fetching customers:', customersError);
        return [];
      }

      return customers.map(customer => customer.id);
    }

    // Regular users can only access their own customer profile
    const { data: customerData, error: customerError } = await supabase
      .from('Customer')
      .select('id')
      .eq('userId', userId);

    if (customerError || !customerData) {
      console.error('Error fetching customer profile:', customerError);
      return [];
    }

    return customerData.map(customer => customer.id);
  } catch (error) {
    console.error('Error in getAccessibleCustomerIds function:', error);
    return [];
  }
}

/**
 * Get all appointments for a user
 * Admins and artists can see all appointments
 * Regular users can only see their own appointments
 */
export async function getUserAppointments(userId: string) {
  if (!userId) return [];

  try {
    const supabase = await serverClient();
    
    // Check user role
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error checking user role:', userError);
      return [];
    }

    // For admins, fetch all appointments
    if (userData.role === UserRole.ADMIN) {
      const { data: appointments, error: appointmentsError } = await supabase
        .from('Appointment')
        .select(`
          *,
          customer:Customer(*),
          artist:Artist(*)
        `)
        .order('date', { ascending: false });

      if (appointmentsError || !appointments) {
        console.error('Error fetching appointments:', appointmentsError);
        return [];
      }

      return appointments;
    }

    // For artists, fetch their appointments
    if (userData.role === UserRole.ARTIST) {
      // First get the artist ID for this user
      const { data: artistData, error: artistError } = await supabase
        .from('Artist')
        .select('id')
        .eq('userId', userId)
        .single();

      if (artistError || !artistData) {
        console.error('Error fetching artist profile:', artistError);
        return [];
      }

      // Then get all appointments for this artist
      const { data: appointments, error: appointmentsError } = await supabase
        .from('Appointment')
        .select(`
          *,
          customer:Customer(*),
          artist:Artist(*)
        `)
        .eq('artistId', artistData.id)
        .order('date', { ascending: false });

      if (appointmentsError || !appointments) {
        console.error('Error fetching appointments:', appointmentsError);
        return [];
      }

      return appointments;
    }

    // For regular users, fetch their appointments
    // First get the customer ID for this user
    const { data: customerData, error: customerError } = await supabase
      .from('Customer')
      .select('id')
      .eq('userId', userId)
      .single();

    if (customerError || !customerData) {
      console.error('Error fetching customer profile:', customerError);
      return [];
    }

    // Then get all appointments for this customer
    const { data: appointments, error: appointmentsError } = await supabase
      .from('Appointment')
      .select(`
        *,
        artist:Artist(*),
        customer:Customer(*)
      `)
      .eq('customerId', customerData.id)
      .order('date', { ascending: false });

    if (appointmentsError || !appointments) {
      console.error('Error fetching appointments:', appointmentsError);
      return [];
    }

    return appointments;
  } catch (error) {
    console.error('Error in getUserAppointments function:', error);
    return [];
  }
}