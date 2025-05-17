'use client';

import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { type GridProps } from '@/types/mui-grid';

/**
 * Enhanced Grid Component
 *
 * A full replacement for Material UI's deprecated Grid component
 * This component uses Flexbox to provide the same functionality with better reliability
 * It maintains the same API as the original Grid component for easy migration
 */

const StyledBox = styled(Box, {
  shouldForwardProp: prop =>
    prop !== 'container' &&
    prop !== 'item' &&
    prop !== 'spacing' &&
    prop !== 'direction' &&
    prop !== 'wrap' &&
    prop !== 'justifyContent' &&
    prop !== 'alignItems' &&
    prop !== 'alignContent' &&
    prop !== 'xs' &&
    prop !== 'sm' &&
    prop !== 'md' &&
    prop !== 'lg' &&
    prop !== 'xl' &&
    prop !== 'zeroMinWidth',
})<GridProps>(({ theme, ...props }) => {
  const {
    container,
    item,
    spacing = 0,
    direction = 'row',
    wrap = 'wrap',
    justifyContent = 'flex-start',
    alignItems = 'stretch',
    alignContent = 'stretch',
    xs,
    sm,
    md,
    lg,
    xl,
    zeroMinWidth,
  } = props;

  // Convert spacing to actual margin/padding values
  const getSpacing = (value: number | string) => {
    if (typeof value === 'string') return value;
    return theme.spacing(value);
  };

  // Define grid container styles
  const containerStyles = container
    ? {
        display: 'flex',
        flexDirection: direction,
        flexWrap: wrap,
        justifyContent,
        alignItems,
        alignContent,
        width: '100%',
        // Apply negative margins to container to compensate for item spacing
        marginTop: spacing ? `-${getSpacing(spacing)}` : 0,
        marginLeft: spacing ? `-${getSpacing(spacing)}` : 0,
        '& > *': {
          paddingTop: spacing ? getSpacing(spacing) : 0,
          paddingLeft: spacing ? getSpacing(spacing) : 0,
        },
      }
    : {};

  // Define grid item styles
  const getWidthValue = (size: number | 'auto' | boolean | string | undefined) => {
    if (size === undefined || size === false) return undefined;
    if (size === true) return '100%';
    if (size === 'auto') return 'auto';
    if (typeof size === 'string') return size;
    return `${(size / 12) * 100}%`;
  };

  const itemStyles = item
    ? {
        // Default to 100% width in flex column layout
        flexBasis: direction.includes('column') ? 'auto' : 0,
        flexGrow: 1,
        maxWidth: '100%',
        ...(zeroMinWidth && { minWidth: 0 }),
        ...(xs !== undefined && {
          flexBasis: getWidthValue(xs),
          flexGrow: xs === 'auto' ? 0 : 1,
          maxWidth: xs === 'auto' ? 'none' : getWidthValue(xs),
        }),
      }
    : {};

  // Responsive sizes
  const responsiveStyles = {
    // Apply responsive breakpoints
    ...(sm !== undefined && {
      [theme.breakpoints.up('sm')]: {
        flexBasis: getWidthValue(sm),
        flexGrow: sm === 'auto' ? 0 : 1,
        maxWidth: sm === 'auto' ? 'none' : getWidthValue(sm),
      },
    }),
    ...(md !== undefined && {
      [theme.breakpoints.up('md')]: {
        flexBasis: getWidthValue(md),
        flexGrow: md === 'auto' ? 0 : 1,
        maxWidth: md === 'auto' ? 'none' : getWidthValue(md),
      },
    }),
    ...(lg !== undefined && {
      [theme.breakpoints.up('lg')]: {
        flexBasis: getWidthValue(lg),
        flexGrow: lg === 'auto' ? 0 : 1,
        maxWidth: lg === 'auto' ? 'none' : getWidthValue(lg),
      },
    }),
    ...(xl !== undefined && {
      [theme.breakpoints.up('xl')]: {
        flexBasis: getWidthValue(xl),
        flexGrow: xl === 'auto' ? 0 : 1,
        maxWidth: xl === 'auto' ? 'none' : getWidthValue(xl),
      },
    }),
  };

  return {
    ...containerStyles,
    ...itemStyles,
    ...responsiveStyles,
  };
});

export const Grid = React.forwardRef<HTMLDivElement, GridProps>((props, ref) => {
  const {
    container,
    item,
    spacing,
    xs,
    sm,
    md,
    lg,
    xl,
    direction,
    wrap,
    justifyContent,
    alignItems,
    alignContent,
    zeroMinWidth,
    ...other
  } = props;

  const gridProps = {
    container: !!container,
    item: !!item,
    ...(spacing !== undefined ? { spacing } : {}),
    ...(xs !== undefined ? { xs } : {}),
    ...(sm !== undefined ? { sm } : {}),
    ...(md !== undefined ? { md } : {}),
    ...(lg !== undefined ? { lg } : {}),
    ...(xl !== undefined ? { xl } : {}),
    ...(direction !== undefined ? { direction } : {}),
    ...(wrap !== undefined ? { wrap } : {}),
    ...(justifyContent !== undefined ? { justifyContent } : {}),
    ...(alignItems !== undefined ? { alignItems } : {}),
    ...(alignContent !== undefined ? { alignContent } : {}),
    ...(zeroMinWidth !== undefined ? { zeroMinWidth } : {}),
  };

  return <StyledBox ref={ref} {...gridProps} {...other} />;
});

Grid.displayName = 'Grid';

export default Grid;
