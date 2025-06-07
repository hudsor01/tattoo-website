'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MoreHorizontal, ArrowUpRight, Loader2, Calendar } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRecentAppointments } from '@/hooks/use-admin-api'

interface AppointmentData {
  id: string
  title: string
  clientName: string | null
  clientEmail: string | null
  clientPhone: string | null
  startDate: Date
  endDate: Date
  status: string
  description: string | null
  totalPrice: number | null
}

function formatCurrency(amount: number | null | undefined): string {
  if (!amount || amount === 0) return 'TBD'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function formatDateTime(dateString: string | Date): { date: string; time: string } {
  const date = new Date(dateString)
  
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  
  return { date: formattedDate, time: formattedTime }
}

function getCustomerInitials(name: string | null | undefined): string {
  if (!name) return 'NA'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case 'confirmed':
    case 'scheduled':
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Confirmed</Badge>
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>
    case 'in-progress':
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>
    case 'completed':
      return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Completed</Badge>
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function DataTable() {
  // Fetch real appointment data
  const { data: appointments = [], isLoading, error } = useRecentAppointments({ limit: 5 })
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Loading appointments...</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Failed to load appointments</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Unable to load appointment data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Recent Appointments</CardTitle>
          <CardDescription>
            You have {appointments.length} recent appointments.
          </CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <a href="/admin/appointments">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden xl:table-column">Service</TableHead>
              <TableHead className="hidden xl:table-column">Date & Time</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No recent appointments found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment: AppointmentData) => {
                const { date, time } = formatDateTime(appointment.startDate)
                const customerName = appointment.clientName ?? 'Unknown Customer'
                const customerInitials = getCustomerInitials(customerName)
                
                return (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{customerInitials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <div className="font-medium">{customerName}</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            {appointment.clientEmail ?? 'No email'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                      {appointment.title ?? appointment.description ?? 'Tattoo Session'}
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                      <div className="flex flex-col">
                        <div className="font-medium">{date}</div>
                        <div className="text-sm text-muted-foreground">{time}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(appointment.totalPrice)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(appointment.status)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <a href={`/admin/appointments/${appointment.id}`} className="w-full">
                              View Details
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <a href={`/admin/appointments/${appointment.id}/edit`} className="w-full">
                              Edit Appointment
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Cancel Appointment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}