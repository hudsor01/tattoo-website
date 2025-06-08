'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/utils';
import { Label } from '@/components/ui/label';

// Component-specific form types - inline definition appropriate
type FormFieldContextValue = {
  name: string;
  error: string;
  id: string;
};

type FormItemContextValue = {
  id: string;
};

type FormProps = React.FormHTMLAttributes<HTMLFormElement> & {
  action?: string | ((formData: FormData) => void | Promise<void>);
};

type FormFieldProps = {
  name: string;
  error?: string;
  children: React.ReactNode;
};

type FormSubmitProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loadingText?: string;
};

type FormState = {
  status: 'idle' | 'loading' | 'error' | 'success';
  isSubmitting: boolean;
  isError: boolean;
  isSuccess: boolean;
};


// Form field context
const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);


// Form item context
const FormItemContext = React.createContext<FormItemContextValue | null>(null);


// Form component that works with Server Actions and useActionState
const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, action, children, ...props }, ref) => {
    return (
      <form
        ref={ref}
        action={action}
        className={cn('space-y-6', className)}
        {...props}
      >
        {children}
      </form>
    );
  }
);
Form.displayName = 'Form';

function FormField({ name, error, children }: FormFieldProps) {
  const id = React.useId();

  const fieldContextValue: FormFieldContextValue = { 
    name, 
    error: error ?? '', 
    id 
  };
  
  return (
    <FormFieldContext.Provider value={fieldContextValue}>
      {children}
    </FormFieldContext.Provider>
  );
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id: fieldId, name, error } = fieldContext;
  const { id: itemId } = itemContext ?? { id: fieldId };

  return {
    id: itemId,
    name,
    formItemId: `${itemId}-form-item`,
    formDescriptionId: `${itemId}-form-item-description`,
    formMessageId: `${itemId}-form-item-message`,
    error,
    invalid: !!error,
  };
};

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props} />
      </FormItemContext.Provider>
    );
  }
);
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(error && 'text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
  React.ComponentRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>((props, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

const FormSubmit = React.forwardRef<HTMLButtonElement, FormSubmitProps>(
  ({ className, children, loadingText = 'Submitting...', disabled, ...props }, ref) => {
    // Simple state-based pending indicator - stable for SSR
    const [isPending, setIsPending] = React.useState(false);

    // Track form submission with useEffect for cleanup
    React.useEffect(() => {
      return () => {
        // Cleanup effect
        if (isPending) {
          setIsPending(false);
        }
      };
    }, [isPending, setIsPending]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (props.onClick) {
        props.onClick(event);
      }
    };

    return (
      <button
        ref={ref}
        type="submit"
        disabled={disabled ?? isPending}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'h-10 px-4 py-2',
          'disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        onClick={handleClick}
        suppressHydrationWarning
        {...props}
      >
        {isPending ? loadingText : children}
      </button>
    );
  }
);
FormSubmit.displayName = 'FormSubmit';

export function getFieldError(
  errors: Record<string, string[]> | undefined,
  fieldName: string
): string | undefined {
  return errors?.[fieldName]?.[0];
}

export const initialFormState: FormState = {
  status: 'idle',
  isSubmitting: false,
  isError: false,
  isSuccess: false,
};

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  FormSubmit,
};