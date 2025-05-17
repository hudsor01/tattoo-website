'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Appointment } from '../appointments/types';

interface AppointmentCardProps {
  appointment: Appointment;
  isPast: boolean;
}

export function AppointmentCard({ appointment, isPast }: AppointmentCardProps) {
  // Status based styling
  const statusColor = !appointment.depositPaid
    ? 'bg-amber-500'
    : appointment.status === 'confirmed'
      ? 'bg-green-500'
      : appointment.status === 'scheduled'
        ? 'bg-blue-500'
        : appointment.status === 'cancelled'
          ? 'bg-red-500'
          : 'bg-gray-500';

  const statusText = !appointment.depositPaid
    ? 'Deposit Due'
    : appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);

  const statusIcon = !appointment.depositPaid ? (
    <AlertCircle className="h-4 w-4" />
  ) : appointment.status === 'confirmed' || appointment.status === 'completed' ? (
    <CheckCircle2 className="h-4 w-4" />
  ) : (
    <Clock className="h-4 w-4" />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Date column */}
          <div className="bg-gray-100 p-4 md:w-40 flex flex-row md:flex-col justify-between md:justify-center items-center text-center">
            <div>
              <p className="text-sm text-gray-500">
                {new Date(appointment.startDate).toLocaleDateString(undefined, {
                  weekday: 'short',
                })}
              </p>
              <p className="text-2xl font-bold">
                {new Date(appointment.startDate).toLocaleDateString(undefined, {
                  day: 'numeric',
                })}
              </p>
              <p className="text-md">
                {new Date(appointment.startDate).toLocaleDateString(undefined, {
                  month: 'short',
                })}
              </p>
            </div>

            <div className="md:mt-4">
              <p className="text-sm">
                {new Date(appointment.startDate).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Details column */}
          <div className="p-4 flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{appointment.title}</h3>
              <Badge className={`${statusColor} text-white`}>
                <span className="flex items-center gap-1">
                  {statusIcon} {statusText}
                </span>
              </Badge>
            </div>

            {appointment.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{appointment.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                <span>
                  {new Date(appointment.startDate).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {new Date(appointment.endDate).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {!appointment.depositPaid && !isPast && appointment.deposit && (
                <Button asChild size="sm" variant="outline" className="mt-2">
                  <Link href={`/client-portal/payments/${appointment.id}`}>
                    Pay Deposit (${appointment.deposit.toFixed(2)})
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Action column */}
          <div className="bg-gray-50 p-4 flex justify-center items-center">
            <Button asChild variant="ghost" size="icon">
              <Link
                href={`/client-portal/appointments/${appointment.id}`}
                aria-label="View appointment details"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}