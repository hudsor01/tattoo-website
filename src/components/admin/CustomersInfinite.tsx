'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Edit, FileText, Eye, User, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { useTRPCInfiniteQuery } from '@/hooks/use-trpc-infinite-query'
import { trpc } from '@/lib/trpc/client'
import { format } from 'date-fns'
import type { Customer } from '@/types/customer-types'

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
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState('')

  // Create a custom infinite query for customers
  const {
    data: customers,
    isLoading,
    isFetching,
    hasMore,
    fetchNextPage,
    count: totalCount,
    refetch,
  } = useTRPCInfiniteQuery({
    queryKey: ['admin', 'getCustomers', { search: searchTerm }],
    queryFn: async ({ pageParam }) => {
      const response = await trpc.admin.getCustomers.query({
        page: pageParam ? pageParam + 1 : 1,
        limit: 20,
        search: searchTerm || undefined,
      })
      
      return {
        data: response.customers || [],
        nextCursor: response.customers && response.customers.length === 20 ? pageParam ? pageParam + 1 : 1 : null,
        totalCount: response.totalCount || 0,
      }
    },
    enabled: true,
  })

  // Mutations
  const updateCustomerMutation = trpc.admin.updateCustomer.useMutation({
    onSuccess: () => {
      toast({ title: 'Customer updated successfully' })
      setEditDialogOpen(false)
      refetch()
    },
    onError: (error) => {
      toast({ 
        title: 'Error updating customer',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const addNoteMutation = trpc.admin.addCustomerNote.useMutation({
    onSuccess: () => {
      toast({ title: 'Note added successfully' })
      setNoteDialogOpen(false)
      setNewNote('')
      refetch()
    },
    onError: (error) => {
      toast({ 
        title: 'Error adding note',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  // Filter customers by search term (client-side for immediate feedback)
  const filteredCustomers = useMemo(() => {
    if (!customers) return []
    
    if (!searchTerm) return customers
    
    const searchLower = searchTerm.toLowerCase()
    return customers.filter(customer =>
      customer.firstName?.toLowerCase().includes(searchLower) ||
      customer.lastName?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(searchTerm)
    )
  }, [customers, searchTerm])

  // Intersection observer for infinite scrolling
  const loadMoreRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    if (!hasMore || isFetching) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isFetching, fetchNextPage])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getCustomerName = (customer: CustomerData) => {
    return `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown Customer'
  }

  const handleViewCustomer = (customer: CustomerData) => {
    setSelectedCustomer(customer)
    setViewDialogOpen(true)
  }

  const handleEditCustomer = (customer: CustomerData) => {
    setSelectedCustomer(customer)
    setEditDialogOpen(true)
  }

  const handleAddNote = (customer: CustomerData) => {
    setSelectedCustomer(customer)
    setNoteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
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
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Customers List */}
      {filteredCustomers.length === 0 && !isLoading ? (
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
            {filteredCustomers.map((customer) => (
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
                              {customer.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
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
                          {(customer.city || customer.state) && (
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
                          {customer.totalBookings || 0} bookings
                        </div>
                        <div className="text-gray-500">
                          {customer.totalSpent ? formatCurrency(customer.totalSpent) : '$0'}
                        </div>
                        <div className="text-xs text-gray-400">
                          Joined {format(new Date(customer.createdAt), 'MMM yyyy')}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCustomer(customer)}
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

          {/* Load More */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {isFetching ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-500">Loading more customers...</span>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={fetchNextPage}
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
              <p className="text-gray-500">You've seen all {totalCount} customers</p>
            </div>
          )}

          {/* Summary */}
          <div className="text-center text-sm text-gray-500">
            Showing {filteredCustomers.length} of {totalCount} customers
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
                  <p className="text-sm text-gray-600">{selectedCustomer.email || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-gray-600">{selectedCustomer.phone || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm text-gray-600">
                    {[selectedCustomer.address, selectedCustomer.city, selectedCustomer.state, selectedCustomer.zipCode]
                      .filter(Boolean).join(', ') || 'Not provided'}
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
                    note: newNote 
                  })}
                  disabled={!newNote.trim() || addNoteMutation.isLoading}
                >
                  Add Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}