import { PrismaClient } from '@prisma/client';
import * as dbFunctions from '@/lib/db-functions';

// Mock the PrismaClient
jest.mock('@prisma/client', () => {
  const mockQueryRaw = jest.fn();
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $queryRaw: mockQueryRaw,
      $disconnect: jest.fn(),
    })),
  };
});

describe('DB Functions', () => {
  // Access the mocked query function
  const mockQueryRaw = (dbFunctions.prisma.$queryRaw as jest.Mock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculatePricing', () => {
    test('calls calculate_pricing database function with correct parameters', async () => {
      // Setup mock return value
      const mockPricing = {
        base_hourly_rate: 100,
        size_factor: 2.0,
        placement_factor: 1.0,
        complexity_factor: 1.1,
        estimated_hours: 2.5,
        total_price: 275,
        deposit_amount: 100,
      };
      mockQueryRaw.mockResolvedValueOnce([mockPricing]);

      // Call the function
      const result = await dbFunctions.calculatePricing('medium', 'arm', 3, 'artist123', 120);

      // Verify result
      expect(result).toEqual(mockPricing);

      // Verify $queryRaw was called with correct SQL
      expect(mockQueryRaw).toHaveBeenCalledTimes(1);
      
      // Verify the call contains the expected parameters
      const queryCall = mockQueryRaw.mock.calls[0][0];
      expect(queryCall).toContain('SELECT * FROM calculate_pricing');
      
      // Check tagged template parameters (in the array following the template)
      const callParams = mockQueryRaw.mock.calls[0];
      expect(callParams).toContainEqual('medium'); // size
      expect(callParams).toContainEqual('arm');    // placement
      expect(callParams).toContainEqual(3);        // complexity
      expect(callParams).toContainEqual('artist123'); // artistId
      expect(callParams).toContainEqual(120);      // customHourlyRate
    });

    test('handles null optional parameters correctly', async () => {
      // Setup mock return value
      mockQueryRaw.mockResolvedValueOnce([{
        base_hourly_rate: 100,
        total_price: 250,
      }]);

      // Call with minimal parameters (no artistId or custom rate)
      await dbFunctions.calculatePricing('small', 'back', 2);

      // Verify $queryRaw was called correctly
      expect(mockQueryRaw).toHaveBeenCalledTimes(1);
      
      // Check that null values are passed for optional parameters
      const callParams = mockQueryRaw.mock.calls[0];
      expect(callParams).toContainEqual(null); // artistId = null
      expect(callParams).toContainEqual(null); // customHourlyRate = null
    });
  });

  describe('checkAppointmentAvailability', () => {
    test('calls check_appointment_availability with correct parameters', async () => {
      // Setup mock return value
      const mockAvailability = {
        is_available: true,
        conflicts: null,
      };
      mockQueryRaw.mockResolvedValueOnce([mockAvailability]);

      // Test date objects
      const startDate = new Date('2025-06-01T10:00:00');
      const endDate = new Date('2025-06-01T12:00:00');

      // Call the function
      const result = await dbFunctions.checkAppointmentAvailability(
        'artist123',
        startDate,
        endDate,
        'appt456'
      );

      // Verify result
      expect(result).toEqual(mockAvailability);

      // Verify $queryRaw was called correctly
      expect(mockQueryRaw).toHaveBeenCalledTimes(1);
      
      // Check function and parameters in the call
      const queryCall = mockQueryRaw.mock.calls[0][0];
      expect(queryCall).toContain('check_appointment_availability');
      
      const callParams = mockQueryRaw.mock.calls[0];
      expect(callParams).toContainEqual('artist123'); // artistId
      expect(callParams).toContainEqual(startDate);   // startTime
      expect(callParams).toContainEqual(endDate);     // endTime
      expect(callParams).toContainEqual('appt456');   // appointmentId
    });

    test('handles null appointmentId correctly', async () => {
      // Setup mock return value
      mockQueryRaw.mockResolvedValueOnce([{ is_available: true }]);

      // Test date objects
      const startDate = new Date('2025-06-01T10:00:00');
      const endDate = new Date('2025-06-01T12:00:00');

      // Call without appointmentId
      await dbFunctions.checkAppointmentAvailability('artist123', startDate, endDate);

      // Verify $queryRaw was called with null for appointmentId
      expect(mockQueryRaw).toHaveBeenCalledTimes(1);
      
      const callParams = mockQueryRaw.mock.calls[0];
      expect(callParams).toContainEqual(null); // appointmentId = null
    });
  });

  describe('validateCustomerData', () => {
    test('calls validate_customer_data with correct parameters', async () => {
      // Setup mock return value
      const mockValidation = {
        is_valid: true,
        normalized_email: 'john.smith@example.com',
        normalized_phone: '+15551234567',
        potential_duplicates: []
      };
      mockQueryRaw.mockResolvedValueOnce([mockValidation]);

      // Call the function with all parameters
      const birthdate = new Date('1990-01-01');
      const result = await dbFunctions.validateCustomerData(
        'John',
        'Smith',
        'john.smith@example.com',
        '555-123-4567',
        birthdate
      );

      // Verify result
      expect(result).toEqual(mockValidation);

      // Verify $queryRaw was called correctly
      expect(mockQueryRaw).toHaveBeenCalledTimes(1);
      
      // Check function and parameters
      const queryCall = mockQueryRaw.mock.calls[0][0];
      expect(queryCall).toContain('validate_customer_data');
      
      const callParams = mockQueryRaw.mock.calls[0];
      expect(callParams).toContainEqual('John');                   // firstName
      expect(callParams).toContainEqual('Smith');                  // lastName
      expect(callParams).toContainEqual('john.smith@example.com'); // email
      expect(callParams).toContainEqual('555-123-4567');           // phone
      expect(callParams).toContainEqual(birthdate);                // birthdate
    });

    test('handles optional parameters correctly', async () => {
      // Setup mock return value
      mockQueryRaw.mockResolvedValueOnce([{ is_valid: true }]);

      // Call with only required parameters
      await dbFunctions.validateCustomerData('Jane', 'Doe');

      // Verify $queryRaw was called with nulls for optional params
      expect(mockQueryRaw).toHaveBeenCalledTimes(1);
      
      const callParams = mockQueryRaw.mock.calls[0];
      expect(callParams).toContainEqual('Jane'); // firstName
      expect(callParams).toContainEqual('Doe');  // lastName
      expect(callParams).toContainEqual(null);   // email = null
      expect(callParams).toContainEqual(null);   // phone = null
      expect(callParams).toContainEqual(null);   // birthdate = null
    });
  });

  describe('enforceCancellationPolicy', () => {
    test('calls enforce_cancellation_policy with correct parameters', async () => {
      // Setup mock return value
      const mockCancellation = {
        success: true,
        appointment_id: 'appt123',
        days_notice: 14,
        fee_percentage: 0,
        deposit_refundable: true
      };
      mockQueryRaw.mockResolvedValueOnce([mockCancellation]);

      // Test date
      const cancellationDate = new Date('2025-05-20T15:30:00');

      // Call the function
      const result = await dbFunctions.enforceCancellationPolicy(
        'appt123',
        cancellationDate,
        'medical'
      );

      // Verify result
      expect(result).toEqual(mockCancellation);

      // Verify $queryRaw was called correctly
      expect(mockQueryRaw).toHaveBeenCalledTimes(1);
      
      // Check function and parameters
      const queryCall = mockQueryRaw.mock.calls[0][0];
      expect(queryCall).toContain('enforce_cancellation_policy');
      
      const callParams = mockQueryRaw.mock.calls[0];
      expect(callParams).toContainEqual('appt123');         // appointmentId
      expect(callParams).toContainEqual(cancellationDate);  // cancellationDate
      expect(callParams).toContainEqual('medical');         // reasonCode
    });

    test('uses defaults when optional parameters are omitted', async () => {
      // Setup mock return value
      mockQueryRaw.mockResolvedValueOnce([{ success: true }]);

      // Store original Date.now
      const originalNow = Date.now;
      
      // Mock Date.now to return a fixed date for testing default cancellationDate
      const mockNow = new Date('2025-05-15T12:00:00').getTime();
      global.Date.now = jest.fn(() => mockNow);
      
      try {
        // Call with only the required appointmentId
        await dbFunctions.enforceCancellationPolicy('appt123');
  
        // Verify $queryRaw was called with default values
        expect(mockQueryRaw).toHaveBeenCalledTimes(1);
        
        const callParams = mockQueryRaw.mock.calls[0];
        expect(callParams).toContainEqual('appt123');               // appointmentId
        
        // The default cancellationDate should be close to our mocked now
        const passedDate = callParams.find(p => p instanceof Date);
        expect(passedDate).toBeDefined();
        expect(Math.abs(passedDate.getTime() - mockNow)).toBeLessThan(1000); // Within 1 second
        
        expect(callParams).toContainEqual('customer_request');      // default reasonCode
      } finally {
        // Restore original Date.now
        global.Date.now = originalNow;
      }
    });
  });
});
