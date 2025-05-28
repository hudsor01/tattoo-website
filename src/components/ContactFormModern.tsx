'use client';

import React, { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { submitContactAction } from '@/lib/actions/contact-actions';
import type { ContactFormState } from '@/types/component-types';

/**
 * Modern ContactForm using React 19 Server Actions
 * Features:
 * - Progressive enhancement (works without JavaScript)
 * - useActionState for form state management
 * - useFormStatus for pending states
 * - Better accessibility and SEO
 */

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed group"
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

function FormContent({ state }: { state: ContactFormState }) {
  return (
    <>
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-white font-medium">
          Full Name <span className="text-red-400">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          required
          className="bg-black/40 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20"
          placeholder="Enter your full name"
          aria-describedby={state.errors?.name ? 'name-error' : undefined}
        />
        {state.errors?.name && (
          <p id="name-error" className="text-red-400 text-sm" role="alert">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white font-medium">
          Email Address <span className="text-red-400">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="bg-black/40 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20 pl-11"
            placeholder="your.email@example.com"
            aria-describedby={state.errors?.email ? 'email-error' : undefined}
          />
        </div>
        {state.errors?.email && (
          <p id="email-error" className="text-red-400 text-sm" role="alert">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      {/* Subject Field */}
      <div className="space-y-2">
        <Label htmlFor="subject" className="text-white font-medium">
          Subject <span className="text-red-400">*</span>
        </Label>
        <Input
          id="subject"
          name="subject"
          required
          className="bg-black/40 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20"
          placeholder="What can I help you with?"
          aria-describedby={state.errors?.subject ? 'subject-error' : undefined}
        />
        {state.errors?.subject && (
          <p id="subject-error" className="text-red-400 text-sm" role="alert">
            {state.errors.subject[0]}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div className="space-y-2">
        <Label htmlFor="message" className="text-white font-medium">
          Message <span className="text-red-400">*</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={6}
          className="bg-black/40 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20 resize-none"
          placeholder="Tell me about your tattoo idea, questions, or how I can help you..."
          aria-describedby={state.errors?.message ? 'message-error' : undefined}
        />
        {state.errors?.message && (
          <p id="message-error" className="text-red-400 text-sm" role="alert">
            {state.errors.message[0]}
          </p>
        )}
      </div>

      {/* Error Display */}
      {state.status === 'error' && state.message && (
        <div
          className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-400 text-sm">{state.message}</p>
        </div>
      )}

      {/* Submit Button */}
      <SubmitButton />

      {/* Contact Info */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-white/70 text-sm text-center">
          You can also reach me directly at:{' '}
          <a
            href="mailto:fennyg83@gmail.com"
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            fennyg83@gmail.com
          </a>
        </p>
      </div>
    </>
  );
}

function SuccessMessage({ state, onReset }: { state: ContactFormState; onReset: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Message Sent Successfully!</h3>
      <p className="text-white/70 mb-6">{state.message}</p>
      {state.submissionId && (
        <p className="text-white/50 text-sm mb-6">Reference ID: {state.submissionId}</p>
      )}
      <Button
        onClick={onReset}
        variant="outline"
        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400"
      >
        Send Another Message
      </Button>
    </div>
  );
}

export default function ContactFormModern() {
  const initialState: ContactFormState = {
    status: 'idle',
  };

  const [state, formAction] = useActionState(submitContactAction, initialState);

  const handleReset = () => {
    // Reset form by reloading the component
    window.location.reload();
  };

  // Show success state
  if (state.status === 'success') {
    return <SuccessMessage state={state} onReset={handleReset} />;
  }

  return (
    <form action={formAction} className="space-y-6">
      <FormContent state={state} />
    </form>
  );
}
