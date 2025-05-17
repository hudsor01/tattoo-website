/**
 * Types for client-portal appointment components
 */

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  deposit?: number;
  depositPaid?: boolean;
  createdAt: string;
  updatedAt: string;
  clientId: string;
  artistId: string;
  notes?: string;
  location?: string;
}