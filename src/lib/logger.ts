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

// Client-side logger implementation
const clientLogger: LoggerInterface = {
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
    console.debug(`DEBUG: ${message}`, data || '');
  },
};

// Dynamically loaded server logger to avoid build issues
let serverLogger: LoggerInterface | null = null;

// This function is only called on the server side
const getServerLogger = (): LoggerInterface => {
  // If we already initialized it, return the instance
  if (serverLogger) return serverLogger;

  try {
    // Dynamically import winston - only works on server
    // using eval to prevent webpack from trying to bundle this
    // eslint-disable-next-line no-eval
    const winston = eval("require('winston')");

    // Define colors for each log level
    const colors = {
      error: 'red',
      warn: 'yellow',
      info: 'green',
      http: 'magenta',
      debug: 'blue',
    };

    // Add colors to winston
    winston.addColors(colors);

    // Determine log level based on environment
    const level = process.env.NODE_ENV === 'development' ? 'debug' : 'warn';

    // Define format for server-side logging
    const serverFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info: any) =>
          `${info.timestamp} ${info.level}: ${info.message} ${
            info.data ? JSON.stringify(info.data) : ''
          }`,
      ),
    );

    // Create different transports for different environments
    const transports = [
      // Always log errors to a file
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.uncolorize(),
      }),
      // Log all messages to a combined file
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.uncolorize(),
      }),
    ];

    // If we're not in production, log to the console
    if (process.env.NODE_ENV !== 'production') {
      transports.push(
        new winston.transports.Console({
          format: serverFormat,
        }),
      );
    }

    // Create the winston logger
    const winstonLogger = winston.createLogger({
      level,
      levels: {
        error: LogLevel.ERROR,
        warn: LogLevel.WARN,
        info: LogLevel.INFO,
        http: LogLevel.HTTP,
        debug: LogLevel.DEBUG,
      },
      format: winston.format.json(),
      transports,
    });

    // Create the server logger interface
    serverLogger = {
      error: (message: LogMessage, data?: LogData) => {
        winstonLogger.error(message, { data });
      },
      warn: (message: LogMessage, data?: LogData) => {
        winstonLogger.warn(message, { data });
      },
      info: (message: LogMessage, data?: LogData) => {
        winstonLogger.info(message, { data });
      },
      http: (message: LogMessage, data?: LogData) => {
        winstonLogger.http(message, { data });
      },
      debug: (message: LogMessage, data?: LogData) => {
        winstonLogger.debug(message, { data });
      },
    };

    return serverLogger;
  } catch (error) {
    // If winston fails to load, fallback to console
    console.error('Failed to initialize server logger, using console fallback', error);
    return clientLogger;
  }
};

// Create a proxy that will use the appropriate logger based on environment
const logger = new Proxy<LoggerInterface>({} as LoggerInterface, {
  get(target, prop) {
    // Determine if we're in a browser environment
    const isClient = typeof window !== 'undefined';
    
    // Use the appropriate logger
    const currentLogger = isClient ? clientLogger : getServerLogger();
    
    // Return the requested method
    return currentLogger[prop as keyof LoggerInterface];
  },
});

export { logger };