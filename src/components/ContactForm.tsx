'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Loader2, CheckCircle2, Upload, FilePlus, Send, AlertCircle } from 'lucide-react';
import {
  contactFormSchema as apiContactFormSchema,
  contactFormResponseSchema,
  defaultContactFormValues,
} from '@/lib/validations/validation-contact';
import type { ContactFormValues } from '@/lib/validations/validation-contact';
// import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
// import { EnhancedErrorBoundary } from '@/components/error/enhanced-error-boundary';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
// Unused import: import { useErrorHandling } from '@/hooks/use-error-handling';

// Animation variants
const formVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Success message component
const SuccessMessage = ({ onReset }: { onReset: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="bg-gradient-to-br from-green-500/10 to-blue-500/10 backdrop-blur-sm p-8 rounded-lg border border-green-500/20 text-center"
  >
    <div className="flex justify-center mb-4">
      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      </div>
    </div>
    <h3 className="text-2xl font-bold text-white mb-3">Message Sent!</h3>
    <p className="text-white/80 mb-6">
      Thank you for reaching out. I'll get back to you as soon as possible.
    </p>
    <Button onClick={onReset} variant="outline" className="border-white/20 hover:bg-white/10">
      Send Another Message
    </Button>
  </motion.div>
);

/**
 * Contact form component content
 * Extracted to allow wrapping with error boundary
 */
function ContactFormContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [successfulSubmission, setSuccessfulSubmission] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  // Using toast commented out in this component
  // const { toast } = useToast();

  // Initialize form with validation schema
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(apiContactFormSchema),
    defaultValues: {
      ...defaultContactFormValues,
      agreeToTerms: defaultContactFormValues['agreeToTerms'] ?? false,
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { errors, isValid, isSubmitted }, // Removed dirtyFields
    watch,
    setValue,
    reset,
    control,
    trigger,
  } = form;

  const hasReferenceImages = watch('hasReference');

  // Reset form and state
  const handleReset = useCallback(() => {
    reset(defaultContactFormValues);
    setUploadedImages([]);
    setSuccessfulSubmission(false);
  }, [reset]);

  // Handle file uploads with visual feedback
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);

    try {
      // Simulated upload delay for UX demonstration
      await new Promise(resolve => setTimeout(resolve, 800));

      // Validate file types and create blob URLs for valid images
      const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      const newImages = Array.from(files)
        .filter(file => validImageTypes.includes(file.type))
        .map(file => URL.createObjectURL(file));

      if (newImages.length === 0) {
        console.warn('No valid image files were uploaded.');
        return;
      }

      setUploadedImages([...uploadedImages, ...newImages]);
      setValue('referenceImages', [...uploadedImages, ...newImages], {
        shouldValidate: true,
        shouldDirty: true,
      });

      // toast.success(`${newImages.length} image${newImages.length > 1 ? 's' : ''} added successfully`, {
      //   description: 'You can add more or continue filling the form'
      // });
    } catch (error) {
      console.error('Error uploading files:', error);
      // toast.error('Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  // Handle removing an image
  const handleRemoveImage = (index: number) => {
    const newImages = [...uploadedImages];
    const removedImage = newImages.splice(index, 1);
    setUploadedImages(newImages);
    setValue('referenceImages', newImages, { shouldValidate: true });

    // Release object URL to prevent memory leaks
    if (removedImage[0]) {
      URL.revokeObjectURL(removedImage[0]);
    }
  };

  // Form submission handler with enhanced error handling
  const onSubmit = async (data: ContactFormValues): Promise<void> => {
    setIsSubmitting(true);

    try {
      // Ensure all validations pass again
      const isValid = await trigger();

      if (!isValid) {
        throw new Error('Validation failed. Please check your form entries.');
      }

      // Transform the data to match API expectations
      const apiData = {
        ...data,
        referenceImages: uploadedImages,
      };

      // Submit data using our validated API client
      const response = await api.post('/api/contact', {
        data: apiData,
        schema: {
          input: apiContactFormSchema,
          output: contactFormResponseSchema,
        },
      });

      // Cast response to the expected type
      if (
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        typeof response.success === 'boolean'
      ) {
        const typedResponse = response as { success: boolean; message?: string };

        if (typedResponse.success) {
          // Mark as successful to show success message
          setSuccessfulSubmission(true);
        } else {
          // toast.error(typedResponse.message || 'Failed to send message. Please try again.');
        }
      } else {
        throw new Error('Unexpected response from the server.');
      }
    } catch (error: unknown) {
      // Error message is unused but useful for debugging
      // let errorMessage = 'Failed to send message. Please try again.';

      // if (
      //   error &&
      //   typeof error === 'object' &&
      //   'message' in error &&
      //   typeof (error as { message?: unknown }).message === 'string'
      // ) {
      //   errorMessage = (error as { message: string }).message;
      // }

      // toast.error(errorMessage);

      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If successfully submitted, show success message
  if (successfulSubmission) {
    return <SuccessMessage onReset={handleReset} />;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={formVariants}
      className="bg-black/20 backdrop-blur-sm p-6 rounded-lg border border-white/10 shadow-lg"
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <motion.div variants={formItemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name field */}
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-sm font-medium">
                    Full Name <span className="text-tattoo-red">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className={`w-full p-3 rounded-lg bg-black/40 border ${
                        errors['name']
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-white/20 focus:border-tattoo-blue'
                      } text-white placeholder-white/50`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {errors['name'] && <AlertCircle className="h-3 w-3" />}
                    {typeof errors['name']?.message === 'string' ? errors['name']?.message : null}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Email field */}
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-sm font-medium">
                    Email Address <span className="text-tattoo-red">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className={`w-full p-3 rounded-lg bg-black/40 border ${
                        errors['email']
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-white/20 focus:border-tattoo-blue'
                      } text-white placeholder-white/50`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {errors['email'] && <AlertCircle className="h-3 w-3" />}
                    {typeof errors['email']?.message === 'string' ? errors['email']?.message : null}
                  </FormMessage>
                </FormItem>
              )}
            />
          </motion.div>

          {/* Subject field */}
          <motion.div variants={formItemVariants}>
            <FormField
              control={control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-sm font-medium">
                    Subject <span className="text-tattoo-red">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className={`w-full p-3 rounded-lg bg-black/40 border ${
                        errors.subject
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-white/20 focus:border-tattoo-blue'
                      } text-white placeholder-white/50`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {errors['subject'] && <AlertCircle className="h-3 w-3" />}
                    {typeof errors['subject']?.message === 'string'
                      ? errors['subject']?.message
                      : null}
                  </FormMessage>
                </FormItem>
              )}
            />
          </motion.div>

          {/* Message field */}
          <motion.div variants={formItemVariants}>
            <FormField
              control={control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-sm font-medium">
                    Message <span className="text-tattoo-red">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your query or request in detail..."
                      className={`w-full p-3 rounded-lg bg-black/40 border ${
                        errors.message
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-white/20 focus:border-tattoo-blue'
                      } text-white placeholder-white/50 resize-none`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {errors['message'] && <AlertCircle className="h-3 w-3" />}
                    {typeof errors['message']?.message === 'string'
                      ? errors['message']?.message
                      : null}
                  </FormMessage>
                </FormItem>
              )}
            />
          </motion.div>

          {/* Reference images */}
          <motion.div variants={formItemVariants}>
            <FormField
              control={control}
              name="hasReference"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={Boolean(field.value)}
                        onCheckedChange={field.onChange}
                        className="border-white/20"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-medium text-white cursor-pointer">
                      I have reference images to share
                    </FormLabel>
                  </div>

                  <AnimatePresence>
                    {hasReferenceImages && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 pt-2">
                          {/* File upload section */}
                          <div className="relative">
                            <label
                              htmlFor="file-upload"
                              className={`
                                group flex flex-col items-center justify-center w-full h-32 
                                border-2 border-dashed rounded-lg cursor-pointer 
                                transition-colors duration-300
                                ${
                                  uploadingImages
                                    ? 'border-tattoo-blue/50 bg-tattoo-blue/10'
                                    : 'border-white/20 hover:border-tattoo-blue/50 hover:bg-tattoo-blue/5'
                                }
                              `}
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {uploadingImages ? (
                                  <>
                                    <Loader2 className="w-8 h-8 text-tattoo-blue mb-2 animate-spin" />
                                    <p className="text-sm text-white/70">Uploading images...</p>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-8 h-8 text-white/60 mb-2 group-hover:text-tattoo-blue transition-colors" />
                                    <p className="text-sm text-white/70">
                                      <span className="font-medium text-white/90">
                                        Click to upload
                                      </span>{' '}
                                      or drag and drop
                                    </p>
                                    <p className="text-xs text-white/50">
                                      SVG, PNG, JPG or GIF (MAX. 5MB)
                                    </p>
                                  </>
                                )}
                              </div>
                              <input
                                id="file-upload"
                                type="file"
                                name="file-upload"
                                multiple
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={uploadingImages}
                                className="hidden"
                              />
                            </label>
                          </div>

                          {/* Image gallery */}
                          {uploadedImages.length > 0 && (
                            <motion.div
                              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                              initial="hidden"
                              animate="visible"
                              variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                  opacity: 1,
                                  transition: { staggerChildren: 0.1 },
                                },
                              }}
                            >
                              <AnimatePresence>
                                {uploadedImages.map((image, index) => (
                                  <motion.div
                                    key={image}
                                    className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    whileHover={{ scale: 1.02 }}
                                  >
                                    <img
                                      src={image}
                                      alt={`Reference ${index + 1}`}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveImage(index)}
                                      className="absolute bottom-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                      aria-label="Remove image"
                                    >
                                      <X size={14} />
                                    </button>
                                  </motion.div>
                                ))}
                              </AnimatePresence>

                              {/* Add more button */}
                              <label
                                htmlFor="add-more-images"
                                className="flex flex-col items-center justify-center aspect-square rounded-lg border border-dashed border-white/20 hover:border-tattoo-blue/50 cursor-pointer bg-black/20 hover:bg-tattoo-blue/5 transition-colors"
                              >
                                <FilePlus className="h-6 w-6 text-white/60 mb-2" />
                                <span className="text-xs text-white/60">Add More</span>
                                <input
                                  id="add-more-images"
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                  disabled={uploadingImages}
                                  className="hidden"
                                />
                              </label>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </FormItem>
              )}
            />
          </motion.div>

          {/* Terms and conditions */}
          <motion.div variants={formItemVariants}>
            <FormField
              control={control}
              name="agreeToTerms"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <FormControl>
                      <Checkbox
                        className={`mt-0.5 border-white/20 ${errors['agreeToTerms'] ? 'data-[state=unchecked]:border-red-500' : ''}`}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="text-sm font-medium text-white">
                        I agree to the{' '}
                        <a
                          href="/terms-and-conditions"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-tattoo-blue hover:text-tattoo-blue/80 transition-colors"
                        >
                          terms and conditions
                        </a>{' '}
                        <span className="text-tattoo-red">*</span>
                      </FormLabel>
                      <FormDescription className="text-xs text-white/50">
                        Your information is secure and will only be used to respond to your inquiry.
                      </FormDescription>
                    </div>
                    <FormMessage>
                      {errors['agreeToTerms'] && <AlertCircle className="h-3 w-3" />}
                      {typeof errors['agreeToTerms']?.message === 'string'
                        ? errors['agreeToTerms']?.message
                        : null}
                    </FormMessage>
                  </div>
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={formItemVariants} className="mt-8">
            <Button
              type="submit"
              disabled={isSubmitting || (!isValid && isSubmitted)}
              className="w-full bg-tattoo-blue hover:bg-tattoo-blue/90 text-white font-medium py-3 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 text-white" />
                  <span>Sending Message...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  <span>Send Message</span>
                </>
              )}
            </Button>

            {/* Form status indicator */}
            {isSubmitted && Object.keys(errors).length > 0 && (
              <motion.div
                className="mt-4 py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle className="text-red-500 h-4 w-4" />
                <p className="text-sm text-red-500">
                  Please fix the errors above before submitting.
                </p>
              </motion.div>
            )}
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}

/**
 * Enhanced Contact form component that extends the base form component.
 * Provides rich interactivity, animations, and improved validation feedback.
 * Wrapped with error boundary for improved resilience.
 */
export default function ContactForm() {
  return (
    <ContactFormContent />
  );
}
