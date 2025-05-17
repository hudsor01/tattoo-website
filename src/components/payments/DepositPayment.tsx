'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type AppointmentDetails = {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  deposit: number;
  depositPaid: boolean;
  artistName: string;
};

export default function DepositPayment({ appointmentId }: { appointmentId: string }) {
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);

  const router = useRouter();

  // Fetch appointment details
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/appointments/${appointmentId}`);

        if (!response.ok) {
          throw new Error('Failed to load appointment details');
        }

        const data = await response.json();
        setAppointment(data);
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Could not load appointment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  // Handle payment initiation
  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      setError(null);

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment session');
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err) {
      console.error('Error initiating payment:', err);
      setError(err instanceof Error ? err.message : 'Payment initialization failed');
      setPaymentLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-1/4 mt-6 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !appointment) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error || 'Appointment not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Deposit already paid
  if (appointment.depositPaid) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="text-center">
          <svg
            className="h-16 w-16 text-green-500 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Deposit Already Paid</h2>
          <p className="text-gray-700 mb-6">
            The deposit for this appointment has already been paid. Your appointment is confirmed.
          </p>
          <button
            onClick={() => router.push('/appointments')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            View All Appointments
          </button>
        </div>
      </div>
    );
  }

  // Format appointment date
  const formattedDate = new Date(appointment.startDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Format appointment time
  const formattedStartTime = new Date(appointment.startDate).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const formattedEndTime = new Date(appointment.endDate).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Pay Deposit</h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Appointment Details</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="mb-2">
            <span className="font-medium">Title:</span> {appointment.title}
          </p>
          <p className="mb-2">
            <span className="font-medium">Date:</span> {formattedDate}
          </p>
          <p className="mb-2">
            <span className="font-medium">Time:</span> {formattedStartTime} - {formattedEndTime}
          </p>
          <p className="mb-2">
            <span className="font-medium">Artist:</span> {appointment.artistName}
          </p>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-gray-700 mb-2">Deposit Amount</p>
        <p className="text-3xl font-bold text-indigo-600">${appointment.deposit.toFixed(2)}</p>
        <p className="text-sm text-gray-500 mt-1">
          This will be applied toward your total tattoo cost
        </p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6">{error}</div>}

      <div className="flex flex-col gap-4">
        <button
          onClick={handlePayment}
          disabled={paymentLoading}
          className="w-full py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {paymentLoading ? 'Processing...' : 'Pay with Card'}
        </button>

        <button
          onClick={() => router.back()}
          disabled={paymentLoading}
          className="w-full py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Secured by <span className="font-medium">Stripe</span>
        </p>
      </div>
    </div>
  );
}
