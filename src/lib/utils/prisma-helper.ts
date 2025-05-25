/**
 * Prisma helper utility functions
 * For handling TypeScript strict mode compatibility with Prisma
 */

/**
 * Converts undefined values to null for Prisma data objects
 * to avoid issues with exactOptionalPropertyTypes
 */
/**
 * Sanitizes data for Prisma by properly handling undefined values for strict TypeScript checks.
 * This converts undefined values to null for Prisma compatibility with exactOptionalPropertyTypes.
 */
export function sanitizeForPrisma<T extends Record<string, unknown>>(data: T): T {
  // If input is null or undefined, return empty object
  if (data === null || data === undefined) {
    return {} as T;
  }
  
  const result = {} as T;
  
  // Convert undefined values to null for Prisma
  void Object.entries(data).forEach(([key, value]) => {
    const typedKey = key as keyof T;
    
    // If value is undefined, convert it to null
    if (value === undefined) {
      result[typedKey] = null as unknown as T[keyof T];
    } else {
      // Otherwise keep the value as is (even if it's already null)
      result[typedKey] = value as T[keyof T];
    }
  });
  
  return result;
}

/**
 * Creates a where condition for email searches that handles undefined
 */
export function emailWhereCondition(email: string | undefined | null) {
  return { email: email ?? null };
}

/**
 * Creates a Prisma-compatible update data object for entity updates
 * Handles the exactOptionalPropertyTypes issue by converting all optional
 * properties to use NullableFieldUpdateOperationsInput
 */
export function createPrismaUpdate<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  const updateData: Record<string, unknown> = {};
  
  // Process each field in the data
  void Object.entries(data).forEach(([key, value]) => {
    // If undefined, skip this field entirely
    if (value === undefined) {
      return;
    }
    
    // If value is already null, keep it as null
    if (value === null) {
      updateData[key] = null;
      return;
    }
    
    // Handle different field types - strings, numbers, booleans should convert to
    // Prisma's Field update operations format when needed
    if (typeof value === 'string') {
      updateData[key] = { set: value };
    } else if (typeof value === 'number') {
      updateData[key] = { set: value };
    } else if (typeof value === 'boolean') {
      updateData[key] = { set: value };
    } else {
      // For complex types like objects, dates, etc., keep as is
      updateData[key] = value;
    }
  });
  
  return updateData;
}