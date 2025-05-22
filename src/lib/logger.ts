/**
 * Unified Logger
 *
 * This file provides a consistent logging interface that works across
 * both client and server environments.
 */

// Define log levels
const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  HTTP: 3,
  DEBUG: 4,
};

type LogMessage = string;
type LogData = unknown;

// Define the logger interface to ensure consistent use
interface LoggerInterface {
  error: (message: LogMessage, data?: LogData) => void;
  warn: (message: LogMessage, data?: LogData) => void;
  info: (message: LogMessage, data?: LogData) => void;
  http: (message: LogMessage, data?: LogData) => void;
  debug: (message: LogMessage, data?: LogData) => void;
}

// Shared logger implementation for both client and server
const consoleLogger: LoggerInterface = {
  error: (message: LogMessage, data?: LogData) => {
    console.error(`ERROR: ${message}`, data || '');
  },
  warn: (message: LogMessage, data?: LogData) => {
    console.warn(`WARN: ${message}`, data || '');
  },
  info: (message: LogMessage, data?: LogData) => {
    console.info(`INFO: ${message}`, data || '');
  },
  http: (message: LogMessage, data?: LogData) => {
    console.info(`HTTP: ${message}`, data || '');
  },
  debug: (message: LogMessage, data?: LogData) => {
    // Use console.info instead of console.debug for better visibility
    console.info(`DEBUG: ${message}`, data || '');
  },
};

/**
 * Enhanced server logger that adds timestamps
 * but still uses console to avoid dependencies
 */
const serverLogger: LoggerInterface = {
  error: (message: LogMessage, data?: LogData) => {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} ERROR: ${message}`, data || '');
  },
  warn: (message: LogMessage, data?: LogData) => {
    const timestamp = new Date().toISOString();
    console.warn(`${timestamp} WARN: ${message}`, data || '');
  },
  info: (message: LogMessage, data?: LogData) => {
    const timestamp = new Date().toISOString();
    console.info(`${timestamp} INFO: ${message}`, data || '');
  },
  http: (message: LogMessage, data?: LogData) => {
    const timestamp = new Date().toISOString();
    console.info(`${timestamp} HTTP: ${message}`, data || '');
  },
  debug: (message: LogMessage, data?: LogData) => {
    const timestamp = new Date().toISOString();
    console.info(`${timestamp} DEBUG: ${message}`, data || '');
  },
};

// Create a proxy that will use the appropriate logger based on environment
const logger = new Proxy<LoggerInterface>({} as LoggerInterface, {
  get(target, prop) {
    // Determine if we're in a browser environment
    const isClient = typeof window !== 'undefined';
    
    // Use the appropriate logger
    const currentLogger = isClient ? consoleLogger : serverLogger;
    
    // Return the requested method
    return currentLogger[prop as keyof LoggerInterface];
  },
});

export { logger };