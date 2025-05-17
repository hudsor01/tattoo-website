import { PrismaClient } from '@prisma/client';
import { TEST_PREFIX } from '../test-constants';

/**
 * Test data factory for E2E tests
 * Provides functions to create and clean up test data
 */
export class TestDataFactory {
  private prisma: PrismaClient;
  private createdItems: TestDataItem[] = [];

  constructor() {
    this.prisma = new PrismaClient();

    // Ensure connection
    this.prisma.$connect().then(() => {
      console.log('Connected to database for test data factory');
    });

    // Register cleanup on process exit
    process.on('exit', () => {
      this.cleanup().catch(err => {
        console.error('Error during cleanup:', err);
      });
    });

    // Handle process termination
    process.on('SIGINT', () => {
      this.cleanup()
        .catch(err => {
          console.error('Error during cleanup:', err);
        })
        .finally(() => {
          process.exit();
        });
    });
  }

  /**
   * Create a customer with test data
   * @param overrides Properties to override default values
   */
  async createTestCustomer(overrides: Partial<any> = {}): Promise<any> {
    const uniqueId = this.generateUniqueId();

    const customer = await this.prisma.customer.create({
      data: {
        firstName: overrides.firstName || `${TEST_PREFIX}First${uniqueId}`,
        lastName: overrides.lastName || `${TEST_PREFIX}Last${uniqueId}`,
        email: overrides.email || `${TEST_PREFIX}${uniqueId}@example.com`,
        phone: overrides.phone || `555${uniqueId.substring(0, 7)}`,
        address: overrides.address || `${uniqueId} Test St`,
        city: overrides.city || 'Test City',
        state: overrides.state || 'TS',
        zip: overrides.zip || `1${uniqueId.substring(0, 4)}`,
        notes: overrides.notes || `Test customer created for E2E test ${uniqueId}`,
      },
    });

    // Register for cleanup
    this.registerCleanup({
      type: 'customer',
      id: customer.id,
      data: customer,
    });

    return customer;
  }

  /**
   * Create a booking with test data
   * @param overrides Properties to override default values
   */
  async createTestBooking(overrides: Partial<any> = {}): Promise<any> {
    const uniqueId = this.generateUniqueId();

    // Create customer if not provided
    let customerId = overrides.customerId;
    if (!customerId) {
      const customer = await this.createTestCustomer({
        email: overrides.email || `${TEST_PREFIX}${uniqueId}@example.com`,
      });
      customerId = customer.id;
    }

    const booking = await this.prisma.booking.create({
      data: {
        name: overrides.name || `${TEST_PREFIX}Booking${uniqueId}`,
        email: overrides.email || `${TEST_PREFIX}${uniqueId}@example.com`,
        phone: overrides.phone || `555${uniqueId.substring(0, 7)}`,
        tattooType: overrides.tattooType || 'custom',
        size: overrides.size || 'medium',
        placement: overrides.placement || 'arm',
        description: overrides.description || `Test booking created for E2E test ${uniqueId}`,
        preferredDate: overrides.preferredDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        preferredTime: overrides.preferredTime || 'afternoon',
        customerId: customerId,
        status: overrides.status || 'pending',
      },
    });

    // Register for cleanup
    this.registerCleanup({
      type: 'booking',
      id: booking.id,
      data: booking,
    });

    return booking;
  }

  /**
   * Create an appointment with test data
   * @param overrides Properties to override default values
   */
  async createTestAppointment(overrides: Partial<any> = {}): Promise<any> {
    const uniqueId = this.generateUniqueId();

    // Create booking if not provided
    let bookingId = overrides.bookingId;
    if (!bookingId) {
      const booking = await this.createTestBooking();
      bookingId = booking.id;
    }

    const startTime = overrides.startTime || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const endTime = overrides.endTime || new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    const appointment = await this.prisma.appointment.create({
      data: {
        title: overrides.title || `${TEST_PREFIX}Appointment${uniqueId}`,
        startTime: startTime,
        endTime: endTime,
        status: overrides.status || 'scheduled',
        notes: overrides.notes || `Test appointment created for E2E test ${uniqueId}`,
        bookingId: bookingId,
        artistId: overrides.artistId,
        deposit: overrides.deposit !== undefined ? overrides.deposit : 100,
        totalPrice: overrides.totalPrice !== undefined ? overrides.totalPrice : 300,
      },
    });

    // Register for cleanup
    this.registerCleanup({
      type: 'appointment',
      id: appointment.id,
      data: appointment,
    });

    return appointment;
  }

  /**
   * Create a test gallery item
   * @param overrides Properties to override default values
   */
  async createTestGalleryItem(overrides: Partial<any> = {}): Promise<any> {
    const uniqueId = this.generateUniqueId();

    const galleryItem = await this.prisma.galleryItem.create({
      data: {
        title: overrides.title || `${TEST_PREFIX}Gallery${uniqueId}`,
        description: overrides.description || `Test gallery item created for E2E test ${uniqueId}`,
        category: overrides.category || 'traditional',
        artist: overrides.artist || 'Test Artist',
        featured: overrides.featured !== undefined ? overrides.featured : false,
        imageUrl: overrides.imageUrl || `https://example.com/test-image-${uniqueId}.jpg`,
      },
    });

    // Register for cleanup
    this.registerCleanup({
      type: 'galleryItem',
      id: galleryItem.id,
      data: galleryItem,
    });

    return galleryItem;
  }

  /**
   * Create a test service
   * @param overrides Properties to override default values
   */
  async createTestService(overrides: Partial<any> = {}): Promise<any> {
    const uniqueId = this.generateUniqueId();

    const service = await this.prisma.service.create({
      data: {
        name: overrides.name || `${TEST_PREFIX}Service${uniqueId}`,
        description: overrides.description || `Test service created for E2E test ${uniqueId}`,
        price: overrides.price !== undefined ? overrides.price : 150,
        duration: overrides.duration !== undefined ? overrides.duration : 60,
        category: overrides.category || 'tattoo',
      },
    });

    // Register for cleanup
    this.registerCleanup({
      type: 'service',
      id: service.id,
      data: service,
    });

    return service;
  }

  /**
   * Generate a unique ID for test data
   */
  private generateUniqueId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2, 8);
  }

  /**
   * Register an item for cleanup
   */
  private registerCleanup(item: TestDataItem): void {
    this.createdItems.push(item);
  }

  /**
   * Clean up all created test data
   */
  async cleanup(): Promise<void> {
    console.log(`Cleaning up ${this.createdItems.length} test data items...`);

    // Process items in reverse order (dependencies last)
    const items = [...this.createdItems].reverse();

    for (const item of items) {
      try {
        switch (item.type) {
          case 'appointment':
            await this.prisma.appointment.delete({
              where: { id: item.id as string },
            });
            break;

          case 'booking':
            await this.prisma.booking.delete({
              where: { id: item.id as string },
            });
            break;

          case 'customer':
            await this.prisma.customer.delete({
              where: { id: item.id as string },
            });
            break;

          case 'galleryItem':
            await this.prisma.galleryItem.delete({
              where: { id: item.id as string },
            });
            break;

          case 'service':
            await this.prisma.service.delete({
              where: { id: item.id as string },
            });
            break;

          default:
            console.warn(`Unknown item type: ${item.type}`);
        }

        // Remove from list
        const index = this.createdItems.findIndex(i => i.type === item.type && i.id === item.id);

        if (index >= 0) {
          this.createdItems.splice(index, 1);
        }
      } catch (error) {
        console.warn(`Failed to clean up test data item: ${item.type} ${item.id}`, error);
      }
    }

    // Disconnect from the database
    await this.prisma.$disconnect();
    console.log('Disconnected from database after cleanup');
  }

  /**
   * Get the Prisma client for direct database operations
   */
  getPrisma(): PrismaClient {
    return this.prisma;
  }

  /**
   * Clean up specific test data items by type
   */
  async cleanupByType(type: string): Promise<void> {
    const items = this.createdItems.filter(item => item.type === type);

    for (const item of items) {
      try {
        switch (item.type) {
          case 'appointment':
            await this.prisma.appointment.delete({
              where: { id: item.id as string },
            });
            break;

          case 'booking':
            await this.prisma.booking.delete({
              where: { id: item.id as string },
            });
            break;

          case 'customer':
            await this.prisma.customer.delete({
              where: { id: item.id as string },
            });
            break;

          case 'galleryItem':
            await this.prisma.galleryItem.delete({
              where: { id: item.id as string },
            });
            break;

          case 'service':
            await this.prisma.service.delete({
              where: { id: item.id as string },
            });
            break;
        }

        // Remove from list
        const index = this.createdItems.findIndex(i => i.type === item.type && i.id === item.id);

        if (index >= 0) {
          this.createdItems.splice(index, 1);
        }
      } catch (error) {
        console.warn(`Failed to clean up test data item: ${item.type} ${item.id}`, error);
      }
    }
  }
}

// Types
interface TestDataItem {
  type: string;
  id: string | number;
  data?: unknown;
}

// Singleton instance for the test data factory
let testDataFactoryInstance: TestDataFactory | null = null;

export function getTestDataFactory(): TestDataFactory {
  if (!testDataFactoryInstance) {
    testDataFactoryInstance = new TestDataFactory();
  }
  return testDataFactoryInstance;
}
