'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Loading state for charts
const ChartSkeleton = ({ height = 350 }: { height?: number }) => (
  <div className="w-full">
    <Skeleton className="w-full" style={{ height }} />
  </div>
);

// Dynamic imports for Recharts components
export const DynamicLineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

export const DynamicBarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

export const DynamicAreaChart = dynamic(() => import('recharts').then((mod) => mod.AreaChart), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

export const DynamicPieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), {
  loading: () => <ChartSkeleton height={400} />,
  ssr: false,
});

// Export common chart components
export {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  Bar,
  Area,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
