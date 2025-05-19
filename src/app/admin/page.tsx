'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
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
  Cell
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

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
}

interface Booking {
  id: number;
  name: string;
  email: string;
  service: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed';
}

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  totalContacts: number;
  newsletterSubscribers: number;
}

interface ChartDataItem {
  name: string;
  bookings: number;
}

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

// Mock data (should be defined somewhere in the file)
const recentBookings: Booking[] = [
  // Mock data would be here
];

const mockStats: Stats = {
  totalBookings: 0,
  pendingBookings: 0,
  totalContacts: 0,
  newsletterSubscribers: 0,
};

const chartData: ChartDataItem[] = [
  // Chart data would be here
];

const pieData: PieDataItem[] = [
  // Pie chart data would be here
];

export default function AdminDashboard() {
  const router = useRouter();
  const [selectedBookings, setSelectedBookings] = useState<number[]>([]);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState<boolean>(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const handleLogout = (): void => {
    // Clear JWT token
    document.cookie = 'admin-token=; Max-Age=0; path=/';
    router.push('/admin/login');
  };

  const exportData = (): void => {
    const csvContent = `data:text/csv;charset=utf-8,` +
      `Name,Email,Service,Date,Status\n${ 
      recentBookings.map(booking => 
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
    if (selectedBookings.length === recentBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(recentBookings.map(b => b.id));
    }
  };

  const filteredBookings: Booking[] = recentBookings.filter(booking => 
    filterStatus === 'all' || booking.status === filterStatus
  );

  // Fetch contacts on mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async (): Promise<void> => {
    setContactsLoading(true);
    try {
      const response = await fetch('/api/admin/contacts');
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setContactsLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Welcome back, Admin</p>
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
            <Button onClick={handleLogout} variant="outline" className="border-gray-700">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Alerts */}
        <div className="mb-8 space-y-4">
          <Alert className="bg-yellow-900/20 border-yellow-700">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pending Bookings</AlertTitle>
            <AlertDescription>
              You have {mockStats.pendingBookings} bookings awaiting confirmation.
            </AlertDescription>
          </Alert>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalBookings}</div>
              <Badge variant="secondary" className="mt-2">
                +12% from last month
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.pendingBookings}</div>
              <p className="text-xs text-gray-400 mt-2">Requires action</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalContacts}</div>
              <p className="text-xs text-gray-400 mt-2">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Newsletter</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.newsletterSubscribers}</div>
              <p className="text-xs text-gray-400 mt-2">Subscribers</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="mb-8">
          <TabsList className="grid grid-cols-4 w-full bg-gray-900">
            <TabsTrigger value="bookings" className="data-[state=active]:bg-gray-800">
              Bookings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-800">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="contacts" className="data-[state=active]:bg-gray-800">
              Contacts
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-800">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="mt-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Bookings</CardTitle>
                  <div className="flex gap-4">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={exportData} variant="outline" className="border-gray-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedBookings.length === filteredBookings.length}
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
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id} className="border-gray-800">
                        <TableCell>
                          <Checkbox
                            checked={selectedBookings.includes(booking.id)}
                            onCheckedChange={() => handleSelectBooking(booking.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{booking.name}</TableCell>
                        <TableCell>{booking.email}</TableCell>
                        <TableCell>{booking.service}</TableCell>
                        <TableCell>{booking.date}</TableCell>
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
                              <AlertDialogContent className="bg-gray-900 border-gray-800">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Booking?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the booking.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-gray-800 border-gray-700">Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-red-900 hover:bg-red-800">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" className="text-gray-400" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" className="bg-gray-800">1</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">2</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">3</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Weekly Bookings</CardTitle>
                  <CardDescription>Bookings trend over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#9ca3af' }}
                      />
                      <Bar dataKey="bookings" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Service Distribution</CardTitle>
                  <CardDescription>Breakdown of services requested</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#9ca3af' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {pieData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-sm text-gray-300">{entry.name} - {entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="mt-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Contact Submissions</CardTitle>
                    <CardDescription>Recent contact form submissions</CardDescription>
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      onClick={fetchContacts} 
                      variant="outline" 
                      className="border-gray-700"
                      disabled={contactsLoading}
                    >
                      {contactsLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>Refresh</>
                      )}
                    </Button>
                    <Button onClick={exportContacts} variant="outline" className="border-gray-700">
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
                  <Alert className="bg-gray-800 border-gray-700">
                    <Info className="h-4 w-4" />
                    <AlertTitle>No contacts yet</AlertTitle>
                    <AlertDescription>
                      Contact form submissions will appear here.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedContacts.length === contacts.length}
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
                        <TableRow key={contact.id} className="border-gray-800">
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
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Dashboard Settings</CardTitle>
                <CardDescription>Configure your admin dashboard preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-400">Receive email alerts for new bookings</p>
                  </div>
                  <Switch id="email-notifications" />
                </div>
                <Separator className="bg-gray-800" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-gray-400">Toggle dashboard theme</p>
                  </div>
                  <Switch id="dark-mode" defaultChecked />
                </div>
                <Separator className="bg-gray-800" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-backup">Auto Backup</Label>
                    <p className="text-sm text-gray-400">Automatically backup data weekly</p>
                  </div>
                  <Switch id="auto-backup" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}