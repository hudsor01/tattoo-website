// Icon button types

import type { ButtonHTMLAttributes, ComponentType } from 'react';
import type { VariantProps } from 'class-variance-authority';
import type { buttonVariants } from '@/components/ui/button';

// Type for Lucide React icons
interface LucideIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
}

type LucideIcon = ComponentType<LucideIconProps>;

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon: LucideIcon;
  loading?: boolean;
  loadingText?: string;
  srOnly?: string;
  ariaLabel?: string;
}
