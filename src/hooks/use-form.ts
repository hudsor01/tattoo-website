'use client';

import { useState, useEffect } from 'react';
import { ZodSchema, z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandling } from '@/hooks/use-error-handling';

interface FormOptions<T> {
  initialValues: T;
  validationSchema?: ZodSchema<T>;
  onSubmit?: (values: T) => Promise<any> | any;
  resetOnSubmit?: boolean;
}

/**
 * Custom form hook for form management with validation
 */
export function useForm<T extends Record<string, any>>({
  const toast = useToast();
  initialValues,
  validationSchema,
  onSubmit,
  resetOnSubmit = false,
}: FormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset the form to initial values
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
  };

  // Validate the entire form
  const validateForm = (): boolean => {
    if (!validationSchema) return true;

    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Validate a single field
  const validateField = (name: string): boolean => {
    if (!validationSchema) return true;

    try {
      // Extract the field's schema from the overall schema
      const fieldSchema = validationSchema.shape[name as keyof typeof validationSchema.shape];
      if (!fieldSchema) return true;
      
      // Validate just this field
      fieldSchema.parse(values[name]);
      
      // Clear any errors for this field
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [name]: error.errors[0]?.message || 'Invalid input',
        }));
      }
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);
    setIsSubmitted(true);

    // Validate the form
    const isValid = validateForm();
    if (!isValid) return;

    // Call the onSubmit handler
    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
        if (resetOnSubmit) {
          resetForm();
        }
      } catch (error) {
        console.error('Form submission error:', error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('An error occurred during form submission');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox values
    const val = (e.target as HTMLInputElement).type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;
    
    // Update the form values
    setValues((prev) => ({ ...prev, [name]: val }));
    
    // Mark the field as touched
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    // Validate the field if it's been touched
    if (touched[name]) {
      validateField(name);
    }
  };

  // Handle file input changes
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    multiple: boolean = false
  ) => {
    const { name, files } = e.target;
    
    if (!files) return;
    
    // Update the form values with the file or files
    setValues((prev) => ({
      ...prev,
      [name]: multiple ? Array.from(files) : files[0],
    }));
    
    // Mark the field as touched
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    // Validate the field if it's been touched
    if (touched[name]) {
      validateField(name);
    }
  };

  // Set a specific field value
  const setFieldValue = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name);
    }
  };

  // Mark a field as touched
  const setFieldTouched = (name: string, isTouched: boolean = true) => {
    setTouched((prev) => ({ ...prev, [name]: isTouched }));
    if (isTouched) {
      validateField(name);
    }
  };

  // Validate on mount and when values change
  useEffect(() => {
    if (isSubmitted) {
      validateForm();
    }
  }, [values, isSubmitted]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isSubmitted,
    handleChange,
    handleFileChange,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    resetForm,
    validateForm,
    validateField,
  };
}