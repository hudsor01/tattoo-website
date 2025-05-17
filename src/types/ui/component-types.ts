// General UI component types

import type { ReactNode } from 'react';

export interface EmailLinkProps {
  email: string;
  subject?: string;
  className?: string;
  children?: ReactNode;
  showIcon?: boolean;
}

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface IconProps {
  className?: string;
  size?: number | string;
  color?: string;
}
