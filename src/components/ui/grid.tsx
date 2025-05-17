import React from 'react';
import { cn } from '@/lib/utils';

export interface GridProps {
  children: React.ReactNode;
  container?: boolean;
  item?: boolean;
  xs?: number | 'auto' | boolean;
  sm?: number | 'auto' | boolean;
  md?: number | 'auto' | boolean;
  lg?: number | 'auto' | boolean;
  xl?: number | 'auto' | boolean;
  spacing?: number;
  columnSpacing?: number;
  rowSpacing?: number;
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  className?: string;
}

const Grid: React.FC<GridProps> = ({
  children,
  container = false,
  item = false,
  xs,
  sm,
  md,
  lg,
  xl,
  spacing = 0,
  columnSpacing,
  rowSpacing,
  direction = 'row',
  justifyContent = 'flex-start',
  alignItems = 'flex-start',
  className,
  ...props
}) => {
  const getWidthClass = (value: number | 'auto' | boolean | undefined, prefix: string) => {
    if (value === undefined) return '';
    if (value === 'auto') return `${prefix}:flex-grow`;
    if (value === true) return `${prefix}:flex-[1_0_0%]`;
    if (value === false) return '';
    if (value === 1) return `${prefix}:w-1/12`;
    if (value === 2) return `${prefix}:w-2/12`;
    if (value === 3) return `${prefix}:w-3/12`;
    if (value === 4) return `${prefix}:w-4/12`;
    if (value === 5) return `${prefix}:w-5/12`;
    if (value === 6) return `${prefix}:w-6/12`;
    if (value === 7) return `${prefix}:w-7/12`;
    if (value === 8) return `${prefix}:w-8/12`;
    if (value === 9) return `${prefix}:w-9/12`;
    if (value === 10) return `${prefix}:w-10/12`;
    if (value === 11) return `${prefix}:w-11/12`;
    if (value === 12) return `${prefix}:w-full`;
    return '';
  };

  const getSpacingClass = (value: number | undefined) => {
    if (value === undefined) return '';
    if (value === 0) return 'gap-0';
    if (value === 1) return 'gap-1';
    if (value === 2) return 'gap-2';
    if (value === 3) return 'gap-3';
    if (value === 4) return 'gap-4';
    if (value === 5) return 'gap-5';
    if (value === 6) return 'gap-6';
    if (value === 8) return 'gap-8';
    if (value === 10) return 'gap-10';
    if (value === 12) return 'gap-12';
    if (value === 16) return 'gap-16';
    if (value === 20) return 'gap-20';
    if (value === 24) return 'gap-24';
    return `gap-${value}`;
  };

  const getRowSpacingClass = (value: number | undefined) => {
    if (value === undefined) return '';
    if (value === 0) return 'gap-y-0';
    if (value === 1) return 'gap-y-1';
    if (value === 2) return 'gap-y-2';
    if (value === 3) return 'gap-y-3';
    if (value === 4) return 'gap-y-4';
    if (value === 5) return 'gap-y-5';
    if (value === 6) return 'gap-y-6';
    if (value === 8) return 'gap-y-8';
    if (value === 10) return 'gap-y-10';
    if (value === 12) return 'gap-y-12';
    if (value === 16) return 'gap-y-16';
    if (value === 20) return 'gap-y-20';
    if (value === 24) return 'gap-y-24';
    return `gap-y-${value}`;
  };

  const getColumnSpacingClass = (value: number | undefined) => {
    if (value === undefined) return '';
    if (value === 0) return 'gap-x-0';
    if (value === 1) return 'gap-x-1';
    if (value === 2) return 'gap-x-2';
    if (value === 3) return 'gap-x-3';
    if (value === 4) return 'gap-x-4';
    if (value === 5) return 'gap-x-5';
    if (value === 6) return 'gap-x-6';
    if (value === 8) return 'gap-x-8';
    if (value === 10) return 'gap-x-10';
    if (value === 12) return 'gap-x-12';
    if (value === 16) return 'gap-x-16';
    if (value === 20) return 'gap-x-20';
    if (value === 24) return 'gap-x-24';
    return `gap-x-${value}`;
  };

  const containerClasses = container
    ? cn(
        'flex flex-wrap',
        direction === 'row' && 'flex-row',
        direction === 'row-reverse' && 'flex-row-reverse',
        direction === 'column' && 'flex-col',
        direction === 'column-reverse' && 'flex-col-reverse',
        justifyContent === 'flex-start' && 'justify-start',
        justifyContent === 'center' && 'justify-center',
        justifyContent === 'flex-end' && 'justify-end',
        justifyContent === 'space-between' && 'justify-between',
        justifyContent === 'space-around' && 'justify-around',
        justifyContent === 'space-evenly' && 'justify-evenly',
        alignItems === 'flex-start' && 'items-start',
        alignItems === 'center' && 'items-center',
        alignItems === 'flex-end' && 'items-end',
        alignItems === 'stretch' && 'items-stretch',
        alignItems === 'baseline' && 'items-baseline',
        columnSpacing !== undefined ? getColumnSpacingClass(columnSpacing) : rowSpacing !== undefined ? getColumnSpacingClass(spacing) : '',
        rowSpacing !== undefined ? getRowSpacingClass(rowSpacing) : spacing !== undefined ? getSpacingClass(spacing) : ''
      )
    : '';

  const itemClasses = item
    ? cn(
        getWidthClass(xs, 'xs'),
        getWidthClass(sm, 'sm'),
        getWidthClass(md, 'md'),
        getWidthClass(lg, 'lg'),
        getWidthClass(xl, 'xl')
      )
    : '';

  const classes = cn(containerClasses, itemClasses, className);

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Grid;