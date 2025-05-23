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
  referenceImages?: string[];
  calBookingUid?: string | undefined;
  calEventId?: string | undefined;
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
    // Extract main booking data
    const { 
      name,
      email,
      phone,
      tattooType,
      size: tattooSize,
      placement: location,
      description: consultationNotes,
      preferredDate,
      preferredTime,
      referenceImages,
      calBookingUid,
      calEventId
    } = data;

    // Format the data for the Prisma schema
    const bookingData = {
      name,
      email,
      phone,
      tattooType,
      size: tattooSize,
      placement: location, // Map location to placement
      description: consultationNotes, // Map consultationNotes to description
      preferredDate: new Date(preferredDate),
      preferredTime,
      paymentMethod: 'unspecified', // Default payment method
      referenceImages: referenceImages || [],
      status: "pending",
      bookingType: "tattoo",
      calBookingUid: calBookingUid || null,
      calRescheduleUid: null,
      calEventId: calEventId || null,
      estimatedPrice: data.totalPrice ? Number(data.totalPrice) : null,
      deposit: data.depositAmount ? Number(data.depositAmount) : null,
      depositPaid: data.depositPaid || false
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
      where: { id: parseInt(bookingId) },
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
      where: { id: parseInt(id) },
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
    const { uid, eventTypeId, startTime, attendees, customInputs } = calData;
    
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
    const bookingData: CreateBookingInput = {
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
 * Map Cal.com status to our booking status (currently unused)
 */
// function mapCalStatusToBookingStatus(calStatus: string): string {
//   switch (calStatus?.toLowerCase()) {
//     case 'accepted':
//       return 'confirmed';
//     case 'pending':
//       return 'pending';
//     case 'cancelled':
//       return 'cancelled';
//     case 'rejected':
//       return 'cancelled';
//     default:
//       return 'pending';
//   }
// }