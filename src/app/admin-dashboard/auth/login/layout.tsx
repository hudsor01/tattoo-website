'use client';

import React from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { pacifico, montserrat } from '../../../../styles/fonts';

// Create a theme for the admin login
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#d62828', // tattoo-red
    },
    secondary: {
      main: '#3b82f6', // tattoo-blue
    },
    background: {
      default: '#0a0a0a', // tattoo-black
      paper: '#141414',
    },
  },
  typography: {
    fontFamily: montserrat.style.fontFamily,
    h1: {
      // Optionally set a fallback font or remove this if not needed
    },
    h2: {
      // Optionally set a fallback font or remove this if not needed
    },
    h3: {
      // Optionally set a fallback font or remove this if not needed
    },
    h4: {
      // Optionally set a fallback font or remove this if not needed
    },
    h5: {
      // Optionally set a fallback font or remove this if not needed
    },
    h6: {
      // Optionally set a fallback font or remove this if not needed
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        /* Import Pacifico font for logo */
        .logo-text {
          font-family: ${pacifico.style.fontFamily};
          color: #d62828;
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        containedPrimary: {
          backgroundColor: '#d62828',
          '&:hover': {
            backgroundColor: '#b21e1e',
          },
        },
      },
    },
  },
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${pacifico.variable}`}>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
