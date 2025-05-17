// Form component types

import type { FieldValues, UseFormReturn, FieldPath } from 'react-hook-form';
import type { ReactNode } from 'react';

export interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
}

export interface FormItemContextValue {
  id: string;
}

export interface FormProviderProps<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
  children: ReactNode;
}

// Re-export types from react-hook-form for convenience
export type { FieldPath, FieldValues, ControllerProps } from 'react-hook-form';
