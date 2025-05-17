import { BoxProps } from '@mui/material';

/**
 * This file provides global MUI Grid component type definitions to resolve linting issues
 * with the deprecated Grid component from Material UI v7+
 *
 * These type definitions are for our custom Grid component that replaces the deprecated Material UI Grid
 */

/**
 * Type for Grid item sizes that can be numbers, booleans, 'auto', or string values
 */
export type GridSize = number | 'auto' | boolean | string;

/**
 * Type for flex wrapping options
 */
export type GridWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

/**
 * Type for flex direction options
 */
export type GridDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

/**
 * Type for justify content options
 */
export type GridJustifyContent =
  | 'flex-start'
  | 'center'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

/**
 * Type for align items options
 */
export type GridAlignItems = 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';

/**
 * Type for align content options
 */
export type GridAlignContent =
  | 'stretch'
  | 'center'
  | 'flex-start'
  | 'flex-end'
  | 'space-between'
  | 'space-around';

/**
 * Full Grid component props type definition
 */
export interface GridProps extends BoxProps {
  container?: boolean;
  item?: boolean;
  spacing?: number | string;
  direction?: GridDirection;
  wrap?: GridWrap;
  justifyContent?: GridJustifyContent;
  alignItems?: GridAlignItems;
  alignContent?: GridAlignContent;
  xs?: GridSize;
  sm?: GridSize;
  md?: GridSize;
  lg?: GridSize;
  xl?: GridSize;
  zeroMinWidth?: boolean;
}

// Extend module declaration to improve linting support
declare module '@mui/material' {
  interface GridProps extends BoxProps {
    container?: boolean;
    item?: boolean;
    spacing?: number | string;
    direction?: GridDirection;
    wrap?: GridWrap;
    justifyContent?: GridJustifyContent;
    alignItems?: GridAlignItems;
    alignContent?: GridAlignContent;
    xs?: GridSize;
    sm?: GridSize;
    md?: GridSize;
    lg?: GridSize;
    xl?: GridSize;
    zeroMinWidth?: boolean;
  }
}

// Ensure JSX namespace includes Grid props
declare namespace JSX {
  interface IntrinsicElements {
    // Using 'any' here is acceptable since this is for intrinsic elements in JSX where specific props are unknown
    // and vary based on the implementation of the custom element
    'mui-grid': GridProps;
  }
}
