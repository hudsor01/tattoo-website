'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/useAuthStore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import { 
  Users, 
  Calendar,
  MessageSquare,
  LogOut,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
}

interface ChartDataItem {
  name: string;
  bookings: number;
}

const chartData: ChartDataItem[] = [
  { name: "Mon", bookings: 5 },
  { name: "Tue", bookings: 7 },
  { name: "Wed", bookings: 3 },
  { name: "Thu", bookings: 8 },
  { name: "Fri", bookings: 10 },
  { name: "Sat", bookings: 12 },
  { name: "Sun", bookings: 6 },
];

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBookings, setSelectedBookings] = useState<number[]>([]);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  
  // Fetch dashboard stats with tRPC
  const { data: statsData } = trpc.dashboard.getStats.useQuery();
  
  // Fetch recent bookings
  const { data: bookingsData, isLoading: bookingsLoading } = trpc.dashboard.getRecentBookings.useQuery({ 
    limit: 10,
    status: filterStatus !== 'all' ? filterStatus : undefined
  }, {
    enabled: !isLoading,
  });
  
  // Fetch weekly booking data for chart
  const { data: weeklyData, isLoading: weeklyLoading } = trpc.dashboard.getWeeklyBookings.useQuery(undefined, {
    enabled: !isLoading,
  });
  
  // Fetch service distribution for pie chart
  const { data: serviceData, isLoading: serviceLoading } = trpc.dashboard.getServiceDistribution.useQuery(undefined, {
    enabled: !isLoading,
  });
  
  // Fetch recent contacts
  const { data: contactsData, isLoading: contactsLoading } = trpc.dashboard.getRecentContacts.useQuery({
    limit: 10
  }, {
    enabled: !isLoading,
  });
  
  // Fetch recent activity
  const { data: activityData, isLoading: activityLoading } = trpc.dashboard.getRecentActivity.useQuery({
    limit: 5
  }, {
    enabled: !isLoading,
  });
  
  // Set contacts when data is fetched
  useEffect(() => {
    if (contactsData) {
      setContacts(contactsData);
    }
  }, [contactsData]);

  // Update loading state when stats are fetched
  useEffect(() => {
    if (statsData) {
      setIsLoading(false);
    }
  }, [statsData]);

  const handleLogout = (): void => {
    // Clear JWT token
    document.cookie = 'admin-token=; Max-Age=0; path=/';
    router.push('/admin-dashboard/auth/login');
  };

  const exportData = (): void => {
    const csvContent = `data:text/csv;charset=utf-8,` +
      `Name,Email,Service,Date,Status\n${ 
      bookings.map((booking) => 
        `${booking.name},${booking.email},${booking.service},${booking.date},${booking.status}`
      ).join('\n')}`;
    
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = 'bookings.csv';
    link.click();
  };

  const handleSelectBooking = (id: number): void => {
    setSelectedBookings(prev => 
      prev.includes(id) 
        ? prev.filter(bookingId => bookingId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (): void => {
    if (selectedBookings.length === bookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(bookings.map(b => b.id));
    }
  };

  // Use real bookings data if available, otherwise fallback to empty array
  const bookings = bookingsData || [];
  
  // No need to filter here as the tRPC query already filters by status

  const exportContacts = async (): Promise<void> => {
    try {
      const response = await fetch('/api/admin/contacts', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to export contacts');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting contacts:', error);
    }
  };

  const handleSelectContact = (id: string): void => {
    setSelectedContacts(prev => 
      prev.includes(id) 
        ? prev.filter(contactId => contactId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAllContacts = (): void => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  const statCards = [
    {
      title: 'Total Bookings',
      value: statsData?.summary?.appointments?.total || 0,
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pending Bookings',
      value: statsData?.pendingBookings || 0,
      icon: <AlertCircle className="h-5 w-5" />,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Total Contacts',
      value: statsData?.summary?.customers?.total || 0,
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Customers',
      value: statsData?.totalCustomers || 0,
      icon: <Users className="h-5 w-5" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email || 'Admin'}
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh">Auto-refresh</Label>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Alerts */}
      <div className="mb-8 space-y-4">
        {statsData?.pendingBookings && statsData.pendingBookings > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pending Bookings</AlertTitle>
            <AlertDescription>
              You have {statsData.pendingBookings} bookings awaiting confirmation.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full`}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Bookings Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Weekly Bookings</CardTitle>
          <CardDescription>Booking trends over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {weeklyLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData || chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Service Distribution */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Service Distribution</CardTitle>
          <CardDescription>Breakdown of services requested</CardDescription>
        </CardHeader>
        <CardContent>
          {serviceLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : serviceData && serviceData.length > 0 ? (
            <div className="space-y-4">
              {serviceData.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{((service.value / serviceData.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(1)}%</p>
                  </div>
                  <p className="font-bold">{service.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground">No service data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="bookings" className="mb-8">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="bookings">
            Bookings
          </TabsTrigger>
          <TabsTrigger value="contacts">
            Contacts
          </TabsTrigger>
          <TabsTrigger value="settings">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Bookings</CardTitle>
                <div className="flex gap-4">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={exportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedBookings.length === bookings.length && bookings.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingsLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center p-4">
                        <div className="flex justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center p-4">
                        <p className="text-gray-500">No bookings found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedBookings.includes(booking.id)}
                            onCheckedChange={() => handleSelectBooking(booking.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{booking.name}</TableCell>
                        <TableCell>{booking.email}</TableCell>
                        <TableCell>{booking.service}</TableCell>
                        <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              booking.status === 'confirmed' ? 'default' :
                              booking.status === 'pending' ? 'secondary' :
                              'outline'
                            }
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-green-500">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Booking?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the booking.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-red-600">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" size="default" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive size="default">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" size="default">2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" size="default">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" size="default" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Contact Submissions</CardTitle>
                  <CardDescription>Recent contact form submissions</CardDescription>
                </div>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => {}} 
                    variant="outline"
                    disabled={contactsLoading}
                  >
                    {contactsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>Refresh</>
                    )}
                  </Button>
                  <Button onClick={exportContacts} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {contactsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : contacts.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No contacts yet</AlertTitle>
                  <AlertDescription>
                    Contact form submissions will appear here.
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedContacts.length === contacts.length && contacts.length > 0}
                          onCheckedChange={handleSelectAllContacts}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedContacts.includes(contact.id)}
                            onCheckedChange={() => handleSelectContact(contact.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{contact.phone || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate" title={contact.message}>
                          {contact.message}
                        </TableCell>
                        <TableCell>
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" className="text-blue-500">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Settings</CardTitle>
              <CardDescription>Configure your admin dashboard preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email alerts for new bookings</p>
                </div>
                <Switch id="email-notifications" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Toggle dashboard theme</p>
                </div>
                <Switch id="dark-mode" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-backup">Auto Backup</Label>
                  <p className="text-sm text-muted-foreground">Automatically backup data weekly</p>
                </div>
                <Switch id="auto-backup" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest bookings and customer interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : activityData && activityData.length > 0 ? (
            <div className="space-y-3">
              {activityData.map((activity, index) => (
                <p key={index} className="text-sm text-muted-foreground">
                  {activity.message}
                </p>
              ))}
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}