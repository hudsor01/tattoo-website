'use client';

import { createTheme, Theme } from '@mui/material/styles';
import { tokens, colors, typography } from './tokens';
import { montserrat, pacifico, satisfy } from '@/styles/fonts';

/**
 * Create a light theme for Material UI that uses CSS variables defined in globals.css
 * This approach allows seamless integration with Tailwind CSS v4
 */
export function createLightTheme(): Theme {
  return createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: colors.tattoo.red.DEFAULT,
        dark: colors.tattoo.red.dark,
        light: colors.tattoo.red.light,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: colors.tattoo.blue.DEFAULT,
        dark: colors.tattoo.blue.dark,
        light: colors.tattoo.blue.light,
        contrastText: '#FFFFFF',
      },
      error: {
        main: colors.error.DEFAULT,
        light: colors.error.light,
        dark: colors.error.dark,
      },
      warning: {
        main: colors.warning.DEFAULT,
        light: colors.warning.light,
        dark: colors.warning.dark,
      },
      info: {
        main: colors.info.DEFAULT,
        light: colors.info.light,
        dark: colors.info.dark,
      },
      success: {
        main: colors.success.DEFAULT,
        light: colors.success.light,
        dark: colors.success.dark,
      },
      background: {
        default: '#ffffff',
        paper: '#f5f5f5',
      },
      text: {
        primary: colors.neutral[900],
        secondary: colors.neutral[700],
        disabled: colors.neutral[400],
      },
    },
    typography: {
      fontFamily: montserrat.style.fontFamily,
      h1: {
        fontFamily: satisfy.style.fontFamily,
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.h1,
      },
      h2: {
        fontFamily: satisfy.style.fontFamily,
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.h2,
      },
      h3: {
        fontFamily: satisfy.style.fontFamily,
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.h3,
      },
      h4: {
        fontFamily: satisfy.style.fontFamily,
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.h4,
      },
      h5: {
        fontFamily: montserrat.style.fontFamily,
        fontWeight: typography.fontWeight.semibold,
        fontSize: typography.fontSize.h5,
      },
      h6: {
        fontFamily: montserrat.style.fontFamily,
        fontWeight: typography.fontWeight.semibold,
        fontSize: typography.fontSize.h6,
      },
      body1: {
        fontFamily: montserrat.style.fontFamily,
        fontSize: typography.fontSize.body1,
      },
      body2: {
        fontFamily: montserrat.style.fontFamily,
        fontSize: typography.fontSize.body2,
      },
      button: {
        fontFamily: montserrat.style.fontFamily,
        fontWeight: typography.fontWeight.medium,
        textTransform: 'none',
      },
      caption: {
        fontFamily: montserrat.style.fontFamily,
        fontSize: typography.fontSize.caption,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          .logo-text {
            font-family: ${pacifico.style.fontFamily};
            color: ${colors.tattoo.red.DEFAULT};
          }
        `,
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 'var(--radius)',
            padding: '0.5rem 1rem',
            textTransform: 'none',
            transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
          },
          containedPrimary: {
            backgroundColor: colors.tattoo.red.DEFAULT,
            '&:hover': {
              backgroundColor: colors.tattoo.red.dark,
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#ffffff',
            color: colors.neutral[900],
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '0.5rem',
            },
          },
        },
      },
    },
  });
}

/**
 * Create a dark theme for Material UI that uses CSS variables defined in globals.css
 * This approach allows seamless integration with Tailwind CSS v4
 */
export function createDarkTheme(): Theme {
  return createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: colors.tattoo.red.light, // Lighter in dark mode
        dark: colors.tattoo.red.DEFAULT,
        light: colors.tattoo.red.light,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: colors.tattoo.blue.light, // Lighter in dark mode
        dark: colors.tattoo.blue.DEFAULT,
        light: colors.tattoo.blue.light,
        contrastText: '#FFFFFF',
      },
      error: {
        main: colors.error.light, // Lighter in dark mode
        light: colors.error.light,
        dark: colors.error.DEFAULT,
      },
      warning: {
        main: colors.warning.light, // Lighter in dark mode
        light: colors.warning.light, 
        dark: colors.warning.DEFAULT,
      },
      info: {
        main: colors.info.light, // Lighter in dark mode
        light: colors.info.light,
        dark: colors.info.DEFAULT, 
      },
      success: {
        main: colors.success.light, // Lighter in dark mode
        light: colors.success.light,
        dark: colors.success.DEFAULT,
      },
      background: {
        default: '#0A0A0A',
        paper: '#121212',
      },
      text: {
        primary: '#FAFAFA',
        secondary: 'rgba(255, 255, 255, 0.7)',
        disabled: 'rgba(255, 255, 255, 0.5)',
      },
    },
    typography: {
      fontFamily: montserrat.style.fontFamily,
      h1: {
        fontFamily: satisfy.style.fontFamily,
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.h1,
      },
      h2: {
        fontFamily: satisfy.style.fontFamily,
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.h2,
      },
      h3: {
        fontFamily: satisfy.style.fontFamily,
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.h3,
      },
      h4: {
        fontFamily: satisfy.style.fontFamily,
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.h4,
      },
      h5: {
        fontFamily: montserrat.style.fontFamily,
        fontWeight: typography.fontWeight.semibold,
        fontSize: typography.fontSize.h5,
      },
      h6: {
        fontFamily: montserrat.style.fontFamily,
        fontWeight: typography.fontWeight.semibold,
        fontSize: typography.fontSize.h6,
      },
      body1: {
        fontFamily: montserrat.style.fontFamily,
        fontSize: typography.fontSize.body1,
      },
      body2: {
        fontFamily: montserrat.style.fontFamily,
        fontSize: typography.fontSize.body2,
      },
      button: {
        fontFamily: montserrat.style.fontFamily,
        fontWeight: typography.fontWeight.medium,
        textTransform: 'none',
      },
      caption: {
        fontFamily: montserrat.style.fontFamily,
        fontSize: typography.fontSize.caption,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          .logo-text {
            font-family: ${pacifico.style.fontFamily};
            color: ${colors.tattoo.red.DEFAULT};
          }
        `,
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 'var(--radius)',
            padding: '0.5rem 1rem',
            textTransform: 'none',
            transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
          },
          containedPrimary: {
            backgroundColor: colors.tattoo.red.DEFAULT,
            '&:hover': {
              backgroundColor: colors.tattoo.red.dark,
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#121212',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            backgroundColor: '#121212',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '0.5rem',
            },
          },
        },
      },
      // Material UI Paper component
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      // Material UI Dialog component
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '0.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
  });
}

// Default themes
export const lightTheme = createLightTheme();
export const darkTheme = createDarkTheme();

export default darkTheme;
