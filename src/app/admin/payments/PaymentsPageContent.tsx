'use client'

import { useState } from 'react'
import { MoreHorizontal, RefreshCw, DollarSign, CreditCard, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
// import { toast } from '@/components/ui/use-toast' // Commented out unused
import { trpc } from '@/lib/trpc/client'
import { format } from 'date-fns'
import { PaymentStatus } from '@/types/enum-types'
import type { DatabasePayment } from '@/types/payments-types'

const statusColors: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'processing': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'failed': 'bg-red-100 text-red-800',
  'cancelled': 'bg-gray-100 text-gray-800',
  'refunded': 'bg-purple-100 text-purple-800',
  'partially_refunded': 'bg-orange-100 text-orange-800',
  'paid': 'bg-green-100 text-green-800',
}

export default function PaymentsPageContent() {
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | 'all'>('all')
  const [selectedPayment, setSelectedPayment] = useState<DatabasePayment | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')

  // Get current date range for stats (last 30 days) - memoized to prevent infinite re-renders
  const [endDate] = useState(() => new Date())
  const [startDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date
  })

  // tRPC queries
  const { data: paymentsData, isLoading: paymentsLoading, refetch: refetchPayments } = trpc.payments.getAllPayments.useQuery({
    limit: 50,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  })

  const { data: paymentStats, isLoading: statsLoading } = trpc.payments.getPaymentStats.useQuery({
    startDate,
    endDate,
  })

  // Mutations (commented out - refund not implemented)
  // const refundPaymentMutation = trpc.payments.refundPayment.useMutation({
  //   onSuccess: () => {
  //     toast({ title: 'Refund processed successfully' })
  //     setRefundDialogOpen(false)
  //     setRefundAmount('')
  //     setRefundReason('')
  //     refetchPayments()
  //   },
  //   onError: (error: unknown) => {
  //     toast({
  //       title: 'Error processing refund',
  //       description: error.message,
  //       variant: 'destructive'
  //     })
  //   }
  // })

  const handleViewPayment = (payment: DatabasePayment) => {
    setSelectedPayment(payment)
    setViewDialogOpen(true)
  }

  const handleRefundPayment = (payment: DatabasePayment) => {
    setSelectedPayment(payment)
    setRefundDialogOpen(true)
  }

  const processRefund = () => {
    if (!selectedPayment) return

    const amount = refundAmount ? parseFloat(refundAmount) * 100 : undefined // Convert to cents
    
    // refundPaymentMutation.mutate({
    //   paymentId: selectedPayment.id,
    //   amount,
    //   reason: refundReason ?? undefined,
    // })
    void console.warn('Refund not implemented', selectedPayment.id, amount, refundReason)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPaymentMethod = (method: string) => {
    return method.charAt(0).toUpperCase() + method.slice(1)
  }

  if (paymentsLoading || statsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, i) => `payment-card-${i}`).map((key) => (
              <div key={key} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => `payment-row-${i}`).map((key) => (
              <div key={key} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const payments = paymentsData?.items ?? []
  const stats = paymentStats

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payments</h1>
        <Button onClick={() => { void refetchPayments() }}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Total Revenue (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue ?? 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPayments ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Average Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.averagePayment ?? 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.paymentsByStatus && stats.totalPayments > 0
                ? Math.round((stats.paymentsByStatus.find(s => s.status === PaymentStatus.COMPLETED)?.count ?? 0) / stats.totalPayments * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Breakdown */}
      {stats?.paymentsByStatus && stats.paymentsByStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.paymentsByStatus.map((statusData) => (
                <div key={statusData.status} className="text-center">
                  <Badge className={statusColors[statusData.status] ?? 'bg-gray-100 text-gray-800'}>
                    {statusData.status}
                  </Badge>
                  <div className="mt-2">
                    <div className="text-lg font-semibold">{statusData.count}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(statusData.totalAmount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as PaymentStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.values(PaymentStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payments found
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment: DatabasePayment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold">
                          {payment.customerName} • {formatCurrency(payment.amount)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {payment.customerEmail}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Transaction ID: {payment.transactionId}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={statusColors[payment.status] ?? 'bg-gray-100 text-gray-800'}>
                      {payment.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatPaymentMethod(payment.paymentMethod)}
                    </p>
                  </div>
                  <div className="ml-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleViewPayment(payment)}>
                          View Details
                        </DropdownMenuItem>
                        {payment.status === 'paid' && (
                          <DropdownMenuItem onClick={() => handleRefundPayment(payment)}>
                            Process Refund
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Payment Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <p>{selectedPayment.customerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p>{selectedPayment.customerEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-lg font-semibold">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={statusColors[selectedPayment.status]}>
                    {selectedPayment.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Payment Method</Label>
                  <p>{formatPaymentMethod(selectedPayment.paymentMethod)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Transaction ID</Label>
                  <p className="font-mono text-sm">{selectedPayment.transactionId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p>{format(new Date(selectedPayment.createdAt), 'PPP p')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Updated</Label>
                  <p>{format(new Date(selectedPayment.updatedAt), 'PPP p')}</p>
                </div>
              </div>
              
              {selectedPayment.Booking && (
                <div>
                  <Label className="text-sm font-medium">Related Booking</Label>
                  <p>Booking ID: {selectedPayment.Booking.id}</p>
                  <p className="text-sm text-muted-foreground">
                    Created: {format(new Date(selectedPayment.Booking.createdAt), 'PPP')}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Processing refund for {selectedPayment.customerName}
                </p>
                <p className="font-semibold">
                  Original amount: {formatCurrency(selectedPayment.amount)}
                </p>
              </div>
              
              <div>
                <Label htmlFor="refundAmount">Refund Amount (optional)</Label>
                <Input
                  id="refundAmount"
                  type="number"
                  step="0.01"
                  max={selectedPayment.amount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={`Full refund: ${selectedPayment.amount}`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for full refund
                </p>
              </div>

              <div>
                <Label htmlFor="refundReason">Reason (optional)</Label>
                <Select value={refundReason} onValueChange={setRefundReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requested_by_customer">Requested by customer</SelectItem>
                    <SelectItem value="duplicate">Duplicate payment</SelectItem>
                    <SelectItem value="fraudulent">Fraudulent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setRefundDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={processRefund} 
                  disabled={false} // refundPaymentMutation.isPending
                  variant="destructive"
                >
                  Process Refund
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}