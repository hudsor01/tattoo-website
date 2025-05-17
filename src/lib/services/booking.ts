/**
 * Booking Service
 * Handles booking-related operations and validation logic
 */

import { prisma } from '@/lib/db/prisma';
import { cache } from '@/lib/cache';
import { sendEmail, generateBookingConfirmationEmail } from '@/lib/email';
import type {
  BookingListParams,
  BookingConfirmationEmailData,
  BookingCreateInput,
} from '@/types/booking-types';

/**
 * Process booking information and add client to the CRM system
 * Creates or updates customer record and adds a system note about the deposit payment
 * @param name Client name
 * @param email Client email
 * @param phone Client phone number
 * @param bookingData Additional booking data
 */
export async function processBookingAsCRMContact(
  name: string,
  email: string,
  phone: string,
  bookingData: Record<string, unknown>,
): Promise<void> {
  try {
    // Split name into firstName and lastName (required by schema)
    const nameParts = String(name).trim().split(' ');
    const firstName = nameParts[0] || 'Unknown';
    const lastName = nameParts.slice(1).join(' ') || 'Unknown';

    // Check if customer already exists in the system by email
    let customer = await prisma.customer.findFirst({
      where: { email: String(email) },
      include: { tags: true },
    });

    // If customer doesn't exist, create a new record
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          firstName,
          lastName,
          email: String(email),
          phone: String(phone),
          source: 'website_booking',
        },
      });
    } else {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          firstName,
          lastName,
          phone: String(phone),
        },
        include: { tags: true },
      });
    }

    // Add a note about the deposit payment
    if (customer) {
      await prisma.note.create({
        data: {
          content: `Deposit paid for tattoo booking (${bookingData['tattooType']}, ${bookingData['size']}) scheduled for ${bookingData['preferredDate']}. Placement: ${bookingData['placement']}`,
          type: 'system',
          customerId: customer.id,
        },
      });
    }

    // Add "deposit_paid" tag to customer if it doesn't already exist
    const depositPaidTag = await prisma.tag.findFirst({
      where: { name: 'deposit_paid' },
    });

    // Create the tag if it doesn't exist
    const tagId = depositPaidTag
      ? depositPaidTag.id
      : (
          await prisma.tag.create({
            data: {
              name: 'deposit_paid',
              color: 'green',
            },
          })
        ).id;

    // Connect tag to customer using Prisma relations syntax
    if (
      depositPaidTag &&
      !customer.tags?.some((tag: { id: string }) => tag.id === depositPaidTag.id)
    ) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          tags: {
            connect: {
              id: tagId,
            },
          },
        },
      });
    }

    // Update analytics for deposit payments
    const today = new Date().toISOString().split('T')[0] || new Date().toDateString();

    // Get today's record or create if not exists
    await prisma.analytics.upsert({
      where: {
        date_metric: {
          date: today,
          metric: 'deposit_payments',
        },
      },
      update: {
        count: { increment: 1 },
      },
      create: {
        date: today,
        metric: 'deposit_payments',
        count: 1,
      },
    });
  } catch (error) {
    console.error('Error processing client in CRM system:', error);
    throw new Error(`Failed to add client to CRM: ${(error as Error).message}`);
  }
}

/**
 * Sends a booking confirmation email to the client.
 * @param bookingData Booking data to generate and send confirmation email.
 */
export async function sendBookingConfirmationEmail(bookingData: BookingConfirmationEmailData) {
  const emailContent = generateBookingConfirmationEmail({
    ...bookingData,
    name: String(bookingData['name']),
    email: String(bookingData['email']),
    phone: String(bookingData['phone']),
    bookingId: Number(bookingData['bookingId']),
    tattooType: String(bookingData['tattooType'] ?? ''),
    size: String(bookingData['size'] ?? ''),
    placement: String(bookingData['placement'] ?? ''),
    preferredDate: String(bookingData['preferredDate'] ?? ''),
    preferredTime: String(bookingData['preferredTime'] ?? ''),
    depositPaid: Boolean(bookingData['depositPaid']),
    depositConfirmed:
      bookingData['depositConfirmed'] !== undefined
        ? Boolean(bookingData['depositConfirmed'])
        : false,
    referenceImages: Array.isArray(bookingData['referenceImages'])
      ? (bookingData['referenceImages'] as string[])
      : [],
    paymentMethod: (['cashapp', 'venmo', 'paypal'].includes(String(bookingData['paymentMethod']))
      ? bookingData['paymentMethod']
      : 'cashapp') as 'cashapp' | 'venmo' | 'paypal',
  });
  await sendEmail({
    to: { email: String(bookingData.email), name: String(bookingData.name) },
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });

  console.info(`Booking confirmation email sent to ${String(bookingData.email)}`);
}

/**
 * Create a new booking
 * @param bookingData Validated booking data
 * @returns Created booking with ID
 */
export async function createBooking(bookingData: BookingCreateInput) {
  try {
    // Convert string date to Date object
    const preferredDate = new Date(bookingData.preferredDate as string | number | Date);

    // Check if payment intent ID is provided (for immediate payment flow)
    const depositPaid = !!bookingData.paymentIntentId;

    // Only allow valid payment methods for booking
    const allowedPaymentMethods = ['cashapp', 'venmo', 'paypal'] as const;
    const paymentMethod = allowedPaymentMethods.includes(
      bookingData.paymentMethod as (typeof allowedPaymentMethods)[number],
    )
      ? (bookingData.paymentMethod as (typeof allowedPaymentMethods)[number])
      : 'cashapp';

    // Create booking record in database
    const booking = await prisma.booking.create({
      data: {
        name: String(bookingData.name),
        email: String(bookingData.email),
        phone: String(bookingData.phone),
        tattooType: String(bookingData.tattooType),
        size: String(bookingData.size),
        placement: String(bookingData.placement),
        description: String(bookingData.description),
        preferredDate,
        preferredTime: String(bookingData.preferredTime),
        paymentMethod: paymentMethod,
        depositPaid,
        ...(bookingData.referenceImages && Array.isArray(bookingData.referenceImages)
          ? { referenceImages: bookingData.referenceImages }
          : {}),
      },
    });

    // If payment was made, create a payment record
    if (depositPaid && bookingData.paymentIntentId) {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: 50.0, // Standard deposit amount
          paymentMethod,
          status: 'completed',
          transactionId: String(bookingData.paymentIntentId),
          customerEmail: String(bookingData.email),
          customerName: String(bookingData.name),
        },
      });
    }

    console.info(`New booking created: ${booking.id} for ${booking.name}`);

    // Invalidate cache
    cache.invalidateAll();
    try {
      await sendBookingConfirmationEmail({
        ...bookingData,
        bookingId: booking.id,
        depositPaid,
        phone: String(bookingData.phone),
        paymentMethod: paymentMethod,
        // Optionally add agreeToTerms and depositConfirmed if needed
      });
    } catch (emailError) {
      console.error('Error sending booking confirmation email:', emailError);
      // Continue processing even if email fails
    }

    return booking;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw new Error(`Failed to create booking: ${(error as Error).message}`);
  }
}

/**
 * Update the deposit status for a booking
 * @param updateData Data containing bookingId and optional paymentMethod
 * @returns Updated booking record
 */
export async function updateBookingDepositStatus(updateData: {
  bookingId: number;
  paymentMethod?: string;
}) {
  try {
    const { bookingId, paymentMethod } = updateData;

    // Ensure bookingId is a number
    if (typeof bookingId !== 'number') {
      throw new Error('Invalid bookingId');
    }

    // Find booking in database
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Update booking deposit status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        depositPaid: true,
        ...(paymentMethod
          ? { paymentMethod: paymentMethod as 'cashapp' | 'venmo' | 'paypal' }
          : {}),
      },
    });

    // Create a payment record linked to the booking
    await prisma.payment.create({
      data: {
        bookingId: bookingId,
        amount: 50.0,
        paymentMethod: updatedBooking.paymentMethod as 'cashapp' | 'venmo' | 'paypal',
        status: 'completed',
        customerEmail: String(updatedBooking.email),
        customerName: String(updatedBooking.name),
      },
    });

    // Send confirmation email to client
    try {
      await sendBookingConfirmationEmail({
        ...updatedBooking,
        preferredDate: updatedBooking.preferredDate.toISOString().split('T')[0],
        agreeToTerms: true,
        depositConfirmed: true,
        paymentMethod: updatedBooking.paymentMethod as 'cashapp' | 'venmo' | 'paypal' | 'stripe',
        phone: String(updatedBooking.phone),
      });
    } catch (emailError) {
      console.error('Error sending booking confirmation email:', emailError);
      // Continue processing even if email fails
    }

    // Add the client to the CRM system
    try {
      await processBookingAsCRMContact(
        updatedBooking.name,
        updatedBooking.email,
        updatedBooking.phone,
        {
          ...updatedBooking,
          preferredDate: updatedBooking.preferredDate.toISOString().split('T')[0],
          depositPaid: true,
        },
      );

      console.info(`Client ${updatedBooking.name} added to CRM system with deposit paid`);
    } catch (crmError) {
      console.error('Error adding client to CRM:', crmError);
      // Continue processing even if CRM integration fails
    }

    return updatedBooking;
  } catch (error) {
    console.error('Error updating deposit status:', error);
    throw new Error(`Failed to update deposit status: ${(error as Error).message}`);
  }
}

/**
 * Get a booking by ID
 * @param id Booking ID
 * @returns Booking with payment information if found
 */
export async function getBookingById(id: number) {
  try {
    // Try to get from cache first
    const cacheKey = `booking:${id}`;
    const cachedBooking = cache.get(cacheKey);
    if (cachedBooking) {
      return cachedBooking;
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        payment: {
          select: {
            id: true,
            amount: true,
            paymentMethod: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!booking) {
      return null;
    }

    // Format the data for API response
    const bookingData = {
      id: booking.id,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      tattooType: booking.tattooType,
      size: booking.size,
      placement: booking.placement,
      description: booking.description,
      preferredDate: booking.preferredDate,
      preferredTime: booking.preferredTime,
      depositPaid: booking.depositPaid,
      createdAt: booking.createdAt,
      payment: booking.payment,
    };

    // Cache the result for 5 minutes
    cache.set(cacheKey, bookingData, 300);

    return bookingData;
  } catch (error) {
    console.error(`Error getting booking ${id}:`, error);
    throw new Error(`Failed to retrieve booking: ${(error as Error).message}`);
  }
}

/**
 * Get a list of bookings with pagination and filtering
 * @param params Pagination and filter parameters
 * @returns Paginated list of bookings with metadata
 */
export async function getBookings(params: BookingListParams): Promise<{
  bookings: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    tattooType: string;
    size: string;
    placement: string;
    description: string;
    preferredDate: Date;
    preferredTime: string;
    depositPaid: boolean;
    createdAt: Date;
    payment: Array<{
      id: number;
      amount: number;
      paymentMethod: string;
      status: string;
      createdAt: Date;
    }>;
  }>;
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  };
}> {
  try {
    // Validate parameters
    const validatedLimit = Math.min(100, Math.max(1, Number(params.limit)));
    const validatedPage = Math.max(1, Number(params.page));
    const skip = (validatedPage - 1) * validatedLimit;

    const cacheKey = `bookings:${validatedPage}:${validatedLimit}`;
    // Try to get data from cache first
    const cachedData = cache.get(cacheKey);
    if (
      cachedData &&
      typeof cachedData === 'object' &&
      'bookings' in cachedData &&
      'pagination' in cachedData
    ) {
      return cachedData as {
        bookings: Array<{
          id: number;
          name: string;
          email: string;
          phone: string;
          tattooType: string;
          size: string;
          placement: string;
          description: string;
          preferredDate: Date;
          preferredTime: string;
          depositPaid: boolean;
          createdAt: Date;
          payment: Array<{
            id: number;
            amount: number;
            paymentMethod: string;
            status: string;
            createdAt: Date;
          }>;
        }>;
        pagination: {
          total: number;
          pages: number;
          currentPage: number;
          perPage: number;
        };
      };
    }

    // Get total count for pagination
    const totalCount = await prisma.booking.count();

    // Get bookings from database
    const bookings = await prisma.booking.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: validatedLimit,
      skip,
      include: {
        payment: {
          select: {
            id: true,
            amount: true,
            paymentMethod: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    // Format the data for API response
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      tattooType: booking.tattooType,
      size: booking.size,
      placement: booking.placement,
      description: booking.description,
      preferredDate: booking.preferredDate,
      preferredTime: booking.preferredTime,
      depositPaid: booking.depositPaid,
      createdAt: booking.createdAt,
      payment: Array.isArray(booking.payment)
        ? booking.payment
        : booking.payment
          ? [booking.payment]
          : [],
    }));

    const responseData = {
      bookings: formattedBookings,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / validatedLimit),
        currentPage: validatedPage,
        perPage: validatedLimit,
      },
    };

    // Cache the data for 2 minutes (120 seconds)
    cache.set(cacheKey, responseData, 120);

    return responseData;
  } catch (error) {
    console.error('Error retrieving bookings:', error);
    throw new Error(`Failed to retrieve bookings: ${(error as Error).message}`);
  }
}

/**
 * Alias for updateBookingDepositStatus for backward compatibility
 * @deprecated Use updateBookingDepositStatus instead
 */
export const updateDepositStatus = updateBookingDepositStatus;
