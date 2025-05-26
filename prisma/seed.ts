import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.info('Starting database seed...')

  // Create Fernando's user account first
  const user = await prisma.user.upsert({
    where: { email: 'fennyg83@gmail.com' },
    update: {},
    create: {
      id: 'user-fernando-govea',
      clerkId: 'temp_clerk_id_fernando', // Will be updated when Clerk is setup
      email: 'fennyg83@gmail.com',
      name: 'Fernando Govea',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  })

  console.info('User created:', user)

  // Create the main artist (Fernando)
  const artist = await prisma.artist.upsert({
    where: { id: 'fernando-govea' },
    update: {},
    create: {
      id: 'fernando-govea',
      userId: user.id,
      bio: `I'm Fernando, a passionate tattoo artist dedicated to creating unique, custom artwork that tells your story. With 15 years of experience in the industry, I specialize in bringing your vision to life through personalized tattoo designs.

My approach is collaborative - I work closely with each client to understand their ideas, preferences, and the meaning behind their desired tattoo. Whether you're looking for something bold and striking or delicate and meaningful, I'm here to guide you through the process and create something truly special.

At Ink37 Tattoos, every piece is custom-designed specifically for you. I believe that your tattoo should be as unique as you are, which is why I don't work from flash sheets or pre-made designs. Instead, we'll work together to create original artwork that reflects your personality and story.

Book a consultation to discuss your ideas, and let's create something amazing together!`,
      specialty: 'Custom Designs, Traditional, Realism, Black & Grey, Color Work',
      portfolio: 'https://instagram.com/fennyg83',
      availableForBooking: true,
      hourlyRate: null, // Custom rates
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    include: {
      User: true,
    }
  })

  console.info('Artist created:', artist)

  // Create some sample customers for testing
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        id: 'customer-john-doe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        address: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90210',
        country: 'USA',
        source: 'website',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }),
    prisma.customer.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        id: 'customer-jane-smith',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        address: '456 Oak Ave',
        city: 'San Diego',
        state: 'CA',
        postalCode: '92101',
        country: 'USA',
        source: 'instagram',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }),
    prisma.customer.upsert({
      where: { email: 'mike.johnson@example.com' },
      update: {},
      create: {
        id: 'customer-mike-johnson',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        address: '789 Pine St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
        country: 'USA',
        source: 'referral',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })
  ])

  console.info('Sample customers created:', customers.length)

  // Delete existing data to avoid duplicates (in correct order for foreign keys)
  await prisma.payment.deleteMany({})
  await prisma.appointment.deleteMany({})
  await prisma.booking.deleteMany({})
  
  // Create some sample bookings
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        customerId: 'customer-john-doe',
        artistId: 'fernando-govea',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '',
        tattooType: 'Traditional',
        size: 'Medium',
        placement: 'Upper Arm',
        description: 'Traditional eagle with banner design',
        preferredDate: new Date('2025-02-15T14:00:00'),
        preferredTime: '2:00 PM',
        paymentMethod: 'cal.com',
        depositPaid: true,
        source: 'cal.com',
        calBookingUid: 'cal-booking-001',
        calStatus: 'accepted',
        calEventTypeId: 1,
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
      }
    }),
    prisma.booking.create({
      data: {
        id: 2,
        customerId: 'customer-jane-smith',
        artistId: 'fernando-govea',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '',
        tattooType: 'Custom Design',
        size: 'Large',
        placement: 'Back',
        description: 'Custom floral mandala design with personal elements',
        preferredDate: new Date('2025-02-20T11:00:00'),
        preferredTime: '11:00 AM',
        paymentMethod: 'cal.com',
        depositPaid: false,
        source: 'cal.com',
        calBookingUid: 'cal-booking-002',
        calStatus: 'pending',
        calEventTypeId: 1,
        createdAt: new Date('2025-01-18'),
        updatedAt: new Date('2025-01-18'),
      }
    }),
    prisma.booking.create({
      data: {
        id: 3,
        customerId: 'customer-mike-johnson',
        artistId: 'fernando-govea',
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        phone: '',
        tattooType: 'Black & Grey',
        size: 'Small',
        placement: 'Forearm',
        description: 'Portrait of family pet - realistic style',
        preferredDate: new Date('2025-02-10T15:30:00'),
        preferredTime: '3:30 PM',
        paymentMethod: 'cal.com',
        depositPaid: true,
        source: 'cal.com',
        calBookingUid: 'cal-booking-003',
        calStatus: 'accepted',
        calEventTypeId: 1,
        createdAt: new Date('2025-01-10'),
        updatedAt: new Date('2025-01-12'),
      }
    })
  ])

  console.info('Sample bookings created:', bookings.length)

  // Create some sample appointments
  const appointments = await Promise.all([
    prisma.appointment.create({
      data: {
        id: 'appt-john-doe-001',
        customerId: 'customer-john-doe',
        artistId: 'fernando-govea',
        title: 'Traditional Eagle Tattoo Session',
        description: 'Traditional eagle with banner design - Upper Arm placement',
        startDate: new Date('2025-02-15T14:00:00'),
        endDate: new Date('2025-02-15T17:00:00'),
        status: 'confirmed',
        deposit: 50,
        totalPrice: 400,
        designNotes: 'Client confirmed design. Ready to proceed.',
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
      }
    }),
    prisma.appointment.create({
      data: {
        id: 'appt-jane-smith-001',
        customerId: 'customer-jane-smith',
        artistId: 'fernando-govea',
        title: 'Custom Mandala Design Session',
        description: 'Custom floral mandala design with personal elements - Back placement',
        startDate: new Date('2025-02-20T11:00:00'),
        endDate: new Date('2025-02-20T15:00:00'),
        status: 'pending',
        deposit: 50,
        totalPrice: 800,
        designNotes: 'Waiting for deposit payment to confirm.',
        createdAt: new Date('2025-01-18'),
        updatedAt: new Date('2025-01-18'),
      }
    })
  ])

  console.info('Sample appointments created:', appointments.length)

  // Create some sample payments (Cal.com handles most payments, but we track deposits)
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        id: 1,
        bookingId: 1,
        amount: 50.00,
        paymentMethod: 'card',
        status: 'paid',
        transactionId: 'cal_cal-booking-001',
        customerEmail: 'john.doe@example.com',
        customerName: 'John Doe',
        paymentType: 'deposit',
        calPaymentId: 'cal-booking-001',
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
      }
    }),
    prisma.payment.create({
      data: {
        id: 2,
        bookingId: 3,
        amount: 50.00,
        paymentMethod: 'card',
        status: 'paid',
        transactionId: 'cal_cal-booking-003',
        customerEmail: 'mike.johnson@example.com',
        customerName: 'Mike Johnson',
        paymentType: 'deposit',
        calPaymentId: 'cal-booking-003',
        createdAt: new Date('2025-01-10'),
        updatedAt: new Date('2025-01-10'),
      }
    })
  ])

  console.info('Sample payments created:', payments.length)

  // Gallery designs are now handled by the migration script: scripts/migrate-gallery-data.ts
  // This removes any duplicate or conflicting gallery data from the seed
  console.info('Gallery designs will be created by migration script - not in seed')

  // Create some customer tags for organization
  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        id: 'tag-vip',
        name: 'VIP Client',
        color: 'gold',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }),
    prisma.tag.create({
      data: {
        id: 'tag-first-time',
        name: 'First Time',
        color: 'blue',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }),
    prisma.tag.create({
      data: {
        id: 'tag-large-piece',
        name: 'Large Piece',
        color: 'purple',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }),
    prisma.tag.create({
      data: {
        id: 'tag-instagram',
        name: 'From Instagram',
        color: 'pink',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })
  ])

  console.info('Sample tags created:', tags.length)

  // Associate some tags with customers
  await prisma.customer.update({
    where: { id: 'customer-jane-smith' },
    data: {
      Tag: {
        connect: [
          { id: 'tag-large-piece' },
          { id: 'tag-instagram' }
        ]
      }
    }
  })

  await prisma.customer.update({
    where: { id: 'customer-mike-johnson' },
    data: {
      Tag: {
        connect: [
          { id: 'tag-vip' }
        ]
      }
    }
  })

  console.info('Customer tags associated')

  console.info('Database seed completed successfully!')
  console.info('Fernando Govea (fennyg83@gmail.com) has been set up as the main artist with admin access')
  console.info('Sample customers, bookings, appointments, and payments have been created')
  console.info('Gallery designs and customer tags are also ready')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error during seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })