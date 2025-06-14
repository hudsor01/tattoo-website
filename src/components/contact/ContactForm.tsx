'use client';

import React, { useActionState, useId } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { submitContactAction } from '@/lib/actions/contact-actions';
import type { ContactFormState } from '@/lib/prisma-types';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

// Initial state for React 19 useActionState
const initialState: ContactFormState = {
  status: 'idle',
  success: false,
};

// Submit button component using React 19 useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-fernando-gradient hover:bg-fernando-gradient-hover text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      {pending ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
          Sending Message...
        </>
      ) : (
        <>
          Send Message
          <Send className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </>
      )}
    </Button>
  );
}

// Success state component
function SuccessMessage({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-700" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Message Sent Successfully!</h3>
      <p className="text-white/70 mb-6">
        Thank you for reaching out. I'll get back to you as soon as possible, usually within 24-48
        hours.
      </p>
      <Button
        onClick={onReset}
        variant="outline"
        className="border-fernando-red/30 text-fernando-red hover:bg-fernando-gradient/10 hover:border-fernando-orange"
      >
        Send Another Message
      </Button>
    </div>
  );
}

// Main contact form component using React 19 patterns
export default function ContactForm() {
  // React 19 useActionState for form handling
  const [state, formAction] = useActionState(submitContactAction, initialState);
  
  // Generate unique IDs for form fields
  const nameId = useId();
  const emailId = useId();
  const subjectId = useId();
  const messageId = useId();

  // Reset form to initial state
  const handleReset = () => {
    // Reset the form by reloading the component state
    window.location.reload();
  };

  // Show success state
  if (state.status === 'success') {
    return <SuccessMessage onReset={handleReset} />;
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor={nameId} className="text-white font-medium">
          Full Name <span className="text-fernando-red">*</span>
        </Label>
        <Input
          id={nameId}
          name="name"
          required
          className="bg-black/40 border-white/20 text-white placeholder:text-white/40 accent-fernando-red focus:border-fernando-red focus:ring-2 focus:ring-fernando-orange/50 focus:ring-offset-2 focus:ring-offset-black focus:shadow-lg focus:shadow-fernando-red/20 transition-all duration-200 selection:bg-fernando-gradient selection:text-white"
          placeholder="Enter your full name"
          aria-describedby={state.errors?.['name'] ? `${nameId}-error` : undefined}
        />
        {state.errors?.['name'] && (
          <p id={`${nameId}-error`} className="text-fernando-red text-sm" role="alert">
            {state.errors['name']?.[0] ?? 'Name is required'}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor={emailId} className="text-white font-medium">
          Email Address <span className="text-fernando-red">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          <Input
            id={emailId}
            name="email"
            type="email"
            required
            className="bg-black/40 border-white/20 text-white placeholder:text-white/40 accent-fernando-red focus:border-fernando-red focus:ring-2 focus:ring-fernando-orange/50 focus:ring-offset-2 focus:ring-offset-black focus:shadow-lg focus:shadow-fernando-red/20 transition-all duration-200 selection:bg-fernando-gradient selection:text-white pl-11"
            placeholder="your.email@example.com"
            aria-describedby={state.errors?.['email'] ? `${emailId}-error` : undefined}
          />
        </div>
        {state.errors?.['email'] && (
          <p id={`${emailId}-error`} className="text-fernando-red text-sm" role="alert">
            {state.errors['email']?.[0] ?? 'Valid email is required'}
          </p>
        )}
      </div>

      {/* Subject Field */}
      <div className="space-y-2">
        <Label htmlFor={subjectId} className="text-white font-medium">
          Subject <span className="text-fernando-red">*</span>
        </Label>
        <Input
          id={subjectId}
          name="subject"
          required
          className="bg-black/40 border-white/20 text-white placeholder:text-white/40 accent-fernando-red focus:border-fernando-red focus:ring-2 focus:ring-fernando-orange/50 focus:ring-offset-2 focus:ring-offset-black focus:shadow-lg focus:shadow-fernando-red/20 transition-all duration-200 selection:bg-fernando-gradient selection:text-white"
          placeholder="What can I help you with?"
          aria-describedby={state.errors?.['subject'] ? `${subjectId}-error` : undefined}
        />
        {state.errors?.['subject'] && (
          <p id={`${subjectId}-error`} className="text-fernando-red text-sm" role="alert">
            {state.errors['subject']?.[0] ?? 'Subject is required'}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div className="space-y-2">
        <Label htmlFor={messageId} className="text-white font-medium">
          Message <span className="text-fernando-red">*</span>
        </Label>
        <Textarea
          id={messageId}
          name="message"
          required
          rows={6}
          maxLength={2000}
          className="bg-black/40 border-white/20 text-white placeholder:text-white/40 accent-fernando-red focus:border-fernando-red focus:ring-2 focus:ring-fernando-orange/50 focus:ring-offset-2 focus:ring-offset-black focus:shadow-lg focus:shadow-fernando-red/20 transition-all duration-200 selection:bg-fernando-gradient selection:text-white resize-none scroll-smooth"
          placeholder="Tell me about your tattoo idea, questions, or how I can help you..."
          aria-describedby={state.errors?.['message'] ? `${messageId}-error` : undefined}
        />
        {state.errors?.['message'] && (
          <p id={`${messageId}-error`} className="text-fernando-red text-sm" role="alert">
            {state.errors['message']?.[0] ?? 'Message is required'}
          </p>
        )}
        <p className="text-white/50 text-xs">
          Maximum 2000 characters
        </p>
      </div>

      {/* Error Display */}
      {state.status === 'error' && state.message && (
        <div className="bg-fernando-gradient/20 border border-fernando-red/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-fernando-red shrink-0" />
            <div className="text-fernando-red text-sm">
              <p>{state.message}</p>
              {state.rateLimitInfo && (
                <p className="mt-1 text-xs">
                  You have {state.rateLimitInfo.remaining} attempts remaining. 
                  Please try again {state.rateLimitInfo.timeRemaining > 60 
                    ? `in ${Math.floor(state.rateLimitInfo.timeRemaining / 60)} minutes` 
                    : `in ${state.rateLimitInfo.timeRemaining} seconds`}.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <SubmitButton />

      {/* Contact Info */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-white/70 text-sm text-center">
          You can also reach me directly at:{' '}
          <a
            href={`mailto:${process.env['NEXT_PUBLIC_CONTACT_EMAIL'] ?? 'contact@ink37tattoos.com'}`}
            className="text-fernando-red hover:text-red-300 transition-colors"
          >
            {process.env['NEXT_PUBLIC_CONTACT_EMAIL'] ?? 'contact@ink37tattoos.com'}
          </a>
        </p>
      </div>
    </form>
  );
}