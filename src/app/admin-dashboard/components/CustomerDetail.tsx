/**
 * Customer Detail Component
 *
 * Displays comprehensive customer information with booking history,
 * appointments, and notes. Allows adding tags and notes.
 * Uses tRPC hooks for data fetching and state management.
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Edit,
  Eye,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  PlusCircle,
  Trash2,
  User2,
  X,
} from 'lucide-react';
import { useCustomer, useTags, useCustomerTags } from '@/hooks/trpc/use-admin';
import { useCustomerSubscription } from '@/hooks/trpc/use-subscription';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CustomerDetailProps {
  id: string;
}

export function CustomerDetail({ id }: CustomerDetailProps) {
  const router = useRouter();
  // Not using the events yet, but keeping subscription active
  useCustomerSubscription(id);

  // Component state
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('gray');

  // Fetch data using tRPC hooks
  const {
    customer,
    isLoading,
    error,
    refetch,
    addNote,
    deleteNote,
    isAddingNote: isSubmittingNote,
    isDeletingNote,
  } = useCustomer(id);

  const { tags, createTag, isCreating: isCreatingTagAPI } = useTags();

  const { addTag, removeTag, isAddingTag, isRemovingTag } = useCustomerTags(id);

  // Submit note handler
  const handleSubmitNote = () => {
    if (noteContent.trim()) {
      addNote(noteContent);
      setNoteContent('');
      setIsAddingNote(false);
    }
  };

  // Submit new tag handler
  const handleCreateTag = () => {
    if (newTagName.trim()) {
      createTag(newTagName, newTagColor);
      setNewTagName('');
      setIsCreatingTag(false);
    }
  };

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Format address
  const formatAddress = (customer: unknown) => {
    if (!customer) return 'No address';

    const parts = [
      customer.address,
      customer.city,
      customer.state,
      customer.postalCode,
      customer.country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'No address';
  };

  // Handle error
  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-destructive mb-2">Error Loading Customer</h3>
          <p className="text-muted-foreground mb-4">
            {error.message || 'There was a problem loading the customer data.'}
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </Card>
    );
  }

  // Handle loading state
  if (isLoading || !customer) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <p className="text-muted-foreground">Loading customer information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="sm" className="mr-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {customer.firstName} {customer.lastName}
          </h1>
          <p className="text-muted-foreground">
            Customer since {format(new Date(customer.createdAt), 'MMMM yyyy')}
          </p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer info sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                {customer.avatarUrl ? (
                  <AvatarImage
                    src={customer.avatarUrl}
                    alt={`${customer.firstName} ${customer.lastName}`}
                  />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {getInitials(customer.firstName, customer.lastName)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            {/* Contact information */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Full Name</p>
                <p className="flex items-center text-base">
                  <User2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  {customer.firstName} {customer.lastName}
                </p>
              </div>

              {customer.email && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                  <p className="flex items-center text-base break-all">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                    <a href={`mailto:${customer.email}`} className="hover:underline">
                      {customer.email}
                    </a>
                  </p>
                </div>
              )}

              {customer.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Phone</p>
                  <p className="flex items-center text-base">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`tel:${customer.phone}`} className="hover:underline">
                      {customer.phone}
                    </a>
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Address</p>
                <p className="flex items-start text-base">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-1 shrink-0" />
                  <span>{formatAddress(customer)}</span>
                </p>
              </div>

              {customer.birthDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Birth Date</p>
                  <p className="flex items-center text-base">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {format(new Date(customer.birthDate), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>

            {/* Tags section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Tags</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <PlusCircle className="h-3 w-3 mr-1" />
                      Add Tag
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Add Tags</h4>
                        {isCreatingTag ? (
                          <div className="space-y-2">
                            <Input
                              placeholder="New tag name"
                              value={newTagName}
                              onChange={e => setNewTagName(e.target.value)}
                            />
                            <div className="flex gap-2 flex-wrap">
                              {['gray', 'red', 'green', 'blue', 'yellow', 'purple', 'pink'].map(
                                color => (
                                  <div
                                    key={color}
                                    className={`h-6 w-6 rounded-full cursor-pointer border border-muted ${
                                      newTagColor === color ? 'ring-2 ring-primary' : ''
                                    }`}
                                    style={{ backgroundColor: `var(--${color}-500)` }}
                                    onClick={() => setNewTagColor(color)}
                                  />
                                ),
                              )}
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCreatingTag(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleCreateTag}
                                disabled={!newTagName.trim() || isCreatingTagAPI}
                              >
                                Create
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Command>
                              <CommandInput placeholder="Search tags..." />
                              <CommandList>
                                <CommandEmpty>
                                  No tags found.
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => setIsCreatingTag(true)}
                                  >
                                    <PlusCircle className="h-3 w-3 mr-1" />
                                    Create New Tag
                                  </Button>
                                </CommandEmpty>
                                {tags && tags.length > 0 && (
                                  <CommandGroup>
                                    {tags.map(tag => {
                                      const isSelected = customer.tags?.some(t => t.id === tag.id);
                                      return (
                                        <CommandItem
                                          key={tag.id}
                                          disabled={isAddingTag || isRemovingTag}
                                          onSelect={() => {
                                            if (isSelected) {
                                              removeTag(tag.id);
                                            } else {
                                              addTag(tag.id);
                                            }
                                          }}
                                        >
                                          <div
                                            className={`h-3 w-3 rounded-full mr-2`}
                                            style={{ backgroundColor: `var(--${tag.color}-500)` }}
                                          />
                                          <span>{tag.name}</span>
                                          {isSelected && (
                                            <span className="ml-auto text-green-500">✓</span>
                                          )}
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                )}
                              </CommandList>
                            </Command>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 w-full justify-start"
                              onClick={() => setIsCreatingTag(true)}
                            >
                              <PlusCircle className="h-3 w-3 mr-1" />
                              Create New Tag
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-wrap gap-2">
                {customer.tags && customer.tags.length > 0 ? (
                  customer.tags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className={`bg-${tag.color}-500/10 border-${tag.color}-500/20 text-${tag.color}-500`}
                    >
                      {tag.name}
                      <button
                        className="ml-1 text-muted-foreground/80 hover:text-muted-foreground"
                        onClick={() => removeTag(tag.id)}
                        disabled={isRemovingTag}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No tags</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <Button
              variant="default"
              className="w-full"
              onClick={() => router.push(`/admin/customers/${id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Customer
            </Button>
          </CardContent>
        </Card>

        {/* Tabs for customer details */}
        <Card className="lg:col-span-2">
          <CardHeader className="px-6">
            <Tabs defaultValue="overview" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="notes">
                  Notes
                  {customer.notes?.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {customer.notes.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="px-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0">
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-muted-foreground">Bookings</p>
                      <p className="text-2xl font-bold">{customer.bookings?.length || 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-muted-foreground">Appointments</p>
                      <p className="text-2xl font-bold">{customer.appointments?.length || 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                      <p className="text-2xl font-bold">{customer.transactions?.length || 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-muted-foreground">Reviews</p>
                      <p className="text-2xl font-bold">{customer.testimonials?.length || 0}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent activity */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {/* Combine appointments, bookings, and notes into a timeline */}
                    {[
                      ...(customer.appointments?.map(a => ({
                        type: 'appointment',
                        date: new Date(a.createdAt),
                        data: a,
                      })) || []),
                      ...(customer.bookings?.map(b => ({
                        type: 'booking',
                        date: new Date(b.createdAt),
                        data: b,
                      })) || []),
                      ...(customer.notes?.map(n => ({
                        type: 'note',
                        date: new Date(n.createdAt),
                        data: n,
                      })) || []),
                      ...(customer.transactions?.map(t => ({
                        type: 'transaction',
                        date: new Date(t.createdAt),
                        data: t,
                      })) || []),
                    ]
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .slice(0, 5)
                      .map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 pb-4 border-b last:border-0"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarFallback
                              className={
                                item.type === 'booking'
                                  ? 'bg-green-500/10 text-green-500'
                                  : item.type === 'appointment'
                                    ? 'bg-blue-500/10 text-blue-500'
                                    : item.type === 'note'
                                      ? 'bg-orange-500/10 text-orange-500'
                                      : 'bg-purple-500/10 text-purple-500'
                              }
                            >
                              {item.type === 'booking'
                                ? 'B'
                                : item.type === 'appointment'
                                  ? 'A'
                                  : item.type === 'note'
                                    ? 'N'
                                    : 'T'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <p className="font-medium">
                              {item.type === 'booking'
                                ? `Booking: ${item.data.tattooType}`
                                : item.type === 'appointment'
                                  ? `Appointment: ${item.data.title}`
                                  : item.type === 'note'
                                    ? 'Note added'
                                    : `Payment: $${item.data.amount}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.type === 'note'
                                ? item.data.content.substring(0, 60) +
                                  (item.data.content.length > 60 ? '...' : '')
                                : item.type === 'booking'
                                  ? `${item.data.size} tattoo on ${item.data.placement}`
                                  : item.type === 'appointment'
                                    ? item.data.description || 'No description'
                                    : `Payment via ${item.data.paymentMethod}`}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground shrink-0">
                            {formatDistanceToNow(item.date, { addSuffix: true })}
                          </div>
                        </div>
                      ))}

                    {/* No activity state */}
                    {!customer.appointments?.length &&
                      !customer.bookings?.length &&
                      !customer.notes?.length && (
                        <div className="text-center py-6 text-muted-foreground">
                          No recent activity
                        </div>
                      )}
                  </div>
                </div>

                {/* Personal notes section */}
                {customer.personalNotes && (
                  <div className="bg-muted/40 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Personal Notes</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {customer.personalNotes}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="mt-0">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Booking History</h3>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/admin/bookings/new?customerId=${id}`)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Booking
                  </Button>
                </div>

                {customer.bookings && customer.bookings.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customer.bookings.map(booking => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              {format(new Date(booking.createdAt), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>{booking.tattooType}</TableCell>
                            <TableCell>
                              <Badge variant={booking.depositPaid ? 'success' : 'secondary'}>
                                {booking.depositPaid ? 'Paid' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(`/admin/bookings/${booking.id}/edit`)
                                    }
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Booking
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(`/admin/appointments/new?bookingId=${booking.id}`)
                                    }
                                  >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Create Appointment
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6 border rounded-md">
                    <p className="text-muted-foreground mb-2">No bookings found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/bookings/new?customerId=${id}`)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      New Booking
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="mt-0">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Appointment History</h3>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/admin/appointments/new?customerId=${id}`)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Appointment
                  </Button>
                </div>

                {customer.appointments && customer.appointments.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customer.appointments.map(appointment => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>
                                  {format(new Date(appointment.startDate), 'MMM d, yyyy')}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(appointment.startDate), 'h:mm a')} -
                                  {format(new Date(appointment.endDate), ' h:mm a')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{appointment.title}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{appointment.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/admin/appointments/${appointment.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6 border rounded-md">
                    <p className="text-muted-foreground mb-2">No appointments found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/appointments/new?customerId=${id}`)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-0">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Customer Notes</h3>
                  <Button size="sm" onClick={() => setIsAddingNote(true)} disabled={isAddingNote}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>

                {/* Add note form */}
                {isAddingNote && (
                  <Card className="border-primary/50">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Enter your note here..."
                          className="min-h-32 resize-y"
                          value={noteContent}
                          onChange={e => setNoteContent(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsAddingNote(false);
                              setNoteContent('');
                            }}
                            disabled={isSubmittingNote}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSubmitNote}
                            disabled={!noteContent.trim() || isSubmittingNote}
                          >
                            {isSubmittingNote ? 'Saving...' : 'Save Note'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notes list */}
                {customer.notes && customer.notes.length > 0 ? (
                  <div className="space-y-4">
                    {customer.notes.map(note => (
                      <Card key={note.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <p className="whitespace-pre-wrap">{note.content}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(note.createdAt), 'MMMM d, yyyy h:mm a')}
                              </p>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Note</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this note? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteNote(note.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={isDeletingNote}
                                  >
                                    {isDeletingNote ? 'Deleting...' : 'Delete Note'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border rounded-md">
                    <p className="text-muted-foreground mb-2">No notes found</p>
                    <Button variant="outline" size="sm" onClick={() => setIsAddingNote(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add First Note
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
