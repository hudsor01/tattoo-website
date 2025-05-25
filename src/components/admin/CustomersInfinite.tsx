'use client'

import React, { useState, useMemo } from 'react'
import { Plus, Search, Edit, Eye, User, Mail, Phone, MapPin, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import { format } from 'date-fns'

interface CustomersInfiniteProps {
  className?: string
}

// Define customer data type for infinite query
interface CustomerData {
  id: string
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  notes?: string | null
  tags?: string[] | null
  createdAt: Date
  updatedAt: Date
  totalBookings?: number
  totalSpent?: number
  lastBookingDate?: Date | null
}

export default function CustomersInfinite({ className = '' }: CustomersInfiniteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState('')
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

  // Use tRPC infinite query for customers
  const {
    data: customersData,
    isLoading,
    refetch,
  } = trpc.admin.getCustomers.useQuery({
    page: 1,
    limit: 100, // Get more customers for infinite scroll
    search: searchTerm ?? undefined,
  })

  // Flatten paginated data for rendering/filtering
  const customers: CustomerData[] = useMemo(() => {
    if (!customersData?.customers) return []
    return customersData.customers
  }, [customersData])

  // Mutations
  const addNoteMutation = trpc.admin.addCustomerNote.useMutation({
    onSuccess: () => {
      toast.success('Note added successfully')
      setNoteDialogOpen(false)
      setNewNote('')
      void refetch()
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to add note')
    }
  })

  const createCustomerMutation = trpc.admin.createCustomer.useMutation({
    onSuccess: () => {
      toast.success('Customer created successfully')
      setCreateDialogOpen(false)
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
      void refetch()
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to create customer')
    }
  })

  // Note: Infinite scrolling would be implemented here with intersection observer

  // Helper function to get customer display name
  const getCustomerName = (customer: CustomerData): string => {
    return `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() ?? 'Unknown Customer'
  }

  // Helper function to format currency
  const formatCurrency = (totalSpent: number | undefined): string => {
    if (typeof totalSpent !== 'number' || isNaN(totalSpent)) return '$0.00'
    return totalSpent.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const handleViewOrEditCustomer = (customer: CustomerData) => {
    setSelectedCustomer(customer)
    setViewDialogOpen(true)
  }

  const handleAddNote = (customer: CustomerData) => {
    setSelectedCustomer(customer)
    setNoteDialogOpen(true)
  }

  const handleCreateCustomer = (e?: React.FormEvent) => {
    e?.preventDefault()
    
    // Validate required fields
    if (!newCustomer.firstName?.trim()) {
      toast.error('First name is required')
      return
    }
    if (!newCustomer.lastName?.trim()) {
      toast.error('Last name is required')
      return
    }
    if (!newCustomer.email?.trim()) {
      toast.error('Email is required')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newCustomer.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    // Create the data object to send
    const customerData = {
      firstName: newCustomer.firstName.trim(),
      lastName: newCustomer.lastName.trim(),
      email: newCustomer.email.trim(),
      phone: newCustomer.phone?.trim() ?? undefined,
      address: newCustomer.address?.trim() ?? undefined,
      city: newCustomer.city?.trim() ?? undefined,
      state: newCustomer.state?.trim() ?? undefined,
      zipCode: newCustomer.zipCode?.trim() ?? undefined,
      notes: newCustomer.notes?.trim() ?? undefined,
    }

    createCustomerMutation.mutate(customerData)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 5 }, (_, i) => `loading-skeleton-${i}`).map((key) => (
          <Card key={key} className="animate-pulse">
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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customers</h2>
          <p className="text-gray-600">Manage customer information and history</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 min-w-[300px]"
            />
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Customers List */}
      {customers.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first customer'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {customers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 text-blue-600 rounded-full p-3">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">
                            {getCustomerName(customer)}
                          </h3>
                          {customer.tags && customer.tags.length > 0 && (
                            <div className="flex gap-1">
                              {customer.tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          {customer.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{customer.email}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          {(customer.city ?? customer.state) && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{[customer.city, customer.state].filter(Boolean).join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm mr-4">
                        <div className="font-medium">
                          {customer.totalBookings ?? 0} bookings
                        </div>
                        <div className="text-gray-500">
                          {formatCurrency(customer.totalSpent)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Joined {format(new Date(customer.createdAt), 'MMM yyyy')}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrEditCustomer(customer)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrEditCustomer(customer)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddNote(customer)}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <div className="text-center text-sm text-gray-500">
            Showing {customers.length} customers
          </div>
        </>
      )}

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
                    {[selectedCustomer.address, selectedCustomer.city, selectedCustomer.state, selectedCustomer.zipCode]
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
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Note Dialog */}
      {selectedCustomer && (
        <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Note for {getCustomerName(selectedCustomer)}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter note about this customer..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => addNoteMutation.mutate({ 
                    customerId: selectedCustomer.id, 
                    content: newNote 
                  })}
                  disabled={!newNote.trim() || addNoteMutation.isPending}
                >
                  Add Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Customer Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newCustomer.firstName}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newCustomer.lastName}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
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
              <div className="col-span-2">
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
              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={newCustomer.zipCode}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="10001"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this customer..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!newCustomer.firstName.trim() || !newCustomer.lastName.trim() || !newCustomer.email.trim() || createCustomerMutation.isPending}
              >
                {createCustomerMutation.isPending ? 'Creating...' : 'Create Customer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}