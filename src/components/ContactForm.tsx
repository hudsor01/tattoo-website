'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useContactForm } from '@/hooks/use-contact-form';
import { Mail, Send, CheckCircle } from 'lucide-react';

// Contact form validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { submitContactForm, isSubmitting, isSuccess, isError } = useContactForm();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      await submitContactForm(data);
      setIsSubmitted(true);
      reset();
    } catch (err) {
      console.error('Failed to submit contact form:', err);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    reset();
  };

  if (isSubmitted ?? isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Message Sent Successfully!</h3>
        <p className="text-white/70 mb-6">
          Thank you for reaching out. I'll get back to you as soon as possible, usually within 24-48 hours.
        </p>
        <Button
          onClick={handleReset}
          variant="outline"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400"
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-6">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-white font-medium">
          Full Name <span className="text-red-400">*</span>
        </Label>
        <Input
          id="name"
          {...register('name')}
          className="bg-black/40 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20"
          placeholder="Enter your full name"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-red-400 text-sm">{errors.name.message}</p>
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
            type="email"
            {...register('email')}
            className="bg-black/40 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20 pl-11"
            placeholder="your.email@example.com"
            disabled={isSubmitting}
          />
        </div>
        {errors.email && (
          <p className="text-red-400 text-sm">{errors.email.message}</p>
        )}
      </div>

      {/* Subject Field */}
      <div className="space-y-2">
        <Label htmlFor="subject" className="text-white font-medium">
          Subject <span className="text-red-400">*</span>
        </Label>
        <Input
          id="subject"
          {...register('subject')}
          className="bg-black/40 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20"
          placeholder="What can I help you with?"
          disabled={isSubmitting}
        />
        {errors.subject && (
          <p className="text-red-400 text-sm">{errors.subject.message}</p>
        )}
      </div>

      {/* Message Field */}
      <div className="space-y-2">
        <Label htmlFor="message" className="text-white font-medium">
          Message <span className="text-red-400">*</span>
        </Label>
        <Textarea
          id="message"
          {...register('message')}
          rows={6}
          className="bg-black/40 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20 resize-none"
          placeholder="Tell me about your tattoo idea, questions, or how I can help you..."
          disabled={isSubmitting}
        />
        {errors.message && (
          <p className="text-red-400 text-sm">{errors.message.message}</p>
        )}
        <p className="text-white/50 text-xs">
          Characters remaining: {2000 - (watch('message')?.length ?? 0)}
        </p>
      </div>

      {/* Error Display */}
      {isError && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">
            {'Failed to send message. Please try again or contact me directly.'}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isSubmitting ? (
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
    </form>
  );
}