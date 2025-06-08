'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, Search, Filter, Eye, Edit } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Customer } from '@prisma/client';

// Customer type with additional computed fields
interface CustomerWithStats extends Customer {
  totalAppointments?: number;
  totalSpent?: number;
  lastVisit?: Date | null;
}

// Fetch customers from API
async function fetchCustomers(): Promise<CustomerWithStats[]> {
  const response = await fetch('/api/admin/customers');
  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }
  return response.json();
}

export default function CustomersList() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: fetchCustomers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer =>
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load customers. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Customers Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Appointments</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading rows
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-full" />
                      <div className="space-y-1">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-3 w-32 bg-muted rounded" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="animate-pulse">
                    <div className="space-y-1">
                      <div className="h-3 w-40 bg-muted rounded" />
                      <div className="h-3 w-28 bg-muted rounded" />
                    </div>
                  </TableCell>
                  <TableCell className="animate-pulse">
                    <div className="h-4 w-8 bg-muted rounded" />
                  </TableCell>
                  <TableCell className="animate-pulse">
                    <div className="h-4 w-16 bg-muted rounded" />
                  </TableCell>
                  <TableCell className="animate-pulse">
                    <div className="h-4 w-20 bg-muted rounded" />
                  </TableCell>
                  <TableCell className="animate-pulse">
                    <div className="h-6 w-16 bg-muted rounded-full" />
                  </TableCell>
                  <TableCell className="animate-pulse">
                    <div className="flex gap-2 justify-end">
                      <div className="h-8 w-8 bg-muted rounded" />
                      <div className="h-8 w-8 bg-muted rounded" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {searchTerm ? 'No customers found matching your search.' : 'No customers found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://avatar.vercel.sh/${customer.email}`} />
                        <AvatarFallback>
                          {customer.firstName[0]}{customer.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                        <div className="text-sm text-muted-foreground">#{customer.id.slice(-8)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {customer.totalAppointments || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      ${(customer.totalSpent || 0).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {customer.lastVisit ? (
                      <span className="text-sm">
                        {format(new Date(customer.lastVisit), 'MMM dd, yyyy')}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" title="View customer">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" title="Edit customer">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}