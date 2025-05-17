'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useBookingAnalytics } from '@/hooks/use-analytics';

type BookingStep = {
  id: string;
  title: string;
  path: string;
  action: 'start' | 'select_service' | 'select_date' | 'enter_details' | 'payment' | 'complete';
};

const BOOKING_STEPS: BookingStep[] = [
  { id: 'service', title: 'Choose Service', path: '/booking/service', action: 'select_service' },
  { id: 'date', title: 'Select Date', path: '/booking/date', action: 'select_date' },
  { id: 'details', title: 'Your Details', path: '/booking/details', action: 'enter_details' },
  { id: 'payment', title: 'Payment', path: '/booking/payment', action: 'payment' },
  { id: 'confirmation', title: 'Confirmation', path: '/booking/confirmation', action: 'complete' },
];

type BookingStepTrackerProps = {
  currentStep: number;
  serviceId?: string;
  serviceName?: string;
  appointmentDate?: Date;
  bookingId?: string;
};

const BookingStepTracker: React.FC<BookingStepTrackerProps> = ({
  currentStep,
  serviceId,
  serviceName,
  appointmentDate,
  bookingId,
}) => {
  const pathname = usePathname();
  const {
    startBookingFlow,
    trackServiceSelection,
    trackDateSelection,
    trackDetailsEntry,
    trackPayment,
    trackCompletion,
  } = useBookingAnalytics();

  // Initialize booking flow tracking
  useEffect(() => {
    if (currentStep === 0 || currentStep === 1) {
      // Start tracking the booking flow when the user begins
      startBookingFlow(serviceId, serviceName);
    }
  }, [currentStep, startBookingFlow, serviceId, serviceName]);

  // Track step changes
  useEffect(() => {
    // Skip for initial render or if we don't have the service details yet
    if (!serviceId || !serviceName) {
      return;
    }

    // Track based on the current step
    switch (currentStep) {
      case 1: // Service selection
        trackServiceSelection(serviceId, serviceName);
        break;
      case 2: // Date selection
        if (appointmentDate) {
          trackDateSelection(serviceId, serviceName, appointmentDate);
        }
        break;
      case 3: // Details entry
        if (appointmentDate) {
          trackDetailsEntry(serviceId, serviceName, appointmentDate);
        }
        break;
      case 4: // Payment
        if (appointmentDate) {
          trackPayment(serviceId, serviceName, appointmentDate);
        }
        break;
      case 5: // Confirmation
        if (appointmentDate && bookingId) {
          trackCompletion(bookingId, serviceId, serviceName, appointmentDate);
        }
        break;
    }
  }, [
    currentStep,
    serviceId,
    serviceName,
    appointmentDate,
    bookingId,
    trackServiceSelection,
    trackDateSelection,
    trackDetailsEntry,
    trackPayment,
    trackCompletion,
  ]);

  // Render the step progress UI
  return (
    <div className="w-full mb-8">
      <ol className="flex items-center w-full">
        {BOOKING_STEPS.map((step, index) => {
          const isActive = index + 1 === currentStep;
          const isCompleted = index + 1 < currentStep;

          return (
            <li
              key={step.id}
              className={`flex items-center ${index < BOOKING_STEPS.length - 1 ? 'w-full' : ''}`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isActive
                      ? 'bg-primary text-white'
                      : isCompleted
                        ? 'bg-primary/80 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  } transition-colors`}
                >
                  {isCompleted ? <CheckIcon className="w-4 h-4" /> : <span>{index + 1}</span>}
                </div>
                <span
                  className={`mt-2 text-xs ${
                    isActive || isCompleted ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {index < BOOKING_STEPS.length - 1 && (
                <div
                  className={`w-full h-[2px] mx-2 ${
                    isCompleted ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

// Simple check icon
const CheckIcon = ({ className = '' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

export default BookingStepTracker;
