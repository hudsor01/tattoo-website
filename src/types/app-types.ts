/**
 * Consolidated App Types
 * All types in one place - simplified and organized
 */

import type { LucideIcon } from 'lucide-react';
// tRPC removed - using TanStack Query with REST API

// ============================================
// Core Business Types (from Prisma)
// ============================================

export interface User {
  id: string;
  email: string;
  name?: string | null;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  customerId: string;
  customer?: Customer;
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string | null;
  calEventId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  appointmentId: string;
  appointment?: Appointment;
  amount: number;
  type: 'deposit' | 'balance' | 'full';
  status: 'pending' | 'completed' | 'refunded';
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description?: string | null;
  category?: string | null;
  order: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// tRPC Types
// ============================================

// tRPC router types removed - using REST API with TanStack Query


// ============================================
// Component Types
// ============================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Data table types for admin
export interface DataTableColumn<T = any> {
  id: string;
  accessorKey?: string;
  header: string | (() => React.ReactNode);
  cell?: (props: { row: { original: T }; getValue: () => any }) => React.ReactNode;
  enableSorting?: boolean;
  enableHiding?: boolean;
}

export interface DataTableAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

// Service display type (not database)
export interface Service {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  image: string;
  icon: LucideIcon;
  color: string;
  features: string[];
  process: string[];
  featured?: boolean;
}

// ============================================
// Form Types
// ============================================

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

// ============================================
// Cal.com Types
// ============================================

export interface CalEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  attendees: Array<{
    email: string;
    name: string;
  }>;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  totalCustomers: number;
  totalAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
}

export interface ActivityItem {
  id: string;
  type: 'appointment' | 'payment' | 'customer';
  description: string;
  timestamp: Date;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

// ============================================
// Auth Types
// ============================================

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  isAdmin: boolean;
}
