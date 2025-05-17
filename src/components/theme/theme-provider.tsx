'use client';

import React, { ReactNode, useEffect, useMemo } from 'react';
// Import ThemeRegistryContext from next/dist/client/components/hooks-client-context
// This helps avoid the 'insertionPoint.setAttribute is not a function' error
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useTheme } from 'next-themes';
import GlobalStyles from '@mui/material/GlobalStyles';
import CssBaseline from '@mui/material/CssBaseline';
import { createLightTheme, createDarkTheme } from './mui-theme';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider component
 * 
 * A single theme provider that properly integrates:
 * - next-themes
 * - Material UI themes
 * - Tailwind CSS dark mode
 * - Proper CSS layering
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const { resolvedTheme, theme } = useTheme();
  
  // Create the MUI theme based on the current theme setting
  const muiTheme = useMemo(() => {
    // Default to dark theme if nothing is resolved yet
    const currentTheme = resolvedTheme || theme || 'dark';
    return currentTheme === 'dark' ? createDarkTheme() : createLightTheme();
  }, [resolvedTheme, theme]);
  
  // Sync the 'dark' class on the document element with the current theme
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    // Important: If nothing is resolved yet, don't change the DOM
    if (resolvedTheme) {
      document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    }
  }, [resolvedTheme]);
  
  return (
  <AppRouterCacheProvider options={{ enableCssLayer: true, key: 'mui' }}>
      {/* Configure CSS layer order for proper overrides */}
      <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
      
      {/* MUI Theme Provider */}
      <MuiThemeProvider theme={muiTheme}>
        {/* Reset MUI styles but preserve Tailwind base styles */}
        <CssBaseline enableColorScheme />
        
        {/* App content */}
        {children}
      </MuiThemeProvider>
    </AppRouterCacheProvider>
  );
}

export default ThemeProvider;