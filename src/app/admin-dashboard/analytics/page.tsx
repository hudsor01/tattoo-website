'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { api } from '@/lib/trpc/client';
import { CalendarIcon, DownloadIcon, RefreshCw, Activity } from 'lucide-react';
import { RealtimeStatUpdater } from './components/RealtimeStatUpdater';
import { LiveActivityIndicator } from './components/LiveActivityIndicator';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A66AFF', '#FF6384'];

const AnalyticsPage = () => {
  const router = useRouter();

  // Date range state
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfDay(subDays(new Date(), 30)),
    to: endOfDay(new Date()),
  });

  // Active tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Get analytics summary data
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = api.analytics.getSummary.useQuery(
    {
      startDate: dateRange.from,
      endDate: dateRange.to,
    },
    {
      enabled: true,
      refetchOnWindowFocus: false,
    },
  );

  // Get top designs data
  const { data: topDesignsData, isLoading: isTopDesignsLoading } =
    api.analytics.getTopDesigns.useQuery(
      {
        limit: 10,
      },
      {
        enabled: activeTab === 'designs',
        refetchOnWindowFocus: false,
      },
    );

  // Get booking funnel data
  const { data: bookingFunnelData, isLoading: isBookingFunnelLoading } =
    api.analytics.getBookingFunnel.useQuery(
      {
        startDate: dateRange.from,
        endDate: dateRange.to,
      },
      {
        enabled: activeTab === 'booking',
        refetchOnWindowFocus: false,
      },
    );

  // Prepare data for charts
  const preparePageViewsData = () => {
    if (!summaryData || !summaryData.topPages) {
      return [];
    }

    return summaryData.topPages.map((page: { path: string; count: number }) => ({
      name: page.path.length > 30 ? `${page.path.substring(0, 27)}...` : page.path,
      views: page.count,
    }));
  };

  const prepareCategoryData = () => {
    if (!summaryData || !summaryData.eventsByCategory) {
      return [];
    }

    return Object.entries(summaryData.eventsByCategory).map(([category, count]) => ({
      name: category,
      value: count,
    }));
  };

  const prepareDeviceData = () => {
    if (!summaryData || !summaryData.deviceBreakdown) {
      return [];
    }

    return Object.entries(summaryData.deviceBreakdown).map(([device, count]) => ({
      name: device,
      value: count,
    }));
  };

  const prepareBookingFunnelData = () => {
    if (!bookingFunnelData || !bookingFunnelData.stepCounts) {
      return [];
    }

    return Object.entries(bookingFunnelData.stepCounts)
      .filter(([step]) => step !== 'abandon')
      .map(([step, count]) => ({
        name: step.replace('_', ' '),
        users: count,
      }));
  };

  // Handle date range selection
  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    if (range.from && range.to) {
      setDateRange({
        from: startOfDay(range.from),
        to: endOfDay(range.to),
      });
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle refresh data
  const handleRefreshData = () => {
    refetchSummary();
  };

  // Handle data export
  const handleExportData = () => {
    // Create CSV data from the summary data
    if (!summaryData) return;
    
    // Prepare CSV header and data rows
    const csvContent = [
      // Headers
      ['Category', 'Count'],
      // Data rows from eventsByCategory
      ...Object.entries(summaryData.eventsByCategory || {}).map(([category, count]) => 
        [category, count.toString()]
      ),
      // Empty row as separator
      [],
      // Page views header and data
      ['Page', 'Views'],
      ...(summaryData.topPages || []).map(page => 
        [page.path, page.count.toString()]
      ),
      // Empty row as separator
      [],
      // Device breakdown header and data
      ['Device', 'Count'],
      ...Object.entries(summaryData.deviceBreakdown || {}).map(([device, count]) => 
        [device, count.toString()]
      )
    ]
    .map(row => row.join(','))
    .join('\n');
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container py-6">
      {/* Add the RealtimeStatUpdater to keep data fresh */}
      <RealtimeStatUpdater dateRange={dateRange} />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <LiveActivityIndicator className="mt-1" />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push('/admin/analytics/live')}>
            <Activity size={16} className="mr-2" />
            Live Dashboard
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon size={16} />
                <span>
                  {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={range =>
                  handleDateRangeChange(range || { from: undefined, to: undefined })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <DownloadIcon size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="designs">Top Designs</TabsTrigger>
          <TabsTrigger value="booking">Booking Funnel</TabsTrigger>
          <TabsTrigger value="events">Event Log</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Events</CardTitle>
                <CardDescription>All tracked interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isSummaryLoading ? 'Loading...' : summaryData?.totalEvents?.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Conversion Rate</CardTitle>
                <CardDescription>Booking completion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isSummaryLoading ? 'Loading...' : `${summaryData?.conversionRate?.toFixed(2)}%`}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Avg. Session</CardTitle>
                <CardDescription>Time spent on site</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isSummaryLoading
                    ? 'Loading...'
                    : summaryData?.averageSessionDuration !== undefined
                      ? `${Math.floor(summaryData.averageSessionDuration / 60)}m ${Math.floor(
                          summaryData.averageSessionDuration % 60,
                        )}s`
                      : 'N/A'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Bounce Rate</CardTitle>
                <CardDescription>Single page visits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isSummaryLoading ? 'Loading...' : `${summaryData?.bounceRate?.toFixed(2)}%`}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most visited pages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isSummaryLoading ? (
                    <div className="flex items-center justify-center h-full">Loading...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={preparePageViewsData()}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip />
                        <Bar dataKey="views" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Categories</CardTitle>
                <CardDescription>Distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isSummaryLoading ? (
                    <div className="flex items-center justify-center h-full">Loading...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={prepareCategoryData()}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }: { name: string; percent: number }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {prepareCategoryData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number, name: string) => [value, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Device Distribution</CardTitle>
              <CardDescription>Traffic by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isSummaryLoading ? (
                  <div className="flex items-center justify-center h-full">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareDeviceData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }: { name: string; percent: number }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {prepareDeviceData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string) => [value, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where visitors come from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">{/* Traffic source visualization */}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Referrers</CardTitle>
                <CardDescription>Top referral sources</CardDescription>
              </CardHeader>
              <CardContent>{/* Referrers table */}</CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Designs Tab */}
        <TabsContent value="designs">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Designs</CardTitle>
              <CardDescription>Based on views and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isTopDesignsLoading ? (
                <div>Loading designs data...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Design</th>
                        <th className="text-left py-3 px-4">Views</th>
                        <th className="text-left py-3 px-4">Interactions</th>
                        <th className="text-left py-3 px-4">Score</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topDesignsData?.map((design: { 
                        designId: string; 
                        views: number;
                        interactions: number;
                        score: number;
                        details?: {
                          title?: string;
                          artist?: string;
                          imageUrl?: string;
                        }
                      }) => (
                        <tr
                          key={design.designId}
                          className="border-b hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {design.details?.imageUrl && (
                                <img
                                  src={design.details.imageUrl}
                                  alt={design.details.title || 'Design thumbnail'}
                                  className="h-10 w-10 object-cover rounded"
                                />
                              )}
                              <div>
                                <div className="font-medium">
                                  {design.details?.title || 'Untitled'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {design.details?.artist || 'Unknown artist'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{design.views}</td>
                          <td className="py-3 px-4">{design.interactions}</td>
                          <td className="py-3 px-4">{design.score}</td>
                          <td className="py-3 px-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/gallery/${design.designId}`)}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Funnel Tab */}
        <TabsContent value="booking">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Funnel</CardTitle>
                <CardDescription>Conversion through booking steps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isBookingFunnelLoading ? (
                    <div className="flex items-center justify-center h-full">Loading...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareBookingFunnelData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="users" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Completion Rate</CardTitle>
                  <CardDescription>Start to finish</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {isBookingFunnelLoading
                      ? 'Loading...'
                      : `${bookingFunnelData?.overallCompletionRate?.toFixed(2)}%`}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Abandonment Rate</CardTitle>
                  <CardDescription>Dropped bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {isBookingFunnelLoading
                      ? 'Loading...'
                      : `${bookingFunnelData?.abandonmentRate?.toFixed(2)}%`}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Bookings</CardTitle>
                  <CardDescription>Completed in period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {isBookingFunnelLoading ? 'Loading...' : bookingFunnelData?.totalBookings}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Step Conversion Rates</CardTitle>
                <CardDescription>Drop-off between steps</CardDescription>
              </CardHeader>
              <CardContent>
                {isBookingFunnelLoading ? (
                  <div>Loading...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Step Transition</th>
                          <th className="text-left py-3 px-4">Conversion Rate</th>
                          <th className="text-left py-3 px-4">Avg. Time Spent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookingFunnelData?.conversionRates &&
                          Object.entries(bookingFunnelData.conversionRates).map(([steps, rate]) => (
                            <tr
                              key={steps}
                              className="border-b hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <td className="py-3 px-4">
                                {steps.replace('_to_', ' → ').replace(/_/g, ' ')}
                              </td>
                              <td className="py-3 px-4">{(rate as number).toFixed(2)}%</td>
                              <td className="py-3 px-4">
                                {bookingFunnelData.stepTimings &&
                                bookingFunnelData.stepTimings[steps] !== undefined
                                  ? `${Math.floor(
                                      bookingFunnelData.stepTimings[steps] / 60,
                                    )}m ${Math.floor(bookingFunnelData.stepTimings[steps] % 60)}s`
                                  : 'N/A'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Event Log Tab */}
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Event Log</CardTitle>
              <CardDescription>Recent tracked events</CardDescription>
            </CardHeader>
            <CardContent>{/* Event log table with filtering */}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
