// Component prop types

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dark' | 'light' | 'minimal';
  showText?: boolean;
  className?: string;
  priority?: boolean;
}

export interface ServicesHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  showCTA?: boolean;
  ctaText?: string;
  ctaHref?: string;
  backgroundImage?: string;
  className?: string;
}
