'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { BookingInput } from '@/types/booking-types';

export default function FallbackBookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const formData = new FormData(event.currentTarget);
      const formValues = Object.fromEntries(formData.entries());
      
      // Format data for API
      const bookingData: Partial<BookingInput> = {
        name: (formValues['name'] as string) || '',
        email: (formValues['email'] as string) || '',
        phone: (formValues['phone'] as string) || '',
        tattooType: (formValues['tattooType'] as string) || '',
        size: (formValues['size'] as string) || '',
        placement: (formValues['placement'] as string) || '',
        description: (formValues['description'] as string) || '',
        preferredDate: (formValues['preferredDate'] as string) || '',
        preferredTime: (formValues['preferredTime'] as string) || '',
        agreeToTerms: formValues['agreeToTerms'] === 'on',
        referenceImages: [],
        paymentMethod: 'unspecified',
      };
      
      // Validate required fields
      if (!bookingData.name || !bookingData.email || !bookingData.phone || 
          !bookingData.tattooType || !bookingData.size || !bookingData.placement || 
          !bookingData.description || !bookingData.preferredDate || !bookingData.preferredTime || 
          !bookingData.agreeToTerms) {
        throw new Error('Please fill in all required fields');
      }
      
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit booking');
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting booking:', error);
      setFormError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (isSubmitted) {
    return (
      <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4">Booking Request Received!</h2>
        <p className="mb-6">Thank you for your booking request. We'll contact you within 1-2 business days to confirm your appointment.</p>
        <Button onClick={() => window.location.href = '/'} className="bg-black hover:bg-gray-800 text-white">
          Return to Home
        </Button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      {formError && (
        <div className="p-4 mb-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-700 dark:text-red-400">{formError}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Your Name</Label>
          <Input id="name" name="name" required placeholder="Full Name" />
        </div>
        
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" type="email" required placeholder="email@example.com" />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" name="phone" required placeholder="(123) 456-7890" />
        </div>
        
        <div>
          <Label htmlFor="tattooType">Tattoo Type</Label>
          <Select name="tattooType" required>
            <SelectTrigger id="tattooType" className="w-full">
              <SelectValue placeholder="Select tattoo type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blackwork">Blackwork</SelectItem>
              <SelectItem value="traditional">Traditional</SelectItem>
              <SelectItem value="japanese">Japanese</SelectItem>
              <SelectItem value="realism">Realism</SelectItem>
              <SelectItem value="watercolor">Watercolor</SelectItem>
              <SelectItem value="other">Other (specify in description)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="size">Size</Label>
          <Select name="size" required>
            <SelectTrigger id="size" className="w-full">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small (2-3 inches)</SelectItem>
              <SelectItem value="medium">Medium (4-6 inches)</SelectItem>
              <SelectItem value="large">Large (7-10 inches)</SelectItem>
              <SelectItem value="extra_large">Extra Large (11+ inches)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="placement">Placement</Label>
          <Input id="placement" name="placement" required placeholder="Arm, back, leg, etc." />
        </div>
        
        <div>
          <Label htmlFor="description">Tattoo Description</Label>
          <Textarea 
            id="description" 
            name="description" 
            required 
            placeholder="Please describe your tattoo idea in detail"
            className="min-h-[100px]"
          />
        </div>
        
        <div>
          <Label htmlFor="preferredDate">Preferred Date</Label>
          <Input 
            id="preferredDate" 
            name="preferredDate" 
            type="date"
            required 
          />
        </div>
        
        <div>
          <Label htmlFor="preferredTime">Preferred Time</Label>
          <Select name="preferredTime" required>
            <SelectTrigger id="preferredTime" className="w-full">
              <SelectValue placeholder="Select preferred time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning (9am-12pm)</SelectItem>
              <SelectItem value="afternoon">Afternoon (12pm-4pm)</SelectItem>
              <SelectItem value="evening">Evening (4pm-7pm)</SelectItem>
              <SelectItem value="any">Any time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox id="agreeToTerms" name="agreeToTerms" required />
          <Label htmlFor="agreeToTerms" className="text-sm">
            I agree to the terms and conditions, including payment of a non-refundable booking deposit.
          </Label>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-black hover:bg-gray-800 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
      </Button>
    </form>
  );
}