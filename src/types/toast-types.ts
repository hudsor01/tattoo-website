/**
 * toast-types.ts
 *
 * Type definitions related to toast notifications and messaging throughout the application.
 */

/**
 * Toast notification variant/style
 */
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

/**
 * Toast action button configuration
 */
export interface ToastAction {
  /**
   * Button label
   */
  label: string;
  
  /**
   * Button click handler
   */
  onClick: () => void;
  
  /**
   * Button variant/style
   */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
}

/**
 * Toast notification structure
 */
export interface Toast {
  /**
   * Unique identifier for the toast
   */
  id: string;
  
  /**
   * Optional toast title
   */
  title?: string;
  
  /**
   * Toast message content
   */
  description: string;
  
  /**
   * Toast style variant
   */
  variant?: ToastVariant;
  
  /**
   * Optional action button
   */
  action?: ToastAction;
  
  /**
   * Duration to display toast in milliseconds (null = indefinite)
   */
  duration?: number;
  
  /**
   * Whether the toast is currently open
   */
  open: boolean;
  
  /**
   * Optional callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Toast state managed by the toast store
 */
export interface ToastState {
  /**
   * Collection of active toasts
   */
  toasts: Toast[];
  
  /**
   * Add a new toast
   */
  addToast: (toast: Omit<Toast, 'id' | 'open'>) => string;
  
  /**
   * Update an existing toast
   */
  updateToast: (id: string, toast: Partial<Omit<Toast, 'id'>>) => void;
  
  /**
   * Dismiss a toast
   */
  dismissToast: (id: string) => void;
  
  /**
   * Dismiss all toasts
   */
  dismissAllToasts: () => void;
  
  /**
   * Remove a toast immediately without animation
   */
  removeToast: (id: string) => void;
}

/**
 * Standard error messages for common error scenarios
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check the form for errors and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  DATA_FETCH_ERROR: 'Failed to fetch data. Please try again.',
  DATA_SUBMIT_ERROR: 'Failed to submit data. Please try again.',
  REQUIRED_FIELD: 'Please fill in all required fields.',
};

/**
 * Standard success messages for common scenarios
 */
export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully.',
  UPDATED: 'Updated successfully.',
  DELETED: 'Deleted successfully.',
  SAVED: 'Saved successfully.',
  SUBMITTED: 'Submitted successfully.',
  UPLOADED: 'Uploaded successfully.',
  LOGGED_IN: 'Logged in successfully.',
  LOGGED_OUT: 'Logged out successfully.',
  PASSWORD_RESET: 'Password reset successfully.',
  EMAIL_SENT: 'Email sent successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  SETTINGS_UPDATED: 'Settings updated successfully.',
  APPOINTMENT_BOOKED: 'Appointment booked successfully.',
  APPOINTMENT_CANCELLED: 'Appointment cancelled successfully.',
  PAYMENT_SUCCESSFUL: 'Payment successful.',
};

/**
 * Standard durations for toasts
 */
export const TOAST_DURATIONS = {
  SHORT: 3000,        // 3 seconds
  MEDIUM: 5000,       // 5 seconds
  LONG: 8000,         // 8 seconds
  PERSISTENT: 100000, // Very long (effectively persistent)
};