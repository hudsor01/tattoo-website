import type { SxProps, Theme } from '@mui/material/styles';

export const inputSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Darker, less transparent
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.1)', // Subtle border
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)', // Brighter on hover
    },
    '&.Mui-focused fieldset': {
      borderColor: '#d62828', // Primary red color for focus
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)', // Lighter label for readability
  },
  '& .MuiInputBase-input': {
    color: 'white', // White input text
  },
  '& .MuiSvgIcon-root, & .MuiSelect-icon': {
    color: 'rgba(255, 255, 255, 0.5)', // Slightly dimmed icons
  },
};
