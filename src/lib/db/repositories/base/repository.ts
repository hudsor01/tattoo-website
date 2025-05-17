/**
 * Base Repository
 * 
 * Abstract base repository class that provides a consistent interface
 * for database operations across the application.
 */

import { PrismaClient, Prisma } from '@prisma/client';

// Type-safe dynamic client access
type PrismaModels = Prisma.TypeMap['meta']['modelProps'];
type ModelName = keyof PrismaModels;

/**
 * Type-safe dynamic access to Prisma models
 */
function getPrismaModel<T extends ModelName>(
  client: PrismaClient,
  modelName: T
): PrismaClient[T] {
  return client[modelName];
}

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected prisma: PrismaClient;
  protected tableName: ModelName;
  
  constructor(prisma: PrismaClient, tableName: ModelName) {
    this.prisma = prisma;
    this.tableName = tableName;
  }
  
  /**
   * Find a record by its ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const model = getPrismaModel(this.prisma, this.tableName);
      
      return await model.findUnique({
        where: { id },
      }) as unknown as T | null;
    } catch (error) {
      console.error(`Error in ${this.tableName}.findById:`, error);
      throw error;
    }
  }
  
  /**
   * Find all records with optional filtering and pagination
   */
  async findAll(
    options: {
      where?: Record<string, unknown>;
      orderBy?: Record<string, 'asc' | 'desc'>;
      skip?: number;
      take?: number;
    } = {}
  ): Promise<T[]> {
    try {
      const { where, orderBy, skip, take } = options;
      const model = getPrismaModel(this.prisma, this.tableName);
      
      return await model.findMany({
        where,
        orderBy,
        skip,
        take,
      }) as unknown as T[];
    } catch (error) {
      console.error(`Error in ${this.tableName}.findAll:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new record
   */
  async create(data: CreateInput): Promise<T> {
    try {
      const model = getPrismaModel(this.prisma, this.tableName);
      
      return await model.create({
        data,
      }) as unknown as T;
    } catch (error) {
      console.error(`Error in ${this.tableName}.create:`, error);
      throw error;
    }
  }
  
  /**
   * Update an existing record
   */
  async update(id: string, data: UpdateInput): Promise<T> {
    try {
      const model = getPrismaModel(this.prisma, this.tableName);
      
      return await model.update({
        where: { id },
        data,
      }) as unknown as T;
    } catch (error) {
      console.error(`Error in ${this.tableName}.update:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a record
   */
  async delete(id: string): Promise<T> {
    try {
      const model = getPrismaModel(this.prisma, this.tableName);
      
      return await model.delete({
        where: { id },
      }) as unknown as T;
    } catch (error) {
      console.error(`Error in ${this.tableName}.delete:`, error);
      throw error;
    }
  }
  
  /**
   * Count records with optional filtering
   */
  async count(where?: Record<string, unknown>): Promise<number> {
    try {
      const model = getPrismaModel(this.prisma, this.tableName);
      
      return await model.count({
        where,
      });
    } catch (error) {
      console.error(`Error in ${this.tableName}.count:`, error);
      throw error;
    }
  }
}
