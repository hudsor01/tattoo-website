import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Tattoo business specific functions
export const tattooDb = {
  // Artist functions
  async getArtists() {
    return prisma.artist.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  },

  async getArtistById(id: string) {
    return prisma.artist.findUnique({
      where: { id },
      include: {
      tattooDesigns: true,
      user: { 
      select: { 
      id: true, 
      name: true, 
      email: true,
      appointments: true 
      } 
      }
      }
    });
  },

  // Event Type functions (Cal.com services)
  async getEventTypes() {
  return prisma.calEventType.findMany({
  where: { isActive: true },
  orderBy: { category: 'asc' }
  });
  },

  // Appointment functions
  async createAppointment(data: {
  userId: string;
  customerId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
  totalPrice: number;
  }) {
  return prisma.appointment.create({
  data,
  include: {
  user: { select: { id: true, name: true, email: true, phone: true } },
  customer: { select: { id: true, firstName: true, lastName: true, email: true } }
  }
  });
  },

  async getUserAppointments(userId: string) {
    return prisma.appointment.findMany({
    where: { userId },
    include: {
    customer: { select: { id: true, firstName: true, lastName: true, email: true } }
    },
    orderBy: { startTime: 'desc' }
    });
  },

  async updateAppointmentStatus(id: string, status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW') {
    return prisma.appointment.update({
      where: { id },
      data: { status }
    });
  }
};
