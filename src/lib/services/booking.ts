import { prisma } from '@/lib/db/prisma';

/**
 * Type definitions for booking input data
 */
interface CreateBookingInput {
  name: string;
  email: string;
  phone: string;
  tattooType: string;
  size: string;
  placement: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
  paymentMethod: string;
  referenceImages?: string[];
  calBookingUid?: string;
  calEventId?: string;
  totalPrice?: string | number;
  depositAmount?: string | number;
  depositPaid?: boolean;
}

/**
 * Type definition for updating deposit status
 */
interface UpdateDepositInput {
  depositPaid: boolean;
}

/**
 * Create a new booking in the database
 */
export async function createBooking(data: CreateBookingInput) {
  try {
    // Format the data for the Prisma schema
    const bookingData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      tattooType: data.tattooType,
      size: data.size,
      placement: data.placement,
      description: data.description,
      preferredDate: new Date(data.preferredDate),
      preferredTime: data.preferredTime,
      paymentMethod: data.paymentMethod,
      depositPaid: data.depositPaid || false,
      calBookingUid: data.calBookingUid || undefined,
      source: data.calBookingUid ? 'cal' : 'website'
    };

    // Create the booking record
    return await prisma.booking.create({
      data: bookingData,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    throw new Error('Failed to create booking'); 
  }
}

/**
 * Update booking deposit status
 */
export async function updateBookingDepositStatus(bookingId: string, data: UpdateDepositInput) {
  try {
    return await prisma.booking.update({
      where: { id: bookingId },
      data: {
        depositPaid: data.depositPaid,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating booking deposit status:', error);
    throw new Error('Failed to update booking deposit status');
  }
}

/**
 * Get a booking by ID
 */
export async function getBookingById(id: string) {
  try {
    return await prisma.booking.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error getting booking by ID:', error);
    throw new Error('Failed to get booking');
  }
}

/**
 * Get all bookings
 */
export async function getBookings() {
  try {
    return await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error getting bookings:', error);
    throw new Error('Failed to get bookings');
  }
}

/**
 * Types for Cal.com booking data
 */
interface CalBookingAttendee {
  name: string;
  email: string;
  phone?: string;
}

interface CalCustomInput {
  label: string;
  value: string;
}

interface CalBookingData {
  uid: string;
  eventTypeId: number;
  startTime: string;
  attendees?: CalBookingAttendee[];
  customInputs?: CalCustomInput[];
  status: string;
}

/**
 * Process a Cal.com webhook booking event
 */
export async function processCalBooking(calData: CalBookingData) {
  try {
    // Extract booking information from Cal.com data
    const { uid, eventTypeId, startTime, attendees, customInputs, status } = calData;
    
    // Get the first attendee (client)
    const attendee = attendees?.[0];
    if (!attendee) {
      throw new Error('No attendee information found in Cal.com booking');
    }

    // Extract custom fields from customInputs
    const getCustomField = (name: string) => {
      const field = customInputs?.find((input: CalCustomInput) => input.label.toLowerCase() === name.toLowerCase());
      return field?.value;
    };

    // Create booking data
    const bookingData = {
      name: attendee.name,
      email: attendee.email,
      phone: attendee.phone || '(Not provided)',
      tattooType: getCustomField('tattoo type') || 'Not specified',
      size: getCustomField('size') || 'Not specified',
      placement: getCustomField('placement') || 'Not specified',
      preferredDate: new Date(startTime).toISOString(),
      preferredTime: new Date(startTime).toLocaleTimeString(),
      description: getCustomField('description') || 'Not provided',
      referenceImages: [],
      calBookingUid: uid,
      calEventId: String(eventTypeId),
      status: mapCalStatusToBookingStatus(status),
      appointmentDate: new Date(startTime),
      depositPaid: false,
      totalPrice: 0
    };

    // Create the booking
    const booking = await createBooking(bookingData);
    return booking;
  } catch (error) {
    console.error('Error processing Cal.com booking:', error);
    throw new Error('Failed to process Cal.com booking');
  }
}

/**
 * Map Cal.com status to our booking status
 */
function mapCalStatusToBookingStatus(calStatus: string): string {
  switch (calStatus?.toLowerCase()) {
    case 'accepted':
      return 'confirmed';
    case 'pending':
      return 'pending';
    case 'cancelled':
      return 'cancelled';
    case 'rejected':
      return 'cancelled';
    default:
      return 'pending';
  }
}