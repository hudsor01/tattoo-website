// Cal.com Atoms type definitions based on actual package exports

// Basic booking response structure
export interface BookingResponse {
  id: string;
  uid: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees?: Array<{
    name: string;
    email: string;
  }>;
}

// API response wrapper
export interface ApiSuccessResponse<T = unknown> {
  status: 'success';
  data: T;
}

export interface ApiErrorResponse {
  status: 'error';
  error: {
    message?: string;
    code?: string;
    details?: Record<string, string | number | boolean>;
  };
}

// Component props
export interface CalAtomsBookerProps {
  username: string;
  eventSlug: string;
  isTeamEvent: boolean;
  onCreateBookingSuccess?: (data: ApiSuccessResponse<BookingResponse>) => void;
  onCreateBookingError?: (error: ApiErrorResponse | Error) => void;
}
