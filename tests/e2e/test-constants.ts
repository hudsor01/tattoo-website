/**
 * Comprehensive shared constants for E2E tests
 */

// Test data prefixes to isolate test data
export const TEST_PREFIX = 'e2e_test_';

// Test user credentials
export const TEST_ADMIN_EMAIL = 'test-admin@example.com';
export const TEST_ADMIN_PASSWORD = 'Test-Password123!';
export const TEST_USER_EMAIL = 'test-user@example.com';
export const TEST_USER_PASSWORD = 'Test-Password123!';
export const TEST_ARTIST_EMAIL = 'test-artist@example.com';
export const TEST_ARTIST_PASSWORD = 'Test-Password123!';

// Test customer data
export const TEST_CUSTOMER = {
  firstName: 'Test',
  lastName: 'Customer',
  email: 'test-customer@example.com',
  phone: '5551234567',
  address: '123 Test St',
  city: 'Test City',
  state: 'TS',
  zip: '12345',
  notes: 'Test customer created by E2E test',
};

// Test booking data
export const TEST_BOOKING = {
  name: 'Test Booking',
  email: 'test-booking@example.com',
  phone: '5551234567',
  tattooType: 'custom',
  size: 'medium',
  placement: 'arm',
  description: 'Test booking created by E2E test',
  preferredDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
  preferredTime: 'afternoon',
  paymentMethod: 'card',
  reference: 'https://example.com/reference-image.jpg',
  additionalInfo: 'This is a test booking with additional information',
};

// Test appointment data
export const TEST_APPOINTMENT = {
  title: 'Test Appointment',
  artist: 'Test Artist',
  notes: 'Test appointment created by E2E test',
  duration: 120, // 2 hours
  startTime: '14:00', // 2:00 PM
  endTime: '16:00', // 4:00 PM
  status: 'scheduled',
  deposit: 100,
  totalPrice: 300,
};

// Test payment data
export const TEST_PAYMENT = {
  amount: 100,
  paymentMethod: 'card',
  status: 'pending',
  transactionId: 'test_txn_123456',
  notes: 'Test payment created by E2E test',
};

// Test gallery item
export const TEST_GALLERY_ITEM = {
  title: 'Test Gallery Item',
  description: 'Test gallery item created by E2E test',
  category: 'traditional',
  artist: 'Test Artist',
  featured: true,
  imageUrl: 'https://example.com/test-image.jpg',
};

// Test service
export const TEST_SERVICE = {
  name: 'Test Service',
  description: 'Test service created by E2E test',
  price: 150,
  duration: 60,
  category: 'tattoo',
};

// Routes for testing
export const ROUTES = {
  home: '/',
  booking: '/booking',
  gallery: '/gallery',
  services: '/services',
  about: '/about',
  contact: '/contact',
  faq: '/faq',
  customer: {
    portal: '/customer',
    appointments: '/customer/appointments',
    profile: '/customer/profile',
    billing: '/customer/billing',
  },
  admin: {
    dashboard: '/admin',
    customers: '/admin/customers',
    appointments: '/admin/appointments',
    gallery: '/admin/gallery',
    services: '/admin/services',
    settings: '/admin/settings',
    staff: '/admin/staff',
    marketing: '/admin/marketing',
    reports: '/admin/reports',
  },
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
  },
  api: {
    bookings: '/api/bookings',
    customers: '/api/customers',
    appointments: '/api/appointments',
    gallery: '/api/gallery',
    services: '/api/services',
    auth: '/api/auth',
    payments: '/api/payments',
  },
};

// Selectors for common elements
export const SELECTORS = {
  // Navigation
  navBar: 'nav',
  navLinks: 'nav a',
  mobileMenuButton: 'button[aria-label="Toggle menu"]',
  
  // Forms
  form: 'form',
  inputField: (name: string) => `input[name="${name}"]`,
  selectField: (name: string) => `select[name="${name}"]`,
  textareaField: (name: string) => `textarea[name="${name}"]`,
  submitButton: 'button[type="submit"]',
  errorMessage: '[role="alert"]',
  
  // Auth
  loginForm: 'form[data-testid="login-form"]',
  logoutButton: 'button[data-testid="logout-button"]',
  
  // Tables
  table: 'table',
  tableRow: 'tr',
  tableCell: 'td',
  tableHeader: 'th',
  
  // Modals
  modal: '[role="dialog"]',
  modalClose: 'button[aria-label="Close"]',
  
  // Buttons
  button: (text: string) => `button:has-text("${text}")`,
  link: (text: string) => `a:has-text("${text}")`,
  
  // Notifications
  toast: '[role="status"]',
  alertDialog: '[role="alertdialog"]',
  
  // Loading states
  loadingSpinner: '[aria-busy="true"]',
  
  // Dashboard elements
  dashboardCard: '[data-testid="dashboard-card"]',
  chart: '[data-testid="chart"]',
};

// Response time expectations
export const PERFORMANCE = {
  pageLoad: 3000, // 3 seconds
  apiResponse: 1000, // 1 second
  animation: 300, // 300ms
};

// Database test queries
export const DB_QUERIES = {
  countCustomers: 'SELECT COUNT(*) FROM "Customer"',
  countBookings: 'SELECT COUNT(*) FROM "Booking"',
  countAppointments: 'SELECT COUNT(*) FROM "Appointment"',
  countPayments: 'SELECT COUNT(*) FROM "Payment"',
};

// API test data
export const API_RESPONSES = {
  success: {
    status: 200,
    message: 'Success',
  },
  created: {
    status: 201,
    message: 'Created',
  },
  badRequest: {
    status: 400,
    message: 'Bad Request',
  },
  unauthorized: {
    status: 401,
    message: 'Unauthorized',
  },
  forbidden: {
    status: 403,
    message: 'Forbidden',
  },
  notFound: {
    status: 404,
    message: 'Not Found',
  },
  serverError: {
    status: 500,
    message: 'Internal Server Error',
  },
};

// Test files and images
export const TEST_FILES = {
  image: 'test-image.jpg',
  pdf: 'test-document.pdf',
  csv: 'test-data.csv',
};
