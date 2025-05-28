import { Suspense } from 'react';
import { Users, Calendar, TrendingUp, DollarSign, Activity, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardStats, getRecentActivity } from './dashboard-server';
import MetricCard from '@/components/admin/MetricCard';
import QuickActions from '@/components/admin/QuickActions';

// Server Component for dashboard metrics
async function DashboardMetrics() {
  // Fetch data on the server
  const stats = await getDashboardStats();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTrend = (change: number | undefined): 'up' | 'down' | 'neutral' => {
    if (change === undefined || change === 0) return 'neutral';
    return change > 0 ? 'up' : 'down';
  };

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
      <MetricCard
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue)}
        change={stats.revenueGrowth}
        trend={getTrend(stats.revenueGrowth)}
        icon={<DollarSign className="h-4 w-4" />}
        description="this month"
        href="/admin/payments"
      />

      <MetricCard
        title="New Customers"
        value={stats.newCustomersThisMonth}
        change={stats.customerGrowth}
        trend={getTrend(stats.customerGrowth)}
        icon={<Users className="h-4 w-4" />}
        description="this month"
        href="/admin/customers"
      />

      <MetricCard
        title="Total Bookings"
        value={stats.totalBookings}
        change={stats.bookingGrowth}
        trend={getTrend(stats.bookingGrowth)}
        icon={<Calendar className="h-4 w-4" />}
        description="this month"
        href="/admin/bookings"
      />

      <MetricCard
        title="Completion Rate"
        value={`${stats.completionRate}%`}
        trend="up"
        icon={<TrendingUp className="h-4 w-4" />}
        description="success rate"
      />
    </div>
  );
}

// Server Component for recent activity
async function RecentActivity() {
  const recentActivity = await getRecentActivity();

  return (
    <Card className="lg:col-span-2 transition-all duration-300 hover:shadow-lg bg-slate-900 border border-slate-800 flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
            <Activity className="h-5 w-5 text-white" />
          </div>
          Recent Activity
        </CardTitle>
        <CardDescription className="text-slate-400">
          Latest updates from your tattoo studio
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="space-y-3 h-full overflow-y-auto">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors duration-200 animate-in slide-in-from-left-5"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-10 w-10 rounded-full bg-blue-900/50 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{activity.message}</p>
                  <p className="text-xs text-slate-400 font-medium">
                    {new Date(activity.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-12 w-12 text-slate-600 mb-4" />
              <p className="text-slate-400 text-sm">No recent activity</p>
              <p className="text-slate-500 text-xs mt-1">
                Activity will appear as you use the system
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Performance Overview Server Component
async function PerformanceOverview() {
  const stats = await getDashboardStats();

  return (
    <Card className="transition-all duration-300 hover:shadow-lg bg-slate-900 border border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          Performance Overview
        </CardTitle>
        <CardDescription className="text-slate-400">
          Key metrics and performance indicators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center space-y-3 p-6 rounded-xl bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-800/50 hover:scale-105 transition-all duration-300 hover:shadow-md">
            <div className="text-3xl font-bold text-blue-400">{stats.upcomingBookings}</div>
            <div className="text-sm text-blue-300 font-semibold">Upcoming Sessions</div>
            <div className="text-xs text-blue-500 font-medium">Scheduled bookings</div>
          </div>
          <div className="text-center space-y-3 p-6 rounded-xl bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-800/50 hover:scale-105 transition-all duration-300 hover:shadow-md">
            <div className="text-3xl font-bold text-green-400">{stats.completedBookings}</div>
            <div className="text-sm text-green-300 font-semibold">Completed</div>
            <div className="text-xs text-green-500 font-medium">This month</div>
          </div>
          <div className="text-center space-y-3 p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-800/50 hover:scale-105 transition-all duration-300 hover:shadow-md">
            <div className="text-3xl font-bold text-purple-400">{stats.completionRate}%</div>
            <div className="text-sm text-purple-300 font-semibold">Success Rate</div>
            <div className="text-xs text-purple-500 font-medium">All sessions</div>
          </div>
          <div className="text-center space-y-3 p-6 rounded-xl bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-800/50 hover:scale-105 transition-all duration-300 hover:shadow-md">
            <div className="text-3xl font-bold text-orange-400">{stats.totalCustomers}</div>
            <div className="text-sm text-orange-300 font-semibold">Total Clients</div>
            <div className="text-xs text-orange-500 font-medium">Active customer base</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeletons for each section
function MetricsLoading() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
      {Array.from({ length: 4 }, (_, i) => i).map((skeletonId) => (
        <Card
          key={`metric-skeleton-${skeletonId}`}
          className="bg-slate-900 border border-slate-800 h-full flex flex-col justify-between min-h-[140px]"
        >
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 bg-slate-800" />
              <Skeleton className="h-10 w-10 rounded-xl bg-slate-800" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 bg-slate-800 mb-3" />
            <Skeleton className="h-4 w-28 bg-slate-800" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ActivityLoading() {
  return (
    <Card className="lg:col-span-2 bg-slate-900 border border-slate-800 flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl bg-slate-800" />
          <Skeleton className="h-6 w-32 bg-slate-800" />
        </div>
        <Skeleton className="h-4 w-48 bg-slate-800" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => i).map((activityId) => (
            <div
              key={`activity-skeleton-${activityId}`}
              className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl"
            >
              <Skeleton className="h-10 w-10 rounded-full bg-slate-700" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-slate-700" />
                <Skeleton className="h-3 w-1/2 bg-slate-700" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Main component with streaming
export default function StreamedDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-tattoo-red to-tattoo-red/80 rounded-xl shadow-sm">
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Ink 37 Tattoos</h1>
            <p className="text-slate-400 mt-1">
              Monitor your business performance and manage operations
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid with Suspense */}
      <Suspense fallback={<MetricsLoading />}>
        <DashboardMetrics />
      </Suspense>

      {/* Main Content Grid with Streaming */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 auto-rows-fr">
        {/* Recent Activity with Suspense */}
        <Suspense fallback={<ActivityLoading />}>
          <RecentActivity />
        </Suspense>

        {/* Quick Actions - Static component, no suspense needed */}
        <QuickActions />
      </div>

      {/* Performance Overview with Suspense */}
      <Suspense fallback={<div className="h-64 bg-slate-900 rounded-xl animate-pulse" />}>
        <PerformanceOverview />
      </Suspense>
    </div>
  );
}
