'use client';

import React from 'react';
import { z } from 'zod';
import { useForm } from '@/hooks/use-form';
import { useToast } from '@/hooks/use-toast';
import { usePricing } from '@/hooks/api/usePricing';
import { useAppointments } from '@/hooks/api/useAppointments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { EnhancedErrorBoundary } from '@/components/error/enhanced-error-boundary';

// Validation schema
const bookingSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  tattooType: z.string().min(1, 'Please select a tattoo type'),
  size: z.string().min(1, 'Please select a size'),
  placement: z.string().min(1, 'Please select a placement'),
  description: z.string().min(10, 'Please provide a description (min 10 characters)'),
  preferredDate: z.string().min(1, 'Please select a preferred date'),
  preferredTime: z.string().min(1, 'Please select a preferred time'),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms and conditions' }),
  }),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

/**
 * Booking Form Content Component
 */
function BookingFormContent() {
  const toast = useToast();
  const { toast } = useToast();
  const { pricingData, isCalculating, calculatePricing, pricingResult } = usePricing();
  const { appointments, createAppointment, isSubmitting } = useAppointments();

  // Initialize form
  const form = useForm<BookingFormValues>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      tattooType: '',
      size: '',
      placement: '',
      description: '',
      preferredDate: '',
      preferredTime: '',
      agreeToTerms: false,
    },
    validationSchema: bookingSchema,
    onSubmit: async (values) => {
      try {
        // Use promise toast to handle all states
        await toast.promise(
          createAppointment({
            title: `Tattoo Appointment - ${values.tattooType}`,
            description: values.description,
            startDate: new Date(`${values.preferredDate}T${values.preferredTime}`),
            customerId: 'current-user', // This will be replaced by the API with the authenticated user
            artistId: 'default-artist', // Replace with actual artist selection
            tattooSize: values.size,
            location: 'main-studio',
          }),
          {
            loading: 'Submitting your booking...',
            success: 'Booking submitted successfully!',
            error: 'Failed to submit booking. Please try again.'
          }
        );
        
        // Reset the form
        form.resetForm();
      } catch (error) {
        // Error already handled by toast.promise
        console.error('Booking submission error:', error);
      }
    },
    resetOnSubmit: true,
  });

  // Calculate pricing when size and placement are selected
  React.useEffect(() => {
    if (form.values.size && form.values.placement && form.touched.size && form.touched.placement) {
      calculatePricing({
        size: form.values.size,
        placement: form.values.placement,
        complexity: 3, // Default complexity
      });
    }
  }, [form.values.size, form.values.placement, form.touched.size, form.touched.placement, calculatePricing]);

  return (
    <div className="w-full max-w-2xl mx-auto shadow-lg bg-white rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold">Book Your Tattoo Appointment</h2>
      </div>
      
      <div className="p-6">
        <form onSubmit={form.handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  {...form.getInputProps('name')}
                />
                {form.errors.name && (
                  <p className="text-sm text-red-500 mt-1">{form.errors.name}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...form.getInputProps('email')}
                />
                {form.errors.email && (
                  <p className="text-sm text-red-500 mt-1">{form.errors.email}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="(123) 456-7890"
                  {...form.getInputProps('phone')}
                />
                {form.errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{form.errors.phone}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Tattoo Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tattoo Details</h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="tattooType">Tattoo Style</Label>
                <Select 
                  id="tattooType"
                  placeholder="Select a style"
                  {...form.getInputProps('tattooType')}
                >
                  <option value="">Select a style</option>
                  <option value="traditional">Traditional</option>
                  <option value="neo-traditional">Neo-Traditional</option>
                  <option value="realism">Realism</option>
                  <option value="blackwork">Blackwork</option>
                  <option value="japanese">Japanese</option>
                  <option value="tribal">Tribal</option>
                  <option value="watercolor">Watercolor</option>
                  <option value="minimalist">Minimalist</option>
                </Select>
                {form.errors.tattooType && (
                  <p className="text-sm text-red-500 mt-1">{form.errors.tattooType}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="size">Size</Label>
                <Select 
                  id="size"
                  placeholder="Select a size"
                  {...form.getInputProps('size')}
                >
                  <option value="">Select a size</option>
                  <option value="small">Small (2-3 inches)</option>
                  <option value="medium">Medium (4-6 inches)</option>
                  <option value="large">Large (7-10 inches)</option>
                  <option value="extra-large">Extra Large (11+ inches)</option>
                  <option value="full-sleeve">Full Sleeve</option>
                  <option value="half-sleeve">Half Sleeve</option>
                  <option value="back-piece">Back Piece</option>
                  <option value="chest-piece">Chest Piece</option>
                </Select>
                {form.errors.size && (
                  <p className="text-sm text-red-500 mt-1">{form.errors.size}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="placement">Placement</Label>
                <Select 
                  id="placement"
                  placeholder="Select placement"
                  {...form.getInputProps('placement')}
                >
                  <option value="">Select placement</option>
                  <option value="arm">Arm</option>
                  <option value="forearm">Forearm</option>
                  <option value="upper-arm">Upper Arm</option>
                  <option value="shoulder">Shoulder</option>
                  <option value="chest">Chest</option>
                  <option value="back">Back</option>
                  <option value="leg">Leg</option>
                  <option value="thigh">Thigh</option>
                  <option value="calf">Calf</option>
                  <option value="ankle">Ankle</option>
                  <option value="foot">Foot</option>
                  <option value="hand">Hand</option>
                  <option value="wrist">Wrist</option>
                  <option value="neck">Neck</option>
                  <option value="ribs">Ribs</option>
                </Select>
                {form.errors.placement && (
                  <p className="text-sm text-red-500 mt-1">{form.errors.placement}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Tattoo Description</Label>
              <Textarea
                id="description"
                placeholder="Please describe your tattoo idea in detail..."
                rows={4}
                {...form.getInputProps('description')}
              />
              {form.errors.description && (
                <p className="text-sm text-red-500 mt-1">{form.errors.description}</p>
              )}
            </div>
          </div>
          
          {/* Pricing Preview */}
          {pricingResult && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold">Estimated Pricing</h3>
              <div className="flex justify-between mt-2">
                <span>Base Price:</span>
                <span>${pricingResult.basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Additional Details:</span>
                <span>${pricingResult.detailsPrice}</span>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-200">
                <span>Total Estimate:</span>
                <span>${pricingResult.totalPrice}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This is a rough estimate. Final pricing will be confirmed during consultation.
              </p>
            </div>
          )}
          
          {/* Schedule Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Schedule Preferences</h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="preferredDate">Preferred Date</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...form.getInputProps('preferredDate')}
                />
                {form.errors.preferredDate && (
                  <p className="text-sm text-red-500 mt-1">{form.errors.preferredDate}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="preferredTime">Preferred Time</Label>
                <Select
                  id="preferredTime"
                  {...form.getInputProps('preferredTime')}
                >
                  <option value="">Select a time</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                </Select>
                {form.errors.preferredTime && (
                  <p className="text-sm text-red-500 mt-1">{form.errors.preferredTime}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Terms and Conditions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="agreeToTerms"
                className="h-4 w-4 rounded border-gray-300"
                checked={form.values.agreeToTerms}
                onChange={(e) => form.setFieldValue('agreeToTerms', e.target.checked)}
              />
              <Label htmlFor="agreeToTerms" className="text-sm">
                I agree to the <a href="/terms" className="text-blue-600 hover:underline">terms and conditions</a>
              </Label>
            </div>
            {form.errors.agreeToTerms && (
              <p className="text-sm text-red-500">{form.errors.agreeToTerms}</p>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Book Now'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Booking Form Component with Error Boundary
 * Provides a comprehensive booking experience with validation and dynamic pricing
 */
export function BookingForm() {
  return (
    <EnhancedErrorBoundary
      componentName="BookingForm"
      title="Unable to load booking form"
      description="We're having trouble displaying the booking form. Please refresh the page to try again."
      showToast={true}
      severity="high"
      canRecover={true}
    >
      <BookingFormContent />
    </EnhancedErrorBoundary>
  );
}