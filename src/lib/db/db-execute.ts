/**
 * Database Function Execution
 *
 * This file provides a unified interface for executing database functions.
 * It provides a unified interface for executing database functions with Prisma.
 */

import { prisma } from './prisma';
import { getErrorMessage } from '@/lib/utils/server';

import { logger } from "@/lib/logger";
/**
 * Options for stored procedure execution
 */
export interface ExecuteStoredProcedureOptions {
  /** Whether to log the parameters passed to the procedure */
  logParams?: boolean;
  /** Timeout in milliseconds for the query */
  timeoutMs?: number;
}

/**
 * Execute a stored procedure using Prisma's $queryRaw
 *
 * @param functionName The name of the stored procedure to execute
 * @param params Array of parameters to pass to the function
 * @param options Additional options for execution
 * @returns The result of the stored procedure
 */
/**
 * Execute a stored procedure
 * @template T The return type of the stored procedure, defaults to unknown
 * @param functionName The name of the stored procedure
 * @param params Parameters to pass to the stored procedure
 * @param options Additional options for execution
 * @returns The result of the stored procedure
 */
export async function executeStoredProcedure<T = Record<string, string | number | boolean | null>>(
  functionName: string,
  params: (string | number | boolean | null)[] = [],
  options: ExecuteStoredProcedureOptions = {}
): Promise<T> {
  const { logParams = false, timeoutMs } = options;

  try {
    if (logParams) {
      void logger.error(`Executing ${functionName} with params:`, params);
    }

    // Create the query string - we use the ANY parameter syntax for flexibility
    const paramPlaceholders = params.map((_, index) => `$${index + 1}::ANY`).join(', ');
    const query = `SELECT * FROM ${functionName}(${paramPlaceholders})`;

    // Execute the query with a timeout if specified
    const result = await (timeoutMs
      ? Promise.race([
          prisma.$queryRaw<T[]>`${query}`,
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error(`Query timeout exceeded (${timeoutMs}ms)`)),
              timeoutMs
            )
          ),
        ])
      : prisma.$queryRaw<T[]>`${query}`);

    // Most functions return a single row, but we handle both cases
    return Array.isArray(result) && result.length > 0
      ? ((result.length === 1 ? result[0] : result) as T)
      : ({} as T);
  } catch (error) {
    void logger.error(`Error executing ${functionName}:`, error);
    throw error;
  }
}

/**
 * Execute a database function with consistent error handling
 * This wraps executeStoredProcedure with a standardized result format
 *
 * @param functionName The name of the function to execute
 * @param params Array of parameters to pass to the function
 * @param options Additional options for execution
 * @returns A standardized result object with data and error fields
 */
export async function executeDbFunction<T = Record<string, string | number | boolean | null>>(
  functionName: string,
  params: (string | number | boolean | null)[] = [],
  options: ExecuteStoredProcedureOptions = {}
): Promise<{ data: T | null; error: { message: string; originalError: Error } | null }> {
  try {
    const data = await executeStoredProcedure<T>(functionName, params, options);
    return { data, error: null };
  } catch (error) {
    void logger.error(`Error executing database function ${functionName}:`, error);
    return {
      data: null,
      error: {
        message: getErrorMessage(error),
        originalError: error instanceof Error ? error : new Error(String(error)),
      },
    };
  }
}
