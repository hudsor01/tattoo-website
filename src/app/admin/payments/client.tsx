/**
 * Admin Payments Page Client Component
 * 
 * Purpose: Manage payments from Cal.com bookings
 * Rendering: CSR with payment data integration
 * Dependencies: Cal.com payment data, analytics
 * 
 * Trade-offs:
 * - Cal.com payment tracking vs custom payment system
 * - Real-time updates vs caching for performance
 */

'use client';

import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/admin/layout/Sidebar';
import { trpc } from '@/lib/trpc/client';
import { format } from 'date-fns';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  Filter,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { DataTable } from '@/components/admin/Data-Table';
import type { ColumnDef } from '@tanstack/react-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import type { PaymentStatus } from '@prisma/client';

// Payment types using the actual tRPC response structure
type PaymentMethodStats = {
  type: string;
  count: number;
  amount: number;
  percentage?: number;
};

type TopServiceStats = {
  name: string;
  bookings: number;
  revenue: number;
};

// Type for the flattened payment data from tRPC
type PaymentResponseData = {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: string | undefined;
  paymentMethod: string | undefined;
  customerName: string;
  customerEmail: string;
  serviceName: string | undefined;
  createdAt: string;
  paidAt: string;
};

const columns: ColumnDef<PaymentResponseData>[] = [
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="font-medium">{format(new Date(row.original.createdAt), 'MMM d, yyyy')}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(row.original.createdAt), 'h:mm a')}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "customerName",
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.customerName}</p>
        <p className="text-sm text-muted-foreground">{row.original.customerEmail}</p>
      </div>
    ),
  },
  {
    id: "serviceName",
    accessorKey: "serviceName",
    header: "Service",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original.serviceName}
      </Badge>
    ),
  },
  {
    id: "amount",
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="font-medium">
        ${row.original.amount.toFixed(2)} {row.original.currency}
      </div>
    ),
  },
  {
    id: "paymentMethod",
    accessorKey: "paymentMethod",
    header: "Method",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{row.original.paymentMethod ?? 'Card'}</span>
      </div>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge 
          variant={
            status === 'COMPLETED' ? 'success' : 
            status === 'PENDING' ? 'warning' : 
            status === 'REFUNDED' ? 'secondary' :
            'destructive'
          }
        >
          <span className="flex items-center gap-1">
            {status === 'COMPLETED' && <CheckCircle className="h-3 w-3" />}
            {status === 'PENDING' && <Clock className="h-3 w-3" />}
            {status === 'FAILED' && <AlertCircle className="h-3 w-3" />}
            {status ?? 'unknown'}
          </span>
        </Badge>
      );
    },
  },
];

export function PaymentsPageClient() {
  const [timeRange, setTimeRange] = useState('month');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  // Fetch payment data
  const { data: payments, isLoading, refetch } = trpc.payments.getPayments.useQuery(
    { 
      timeRange: timeRange as 'week' | 'month' | 'year',
      status: statusFilter === 'all' ? undefined : statusFilter as PaymentStatus
    },
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  // Fetch payment stats
  const { data: stats } = trpc.payments.getPaymentStats.useQuery({
    timeRange: timeRange as 'week' | 'month' | 'year',
  });

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: "Payments refreshed",
      description: "Payment data has been updated.",
    });
  };

  const handleExport = async () => {
    try {
      // Export logic here
      toast({
        title: "Export started",
        description: "Your payment report is being generated.",
      });
    } catch {
      toast({
        title: "Export failed",
        description: "Failed to export payment data.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Fixed Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/95 backdrop-blur-sm">
          <div>
            <h1 className="dashboard-section-heading text-4xl lg:text-5xl">Payments</h1>
            <p className="dashboard-section-subheading mt-1">
              Track revenue and payment status from bookings
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleRefresh()}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleExport()}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Revenue Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats?.totalRevenue?.toFixed(2) ?? '0.00'}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  {stats?.revenueChange && stats.revenueChange > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-green-500">+{stats.revenueChange}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      <span className="text-red-500">{stats?.revenueChange}%</span>
                    </>
                  )}
                  <span className="ml-1">from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats?.paidAmount?.toFixed(2) ?? '0.00'}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats?.paidCount ?? 0} transactions
                </p>
                <Progress 
                  value={stats?.paidPercentage ?? 0} 
                  className="mt-2 h-1"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats?.pendingAmount?.toFixed(2) ?? '0.00'}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats?.pendingCount ?? 0} transactions
                </p>
                <Progress 
                  value={stats?.pendingPercentage ?? 0} 
                  className="mt-2 h-1"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats?.failedAmount?.toFixed(2) ?? '0.00'}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats?.failedCount ?? 0} transactions
                </p>
                <Progress 
                  value={stats?.failedPercentage ?? 0} 
                  className="mt-2 h-1"
                />
              </CardContent>
            </Card>
          </div>

          {/* Filters and Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Payment Transactions</CardTitle>
                  <CardDescription>
                    All payments processed through Cal.com bookings
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={payments ?? []}
                loading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Payment Analytics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Breakdown of payment methods used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.paymentMethods?.map((method: PaymentMethodStats) => (
                    <div key={method.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{method.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {method.count} payments
                        </span>
                        <Badge variant="secondary">
                          ${method.amount.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Services by Revenue</CardTitle>
                <CardDescription>
                  Most profitable services this period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.topServices?.map((service: TopServiceStats, index: number) => (
                    <div key={service.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium">{service.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {service.bookings} bookings
                        </span>
                        <Badge variant="secondary">
                          ${service.revenue.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}