import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { log } from './logger'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): NextResponse {
  // Log error server-side
  if (error instanceof ApiError) {
    log.error('API Error', error, {
      statusCode: error.statusCode,
      code: error.code,
      details: error.details,
    })

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(process.env.NODE_ENV === 'development' && { details: error.details }),
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof ZodError) {
    log.warn('Validation Error', { errors: error.errors })

    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.errors,
        ...(process.env.NODE_ENV === 'development' && { fullError: error }),
      },
      { status: 400 }
    )
  }

  // Unknown error - don't expose internal details in production
  log.error('Unknown API Error', error)

  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }),
    },
    { status: 500 }
  )
}

export function createErrorResponse(
  statusCode: number,
  message: string,
  code?: string,
  details?: unknown
): NextResponse {
  return handleApiError(new ApiError(statusCode, message, code, details))
}
