import pino from 'pino'

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
})

// Helper functions for different log levels
export const log = {
  info: (message: string, data?: Record<string, unknown>) => logger.info(data, message),
  error: (message: string, error?: Error | unknown, data?: Record<string, unknown>) => {
    if (error instanceof Error) {
      logger.error({ ...data, err: error, stack: error.stack }, message)
    } else {
      logger.error(data, message)
    }
  },
  warn: (message: string, data?: Record<string, unknown>) => logger.warn(data, message),
  debug: (message: string, data?: Record<string, unknown>) => logger.debug(data, message),
}
