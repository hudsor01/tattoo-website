'use client';

import React, { useState } from 'react';
import { Plus, Search, Eye, User, Mail, Phone, MapPin, Loader2, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { FadeIn } from '@/components/ui/animated-page';

// Simplified customer type
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Form input type
interface CustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  notes: string;
}

// Add this interface above the CustomersOptimistic component
interface ClientApiResponse {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  notes?: string;
  status?: string;
  tattooStyle?: string;
  lastContact?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function CustomersOptimistic() {
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for new customer
  const [newCustomer, setNewCustomer] = useState<CustomerInput>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    notes: '',
  });

  // Form state for editing customer
  const [editCustomer, setEditCustomer] = useState<CustomerInput>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    notes: '',
  });

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/customers');

      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.status}`);
      }

      const data = await response.json();

      // Transform API response to match component expectations
      const transformedCustomers = (data.clients ?? []).map((client: ClientApiResponse) => {
        // Handle both new format (with firstName/lastName) and legacy format (with name)
        let firstName = client.firstName ?? '';
        let lastName = client.lastName ?? '';

        if (client.name && (!firstName || !lastName)) {
          const nameParts = client.name.split(' ');
          firstName = nameParts[0] ?? '';
          lastName = nameParts.slice(1).join(' ') || '';
        }

        return {
          ...client,
          firstName,
          lastName,
          phone: client.phone ?? '',
          address: client.address ?? '',
          city: client.city ?? '',
          state: client.state ?? '',
          postalCode: client.postalCode ?? '',
          notes: client.notes ?? '',
        } as Customer;
      });

      setCustomers(transformedCustomers);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load customers');
      void toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  // Load customers on mount
  React.useEffect(() => {
    void fetchCustomers();
  }, []);

  // Create customer function using API route
  const createCustomer = async (input: CustomerInput) => {
    try {
      setIsCreating(true);

      // Prepare customer data with all fields
      const customerData = {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone?.trim() ?? null,
        address: input.address?.trim() ?? null,
        city: input.city?.trim() ?? null,
        state: input.state?.trim() ?? null,
        postalCode: input.postalCode?.trim() ?? null,
        notes: input.notes?.trim() ?? null,
      };

      void console.warn('Sending customer data:', customerData);

      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to create customer' }));
        throw new Error(errorData.error ?? `HTTP ${response.status}: Failed to create customer`);
      }

      const data = await response.json();
      void console.warn('Customer created response:', data);

      // Create customer object with all fields from response
      const newCustomer: Customer = {
        id: data.id,
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        postalCode: data.postalCode ?? '',
        notes: data.notes ?? '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      setCustomers((prev) => [newCustomer, ...prev]);
      void toast.success('Customer created successfully!');

      return newCustomer;
    } catch (error) {
      void console.error('Error creating customer:', error);
      void toast.error(error instanceof Error ? error.message : 'Failed to create customer');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  // Update customer function
  const updateCustomer = async (customerId: string, input: CustomerInput) => {
    try {
      setIsUpdating(true);

      const customerData = {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone?.trim() || null,
        address: input.address?.trim() || null,
        city: input.city?.trim() || null,
        state: input.state?.trim() || null,
        postalCode: input.postalCode?.trim() || null,
        notes: input.notes?.trim() || null,
      };

      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to update customer' }));
        throw new Error(errorData.error ?? `HTTP ${response.status}: Failed to update customer`);
      }

      const data = await response.json();

      // Update customer in local state
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === customerId
            ? {
                ...customer,
                firstName: data.firstName ?? '',
                lastName: data.lastName ?? '',
                email: data.email ?? '',
                phone: data.phone ?? '',
                address: data.address ?? '',
                city: data.city ?? '',
                state: data.state ?? '',
                postalCode: data.postalCode ?? '',
                notes: data.notes ?? '',
                updatedAt: data.updatedAt,
              }
            : customer
        )
      );

      // Update selected customer if it's the one being edited
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer({
          ...selectedCustomer,
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          city: data.city ?? '',
          state: data.state ?? '',
          postalCode: data.postalCode ?? '',
          notes: data.notes ?? '',
          updatedAt: data.updatedAt,
        });
      }

      void toast.success('Customer updated successfully!');
      return data;
    } catch (error) {
      void console.error('Error updating customer:', error);
      void toast.error(error instanceof Error ? error.message : 'Failed to update customer');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete customer function
  const deleteCustomer = async (customerId: string) => {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to delete customer' }));
        throw new Error(errorData.error ?? `HTTP ${response.status}: Failed to delete customer`);
      }

      // Remove customer from local state
      setCustomers((prev) => prev.filter((customer) => customer.id !== customerId));

      void toast.success('Customer deleted successfully!');
    } catch (error) {
      void console.error('Error deleting customer:', error);
      void toast.error(error instanceof Error ? error.message : 'Failed to delete customer');
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset new customer form
  const resetForm = () => {
    setNewCustomer({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      notes: '',
    });
  };

  // Handle customer creation
  const handleCreateCustomer = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Validate required fields
    if (!newCustomer.firstName.trim()) {
      void toast.error('First name is required');
      return;
    }

    if (!newCustomer.lastName.trim()) {
      void toast.error('Last name is required');
      return;
    }

    if (!newCustomer.email.trim()) {
      void toast.error('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCustomer.email)) {
      void toast.error('Please enter a valid email address');
      return;
    }

    try {
      await createCustomer(newCustomer);

      // Reset form and close dialog
      resetForm();
      setCreateDialogOpen(false);
    } catch (error) {
      void console.error('Failed to create customer:', error);
      // Error is already handled by createCustomer function
    }
  };

  // View customer details
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewDialogOpen(true);
  };

  // Edit customer
  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditCustomer({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone ?? '',
      address: customer.address ?? '',
      city: customer.city ?? '',
      state: customer.state ?? '',
      postalCode: customer.postalCode ?? '',
      notes: customer.notes ?? '',
    });
    setViewDialogOpen(false);
    setEditDialogOpen(true);
  };

  // Handle customer update
  const handleUpdateCustomer = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!selectedCustomer) return;

    // Validate required fields
    if (!editCustomer.firstName.trim()) {
      void toast.error('First name is required');
      return;
    }

    if (!editCustomer.lastName.trim()) {
      void toast.error('Last name is required');
      return;
    }

    if (!editCustomer.email.trim()) {
      void toast.error('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editCustomer.email)) {
      void toast.error('Please enter a valid email address');
      return;
    }

    try {
      await updateCustomer(selectedCustomer.id, editCustomer);
      setEditDialogOpen(false);
    } catch (error) {
      void console.error('Failed to update customer:', error);
    }
  };

  // Delete customer
  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  // Confirm delete customer
  const confirmDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      await deleteCustomer(selectedCustomer.id);
      setDeleteDialogOpen(false);
      setViewDialogOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      void console.error('Failed to delete customer:', error);
    }
  };

  // Get customer display name
  const getCustomerName = (customer: Customer) => {
    return `${customer.firstName} ${customer.lastName}`.trim() ?? 'Unknown Customer';
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.firstName.toLowerCase().includes(query) ||
      customer.lastName.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query)
    );
  });

  // Show error state
  if (error && customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-red-500 text-lg font-medium">Error Loading Customers</div>
        <div className="text-sm text-muted-foreground">{error}</div>
        <Button
          onClick={() => {
            void fetchCustomers();
          }}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading && customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <div className="text-lg font-medium">Loading customers...</div>
        <div className="text-sm text-muted-foreground">
          Please wait while we fetch your customer list
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <FadeIn>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Customers</h2>
            <p className="text-sm text-muted-foreground">
              Manage your customer database ({filteredCustomers.length} total)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="shrink-0 w-full sm:w-auto"
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Customer
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Customer Cards */}
      {!isLoading && filteredCustomers.length === 0 && !searchQuery && (
        <FadeIn delay={0.1}>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-500 text-center max-w-sm mb-4">
                Get started by adding your first customer.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Customer
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {searchQuery && filteredCustomers.length === 0 && (
        <FadeIn delay={0.1}>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 text-center max-w-sm">
                No customers match &quot;{searchQuery}&quot;
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Customer List */}
      <AnimatePresence>
        <div className="space-y-4">
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className="transition-all hover:shadow-lg hover:bg-gray-50/50 dark:hover:bg-gray-800/50 cursor-pointer border-2 hover:border-blue-200 dark:hover:border-blue-800"
                onClick={() => handleViewCustomer(customer)}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-sm md:text-lg shrink-0">
                        {customer.firstName.charAt(0)}
                        {customer.lastName.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate">
                            {getCustomerName(customer)}
                          </h3>
                        </div>

                        <div className="space-y-1 mt-1">
                          {customer.email && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3 shrink-0" />
                              {customer.email}
                            </p>
                          )}
                          {customer.phone && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3 shrink-0" />
                              {customer.phone}
                            </p>
                          )}
                          {(customer.city ?? customer.state) && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 shrink-0" />
                              {[customer.city, customer.state].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {format(new Date(customer.createdAt), 'MMM d, yyyy')}
                      </p>
                      <div className="text-blue-500 opacity-70 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Load More functionality removed for now - simplified implementation */}

      {/* Create Customer Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              void handleCreateCustomer(e);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
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
            </div>

            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main St"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={newCustomer.city}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="Dallas"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={newCustomer.state}
                  onChange={(e) => setNewCustomer((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder="TX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">ZIP</Label>
                <Input
                  id="postalCode"
                  value={newCustomer.postalCode}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({ ...prev, postalCode: e.target.value }))
                  }
                  placeholder="75201"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the customer..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isCreating} className="flex-1">
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Customer'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xl">
                  {selectedCustomer.firstName?.charAt(0)}
                  {selectedCustomer.lastName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Customer since {format(new Date(selectedCustomer.createdAt ?? ''), 'MMMM yyyy')}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {selectedCustomer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                )}

                {selectedCustomer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                )}

                {(selectedCustomer.address ?? selectedCustomer.city) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      {selectedCustomer.address && <div>{selectedCustomer.address}</div>}
                      <div>
                        {[
                          selectedCustomer.city,
                          selectedCustomer.state,
                          selectedCustomer.postalCode,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    </div>
                  </div>
                )}

                {selectedCustomer.notes && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-muted-foreground">{selectedCustomer.notes}</p>
                  </div>
                )}
              </div>

              {/* Customer Actions */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditCustomer(selectedCustomer)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Customer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCustomer(selectedCustomer)}
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-2">
                  {selectedCustomer.email && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`mailto:${selectedCustomer.email}`, '_blank')}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      // TODO: Implement booking flow
                      void toast.success('Booking feature coming soon!');
                    }}
                  >
                    Schedule Appointment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <form onSubmit={(e) => { void handleUpdateCustomer(e); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name *</Label>
                  <Input
                    id="editFirstName"
                    value={editCustomer.firstName}
                    onChange={(e) =>
                      setEditCustomer((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name *</Label>
                  <Input
                    id="editLastName"
                    value={editCustomer.lastName}
                    onChange={(e) =>
                      setEditCustomer((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editEmail">Email *</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editCustomer.email}
                  onChange={(e) => setEditCustomer((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  type="tel"
                  value={editCustomer.phone}
                  onChange={(e) => setEditCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editAddress">Address</Label>
                <Input
                  id="editAddress"
                  value={editCustomer.address}
                  onChange={(e) => setEditCustomer((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editCity">City</Label>
                  <Input
                    id="editCity"
                    value={editCustomer.city}
                    onChange={(e) => setEditCustomer((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="Dallas"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editState">State</Label>
                  <Input
                    id="editState"
                    value={editCustomer.state}
                    onChange={(e) => setEditCustomer((prev) => ({ ...prev, state: e.target.value }))}
                    placeholder="TX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPostalCode">ZIP</Label>
                  <Input
                    id="editPostalCode"
                    value={editCustomer.postalCode}
                    onChange={(e) =>
                      setEditCustomer((prev) => ({ ...prev, postalCode: e.target.value }))
                    }
                    placeholder="75201"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editNotes">Notes</Label>
                <Textarea
                  id="editNotes"
                  value={editCustomer.notes}
                  onChange={(e) => setEditCustomer((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the customer..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isUpdating} className="flex-1">
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Customer'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Customer Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>
                {selectedCustomer ? getCustomerName(selectedCustomer) : 'this customer'}
              </strong>
              ? This action cannot be undone and will permanently remove all customer data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { void confirmDeleteCustomer(); }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Customer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
