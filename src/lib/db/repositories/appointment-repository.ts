/**
 * Appointment Repository
 * 
 * Repository for appointment-related database operations
 */

import { PrismaClient, Appointment } from '@prisma/client';
import { BaseRepository } from './base/repository';

// Define input types for create and update operations
export type AppointmentCreateInput = {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  customerId: string;
  artistId: string;
  status: string;
  tattooSize?: string;
  complexity?: number;
  location?: string;
  depositAmount?: number;
  totalPrice?: number;
};

export type AppointmentUpdateInput = Partial<AppointmentCreateInput>;

export class AppointmentRepository extends BaseRepository<
  Appointment,
  AppointmentCreateInput,
  AppointmentUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'appointment');
  }
  
  /**
   * Find appointments within a date range
   */
  async findByDateRange(startDate: Date, endDate: Date, artistId?: string): Promise<Appointment[]> {
    try {
      return await this.prisma.appointment.findMany({
        where: {
          startDate: { gte: startDate },
          endDate: { lte: endDate },
          ...(artistId ? { artistId } : {}),
        },
        orderBy: {
          startDate: 'asc',
        },
      });
    } catch (error) {
      console.error('Error in appointment.findByDateRange:', error);
      throw error;
    }
  }
  
  /**
   * Check if an appointment time slot is available
   */
  async checkAvailability(
    artistId: string,
    startDate: Date,
    endDate: Date,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    try {
      const conflictingAppointments = await this.prisma.appointment.findMany({
        where: {
          artistId,
          id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
          OR: [
            {
              // Starts during the proposed time slot
              startDate: {
                gte: startDate,
                lt: endDate,
              },
            },
            {
              // Ends during the proposed time slot
              endDate: {
                gt: startDate,
                lte: endDate,
              },
            },
            {
              // Completely overlaps the proposed time slot
              startDate: {
                lte: startDate,
              },
              endDate: {
                gte: endDate,
              },
            },
          ],
        },
      });
      
      return conflictingAppointments.length === 0;
    } catch (error) {
      console.error('Error in appointment.checkAvailability:', error);
      throw error;
    }
  }
  
  /**
   * Find upcoming appointments for a customer
   */
  async findUpcomingForCustomer(customerId: string, limit = 5): Promise<Appointment[]> {
    try {
      return await this.prisma.appointment.findMany({
        where: {
          customerId,
          startDate: { gte: new Date() },
          status: { notIn: ['cancelled', 'completed'] },
        },
        orderBy: {
          startDate: 'asc',
        },
        take: limit,
      });
    } catch (error) {
      console.error('Error in appointment.findUpcomingForCustomer:', error);
      throw error;
    }
  }
  
  /**
   * Find upcoming appointments for an artist
   */
  async findUpcomingForArtist(artistId: string, limit = 10): Promise<Appointment[]> {
    try {
      return await this.prisma.appointment.findMany({
        where: {
          artistId,
          startDate: { gte: new Date() },
          status: { notIn: ['cancelled'] },
        },
        orderBy: {
          startDate: 'asc',
        },
        take: limit,
      });
    } catch (error) {
      console.error('Error in appointment.findUpcomingForArtist:', error);
      throw error;
    }
  }
}