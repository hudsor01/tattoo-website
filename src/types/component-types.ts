/**
 * component-types.ts
 *
 * Consolidated component-related type definitions for the application.
 * This includes React component props, UI elements, and layout structures.
 */

import React from 'react';
import type { ReactNode } from 'react';
import type { Size, ThemeColor, StatusType } from './enum-types';
import type {
  GridColDef,
  GridRowParams,
  GridRowSelectionModel,
  GridInitialState,
} from '@mui/x-data-grid';
import type { SxProps, TextFieldProps, Theme } from '@mui/material';
import type { ChipProps } from '@mui/material/Chip';
import type { Target, TargetAndTransition } from 'framer-motion';
import type { InputProps } from 'react-admin';

/**
 * Common props for UI elements
 */
export interface UIElementProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  'data-testid'?: string;
}

/**
 * Props with children
 */
export interface WithChildrenProps {
  children?: ReactNode;
}

/**
 * Class name helper type
 */
export interface WithClassName {
  className?: string;
}

/**
 * Status badge properties
 */
export interface StatusBadgeProps extends UIElementProps {
  status: StatusType;
  text?: string;
  size?: Size;
  variant?: 'default' | 'subtle' | 'outline';
  icon?: boolean;
}

/**
 * Modal/Dialog props
 */
export interface ModalProps extends UIElementProps, WithChildrenProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  hideCloseButton?: boolean;
}

/**
 * Toast notification props
 */
export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

/**
 * Button props
 */
export interface ButtonProps extends UIElementProps, WithChildrenProps {
  variant?: 'primary' | 'secondary' | 'text' | 'outlined' | 'ghost';
  size?: Size;
  color?: ThemeColor;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Tab interface
 */
export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

/**
 * Tabs component props
 */
export interface TabsProps extends UIElementProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  centered?: boolean;
  fullWidth?: boolean;
}

/**
 * Navigation link props
 */
export interface NavLinkProps extends UIElementProps {
  href: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
  subItems?: NavLinkProps[];
  external?: boolean;
}

/**
 * Image props
 */
export interface ImageProps extends UIElementProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onClick?: () => void;
}

/**
 * Card props
 */
export interface CardProps extends UIElementProps, WithChildrenProps {
  title?: string;
  subtitle?: string;
  media?: {
    src: string;
    alt?: string;
    height?: number | string;
  };
  footer?: ReactNode;
  elevation?: number;
  onClick?: () => void;
  hoverEffect?: boolean;
}

/**
 * Email Link props
 */
export interface EmailLinkProps extends WithChildrenProps {
  email?: string;
  className?: string;
  showIcon?: boolean;
}

/**
 * Action buttons props for data grid components
 */
export interface ActionButtonsProps {
  id: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  customActions?: React.ReactNode;
}

/**
 * MotionCard props
 */
export interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
}

/**
 * Sidebar context props
 */
export interface SidebarContextProps {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

/**
 * Logo props
 */
export interface LogoProps {
  className?: string;
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  variant?: 'image' | 'text';
  isLinked?: boolean;
}

/**
 * Dropzone props
 */
export type DropzoneProps = {
  className?: string;
};

/**
 * Dashboard stats card props
 */
export interface DashboardStatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: string;
  color: string;
  change: string;
  link?: string;
}

/**
 * Dashboard appointment data
 */
export interface DashboardAppointment {
  id: string;
  title: string;
  client: string;
  clientId: string;
  startTime: string;
  endTime: string;
  status: string;
  service: string;
  deposit: number;
  depositPaid: boolean;
}

/**
 * Dashboard data interface
 */
export interface DashboardData {
  stats: DashboardStatsCardProps[];
  upcomingAppointments: DashboardAppointment[];
  recentMessages?: Record<string, unknown>[];
  todayAppointments?: unknown[];
}

/**
 * MUI common prop types
 */
export type MuiSxProps = SxProps<Theme>;

/**
 * MUI Chip color types
 */
export type ChipColorType = ChipProps['color'];

/**
 * Action column configuration
 */
export interface ActionColumnConfig {
  width?: number;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  renderCustomActions?: (id: string) => ReactNode;
}

/**
 * Grid action configuration
 */
export type GridActionConfig = {
  onView?: (id: string) => void;
};

/**
 * Props for the enhanced data grid component
 */
export interface DataTableProps {
  rows: Record<string, unknown>[];
  columns: GridColDef[];
  loading?: boolean;
  error?: string | null;
  onRowClick?: (params: GridRowParams) => void;
  onSelectionChange?: (selection: GridRowSelectionModel) => void;
  onPaginationChange?: (model: { pageSize: number; page: number }) => void;
  onAddClick?: () => void;
  onRefreshClick?: () => void;
  onDeleteSelected?: (ids: GridRowSelectionModel) => void;
  onSearch?: (value: string) => void;
  searchValue?: string;
  title?: string;
  getRowId?: (row: Record<string, unknown>) => string;
  initialState?: GridInitialState;
  searchPlaceholder?: string;
  hideToolbar?: boolean;
  actionColumn?: ActionColumnConfig;
  customToolbarActions?: ReactNode;
  sx?: MuiSxProps;
  autoHeight?: boolean;
  containerHeight?: number;
}

/**
 * MUI DataGrid styling props
 */
export interface DataGridStylingProps {
  containerSx?: MuiSxProps;
  gridSx?: MuiSxProps;
}

/**
 * Pagination model for DataGrid component
 */
export interface PaginationModel {
  page: number;
  pageSize: number;
}

/**
 * CSS breakpoints interface
 */
export interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

/**
 * Layout section props
 */
export interface SectionProps extends UIElementProps, WithChildrenProps {
  title?: string;
  subtitle?: string;
  fullWidth?: boolean;
  background?: 'light' | 'dark' | 'gradient' | 'none';
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Page header props
 */
export interface PageHeaderProps extends UIElementProps {
  title: string;
  subtitle?: string;
  imagePath?: string;
  imagePosition?: 'top' | 'center' | 'bottom';
  height?: 'small' | 'medium' | 'large';
  overlay?: boolean;
  actions?: ReactNode;
}

/**
 * Container props
 */
export interface ContainerProps extends UIElementProps, WithChildrenProps {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'none';
  disableGutters?: boolean;
  fixed?: boolean;
}

/**
 * Grid props
 */
export interface GridProps extends UIElementProps, WithChildrenProps {
  container?: boolean;
  item?: boolean;
  xs?: number | 'auto' | boolean;
  sm?: number | 'auto' | boolean;
  md?: number | 'auto' | boolean;
  lg?: number | 'auto' | boolean;
  xl?: number | 'auto' | boolean;
  spacing?: number;
  justifyContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}

/**
 * Responsive layout props
 */
export interface ResponsiveLayoutProps extends UIElementProps, WithChildrenProps {
  sidebar?: ReactNode;
  navigationItems?: Array<{
    href: string;
    label: string;
    icon?: ReactNode;
  }>;
  title?: string;
  logoSrc?: string;
  logoAlt?: string;
  footerContent?: ReactNode;
  sidebarWidth?: number;
  stickyHeader?: boolean;
  transparentHeader?: boolean;
  headerContent?: ReactNode;
}

/**
 * Modern layout props
 */
export interface ModernLayoutProps extends UIElementProps, WithChildrenProps {
  navigationItems?: Array<{
    href: string;
    label: string;
    isButton?: boolean;
  }>;
  title?: string;
  logoSrc?: string;
  logoAlt?: string;
  footerLinks?: Array<{
    title: string;
    links: Array<{
      href: string;
      label: string;
    }>;
  }>;
  copyrightText?: string;
  contactInfo?: {
    address?: string;
    phone?: string;
    email?: string;
  };
  socialLinks?: Array<{
    href: string;
    icon: ReactNode;
    label: string;
  }>;
  darkMode?: boolean;
}

/**
 * Dashboard layout props
 */
export interface DashboardLayoutProps extends UIElementProps, WithChildrenProps {
  sidebarItems: Array<{
    href: string;
    label: string;
    icon?: ReactNode;
    childItems?: Array<{
      href: string;
      label: string;
    }>;
  }>;
  headerActions?: ReactNode;
  userMenu?: {
    displayName?: string;
    avatarSrc?: string;
    items: Array<{
      label: string;
      href?: string;
      onClick?: () => void;
      icon?: ReactNode;
    }>;
  };
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
  }>;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

/**
 * Flex container props
 */
export interface FlexProps extends UIElementProps, WithChildrenProps {
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  alignContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'stretch'
    | 'space-between'
    | 'space-around';
  gap?: number | string;
  flex?: string | number;
}

/**
 * Divider props
 */
export interface DividerProps extends UIElementProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'fullWidth' | 'inset' | 'middle';
  light?: boolean;
  spacing?: number | string;
  text?: string;
}

/**
 * Animation props
 */
export interface AnimationProps {
  animate?: boolean;
  initial?: boolean | object;
  transition?: {
    duration?: number;
    delay?: number;
    ease?: string | number[];
    type?: string;
  };
}

/**
 * Simple variant with just target properties
 */
export interface SimpleVariant {
  [key: string]: Target;
}

/**
 * Variant with transition properties
 */
export interface TransitionVariant {
  [key: string]: TargetAndTransition;
}

/**
 * Variant with custom props (like index-based variants)
 */
export interface CustomVariant<P> {
  [key: string]: (props: P) => TargetAndTransition;
}

/**
 * Custom variant that accepts a number index
 */
export interface IndexVariant {
  [key: string]: Target | ((i: number) => TargetAndTransition);
}

/**
 * FAQ Item type
 */
export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * FAQ Accordion props
 */
export interface FAQAccordionProps {
  items: FAQItem[];
}

/**
 * FAQ Category
 */
export type FAQCategory = {
  id: string;
  title: string;
  icon: string;
  items: FAQItem[];
};

/**
 * FAQ Search props
 */
export interface FAQSearchProps {
  categories: FAQCategory[];
}

// React Admin Types

/**
 * React Admin Menu props
 */
export interface ReactAdminMenuProps {
  children: ReactNode;
  dense?: boolean;
  hasDashboard?: boolean;
  onMenuClick?: () => void;
}

/**
 * React Admin AppBar props
 */
export interface ReactAdminAppBarProps {
  children?: ReactNode;
  className?: string;
  color?: 'default' | 'primary' | 'secondary' | 'transparent';
  open?: boolean;
  title?: ReactNode | string;
  userMenu?: ReactNode;
  logout?: ReactNode;
  [key: string]: unknown; // For rest props
}

/**
 * React Admin Layout props
 */
export interface ReactAdminLayoutProps {
  appBar?: React.ComponentType<ReactAdminAppBarProps>;
  children?: ReactNode;
  className?: string;
  dashboard?: React.ComponentType;
  error?: React.ComponentType;
  loading?: React.ComponentType;
  menu?: React.ComponentType<ReactAdminMenuProps>;
  sidebar?: React.ComponentType;
  title?: string | ReactNode;
  theme?: Theme;
  [key: string]: unknown; // For rest props
}

// Toast Types

/**
 * Toast message data
 */
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title?: string;
  icon?: ReactNode;
  duration?: number;
  dismissible?: boolean;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outlined';
  }>;
}

/**
 * Toast position
 */
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

/**
 * Toast service interface
 */
export interface ToastService {
  success: (
    message: string,
    options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'message'>>,
  ) => string;
  error: (
    message: string,
    options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'message'>>,
  ) => string;
  info: (
    message: string,
    options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'message'>>,
  ) => string;
  warning: (
    message: string,
    options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'message'>>,
  ) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

/**
 * Toast provider props
 */
export interface ToastProviderProps {
  children: ReactNode;
  defaultPosition?: ToastPosition;
  defaultDuration?: number;
  maxToasts?: number;
  pauseOnHover?: boolean;
  dismissible?: boolean;
  newestOnTop?: boolean;
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
}

/**
 * Toast component props
 */
export interface ToastComponentProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
  position: ToastPosition;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Toast container props
 */
export interface ToastContainerProps {
  position?: ToastPosition;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Root layout props for the main application layout
 */
export interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Gallery item card props interface
 */
export interface GalleryItemProps {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  artist?: string;
  tags?: string[];
  position?: number;
  className?: string;
  onOpen?: (id: string) => void;
}

/**
 * Service process step interface
 */
export interface ServiceProcess {
  title: string;
  description: string;
}

/**
 * Tattoo service interface
 */
export interface Service {
  id: string;
  title: string;
  description: string;
  process: string[];
  detailedProcess?: ServiceProcess[];
  image: string;
  icon: React.ComponentType<{ size: number }>;
  color?: string;
}

/**
 * Live activity indicator props for analytics
 */
export interface LiveActivityIndicatorProps {
  className?: string;
}

/**
 * Realtime stat updater props for analytics
 */
export interface RealtimeStatUpdaterProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}
export interface GalleryImage {
  src: string;
  width: number;
  height: number;
  srcSet?: string[];
  alt?: string;
  title?: string;
  tags?: string[];
  category?: string;
}

/**
 * Props for the unified input adapter component
 */
export interface InputAdapterProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  implementation?: 'admin' | 'client' | 'auto';
  muiProps?: Omit<
    TextFieldProps,
    | 'name'
    | 'label'
    | 'type'
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'onBlur'
    | 'error'
    | 'helperText'
  >;
  shadcnProps?: Omit<
    InputProps,
    'name' | 'type' | 'value' | 'defaultValue' | 'onChange' | 'onBlur'
  >;
}
