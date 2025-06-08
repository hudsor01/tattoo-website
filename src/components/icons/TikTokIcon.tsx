/**
 * TikTok brand icon component
 * SVG optimized from Bootstrap Icons library
 * Supports currentColor for easy theming
 */

interface TikTokIconProps {
  className?: string;
  size?: number | string;
  color?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

export function TikTokIcon({ 
  className = 'w-6 h-6',
  size,
  color = 'currentColor',
  'aria-label': ariaLabel = 'TikTok',
  'aria-hidden': ariaHidden,
  ...props 
}: TikTokIconProps) {
  const dimensions = size ? { width: size, height: size } : {};
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 16 16" 
      fill={color}
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      role="img"
      {...dimensions}
      {...props}
    >
      <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/>
    </svg>
  );
}
