import * as React from 'react';
import { cn } from '@/lib/utils';

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Whether to use inline styling instead of CSS class
   */
  asChild?: boolean;
}

/**
 * Visually hidden component for screen reader only content
 * This component is used to provide content to screen readers while hiding it visually
 */
export const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ className, asChild, children, ...props }, ref) => {
    
    const visuallyHiddenStyles = {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      borderWidth: '0',
    } as React.CSSProperties;
    
    if (asChild) {
      return <>{children}</>;
    }
    
    return (
      <span
        ref={ref}
        style={visuallyHiddenStyles}
        className={cn('sr-only', className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

VisuallyHidden.displayName = 'VisuallyHidden';

// Export a hook for programmatic use
export function useVisuallyHidden() {
  return {
    'aria-hidden': 'true',
    style: {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      borderWidth: '0',
    } as React.CSSProperties,
  };
}