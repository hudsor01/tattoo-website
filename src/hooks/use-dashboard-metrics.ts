/**
 * Re-export of dashboard metrics hooks from consolidated use-metrics.ts
 */

export type { 
  DateRange,
  MetricsPeriod,
  UseDashboardMetricsReturn 
} from './use-metrics';

export { 
  useDashboardMetrics,
  useRealtimeDashboard,
  useDashboardCharts 
} from './use-metrics';