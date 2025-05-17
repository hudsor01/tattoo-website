'use client';

import * as React from 'react';
import { type FieldPath, type FieldValues } from 'react-hook-form';
import { cn } from '@/utils';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Base props for all form field components
 */
import type { Control } from 'react-hook-form';

export interface FormFieldBaseProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  label?: string;
  description?: string;
  placeholder?: string;
  control: Control<TFieldValues>;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

/**
 * Props for text input fields
 */
export interface TextFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends FormFieldBaseProps<TFieldValues, TName> {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

/**
 * Text input field component
 */
function TextFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  placeholder,
  control,
  type = 'text',
  disabled = false,
  className,
  required,
  autoComplete,
  maxLength,
  minLength,
  pattern,
}: TextFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <ExtendedFormLabel required={required}>{label}</ExtendedFormLabel>}
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete={autoComplete}
              maxLength={maxLength}
              minLength={minLength}
              pattern={pattern}
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Props for textarea fields
 */
export interface TextareaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends FormFieldBaseProps<TFieldValues, TName> {
  rows?: number;
  maxLength?: number;
  minLength?: number;
}

/**
 * Textarea field component
 */
export function TextareaField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  placeholder,
  control,
  disabled = false,
  className,
  required,
  rows = 4,
  maxLength,
  minLength,
}: TextareaFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <ExtendedFormLabel required={required}>{label}</ExtendedFormLabel>}
          <FormControl>
            <Textarea
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              maxLength={maxLength}
              minLength={minLength}
              {...field}
              value={field.value || ''}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Props for checkbox fields
 */
export interface CheckboxFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends FormFieldBaseProps<TFieldValues, TName> {
  checkboxLabel?: string;
}

/**
 * Checkbox field component
 */
export function CheckboxField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  description,
  control,
  disabled = false,
  className,
  required,
  checkboxLabel,
}: CheckboxFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-row items-start space-x-3 space-y-0', className)}>
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
          </FormControl>
          <div className="space-y-1 leading-none">
            {checkboxLabel && (
              <ExtendedFormLabel required={required}>{checkboxLabel}</ExtendedFormLabel>
            )}
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Props for switch fields
 */
export interface SwitchFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends FormFieldBaseProps<TFieldValues, TName> {
  switchLabel?: string;
}

/**
 * Switch field component
 */
export function SwitchField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  control,
  disabled = false,
  className,
  required,
  switchLabel,
}: SwitchFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-row items-center justify-between', className)}>
          <div className="space-y-0.5">
            {label && <ExtendedFormLabel required={required}>{label}</ExtendedFormLabel>}
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              aria-label={switchLabel || label || name}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Props for select fields
 */
export interface SelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends FormFieldBaseProps<TFieldValues, TName> {
  options: { label: string; value: string }[];
  emptyMessage?: string;
}

/**
 * Select field component
 */
export function SelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  placeholder,
  control,
  disabled = false,
  className,
  required,
  options,
  emptyMessage = 'No options available',
}: SelectFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <ExtendedFormLabel required={required}>{label}</ExtendedFormLabel>}
          <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.length > 0 ? (
                options.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                <p className="p-2 text-center text-sm text-muted-foreground">{emptyMessage}</p>
              )}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Props for radio group fields
 */
export interface RadioGroupFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends FormFieldBaseProps<TFieldValues, TName> {
  options: { label: string; value: string }[];
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Radio group field component
 */
export function RadioGroupField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  control,
  disabled = false,
  className,
  required,
  options,
  orientation = 'vertical',
}: RadioGroupFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <ExtendedFormLabel required={required}>{label}</ExtendedFormLabel>}
          <FormControl>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled}
              className={cn(
                orientation === 'horizontal' && 'flex flex-row space-x-2',
                orientation === 'vertical' && 'flex flex-col space-y-2',
              )}
            >
              {options.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                  <ExtendedFormLabel htmlFor={`${name}-${option.value}`} className="font-normal">
                    {option.label}
                  </ExtendedFormLabel>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Props for date picker fields
 */
export interface DatePickerFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends FormFieldBaseProps<TFieldValues, TName> {
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
}

/**
 * Date picker field component
 */
export function DatePickerField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  placeholder = 'Select a date',
  control,
  disabled = false,
  className,
  required,
  dateFormat = 'PPP',
  minDate,
  maxDate,
}: DatePickerFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <ExtendedFormLabel required={required}>{label}</ExtendedFormLabel>}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full pl-3 text-left font-normal',
                    !field.value && 'text-muted-foreground',
                  )}
                  disabled={disabled}
                >
                  {field.value ? format(field.value, dateFormat) : <span>{placeholder}</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={
                  disabled ||
                  ((date: Date) => {
                    return (minDate ? date < minDate : false) || (maxDate ? date > maxDate : false);
                  })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Function to extend the React component props with 'required' prop for <FormLabel>
 */
type ComponentWithRequiredProp = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<
    React.ComponentPropsWithoutRef<typeof FormLabel> & { required?: boolean | undefined }
  > &
    React.RefAttributes<HTMLLabelElement>
>;

const ExtendedFormLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<typeof FormLabel> & { required?: boolean | undefined }
>(({ required, children, className, ...props }, ref) => {
  return (
    <FormLabel ref={ref} className={className} {...props}>
      {children}
      {required && <span className="ml-1 text-destructive">*</span>}
    </FormLabel>
  );
}) as ComponentWithRequiredProp;

ExtendedFormLabel.displayName = 'ExtendedFormLabel';

// Replace the original FormLabel with the extended version
Object.assign(FormLabel, ExtendedFormLabel);

export { TextFieldComponent as TextField };
