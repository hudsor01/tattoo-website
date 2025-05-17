import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Contact form functions
export async function submitContact(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const { data: contact, error } = await supabase
    .from('Contact')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return contact;
}

export async function getContacts() {
  const { data, error } = await supabase
    .from('Contact')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data;
}