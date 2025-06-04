'use client';

/**
 * Admin Dashboard Client Component
 * 
 * Purpose: Client wrapper for admin dashboard with real-time analytics
 * Responsive design with proper spacing and modern layout
 */

import React, { useState } from 'react';
import {
  Activity,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  Bell,
  Plus,
  Download,
  Search,
  Filter,
  RefreshCw,
  Zap,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/error/error-boundary';
import { useUser } from '@/lib/auth-client';
// TODO: Replace with actual REST API calls using TanStack Query
import { logger } from '@/lib/logger';
import { DashboardCharts, RevenueChart } from '@/components/admin/dashboard/Charts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MetricCard from '@/components/admin/dashboard/Metrics-Card';
import { cn } from '@/lib/utils';
import { AdminLoginClient } from '@/components/admin/auth/Login-Client';

// Import Prisma types if needed
import type { Prisma } from '@prisma/client';

// UI-specific types (not database models)
type DashboardMetrics = {
  revenue: {
    current: number;
    previous: number;
    trend: number;
    inPeriod?: number;
    change?: number;
  };
  appointments: {
    current: number;
    previous: number;
    trend: number;
    upcoming?: number;
    change?: number;
  };
  customers: {
    current: number;
    previous: number;
    trend: number;
    newInPeriod?: number;
    change?: number;
  };
  conversion: {
    current: number;
    previous: number;
    trend: number;
  };
  growth?: {
    current?: number;
    change?: number;
  };
};

// Dashboard stats query response type - matches tRPC router return
type DashboardStatsQueryResponse = {
  totalRevenue: number;
  bookingCount: number;
  customerCount: number;
  activeappointments: number;
  revenueByService: Array<{
    service: string;
    revenue: number;
    count: number;
  }>;
  recentappointments: Array<{
    id: string;
    customer: string;
    service: string;
    amount: number;
    date: string;
    status: string;
  }>;
  metrics: DashboardMetrics;
  revenue?: {
    inPeriod?: number;
    change?: number;
  };
  customers?: {
    newInPeriod?: number;
    change?: number;
  };
  appointments?: {
    current?: number;
    upcoming?: number;
    change?: number;
  };
  growth?: {
    current?: number;
    change?: number;
  };
};

// Enhanced loading skeleton for metric cards
function MetricCardSkeleton() {
  return (
    <div className="metric-card animate-pulse">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-8 w-8 bg-muted rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="h-8 w-24 bg-muted rounded" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

// Enhanced Quick Actions Panel with Emergency Actions
function QuickActionsPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const primaryActions = [
    { icon: Plus, label: 'Quick Add', onClick: () => {} },
    { icon: Calendar, label: 'Quick Booking', onClick: () => {} },
    { icon: DollarSign, label: 'Record Payment', onClick: () => {} },
  ];
  
  const emergencyActions = [
    { icon: XCircle, label: 'Cancel Appointment', color: 'bg-red-600 hover:bg-red-700' },
    { icon: RefreshCw, label: 'Reschedule', color: 'bg-yellow-600 hover:bg-yellow-700' },
    { icon: AlertCircle, label: 'Emergency Contact', color: 'bg-orange-600 hover:bg-orange-700' },
  ];
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Expanded Actions */}
        {isExpanded && (
          <div className="absolute bottom-16 right-0 bg-card border border-border rounded-xl shadow-xl p-4 mb-3 animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            
            {/* Primary Actions */}
            <div className="space-y-2 mb-4">
              {primaryActions.map((action) => (
                <Button
                  key={`primary-action-${action.label}`}
                  variant="outline"
                  className="w-full justify-start h-10"
                  onClick={action.onClick}
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>
            
            {/* Emergency Actions */}
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground mb-2">Emergency Actions</p>
              <div className="space-y-2">
                {emergencyActions.map((action) => (
                  <Button
                    key={`emergency-action-${action.label}`}
                    className={`w-full justify-start h-10 text-white ${action.color}`}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Main Toggle Button */}
        <Button 
          className="quick-action-btn h-14 w-14 rounded-full p-0 shadow-lg"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <XCircle className="h-6 w-6" />
          ) : (
            <Zap className="h-6 w-6" />
          )}
          <span className="sr-only">{isExpanded ? 'Close' : 'Quick Actions'}</span>
        </Button>
      </div>
    </div>
  );
}

// Enhanced Activity Card Component
function ActivityCard({ icon, title, time, status, statusColor = 'success' }: {
  icon: React.ReactNode;
  title: string;
  time: string;
  status: string;
  statusColor?: 'success' | 'warning' | 'critical';
}) {
  return (
    <div className="activity-card group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            statusColor === 'success' ? 'bg-green-500/10 dark:bg-green-900/30 group-hover:bg-green-500/20' :
            statusColor === 'warning' ? 'bg-yellow-500/10 dark:bg-amber-900/30 group-hover:bg-yellow-500/20' :
            'bg-red-500/10 dark:bg-red-900/30 group-hover:bg-red-500/20'
          }`}>
            {icon}
          </div>
          <div>
            <p className="font-medium text-foreground group-hover:text-primary transition-colors">{title}</p>
            <p className="text-xs text-muted-foreground">{time}</p>
          </div>
        </div>
        <Badge className={`${
          statusColor === 'success' ? 'status-healthy' :
          statusColor === 'warning' ? 'status-warning' :
          'status-critical'
        } transition-all duration-300 group-hover:scale-105`}>
          {status}
        </Badge>
      </div>
    </div>
  );
}

// Enhanced Date Range Selector with Comparative Analytics
function DateRangeSelector({ period, setPeriod, onCompareToggle }: {
  period: 'month' | 'week' | 'today' | 'year';
  setPeriod: (period: 'month' | 'week' | 'today' | 'year') => void;
  onCompareToggle?: (enabled: boolean) => void;
}) {
  const [showComparison, setShowComparison] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    window.location.reload();
  };
  
  const handleCompareToggle = () => {
    const newValue = !showComparison;
    setShowComparison(newValue);
    onCompareToggle?.(newValue);
  };
  
  // Calculate date range display
  const getDateRangeText = () => {
    const now = new Date();
    const start = new Date();
    
    switch (period) {
      case 'today':
        return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      case 'week':
        start.setDate(now.getDate() - 7);
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'year':
        return now.getFullYear().toString();
      default:
        return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-2">
        <Button 
          variant={period === 'today' ? 'default' : 'outline'} 
          size="sm" 
          className="h-9 transition-all duration-300"
          onClick={() => setPeriod('today')}
        >
          <Calendar className="h-4 w-4 mr-1" />
          Today
        </Button>
        <Button 
          variant={period === 'week' ? 'default' : 'outline'} 
          size="sm" 
          className="h-9 transition-all duration-300"
          onClick={() => setPeriod('week')}
        >
          <BarChart3 className="h-4 w-4 mr-1" />
          Weekly
        </Button>
        <Button 
          variant={period === 'month' ? 'default' : 'outline'} 
          size="sm" 
          className="h-9 transition-all duration-300"
          onClick={() => setPeriod('month')}
        >
          <PieChart className="h-4 w-4 mr-1" />
          Monthly
        </Button>
        <Button 
          variant={period === 'year' ? 'default' : 'outline'} 
          size="sm" 
          className="h-9 transition-all duration-300"
          onClick={() => setPeriod('year')}
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          Yearly
        </Button>
      </div>
      
      <div className="flex items-center gap-2 ml-0 sm:ml-2">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 transition-all duration-300",
            showComparison && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={handleCompareToggle}
        >
          <BarChart3 className="h-4 w-4 mr-1" />
          Compare
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 transition-all duration-300 hover:scale-105"
          onClick={() => void handleRefresh()}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("h-4 w-4 mr-1", isRefreshing && "animate-spin")} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
        
        <div className="hidden lg:flex items-center text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
          <Calendar className="h-3 w-3 mr-1" />
          {getDateRangeText()}
        </div>
      </div>
    </div>
  );
}

// Enhanced hydration and auth wrapper
function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = React.useState(false);
  const { user, isAdmin, isLoading } = useUser();
  
  // Handle hydration - critical for auth state
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Don't render anything until hydration is complete to avoid mismatches
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#dc2626]"></div>
      </div>
    );
  }
  
  // Show loading state after hydration
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#dc2626]"></div>
      </div>
    );
  }
  
  // Authentication check - show login if not admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <ErrorBoundary 
          fallback={
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
              <div className="bg-gray-800 rounded-lg p-8 text-center max-w-md">
                <div className="mb-4 text-[#dc2626]">
                  <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m10-8a8 8 0 01-5.18 7.47c-.3.07-.6-.16-.6-.47v-1.7c0-.27.2-.49.47-.5 2.35-.1 4-1.47 4-3.7 0-.86-.3-1.6-.8-2.15a.5.5 0 01-.12-.63c.2-.57.27-1.12.17-1.67-.1-.6-.81-.41-.81-.41-.4.08-.79.21-1.17.39a.5.5 0 01-.5-.03A5.1 5.1 0 0012 7c-.64 0-1.28.09-1.89.25a.5.5 0 01-.51.03 5.02 5.02 0 00-1.16-.39s-.71-.19-.81.41c-.09.55-.03 1.1.17 1.67a.5.5 0 01-.12.63c-.5.55-.8 1.3-.8 2.15 0 2.23 1.67 3.6 4.02 3.7.27.01.47.23.47.5v1.7c0 .3-.3.54-.6.47A8 8 0 112 7a8 8 0 018-8 8 8 0 018 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Unauthorized Access</h3>
                <p className="text-gray-400 mb-4">
                  You don't have permission to access this dashboard. Please sign in with an admin account.
                </p>
                <a 
                  href="/auth"
                  className="px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-md inline-block"
                >
                  Sign In
                </a>
              </div>
            </div>
          }
        >
          <AdminLoginClient />
        </ErrorBoundary>
      </div>
    );
  }
  
  return <>{children}</>;
}

export default function AdminDashboardClient() {
  // Enhanced auth and hydration wrapper
  const [isHydrated, setIsHydrated] = React.useState(false);
  const { user, isAdmin, isLoading } = useUser();
  
  // Handle hydration - critical for auth state
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Don't render anything until hydration is complete to avoid mismatches
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#dc2626]"></div>
      </div>
    );
  }
  
  // Show loading state after hydration
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#dc2626]"></div>
      </div>
    );
  }
  
  // Authentication check - show login if not admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 text-center max-w-md">
          <div className="mb-4 text-[#dc2626]">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m10-8a8 8 0 01-5.18 7.47c-.3.07-.6-.16-.6-.47v-1.7c0-.27.2-.49.47-.5 2.35-.1 4-1.47 4-3.7 0-.86-.3-1.6-.8-2.15a.5.5 0 01-.12-.63c.2-.57.27-1.12.17-1.67-.1-.6-.81-.41-.81-.41-.4.08-.79.21-1.17.39a.5.5 0 01-.5-.03A5.1 5.1 0 0012 7c-.64 0-1.28.09-1.89.25a.5.5 0 01-.51.03 5.02 5.02 0 00-1.16-.39s-.71-.19-.81.41c-.09.55-.03 1.1.17 1.67a.5.5 0 01-.12.63c-.5.55-.8 1.3-.8 2.15 0 2.23 1.67 3.6 4.02 3.7.27.01.47.23.47.5v1.7c0 .3-.3.54-.6.47A8 8 0 112 7a8 8 0 018-8 8 8 0 018 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Unauthorized Access</h3>
          <p className="text-gray-400 mb-4">
            You don't have permission to access this dashboard. Please sign in with an admin account.
          </p>
          <a 
            href="/auth"
            className="px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-md inline-block"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Now render the actual dashboard content
  return <AdminDashboardContent user={user} />;
}

// Separate the dashboard content into its own component
function AdminDashboardContent({ user }: { user: NonNullable<ReturnType<typeof useUser>['user']> }) {
  // Use React hooks for state management
  const [period, setPeriod] = useState<'month' | 'week' | 'today' | 'year'>('month');
  const [showComparison, setShowComparison] = useState(true);
  
  // TODO: Replace with actual REST API calls using TanStack Query
  const isDashboardLoading = false;
  const dashboardError = null;
  
  // Mock dashboard data
  const dashboardData = {
    revenue: { current: 12500, previous: 10800, trend: 15.7, inPeriod: 12500, change: 15.7 },
    appointments: { current: 45, previous: 38, trend: 18.4, upcoming: 12, change: 18.4 },
    customers: { current: 156, previous: 142, trend: 9.9, newInPeriod: 14, inPeriod: 14, change: 9.9 },
    conversion: { current: 68.5, previous: 62.1, trend: 10.3 },
    growth: { current: 15.7, change: 12.3 }
  };

  // Mock health status
  const healthStatus = {
    data: {
      overall: 'healthy',
      database: 'healthy',
      api: 'healthy',
      uptime: 99.8
    }
  };

  // Compute overall health status from individual services
  const getOverallHealthStatus = () => {
    if (!healthStatus?.data) return 'unknown';
    
    const { api, database, sync } = healthStatus.data;
    
    // If any service is critical, overall is critical
    if (api.status === 'critical' || database.status === 'critical' || sync.status === 'critical') {
      return 'critical';
    }
    
    // If any service has warning, overall is warning
    if (api.status === 'warning' || database.status === 'warning' || sync.status === 'warning') {
      return 'warning';
    }
    
    // If all services are healthy, overall is healthy
    if (api.status === 'healthy' && database.status === 'healthy' && sync.status === 'healthy') {
      return 'healthy';
    }
    
    return 'unknown';
  };

  // Health status indicator
  const getHealthStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };
  
  return (
    <AdminAuthWrapper>
      {/* Fixed Header */}
      <header 
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/95 backdrop-blur-sm"
        role="banner"
        aria-label="Dashboard header"
      >
        <div>
          <h1 className="dashboard-section-heading text-4xl lg:text-5xl">Dashboard</h1>
          <p className="dashboard-section-subheading mt-1">
            Overview of your studio's performance and appointments
          </p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Global Search */}
          <div className="relative group hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search customers, appointments..."
              className="w-48 lg:w-64 h-9 pl-9 pr-3 bg-muted/50 border border-transparent rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  // Handle search functionality
                  // TODO: Implement search functionality
                }
              }}
            />
            <kbd className="absolute right-2 top-1/2 transform -translate-y-1/2 hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
          
          {/* Search Button for Mobile */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          
          {/* Health Status Badge */}
          <Badge 
            variant={getOverallHealthStatus() === 'healthy' ? 'success' : getOverallHealthStatus() === 'warning' ? 'warning' : 'destructive'} 
            className="flex items-center gap-1 h-8 px-3"
          >
            {getHealthStatusIcon(getOverallHealthStatus())}
            <span className="hidden sm:inline capitalize">{getOverallHealthStatus()}</span>
          </Badge>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user.name || 'Admin User'}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image ?? undefined} alt={user.name || 'User'} />
              <AvatarFallback>
                {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AD'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      
      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 space-y-6">
          {/* Enhanced Period Selector */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="dashboard-section-heading">Performance Overview</h2>
              <p className="dashboard-section-subheading mt-1">Track your key metrics and growth with real-time analytics</p>
            </div>
            <DateRangeSelector 
              period={period} 
              setPeriod={setPeriod} 
              onCompareToggle={setShowComparison} 
            />
          </div>

          {/* Enhanced Tattoo-Themed Stats Cards */}
          <div className="dashboard-grid">
            {isDashboardLoading ? (
              <>
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
              </>
            ) : (
              <>
                <MetricCard
                  title="Total Revenue"
                  value={`$${dashboardData?.revenue?.inPeriod?.toLocaleString() ?? '1,250.00'}`}
                  description="Trending up this month"
                  icon={<DollarSign className="h-5 w-5" />}
                  trend="up"
                  change={dashboardData?.revenue?.change ?? 12.5}
                  variant="critical"
                  priority="critical"
                  href="/admin/payments"
                  {...(showComparison ? {
                    comparison: {
                      previousValue: `$${(dashboardData?.revenue?.inPeriod ?? 1250) * 0.88}`,
                      previousPeriod: 'Last period',
                      yearOverYear: 28.5
                    }
                  } : {})}
                  showProgress={showComparison}
                />
                
                <MetricCard
                  title="New Customers"
                  value={dashboardData?.customers?.newInPeriod?.toLocaleString() ?? '1,234'}
                  description="Customer growth this period"
                  icon={<Users className="h-5 w-5" />}
                  trend={dashboardData?.customers?.change && dashboardData.customers.change > 0 ? "up" : "down"}
                  change={dashboardData?.customers?.change ?? -20}
                  variant="default"
                  priority="medium"
                  href="/admin/customers"
                  {...(showComparison ? {
                    comparison: {
                      previousValue: Math.floor((dashboardData?.customers?.newInPeriod ?? 1234) * 1.25).toLocaleString(),
                      previousPeriod: 'Last period',
                      yearOverYear: -8.2
                    }
                  } : {})}
                  showProgress={showComparison}
                />
                
                <MetricCard
                  title="Active appointments"
                  value={dashboardData?.appointments?.current?.toLocaleString() ?? dashboardData?.appointments?.upcoming?.toLocaleString() ?? '45,678'}
                  description="Strong appointment flow"
                  icon={<Calendar className="h-5 w-5" />}
                  trend="up"
                  change={dashboardData?.appointments?.change ?? dashboardData?.appointments?.change ?? 12.5}
                  variant="success"
                  priority="high"
                  href="/admin/appointments"
                  {...(showComparison ? {
                    comparison: {
                      previousValue: Math.floor((dashboardData?.appointments?.current ?? dashboardData?.appointments?.upcoming ?? 45678) * 0.89).toLocaleString(),
                      previousPeriod: 'Last period',
                      yearOverYear: 15.3
                    }
                  } : {})}
                  showProgress={showComparison}
                />
                
                <MetricCard
                  title="Growth Rate"
                  value={`${dashboardData?.growth?.current?.toFixed(1) ?? '4.5'}%`}
                  description="Studio performance increase"
                  icon={<TrendingUp className="h-5 w-5" />}
                  trend="up"
                  change={dashboardData?.growth?.change ?? 4.5}
                  variant="metallic"
                  priority="high"
                  {...(showComparison ? {
                    comparison: {
                      previousValue: `${((dashboardData?.growth?.current ?? 4.5) - 1.2).toFixed(1)}%`,
                      previousPeriod: 'Last period',
                      yearOverYear: 32.1
                    }
                  } : {})}
                  showProgress={showComparison}
                />
              </>
            )}
          </div>
          
          {/* Key Performance Indicators Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="dashboard-section-heading">Key Performance Indicators</h2>
                <p className="dashboard-section-subheading mt-1">Critical business metrics and conversion analytics</p>
              </div>
              <Badge variant="outline" className="text-sm px-3 py-1">
                <Activity className="h-4 w-4 mr-1.5" />
                Live Metrics
              </Badge>
            </div>
            
            {/* KPI Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {/* Revenue per Customer */}
              <Card className="relative overflow-hidden chart-container">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg lg:text-xl font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Revenue per Customer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-3xl lg:text-4xl font-bold">
                      ${((dashboardData?.revenue?.inPeriod ?? 1250) / Math.max(1, dashboardData?.customers?.newInPeriod ?? 10)).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-sm px-2 py-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +15.2%
                      </Badge>
                      <span className="text-sm text-muted-foreground">avg transaction</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Conversion Rate */}
              <Card className="relative overflow-hidden chart-container">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg lg:text-xl font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Booking Conversion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-3xl lg:text-4xl font-bold">68.5%</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-sm px-2 py-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +3.2%
                      </Badge>
                      <span className="text-sm text-muted-foreground">lead to booking</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Lifetime Value */}
              <Card className="relative overflow-hidden chart-container">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg lg:text-xl font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Customer Lifetime Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-3xl lg:text-4xl font-bold">$3,250</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-sm px-2 py-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +22.8%
                      </Badge>
                      <span className="text-sm text-muted-foreground">avg lifetime</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Session Tracking */}
              <Card className="relative overflow-hidden chart-container">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg lg:text-xl font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary animate-pulse" />
                    Active Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-3xl lg:text-4xl font-bold">24</p>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1,2,3,4].map((i) => (
                          <div key={`avatar-placeholder-${i}`} className="h-6 w-6 rounded-full bg-muted border-2 border-background" />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">users online</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Enhanced Charts & Analytics Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="dashboard-section-heading">Analytics & Insights</h2>
                <p className="dashboard-section-subheading">Real-time studio performance and booking analytics</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="h-9">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-7">
              <Card className="lg:col-span-4 overflow-hidden chart-container">
                <CardHeader className="px-6 py-4 border-b border-border/40">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg lg:text-xl font-semibold flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Total Visitors
                      </CardTitle>
                      <CardDescription className="text-sm lg:text-base">
                        Comprehensive visitor analytics and booking funnel metrics
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-9 text-sm bg-background/50 px-3 hover:scale-105 transition-all">
                        Last 3 months
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 text-sm bg-background/50 px-3 hover:scale-105 transition-all">
                        Last 30 days
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 text-sm bg-background/50 px-3 hover:scale-105 transition-all">
                        Last 7 days
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6 py-4">
                  <div className="h-[280px] w-full">
                    <DashboardCharts timeRange={period as 'week' | 'month' | 'year'} />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-3 overflow-hidden chart-container">
                <CardHeader className="px-6 py-4 border-b border-border/40">
                  <CardTitle className="text-lg lg:text-xl font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-sm lg:text-base">
                    Latest appointments, payments, and customer interactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 py-4">
                  <div className="space-y-3">
                    <ActivityCard
                      icon={<Calendar className="h-4 w-4 text-blue-500" />}
                      title="Custom Sleeve Design"
                      time="2 hours ago"
                      status="Completed"
                      statusColor="success"
                    />
                    
                    <ActivityCard
                      icon={<DollarSign className="h-4 w-4 text-green-500" />}
                      title="Traditional Rose - $250"
                      time="5 hours ago"
                      status="Paid"
                      statusColor="success"
                    />
                    
                    <ActivityCard
                      icon={<Calendar className="h-4 w-4 text-yellow-500" />}
                      title="Cover-up Consultation"
                      time="Yesterday"
                      status="Pending"
                      statusColor="warning"
                    />
                    
                    <ActivityCard
                      icon={<XCircle className="h-4 w-4 text-red-500" />}
                      title="Full Back Piece"
                      time="2 days ago"
                      status="Cancelled"
                      statusColor="critical"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Revenue Trends Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="dashboard-section-heading">Revenue Trends</h2>
                <p className="dashboard-section-subheading">Cal.com integration analytics and booking revenue tracking</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9">
                  <Zap className="h-4 w-4 mr-1" />
                  Live Data
                </Button>
                <Button variant="outline" size="sm" className="h-9">
                  <Download className="h-4 w-4 mr-1" />
                  Export Report
                </Button>
              </div>
            </div>
            
            <ErrorBoundary
              fallback={
                <Card className="overflow-hidden chart-container">
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      Cal.com Analytics
                    </CardTitle>
                    <CardDescription>
                      Analytics data temporarily unavailable
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center h-[400px] p-6">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-semibold mb-2">Analytics Error</h3>
                      <p className="text-muted-foreground mb-6">
                        There was a problem loading the Cal.com analytics. This may be due to one of the following:
                      </p>
                      <ul className="text-sm text-muted-foreground mb-6 text-left space-y-1">
                        <li>• Cal.com API integration is not properly configured</li>
                        <li>• No revenue data has been recorded yet</li>
                        <li>• The Cal.com service may be temporarily unavailable</li>
                      </ul>
                    </div>
                    <div className="flex space-x-3">
                      <Button 
                        onClick={() => window.location.reload()}
                        className="quick-action-btn"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Data
                      </Button>
                      <Button 
                        onClick={() => window.open('/admin/settings', '_blank')}
                        variant="outline"
                      >
                        Check Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <Card className="overflow-hidden chart-container">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Cal.com Analytics
                  </CardTitle>
                  <CardDescription>
                    Detailed revenue analytics from your Cal.com booking integration
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[400px]">
                    <RevenueChart timeRange={period} />
                  </div>
                </CardContent>
              </Card>
            </ErrorBoundary>
          </div>
        </div>
      </main>
      
      {/* Quick Actions Panel - Floating */}
      <QuickActionsPanel />
    </AdminAuthWrapper>
  );
}