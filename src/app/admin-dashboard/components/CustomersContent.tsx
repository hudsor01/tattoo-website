/**
 * Customers Content Component
 * 
 * Main component for customer management with filtering, pagination, and actions.
 * Uses tRPC hooks for data fetching and state management.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { format } from 'date-fns';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit, 
  Eye, 
  FileText,
  MoreHorizontal,
  Phone,
  PlusCircle,
  Search,
  Trash2,
} from 'lucide-react';
import { useCustomers, useTags } from '@/hooks/trpc/use-admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CustomersContentProps {
  initialPage: number;
  initialLimit: number;
  initialSearch: string;
}

export function CustomersContent({ 
  initialPage, 
  initialLimit, 
  initialSearch 
}: CustomersContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Local state
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 500);
  
  // Fetch data using tRPC hooks
  const { 
    customers,
    pagination,
    isLoading,
    isRefetching,
    error,
    refetch
  } = useCustomers(page, limit, debouncedSearch);
  
  const { tags } = useTags();
  
  // Update URL when parameters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    
    if (limit !== 20) {
      params.set('limit', limit.toString());
    } else {
      params.delete('limit');
    }
    
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    
    router.replace(`${pathname}?${params.toString()}`);
  }, [page, limit, debouncedSearch, pathname, router, searchParams]);
  
  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);
  
  // Handle pagination
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  const handleNextPage = () => {
    if (pagination && page < pagination.totalPages) {
      setPage(page + 1);
    }
  };
  
  // Navigate to customer detail
  const handleViewCustomer = (id: string) => {
    router.push(`/admin/customers/${id}`);
  };
  
  // Navigate to edit customer
  const handleEditCustomer = (id: string) => {
    router.push(`/admin/customers/${id}/edit`);
  };
  
  // Get color for a specific tag
  const getTagColor = (tagName: string) => {
    const tag = tags?.find(t => t.name === tagName);
    return tag?.color || 'gray';
  };
  
  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  return (
    <div className="space-y-6">
      {/* Search and controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-10 max-w-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select
            value={limit.toString()}
            onValueChange={(value) => {
              setLimit(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => router.push('/admin/customers/new')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Customer
          </Button>
        </div>
      </div>
      
      {/* Customers table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>
            {pagination ? `Showing ${customers.length} of ${pagination.totalCount} customers` : 'Loading customers...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-6">
              <p className="text-destructive mb-2">{error.message || 'Error loading customers'}</p>
              <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && !customers.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Loading customers...
                      </TableCell>
                    </TableRow>
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No customers found
                        {search && (
                          <>
                            {' '}matching <span className="font-medium">"{search}"</span>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewCustomer(customer.id)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              {customer.avatarUrl ? (
                                <AvatarImage src={customer.avatarUrl} alt={`${customer.firstName} ${customer.lastName}`} />
                              ) : (
                                <AvatarFallback>
                                  {getInitials(customer.firstName, customer.lastName)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {customer.firstName} {customer.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {customer.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.phone ? (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span>{customer.phone}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No phone</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-sm">
                              {format(new Date(customer.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {customer.tags && customer.tags.length > 0 ? (
                              customer.tags.slice(0, 2).map((tag) => (
                                <Badge 
                                  key={tag.id} 
                                  variant="outline" 
                                  className={`bg-${tag.color}-500/10 text-${tag.color}-500 border-${tag.color}-500/20`}
                                >
                                  {tag.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">No tags</span>
                            )}
                            {customer.tags && customer.tags.length > 2 && (
                              <Badge variant="outline" className="bg-muted">
                                +{customer.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2 text-sm">
                            <div className="flex items-center" title="Bookings">
                              <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span>{customer.bookings?.length || 0}</span>
                            </div>
                            <div className="flex items-center" title="Appointments">
                              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span>{customer.appointments?.length || 0}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleViewCustomer(customer.id);
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleEditCustomer(customer.id);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Customer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/admin/bookings/new?customerId=${customer.id}`);
                              }}>
                                <FileText className="h-4 w-4 mr-2" />
                                New Booking
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/admin/appointments/new?customerId=${customer.id}`);
                              }}>
                                <Calendar className="h-4 w-4 mr-2" />
                                New Appointment
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => {
                                      e.preventDefault();
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Customer
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {customer.firstName} {customer.lastName}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => {
                                        // Actual deletion will be implemented later
                                        console.log('Delete customer', customer.id);
                                      }}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 0 && (
          <CardFooter className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousPage}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {/* Page number buttons */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                // Calculate the page number to display
                let pageNum = i + 1;
                
                // If more than 5 pages and current page > 3, adjust display
                if (pagination.totalPages > 5 && pagination.page > 3) {
                  // Center current page with 2 before and 2 after when possible
                  const startPage = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4));
                  pageNum = startPage + i;
                }
                
                // Only show if the calculated page is valid
                if (pageNum <= pagination.totalPages) {
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? "default" : "outline"}
                      size="icon"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                }
                return null;
              })}
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={pagination.page >= pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
