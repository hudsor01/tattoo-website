import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PricingCalculator from '@/components/PricingCalculator';
import * as dbFunctions from '@/lib/db-functions';

// Mock the db-functions module
jest.mock('@/lib/db-functions', () => ({
  calculatePricing: jest.fn(),
}));

describe('PricingCalculator Component', () => {
  // Mock data for successful calculation
  const mockPricingResult = {
    base_hourly_rate: 100,
    estimated_hours: 2.5,
    size_factor: 2.0,
    placement_factor: 1.0,
    complexity_factor: 1.1,
    total_price: 275,
    deposit_amount: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the pricing calculator form', () => {
    render(<PricingCalculator />);
    
    // Check for form elements
    expect(screen.getByText('Tattoo Pricing Calculator')).toBeInTheDocument();
    expect(screen.getByLabelText('Tattoo Size')).toBeInTheDocument();
    expect(screen.getByLabelText('Placement')).toBeInTheDocument();
    expect(screen.getByLabelText('Complexity')).toBeInTheDocument();
    expect(screen.getByText('Calculate Price')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  test('calculates price when button is clicked', async () => {
    // Mock the API call
    (dbFunctions.calculatePricing as jest.Mock).mockResolvedValue(mockPricingResult);
    
    render(<PricingCalculator />);
    
    // Click calculate button
    fireEvent.click(screen.getByText('Calculate Price'));
    
    // Check if calculating state is shown
    expect(screen.getByText('Calculating...')).toBeInTheDocument();
    
    // Wait for calculation to complete
    await waitFor(() => {
      expect(screen.getByText('$275.00')).toBeInTheDocument();
    });
    
    // Verify the API was called with the correct params
    expect(dbFunctions.calculatePricing).toHaveBeenCalledWith(
      'medium', // default size
      'arm',    // default placement
      3,        // default complexity
      undefined, // no artistId by default
      undefined  // no custom rate by default
    );
    
    // Check if the pricing details are displayed
    expect(screen.getByText('$100.00/hour')).toBeInTheDocument();
    expect(screen.getByText('2.5 hours')).toBeInTheDocument();
    expect(screen.getByText('2.0x')).toBeInTheDocument();
    expect(screen.getByText('1.0x')).toBeInTheDocument();
    expect(screen.getByText('1.1x')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument(); // deposit amount
  });

  test('handles form input changes', async () => {
    // Mock the API call
    (dbFunctions.calculatePricing as jest.Mock).mockResolvedValue({
      ...mockPricingResult,
      size_factor: 3.5,
      total_price: 385,
    });
    
    render(<PricingCalculator />);
    
    // Change size to 'large'
    fireEvent.change(screen.getByLabelText('Tattoo Size'), { target: { value: 'large' } });
    
    // Change placement to 'back'
    fireEvent.change(screen.getByLabelText('Placement'), { target: { value: 'back' } });
    
    // Change complexity to 4
    fireEvent.change(screen.getByLabelText('Complexity'), { target: { value: '4' } });
    
    // Add a custom rate
    const customRateInput = screen.getByLabelText('Custom Hourly Rate (Optional)');
    fireEvent.change(customRateInput, { target: { value: '120' } });
    
    // Click calculate button
    fireEvent.click(screen.getByText('Calculate Price'));
    
    // Wait for calculation to complete
    await waitFor(() => {
      expect(screen.getByText('$385.00')).toBeInTheDocument();
    });
    
    // Verify the API was called with the updated params
    expect(dbFunctions.calculatePricing).toHaveBeenCalledWith(
      'large',    // updated size
      'back',     // updated placement
      4,          // updated complexity
      undefined,  // no artistId
      120         // custom rate
    );
  });

  test('reset button clears the form and results', async () => {
    // Mock the API call
    (dbFunctions.calculatePricing as jest.Mock).mockResolvedValue(mockPricingResult);
    
    render(<PricingCalculator />);
    
    // Change form values
    fireEvent.change(screen.getByLabelText('Tattoo Size'), { target: { value: 'large' } });
    fireEvent.change(screen.getByLabelText('Complexity'), { target: { value: '5' } });
    
    // Calculate price
    fireEvent.click(screen.getByText('Calculate Price'));
    
    // Wait for calculation to complete
    await waitFor(() => {
      expect(screen.getByText('$275.00')).toBeInTheDocument();
    });
    
    // Click reset button
    fireEvent.click(screen.getByText('Reset'));
    
    // Check if form is reset
    expect(screen.getByLabelText('Tattoo Size')).toHaveValue('medium');
    expect(screen.getByLabelText('Placement')).toHaveValue('arm');
    expect(screen.getByLabelText('Complexity')).toHaveValue('3');
    
    // Check if results are cleared
    expect(screen.queryByText('$275.00')).not.toBeInTheDocument();
    expect(screen.getByText('Fill out the form and click "Calculate Price" to see pricing details.')).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    // Mock API error
    (dbFunctions.calculatePricing as jest.Mock).mockRejectedValue(new Error('API error'));
    
    render(<PricingCalculator />);
    
    // Click calculate button
    fireEvent.click(screen.getByText('Calculate Price'));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to calculate pricing. Please try again.')).toBeInTheDocument();
    });
  });

  test('passes artistId prop to the API call when provided', async () => {
    // Mock the API call
    (dbFunctions.calculatePricing as jest.Mock).mockResolvedValue(mockPricingResult);
    
    // Render with artistId prop
    render(<PricingCalculator artistId="artist123" />);
    
    // Click calculate button
    fireEvent.click(screen.getByText('Calculate Price'));
    
    // Wait for calculation to complete
    await waitFor(() => {
      expect(screen.getByText('$275.00')).toBeInTheDocument();
    });
    
    // Verify artistId was passed to the API call
    expect(dbFunctions.calculatePricing).toHaveBeenCalledWith(
      'medium',     // default size
      'arm',        // default placement
      3,            // default complexity
      'artist123',  // passed artistId
      undefined     // no custom rate
    );
  });
});
