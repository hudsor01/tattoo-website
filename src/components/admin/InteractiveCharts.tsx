'use client';

import * as React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, TrendingUp, Users, Clock, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { format } from 'date-fns';
import type { ServiceStat, TimeStatItem } from '@/types/dashboard-types';

// Types for chart data
interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
}

interface ServiceData {
  name: string;
  value: number;
  sessions: number;
  color: string;
}

interface TimeSlotData {
  time: string;
  bookings: number;
}

// Color palette for charts
const CHART_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6b7280', // gray
  '#14b8a6', // teal
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload?.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-foreground">{label}</p>
        {payload.map((entry) => (
          <p
            key={entry.dataKey ?? entry.name ?? 'unknown'}
            className="text-sm"
            style={{ color: entry.color }}
          >
            {entry.name}:{' '}
            {typeof entry.value === 'number' && (entry.name?.includes('revenue') ?? false)
              ? `$${entry.value.toLocaleString()}`
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface RevenueChartProps {
  timeRange: string;
}

export function RevenueChart({ timeRange }: RevenueChartProps) {
  const [animationKey, setAnimationKey] = React.useState(0);

  // Date range calculation based on timeRange (currently not used but available for future use)

  // const { start, end } = getDateRange()

  // Fetch revenue data from API
  const {
    data: revenueStats,
    isLoading,
    error,
  } = trpc.dashboard.getStats.useQuery({
    period: timeRange === '1y' ? 'year' : timeRange === '90d' ? 'month' : 'month',
  });

  // Process data for chart
  const revenueData: RevenueData[] = React.useMemo(() => {
    if (!revenueStats?.summary) return [];

    // Create mock data based on the summary stats
    return [
      {
        month: timeRange === '1y' ? format(new Date(), 'MMM yyyy') : format(new Date(), 'MMM dd'),
        revenue: revenueStats.summary.revenue?.period ?? 0,
        bookings: revenueStats.summary.appointments?.period ?? 0,
      },
    ];
  }, [revenueStats, timeRange]);

  // Calculate growth percentage
  const growthPercentage = React.useMemo(() => {
    if (!revenueStats?.summary?.revenue?.change) return 0;
    return Math.round(revenueStats.summary.revenue.change * 100) / 100;
  }, [revenueStats]);

  React.useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, [timeRange]);

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-80">
          <p className="text-muted-foreground">Failed to load revenue data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Revenue Overview
              </CardTitle>
              <CardDescription>Revenue and booking trends over time</CardDescription>
            </div>
            {!isLoading && (
              <Badge
                variant="secondary"
                className={`${
                  growthPercentage >= 0
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}
              >
                {growthPercentage >= 0 ? '+' : ''}
                {growthPercentage}% vs last period
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} key={animationKey}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    className="text-muted-foreground text-xs"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    className="text-muted-foreground text-xs"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ServiceBreakdownChart() {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Fetch service breakdown data
  const { data: serviceStats, isLoading, error } = trpc.dashboard.getServiceDistribution.useQuery();

  // Process data for pie chart
  const serviceData: ServiceData[] = React.useMemo(() => {
    if (!serviceStats || !Array.isArray(serviceStats)) return [];

    const validServiceStats = serviceStats as ServiceStat[];
    const total = validServiceStats.reduce((sum, service) => sum + service.value, 0);

    return validServiceStats.map((service, index): ServiceData => {
      const color = service.color ?? CHART_COLORS[index % CHART_COLORS.length] ?? '#ef4444';
      return {
        name: service.name,
        value: total > 0 ? Math.round((service.value / total) * 100) : 0,
        sessions: service.value,
        color: color,
      };
    });
  }, [serviceStats]);

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load service data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Service Breakdown
          </CardTitle>
          <CardDescription>Distribution of tattoo services this month</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : serviceData.length > 0 ? (
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="h-64 w-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1000}
                      onMouseEnter={(_, index) => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {serviceData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={entry.color}
                          stroke={hoveredIndex === index ? '#ffffff' : 'transparent'}
                          strokeWidth={hoveredIndex === index ? 2 : 0}
                          style={{
                            filter: hoveredIndex === index ? 'brightness(1.1)' : 'brightness(1)',
                            transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                            transformOrigin: 'center',
                            transition: 'all 0.2s ease-in-out',
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload?.length && payload[0]?.payload) {
                          const data = payload[0].payload as ServiceData;
                          return (
                            <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {data.value}% ({data.sessions} sessions)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {serviceData.map((service, index) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: service.color }}
                      />
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.sessions} sessions</p>
                      </div>
                    </div>
                    <Badge variant="outline">{service.value}%</Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No service data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function BookingTimesChart() {
  // Fetch booking time distribution data
  const { data: timeStats, isLoading, error } = trpc.dashboard.getWeeklyBookings.useQuery();

  // Process data for bar chart
  const timeSlotData: TimeSlotData[] = React.useMemo(() => {
    if (!timeStats || !Array.isArray(timeStats)) return [];

    return timeStats.map((day: TimeStatItem) => ({
      time: day.name,
      bookings: day.bookings,
    }));
  }, [timeStats]);

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load booking time data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-500" />
            Popular Booking Times
          </CardTitle>
          <CardDescription>Booking frequency by time of day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeSlotData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="time"
                    className="text-muted-foreground text-xs"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    className="text-muted-foreground text-xs"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="bookings"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ChartContainerProps {
  children: React.ReactNode;
  timeRange: string;
  setTimeRange: (range: string) => void;
}

export function ChartContainer({ children, timeRange, setTimeRange }: ChartContainerProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your studio's performance and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {children}
    </div>
  );
}

// Main dashboard charts component
export function DashboardCharts() {
  const [timeRange, setTimeRange] = React.useState('30d');

  return (
    <ChartContainer timeRange={timeRange} setTimeRange={setTimeRange}>
      <div className="grid gap-6">
        <RevenueChart timeRange={timeRange} />
        <div className="grid lg:grid-cols-2 gap-6">
          <ServiceBreakdownChart />
          <BookingTimesChart />
        </div>
      </div>
    </ChartContainer>
  );
}
