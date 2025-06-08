/**
 * Enhanced Contact Form with Advanced Validation
 * 
 * Features comprehensive validation, security checks, and real-time feedback
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced validation imports
import { enhancedContactFormSchema, type EnhancedContactFormData } from '@/lib/validation/enhanced-validation';
import { useEnhancedValidation } from '@/hooks/use-enhanced-validation';
import { ValidationFeedback } from '@/components/validation/ValidationFeedback';
import { CSRFInput } from '@/components/providers/CSRFProvider';

const TATTOO_TYPES = [
  { value: 'traditional', label: 'Traditional' },
  { value: 'realism', label: 'Realism' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'coverup', label: 'Cover-up' },
  { value: 'custom', label: 'Custom Design' },
  { value: 'other', label: 'Other' },
];

const SERVICES = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'design', label: 'Custom Design' },
  { value: 'tattoo', label: 'Tattoo Session' },
  { value: 'touchup', label: 'Touch-up' },
  { value: 'removal', label: 'Removal Consultation' },
];

const BUDGET_RANGES = [
  '$100-$300',
  '$300-$500',
  '$500-$1000',
  '$1000-$2000',
  '$2000+',
];

export function EnhancedContactForm() {
  const [formData, setFormData] = useState<Partial<EnhancedContactFormData>>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    tattooType: undefined,
    budget: '',
    service: undefined,
    preferredTime: '',
    agreeToTerms: false,
    honeypot: '', // Anti-spam honeypot
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Enhanced validation hook
  const {
    validationState,
    validateForm,
    handleFieldChange,
    handleFieldBlur,
    getFieldState,
    clearValidation,
  } = useEnhancedValidation(enhancedContactFormSchema, {
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 500,
    showSecurityWarnings: true,
    enableRealTimeValidation: true,
  });

  /**
   * Handle input changes with validation
   */
  const handleInputChange = (fieldName: keyof EnhancedContactFormData, value: any) => {
    const newFormData = { ...formData, [fieldName]: value };
    setFormData(newFormData);
    handleFieldChange(fieldName, value, newFormData);
  };

  /**
   * Handle input blur with validation
   */
  const handleInputBlur = (fieldName: keyof EnhancedContactFormData, value: any) => {
    handleFieldBlur(fieldName, value, formData);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Validate entire form
      const validation = await validateForm(formData);
      
      if (!validation.success) {
        setSubmitStatus('error');
        setSubmitMessage('Please fix the validation errors before submitting.');
        setIsSubmitting(false);
        return;
      }

      // Submit to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validation.data),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setSubmitMessage('Thank you! Your message has been sent successfully.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          tattooType: undefined,
          budget: '',
          service: undefined,
          preferredTime: '',
          agreeToTerms: false,
          honeypot: '',
        });
        clearValidation();
      } else {
        setSubmitStatus('error');
        setSubmitMessage(result.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Calculate form completion percentage
   */
  const calculateCompletion = () => {
    const requiredFields = ['name', 'email', 'subject', 'message', 'agreeToTerms'];
    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof EnhancedContactFormData];
      return value && value !== '' && value !== false;
    });
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const completionPercentage = calculateCompletion();
  const hasSecurityThreats = Object.values(validationState.securityThreats).some(threats => threats.length > 0);
  const hasErrors = Object.values(validationState.errors).some(errors => errors.length > 0);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Contact Ink 37 Tattoos
        </CardTitle>
        <CardDescription>
          Get in touch for consultations, bookings, or questions about our services.
        </CardDescription>
        
        {/* Form Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Form Completion</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Security Status */}
        {hasSecurityThreats && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <Shield className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">Security issues detected. Please review your input.</span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Anti-spam honeypot field (hidden) */}
          <input
            type="text"
            name="honeypot"
            value={formData.honeypot}
            onChange={(e) => handleInputChange('honeypot', e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* CSRF Protection */}
          <CSRFInput />

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={(e) => handleInputBlur('name', e.target.value)}
                placeholder="Your full name"
                className={cn(
                  getFieldState('name').hasErrors && 'border-red-500',
                  getFieldState('name').hasSecurityThreats && 'border-red-500 bg-red-50'
                )}
              />
              <ValidationFeedback
                fieldName="name"
                {...getFieldState('name')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={(e) => handleInputBlur('email', e.target.value)}
                placeholder="your.email@example.com"
                className={cn(
                  getFieldState('email').hasErrors && 'border-red-500',
                  getFieldState('email').hasSecurityThreats && 'border-red-500 bg-red-50'
                )}
              />
              <ValidationFeedback
                fieldName="email"
                {...getFieldState('email')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              onBlur={(e) => handleInputBlur('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className={cn(
                getFieldState('phone').hasErrors && 'border-red-500'
              )}
            />
            <ValidationFeedback
              fieldName="phone"
              {...getFieldState('phone')}
            />
          </div>

          {/* Service Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service">Service Type</Label>
              <Select
                value={formData.service}
                onValueChange={(value) => handleInputChange('service', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map((service) => (
                    <SelectItem key={service.value} value={service.value}>
                      {service.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tattooType">Tattoo Style</Label>
              <Select
                value={formData.tattooType}
                onValueChange={(value) => handleInputChange('tattooType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent>
                  {TATTOO_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget Range</Label>
            <Select
              value={formData.budget}
              onValueChange={(value) => handleInputChange('budget', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your budget range" />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_RANGES.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ValidationFeedback
              fieldName="budget"
              {...getFieldState('budget')}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              onBlur={(e) => handleInputBlur('subject', e.target.value)}
              placeholder="Brief description of your inquiry"
              className={cn(
                getFieldState('subject').hasErrors && 'border-red-500',
                getFieldState('subject').hasSecurityThreats && 'border-red-500 bg-red-50'
              )}
            />
            <ValidationFeedback
              fieldName="subject"
              {...getFieldState('subject')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              onBlur={(e) => handleInputBlur('message', e.target.value)}
              placeholder="Tell us about your tattoo idea, questions, or what you'd like to discuss..."
              rows={6}
              className={cn(
                getFieldState('message').hasErrors && 'border-red-500',
                getFieldState('message').hasSecurityThreats && 'border-red-500 bg-red-50'
              )}
            />
            <ValidationFeedback
              fieldName="message"
              {...getFieldState('message')}
            />
          </div>

          {/* Terms Agreement */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="agreeToTerms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
            />
            <Label
              htmlFor="agreeToTerms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the terms and conditions and privacy policy *
            </Label>
          </div>
          <ValidationFeedback
            fieldName="agreeToTerms"
            {...getFieldState('agreeToTerms')}
          />

          {/* Submit Status */}
          {submitStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700">{submitMessage}</span>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{submitMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || hasErrors || hasSecurityThreats || !formData.agreeToTerms}
            className="w-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Sending Message...
              </>
            ) : (
              <>
                Send Message
                <Send className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Shield className="h-3 w-3" />
            <span>Protected by enhanced security validation</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}