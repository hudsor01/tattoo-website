'use client';

import { BookNowButton } from '@/components/ui/BookNowButton';

export default function TestBookingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Test Booking Modal</h1>
        <BookNowButton
          useModal={true}
          designName="Test Design"
          eventSlug="consultation"
          className="bg-blue-600 text-white px-6 py-3"
        >
          Test Book This Design
        </BookNowButton>
      </div>
    </div>
  );
}