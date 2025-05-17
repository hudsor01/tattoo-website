'use client';

import { useState, useCallback } from 'react';
import { ClientCookies, CookieOptions } from '@/lib/cookie';

/**
 * Custom hook to replace react-cookie's useCookies
 * @param cookieNames Array of cookie names to track
 * @returns Cookie values, setter, and remover functions
 */
export function useCookies(cookieNames: string[]) {
  // Initialize state for all cookies we want to track
  const initialCookies = cookieNames.reduce<Record<string, string | undefined>>((acc, name) => {
    acc[name] = ClientCookies.get(name);
    return acc;
  }, {});
  
  const [cookies, setCookiesState] = useState(initialCookies);
  
  // Function to set a cookie and update state
  const setCookie = useCallback((name: string, value: any, options?: CookieOptions) => {
    // For objects, stringify them (just like react-cookie does)
    const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
    
    ClientCookies.set(name, valueToStore, options);
    
    // Update state
    setCookiesState(prev => ({
      ...prev,
      [name]: valueToStore
    }));
  }, []);
  
  // Function to remove a cookie
  const removeCookie = useCallback((name: string, options?: Pick<CookieOptions, 'path' | 'domain'>) => {
    ClientCookies.remove(name, options);
    
    // Update state
    setCookiesState(prev => {
      const newCookies = { ...prev };
      delete newCookies[name];
      return newCookies;
    });
  }, []);
  
  return [cookies, setCookie, removeCookie] as const;
}

export default useCookies;