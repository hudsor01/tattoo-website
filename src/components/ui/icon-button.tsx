import { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Loader2 } from 'lucide-react';
import type { IconButtonProps } from '@/types/ui/icon-types';

/**
 * IconButton component that combines the Button and Icon components
 * with proper accessibility features
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <IconButton icon={Menu} label="Open menu" />
 * 
 * // With size and variant
 * <IconButton 
 *   icon={ChevronLeft} 
 *   size="lg" 
 *   variant="outline" 
 *   label="Go back" 
 * />
 * 
 * // Loading state
 * <IconButton 
 *   icon={Send} 
 *   isLoading 
 *   label="Send message" 
 * />
 * ```
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ 
    icon,
    size = 'md',
    variant = 'default',
    loading = false,
    disabled = false,
    ariaLabel,
    className,
    ...props 
  }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        disabled={disabled || loading}
        className={className}
        aria-label={ariaLabel}
        size="icon"
        {...props}
      >
        {loading ? (
          <Icon 
            icon={Loader2} 
            size={typeof size === 'number' ? 'md' : (size || 'md')} 
            className="animate-spin"
          />
        ) : (
          <Icon 
            icon={icon} 
            size={typeof size === 'number' ? 'md' : (size || 'md')} 
          />
        )}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;