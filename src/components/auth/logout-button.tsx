/**
 * Logout Button Component
 * 
 * A button that handles user logout functionality with Supabase auth.
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { browserClient } from '@/lib/supabase/server-client';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  redirect?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'default',
  className = '',
  redirect = '/',
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const supabase = browserClient();
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Redirect to specified route after logout
      router.push(redirect);
      
      // Force a router refresh to update authentication state across the app
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? 'Logging out...' : 'Log out'}
    </Button>
  );
};

export default LogoutButton;
export { LogoutButton };