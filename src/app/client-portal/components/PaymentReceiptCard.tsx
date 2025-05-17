'use client';

import React from 'react';
import { format } from 'date-fns';
import { CreditCard, Clock, CheckCircle2, AlertCircle, FileDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PaymentReceiptCardProps {
  amount: number;
  date: Date;
  method: string;
  status: string;
  receiptUrl?: string | undefined;
}

export function PaymentReceiptCard({
  amount,
  date,
  method,
  status,
  receiptUrl,
}: PaymentReceiptCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'succeeded':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'refunded':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatPaymentMethod = (method: string) => {
    switch (method.toLowerCase()) {
      case 'card':
      case 'credit_card':
        return 'Credit Card';
      case 'cashapp':
        return 'Cash App';
      default:
        return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{formatPaymentMethod(method)}</span>
            </div>
            <p className="text-lg font-semibold">{formatCurrency(amount)}</p>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {format(date, 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={`${getStatusColor(status)} flex items-center gap-1`}
            >
              {getStatusIcon(status)}
              <span>{status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}</span>
            </Badge>

            {receiptUrl && (
              <Button variant="outline" size="sm" asChild className="h-8">
                <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                  <FileDown className="h-3.5 w-3.5 mr-1" />
                  Receipt
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
