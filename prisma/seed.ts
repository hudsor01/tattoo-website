/**
 * Prisma seed file
 * 
 * This file is used to seed the database with initial data.
 * For production deployments, we're using a simplified version
 * that doesn't cause TypeScript errors.
 */

import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

async function main() {
  console.log('Seeding database...');
  
  // Create some test customers first
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1987654321',
      },
    }),
  ]);

  // Create some test bookings
  const bookings = await Promise.all([
    prisma.booking.upsert({
      where: { id: 'booking-1' },
      update: {},
      create: {
        id: 'booking-1',
        customerId: customers[0].id,
        firstName: customers[0].firstName,
        lastName: customers[0].lastName,
        email: customers[0].email ?? 'john.doe@example.com',
        phone: customers[0].phone,
        tattooType: 'Traditional',
        size: 'Medium',
        placement: 'Arm',
        description: 'Dragon tattoo design',
        preferredDate: new Date('2024-12-15T14:00:00Z'),
        preferredTime: '2:00 PM',
        status: 'CONFIRMED',
        totalAmount: 250.00,
        paymentMethod: 'Credit Card',
      },
    }),
    prisma.booking.upsert({
      where: { id: 'booking-2' },
      update: {},
      create: {
        id: 'booking-2',
        customerId: customers[1].id,
        firstName: customers[1].firstName,
        lastName: customers[1].lastName,
        email: customers[1].email ?? 'jane.smith@example.com',
        phone: customers[1].phone,
        tattooType: 'Realism',
        size: 'Large',
        placement: 'Back',
        description: 'Portrait tattoo',
        preferredDate: new Date('2024-12-20T16:00:00Z'),
        preferredTime: '4:00 PM',
        status: 'PENDING',
        totalAmount: 450.00,
        paymentMethod: 'Debit Card',
      },
    }),
  ]);

  // Create some test payments
  await Promise.all([
    prisma.payment.upsert({
      where: { id: 'payment-1' },
      update: {},
      create: {
        id: 'payment-1',
        bookingId: bookings[0].id,
        amount: 250.00,
        currency: 'USD',
        status: 'COMPLETED',
        paymentMethod: 'Credit Card',
        stripeId: 'pi_test_1234567890',
      },
    }),
    prisma.payment.upsert({
      where: { id: 'payment-2' },
      update: {},
      create: {
        id: 'payment-2',
        bookingId: bookings[1].id,
        amount: 450.00,
        currency: 'USD',
        status: 'PENDING',
        paymentMethod: 'Debit Card',
      },
    }),
    prisma.payment.upsert({
      where: { id: 'payment-3' },
      update: {},
      create: {
        id: 'payment-3',
        amount: 150.00,
        currency: 'USD',
        status: 'COMPLETED',
        paymentMethod: 'Cash',
      },
    }),
    prisma.payment.upsert({
      where: { id: 'payment-4' },
      update: {},
      create: {
        id: 'payment-4',
        amount: 75.00,
        currency: 'USD',
        status: 'FAILED',
        paymentMethod: 'Credit Card',
        stripeId: 'pi_test_failed',
      },
    }),
  ]);

  // Create some test tattoo designs
  const designs = await Promise.all([
    prisma.tattooDesign.upsert({
      where: { id: 'design-1' },
      update: {},
      create: {
        id: 'design-1',
        name: 'Traditional Japanese Sleeve',
        description: 'A full sleeve design featuring traditional Japanese elements including koi fish, cherry blossoms, and waves.',
        fileUrl: '/images/japanese.jpg',
        thumbnailUrl: '/images/japanese.jpg',
        designType: 'Japanese',
        size: 'Large',
        isApproved: true,
        artistId: 'fernando-govea',
        artistName: 'Fernando Govea',
      },
    }),
    prisma.tattooDesign.upsert({
      where: { id: 'design-2' },
      update: {},
      create: {
        id: 'design-2',
        name: 'Classic American Eagle',
        description: 'Traditional American style eagle with banner, bold lines and vibrant colors.',
        fileUrl: '/images/traditional.jpg',
        thumbnailUrl: '/images/traditional.jpg',
        designType: 'Traditional',
        size: 'Medium',
        isApproved: true,
        artistId: 'fernando-govea',
        artistName: 'Fernando Govea',
      },
    }),
    prisma.tattooDesign.upsert({
      where: { id: 'design-3' },
      update: {},
      create: {
        id: 'design-3',
        name: 'Photorealistic Portrait',
        description: 'Stunning black and grey portrait work with incredible detail and shading.',
        fileUrl: '/images/realism.jpg',
        thumbnailUrl: '/images/realism.jpg',
        designType: 'Realism',
        size: 'Medium',
        isApproved: true,
        artistId: 'fernando-govea',
        artistName: 'Fernando Govea',
      },
    }),
    prisma.tattooDesign.upsert({
      where: { id: 'design-4' },
      update: {},
      create: {
        id: 'design-4',
        name: 'Sacred Heart',
        description: 'Religious artwork featuring sacred heart with roses and thorns.',
        fileUrl: '/images/christ-crosses.jpg',
        thumbnailUrl: '/images/christ-crosses.jpg',
        designType: 'Black & Grey',
        size: 'Large',
        isApproved: true,
        artistId: 'fernando-govea',
        artistName: 'Fernando Govea',
      },
    }),
    prisma.tattooDesign.upsert({
      where: { id: 'design-5' },
      update: {},
      create: {
        id: 'design-5',
        name: 'Dragon Ball Z Sleeve',
        description: 'Anime-inspired sleeve featuring Goku and other DBZ characters.',
        fileUrl: '/images/dragonballz-left-arm.jpg',
        thumbnailUrl: '/images/dragonballz-left-arm.jpg',
        designType: 'Color',
        size: 'Large',
        isApproved: true,
        artistId: 'fernando-govea',
        artistName: 'Fernando Govea',
      },
    }),
    prisma.tattooDesign.upsert({
      where: { id: 'design-6' },
      update: {},
      create: {
        id: 'design-6',
        name: 'Cover-up Transformation',
        description: 'Expert cover-up work transforming old tattoos into beautiful new designs.',
        fileUrl: '/images/cover-ups.jpg',
        thumbnailUrl: '/images/cover-ups.jpg',
        designType: 'Cover-up',
        size: 'Large',
        isApproved: true,
        artistId: 'fernando-govea',
        artistName: 'Fernando Govea',
      },
    }),
    prisma.tattooDesign.upsert({
      where: { id: 'design-7' },
      update: {},
      create: {
        id: 'design-7',
        name: 'Custom Geometric Design',
        description: 'Modern geometric patterns with intricate linework.',
        fileUrl: '/images/custom-designs.jpg',
        thumbnailUrl: '/images/custom-designs.jpg',
        designType: 'Custom',
        size: 'Medium',
        isApproved: true,
        artistId: 'fernando-govea',
        artistName: 'Fernando Govea',
      },
    }),
    prisma.tattooDesign.upsert({
      where: { id: 'design-8' },
      update: {},
      create: {
        id: 'design-8',
        name: 'Praying Nun Portrait',
        description: 'Detailed religious portrait with amazing shading and depth.',
        fileUrl: '/images/praying-nun-left-arm.jpg',
        thumbnailUrl: '/images/praying-nun-left-arm.jpg',
        designType: 'Portrait',
        size: 'Medium',
        isApproved: true,
        artistId: 'fernando-govea',
        artistName: 'Fernando Govea',
      },
    }),
    prisma.tattooDesign.upsert({
      where: { id: 'design-9' },
      update: {},
      create: {
        id: 'design-9',
        name: 'Full Leg Piece',
        description: 'Comprehensive leg design with flowing elements and detailed artwork.',
        fileUrl: '/images/leg-piece.jpg',
        thumbnailUrl: '/images/leg-piece.jpg',
        designType: 'Neo-Traditional',
        size: 'Large',
        isApproved: true,
        artistId: 'fernando-govea',
        artistName: 'Fernando Govea',
      },
    }),
  ]);

  console.log('Seed data created successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
