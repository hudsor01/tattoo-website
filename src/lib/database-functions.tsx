/**
 * Database utility functions for Supabase
 */
import { createClient } from '@/lib/supabase/client';

// Define types for customer data
interface CustomerData {
  name?: string;
  email?: string;
  phone?: string;
  userId?: string;
  profileImage?: string;
  [key: string]: unknown;
}

/**
 * Get a customer by ID
 */
export async function getCustomerById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from('Customer').select('*').eq('id', id).single();

  if (error) throw error;
  return data;
}

/**
 * Get a customer by user ID
 */
export async function getCustomerByUserId(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from('Customer').select('*').eq('userId', userId).single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/**
 * Get all customers
 */
export async function getAllCustomers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('Customer')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Create a new customer
 */
export async function createCustomer(customerData: CustomerData) {
  const supabase = createClient();
  const { data, error } = await supabase.from('Customer').insert(customerData).select().single();

  if (error) throw error;
  return data;
}

/**
 * Update a customer
 */
export async function updateCustomer(id: string, customerData: CustomerData) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('Customer')
    .update(customerData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get appointments for a customer
 */
export async function getCustomerAppointments(customerId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('Appointment')
    .select('*, Artist(name, profileImage)')
    .eq('customerId', customerId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get designs for a customer
 */
export async function getCustomerDesigns(customerId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('TattooDesign')
    .select('*, Artist(name, profileImage)')
    .eq('customerId', customerId)
    .order('updatedAt', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get payments for a customer
 */
export async function getCustomerPayments(customerId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('Payment')
    .select('*, Appointment(date, status)')
    .eq('customerId', customerId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get artist by ID
 */
export async function getArtistById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from('Artist').select('*').eq('id', id).single();

  if (error) throw error;
  return data;
}

/**
 * Get all artists
 */
export async function getAllArtists() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('Artist')
    .select('*')
    .eq('isActive', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

/**
 * Get appointments for an artist
 */
export async function getArtistAppointments(artistId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('Appointment')
    .select('*, Customer(name, profileImage)')
    .eq('artistId', artistId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get appointment by ID
 */
export async function getAppointmentById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('Appointment')
    .select('*, Customer(name, email, profileImage), Artist(name, profileImage)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('Appointment')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get tattoo design by ID
 */
export async function getDesignById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('TattooDesign')
    .select('*, Customer(name), Artist(name, profileImage)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update design status
 */
export async function updateDesignStatus(id: string, status: string, notes?: string) {
  const updateData: { status: string; notes?: string } = { status };
  if (notes) updateData.notes = notes;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('TattooDesign')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export default {
  getCustomerById,
  getCustomerByUserId,
  getAllCustomers,
  createCustomer,
  updateCustomer,
  getCustomerAppointments,
  getCustomerDesigns,
  getCustomerPayments,
  getArtistById,
  getAllArtists,
  getArtistAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getDesignById,
  updateDesignStatus,
};
