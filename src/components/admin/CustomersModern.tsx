'use client';

import React, { useState, useOptimistic, useTransition, useMemo, useCallback } from 'react';
import { Plus, Search, Eye, User, Mail, Phone, MapPin, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { api } from '@/lib/trpc/client';
interface CustomersModernProps {
  className?: string;
}

// Type for Customer data from Prisma (matches actual database schema)
type CustomerData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  zipCode?: string | null; // For form compatibility
  country: string | null;
  birthDate: Date | null;
  notes: string | null;
  allergies: string | null;
  source: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

// React 19 useOptimistic action types for customer operations
type OptimisticCustomerAction =
  | { type: 'add'; customer: CustomerData }
  | { type: 'update'; id: string; updates: Record<string, unknown> };

function optimisticCustomerReducer(
  customers: CustomerData[],
  action: OptimisticCustomerAction
): CustomerData[] {
  switch (action.type) {
    case 'add':
      return [action.customer, ...customers];
    case 'update':
      return customers.map((customer) =>
        customer.id === action.id
          ? ({ ...customer, ...action.updates, updatedAt: new Date() } as CustomerData)
          : customer
      );
    default:
      return customers;
  }
}

export default function CustomersModern({ className }: CustomersModernProps) {
  // React 19 useTransition for non-blocking state updates
  const [isPending, startTransition] = useTransition();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerData | null>(null);

  // Form state for new customer
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  });

  // Use tRPC infinite query for customers
  const {
    data,
    isLoading,
    isFetching,
    hasNextPage: hasMore,
    fetchNextPage,
    isSuccess,
    refetch,
  } = api.admin.getCustomersInfinite.useInfiniteQuery(
    {
      limit: 20,
      search: searchQuery.trim() || undefined,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const fetchedCustomers = data?.pages.flatMap((page) => page.customers) ?? [];
  const count = data?.pages[0]?.totalCount ?? 0;

  // React 19 useOptimistic for instant UI updates
  const [optimisticCustomers, addOptimisticUpdate] = useOptimistic(
    fetchedCustomers,
    optimisticCustomerReducer
  );

  // Create customer mutation with optimistic updates
  const createCustomerMutation = api.admin.createCustomer.useMutation({
    onMutate: async (newCustomerData) => {
      const tempCustomer: CustomerData = {
        id: `temp-${Date.now()}`,
        firstName: newCustomerData.firstName,
        lastName: newCustomerData.lastName,
        email: newCustomerData.email ?? null,
        phone: newCustomerData.phone ?? null,
        avatarUrl: null,
        address: newCustomerData.address ?? null,
        city: newCustomerData.city ?? null,
        state: newCustomerData.state ?? null,
        postalCode: newCustomerData.zipCode ?? null,
        zipCode: newCustomerData.zipCode ?? null,
        country: null,
        birthDate: null,
        notes: newCustomerData.notes ?? null,
        allergies: null,
        source: null,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addOptimisticUpdate({ type: 'add', customer: tempCustomer });
      return { tempCustomer };
    },
    onError: (error) => {
      // Revert optimistic update on error by refetching
      void refetch();
      toast.error('Failed to create customer: ' + error.message);
    },
    onSuccess: () => {
      toast.success('Customer created successfully!');
      setCreateDialogOpen(false);
      resetForm();
      void refetch();
    },
  });

  // Update customer mutation with optimistic updates
  const updateCustomerMutation = api.admin.updateCustomer.useMutation({
    onMutate: async (data) => {
      const { id, ...updates } = data;
      addOptimisticUpdate({ type: 'update', id, updates });
      return { id, updates };
    },
    onError: (error) => {
      // Revert optimistic update - refetch to get correct state
      void refetch();
      toast.error('Failed to update customer: ' + error.message);
    },
    onSuccess: () => {
      toast.success('Customer updated successfully');
      setEditDialogOpen(false);
      setEditingCustomer(null);
    },
  });

  // Optimized event handlers with React 19 patterns
  const resetForm = useCallback(() => {
    setNewCustomer({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      notes: '',
    });
  }, []);

  // React 19 optimized create customer handler with startTransition
  const handleCreateCustomer = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      // Validate required fields
      if (!newCustomer.firstName.trim()) {
        toast.error('First name is required');
        return;
      }

      if (!newCustomer.lastName.trim()) {
        toast.error('Last name is required');
        return;
      }

      if (!newCustomer.email.trim()) {
        toast.error('Email is required');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newCustomer.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      startTransition(() => {
        createCustomerMutation.mutate({
          firstName: newCustomer.firstName.trim(),
          lastName: newCustomer.lastName.trim(),
          email: newCustomer.email.trim().toLowerCase(),
          phone: newCustomer.phone?.trim() || undefined,
          address: newCustomer.address?.trim() || undefined,
          city: newCustomer.city?.trim() || undefined,
          state: newCustomer.state?.trim() || undefined,
          zipCode: newCustomer.zipCode?.trim() || undefined,
          notes: newCustomer.notes?.trim() || undefined,
        });
      });
    },
    [newCustomer, createCustomerMutation]
  );

  // React 19 optimized update customer handler
  const handleUpdateCustomer = useCallback(
    (
      id: string,
      updates: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        personalNotes?: string;
      }
    ) => {
      updateCustomerMutation.mutate({ id, ...updates });
    },
    [updateCustomerMutation]
  );

  // View customer details
  const handleViewCustomer = useCallback((customer: CustomerData) => {
    setSelectedCustomer(customer);
    setViewDialogOpen(true);
  }, []);

  // React 19 optimized search handler using startTransition
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Dialog handlers
  const openEditDialog = useCallback((customer: CustomerData) => {
    setEditingCustomer(customer);
    setNewCustomer({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      address: customer.address ?? '',
      city: customer.city ?? '',
      state: customer.state ?? '',
      zipCode: customer.postalCode ?? '',
      notes: customer.notes ?? '',
    });
    setEditDialogOpen(true);
  }, []);

  // Get customer display name
  const getCustomerName = useCallback((customer: CustomerData) => {
    const firstName = customer.firstName ?? '';
    const lastName = customer.lastName ?? '';
    return `${firstName} ${lastName}`.trim() ?? 'Unknown Customer';
  }, []);

  // React 19 useMemo for performance optimization
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return optimisticCustomers;

    const query = searchQuery.toLowerCase();
    return optimisticCustomers.filter((customer) => {
      const name = getCustomerName(customer).toLowerCase();
      const email = customer.email?.toLowerCase() ?? '';
      const phone = customer.phone?.toLowerCase() ?? '';
      return name.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [optimisticCustomers, searchQuery, getCustomerName]);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(5)].map(() => (
          <Card key={crypto.randomUUID()} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Search */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Customers</h2>
          <p className="text-sm text-muted-foreground">
            Manage your customer database ({count} total)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="shrink-0 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Customer Cards */}
      {isSuccess && filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500 text-center max-w-sm">
              {searchQuery
                ? `No customers match "${searchQuery}"`
                : 'Get started by adding your first customer.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setCreateDialogOpen(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Customer
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {filteredCustomers.map((customer) => (
        <Card
          key={customer.id}
          className={`hover:shadow-md transition-all ${
            customer.id.startsWith('temp-') ? 'opacity-70 animate-pulse' : ''
          }`}
        >
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-sm md:text-lg shrink-0">
                  {getCustomerName(customer).charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base md:text-lg truncate">
                      {getCustomerName(customer)}
                    </h3>
                    {customer.id.startsWith('temp-') && (
                      <Badge variant="secondary" className="text-xs">
                        Saving...
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    {customer.email && (
                      <div className="flex items-center text-xs md:text-sm text-gray-500">
                        <Mail className="h-3 w-3 md:h-4 md:w-4 mr-1 shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
                      {customer.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 md:h-4 md:w-4 mr-1 shrink-0" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {(customer.city ?? customer.state) && (
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1 shrink-0" />
                          <span className="truncate">
                            {[customer.city, customer.state].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Added {format(new Date(customer.createdAt), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end sm:justify-start">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewCustomer(customer)}
                  disabled={isPending}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(customer)}
                  disabled={isPending || customer.id.startsWith('temp-')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center py-8">
          {isFetching ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-500">Loading more customers...</span>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                void fetchNextPage();
              }}
              className="px-8"
            >
              Load More Customers
            </Button>
          )}
        </div>
      )}

      {/* End Message */}
      {!hasMore && filteredCustomers.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">You've seen all {count} customers</p>
        </div>
      )}

      {/* Summary */}
      <div className="text-center text-sm text-gray-500">
        Showing {filteredCustomers.length} of {count} customers
      </div>

      {/* Create Customer Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Create a new customer with instant visual feedback using React 19 optimistic updates
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              void handleCreateCustomer(e);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newCustomer.firstName}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newCustomer.lastName}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  placeholder="Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={newCustomer.city}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="New York"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={newCustomer.state}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder="NY"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes about this customer..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  resetForm();
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newCustomer.firstName.trim() || !newCustomer.email.trim() || isPending}
              >
                {isPending ? 'Creating...' : 'Create Customer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      {selectedCustomer && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-gray-600">{getCustomerName(selectedCustomer)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">
                    {selectedCustomer.email ?? 'Not provided'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-gray-600">
                    {selectedCustomer.phone ?? 'Not provided'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm text-gray-600">
                    {[
                      selectedCustomer.address,
                      selectedCustomer.city,
                      selectedCustomer.state,
                      selectedCustomer.postalCode,
                    ]
                      .filter(Boolean)
                      .join(', ') ?? 'Not provided'}
                  </p>
                </div>
              </div>
              {selectedCustomer.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {selectedCustomer.notes}
                  </p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-sm text-gray-600">
                  {format(new Date(selectedCustomer.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Customer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information with React 19 optimistic updates for instant feedback
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingCustomer) {
                const phone = newCustomer.phone?.trim();
                const address = newCustomer.address?.trim();
                const city = newCustomer.city?.trim();
                const state = newCustomer.state?.trim();
                const postalCode = newCustomer.zipCode?.trim();
                const personalNotes = newCustomer.notes?.trim();

                handleUpdateCustomer(editingCustomer.id, {
                  firstName: newCustomer.firstName.trim(),
                  lastName: newCustomer.lastName.trim(),
                  email: newCustomer.email.trim().toLowerCase(),
                  ...(phone && { phone }),
                  ...(address && { address }),
                  ...(city && { city }),
                  ...(state && { state }),
                  ...(postalCode && { postalCode }),
                  ...(personalNotes && { personalNotes }),
                });
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-firstName">First Name *</Label>
                <Input
                  id="edit-firstName"
                  value={newCustomer.firstName}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-lastName">Last Name *</Label>
                <Input
                  id="edit-lastName"
                  value={newCustomer.lastName}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  placeholder="Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={newCustomer.city}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="New York"
                />
              </div>
              <div>
                <Label htmlFor="edit-state">State</Label>
                <Input
                  id="edit-state"
                  value={newCustomer.state}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder="NY"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes about this customer..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setEditingCustomer(null);
                  resetForm();
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newCustomer.firstName.trim() || !newCustomer.email.trim() || isPending}
              >
                {isPending ? 'Updating...' : 'Update Customer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
