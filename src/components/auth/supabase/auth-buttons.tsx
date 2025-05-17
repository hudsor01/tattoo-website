'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { useAuthStore } from '@/lib/auth/auth-system';
import { useRouter } from 'next/navigation';

/**
 * Props for the OAuth button component
 */
interface OAuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** OAuth provider to sign in with */
  provider: 'google' | 'github' | 'twitter' | 'discord';
  /** Whether to show the provider icon */
  showIcon?: boolean;
  /** Button variant from shadcn/ui button */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  /** URL to redirect to after successful sign in */
  redirectTo?: string;
}

/**
 * Props for the magic link button component
 */
interface MagicLinkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** URL to redirect to after successful sign in */
  redirectTo?: string;
}

/**
 * OAuth sign in button using shadcn UI styling
 * Provides a consistent styled button for each OAuth provider
 *
 * @param provider - The OAuth provider to use
 * @param showIcon - Whether to show the provider icon
 * @param variant - The button variant
 * @param redirectTo - The URL to redirect to after sign in
 * @param className - Additional class names
 * @param children - Button content
 * @param props - Additional button props
 */
export function OAuthButton({
  provider,
  showIcon = true,
  variant = 'outline',
  className,
  children,
  redirectTo,
  ...props
}: OAuthButtonProps) {
  const { signInWithProvider } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithProvider(provider, redirectTo);
    } catch (error) {
      console.error(`Sign in with ${provider} failed:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get provider-specific icon
  const ProviderIcon = () => {
    switch (provider) {
      case 'google':
        return <Icons.google className="mr-2 h-4 w-4" />;
      case 'github':
        return <Icons.gitHub className="mr-2 h-4 w-4" />;
      case 'twitter':
        return <Icons.twitter className="mr-2 h-4 w-4" />;
      case 'discord':
        return <Icons.discord className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };

  // Get provider name with proper capitalization
  const getProviderName = () => {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  return (
    <button
      type="button"
      className={cn(
        buttonVariants({ variant }),
        isLoading && 'opacity-70 cursor-not-allowed',
        className
      )}
      onClick={handleSignIn}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        showIcon && <ProviderIcon />
      )}
      {children || `Continue with ${getProviderName()}`}
    </button>
  );
}

/**
 * Magic link button
 * Allows users to sign in with a magic link sent to their email
 *
 * @param redirectTo - The URL to redirect to after sign in
 * @param className - Additional class names
 * @param children - Button content
 * @param props - Additional button props
 */
export function MagicLinkButton({
  className,
  children,
  redirectTo,
  ...props
}: MagicLinkButtonProps) {
  const { sendMagicLink } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [showInput, setShowInput] = React.useState(false);
  const router = useRouter();

  const handleSendMagicLink = async () => {
    if (!email) {
      setShowInput(true);
      return;
    }

    try {
      setIsLoading(true);
      await sendMagicLink(email);
      
      // Show success message or redirect
    } catch (error) {
      console.error('Magic link error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showInput) {
    return (
      <div className="flex flex-col space-y-2">
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-2 border rounded"
        />
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            isLoading && 'opacity-70 cursor-not-allowed',
            className
          )}
          onClick={handleSendMagicLink}
          disabled={isLoading || !email || props.disabled}
          {...props}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.mail className="mr-2 h-4 w-4" />
          )}
          {children || 'Send Magic Link'}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        'text-sm text-muted-foreground hover:text-primary',
        className
      )}
      onClick={() => setShowInput(true)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {children || 'Sign in with magic link'}
    </button>
  );
}

/**
 * Sign out button
 * Simple button to sign out the current user
 *
 * @param className - Additional class names
 * @param children - Button content
 * @param props - Additional button props
 */
export function SignOutButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { signOut } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        isLoading && 'opacity-70 cursor-not-allowed',
        className
      )}
      onClick={handleSignOut}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.logout className="mr-2 h-4 w-4" />
      )}
      {children || 'Sign out'}
    </button>
  );
}