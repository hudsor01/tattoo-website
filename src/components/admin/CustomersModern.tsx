'use client'

import React, { useState } from 'react'
import { Plus, Search, Eye, User, Mail, Phone, MapPin} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { api } from '@/lib/trpc/client'
import type { Customer } from '@/types/customer-types'

interface CustomersModernProps {
  className?: string
}

// Type for Customer data
type CustomerData = Customer

export default function CustomersModern({ className }: CustomersModernProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  
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
  })

  // Create customer mutation
  const createCustomerMutation = api.admin.createCustomer.useMutation({
    onSuccess: () => {
      toast.success('Customer created successfully!')
      setCreateDialogOpen(false)
      resetForm()
      void refetch()
    },
    onError: (error) => {
      toast.error('Failed to create customer: ' + error.message)
    }
  })

  // Use tRPC infinite query for customers
  const {
    data,
    isLoading,
    isFetching,
    hasNextPage: hasMore,
    fetchNextPage,
    isSuccess,
    refetch
  } = api.admin.getCustomersInfinite.useInfiniteQuery(
    {
      limit: 20,
      search: searchQuery.trim() || undefined,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  const customers = data?.pages.flatMap(page => page.customers) ?? []
  const count = data?.pages[0]?.totalCount ?? 0

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
      zipCode: '',
      notes: '',
    })
  }

  // Create customer using secure Supabase function
  const handleCreateCustomer = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    // Validate required fields
    if (!newCustomer.firstName.trim()) {
      void toast.error('First name is required')
      return
    }
    
    if (!newCustomer.lastName.trim()) {
      void toast.error('Last name is required')
      return
    }
    
    if (!newCustomer.email.trim()) {
      void toast.error('Email is required')
      return
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newCustomer.email)) {
      void toast.error('Please enter a valid email address')
      return
    }
    
    setIsCreating(true)
    
    try {
      await createCustomerMutation.mutateAsync({
        firstName: newCustomer.firstName.trim(),
        lastName: newCustomer.lastName.trim(),
        email: newCustomer.email.trim().toLowerCase(),
        phone: newCustomer.phone?.trim() || undefined,
        address: newCustomer.address?.trim() || undefined,
        city: newCustomer.city?.trim() || undefined,
        state: newCustomer.state?.trim() || undefined,
        zipCode: newCustomer.zipCode?.trim() || undefined,
        notes: newCustomer.notes?.trim() || undefined,
      })
      void refetch()
      
    } catch (error) {
      void console.error('❌ Unexpected error:', error)
      void toast.error(`Failed to create customer: ${error}`)
    } finally {
      setIsCreating(false)
    }
  }

  // View customer details
  const handleViewCustomer = (customer: CustomerData) => {
    setSelectedCustomer(customer)
    setViewDialogOpen(true)
  }

  // Get customer display name
  const getCustomerName = (customer: CustomerData) => {
    const firstName = customer.firstName ?? ''
    const lastName = customer.lastName ?? ''
    return `${firstName} ${lastName}`.trim() ?? 'Unknown Customer'
  }

  // Filter customers based on search
  const filteredCustomers = customers

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
    )
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
              {searchQuery ? `No customers match "${searchQuery}"` : 'Get started by adding your first customer.'}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => setCreateDialogOpen(true)} 
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Customer
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {filteredCustomers.map((customer: CustomerData) => (
        <Card key={customer.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-sm md:text-lg shrink-0">
                  {getCustomerName(customer).charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="font-semibold text-base md:text-lg truncate">{getCustomerName(customer)}</h3>
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
                          <span className="truncate">{[customer.city, customer.state].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Added {format(new Date(customer.createdAt), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end sm:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewCustomer(customer)}
                  className="w-full sm:w-auto"
                >
                  <Eye className="h-4 w-4 mr-2 sm:mr-0" />
                  <span className="sm:hidden">View Details</span>
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
              onClick={() => { void fetchNextPage() }}
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
          </DialogHeader>
          <form onSubmit={e => { void handleCreateCustomer(e) }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newCustomer.firstName}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newCustomer.lastName}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, lastName: e.target.value }))}
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
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
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
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={newCustomer.city}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="New York"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={newCustomer.state}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="NY"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes about this customer..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setCreateDialogOpen(false)
                  resetForm()
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!newCustomer.firstName.trim() || !newCustomer.email.trim() || isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Customer'}
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
                  <p className="text-sm text-gray-600">{selectedCustomer.email ?? 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-gray-600">{selectedCustomer.phone ?? 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm text-gray-600">
                    {[selectedCustomer.address, selectedCustomer.city, selectedCustomer.state, selectedCustomer.postalCode]
                      .filter(Boolean).join(', ') ?? 'Not provided'}
                  </p>
                </div>
              </div>
              {selectedCustomer.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{selectedCustomer.notes}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="text-sm text-gray-600">
                  {format(new Date(selectedCustomer.createdAt), 'MMMM d, yyyy \'at\' h:mm a')}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}