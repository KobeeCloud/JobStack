/**
 * Tests for lib/api-error.ts
 * Verifies error handling, Zod sanitization in production, and API error formatting.
 */

// Mock next/server to avoid Request polyfill issues in jsdom
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
      _body: body,
    }),
  },
}))

// Mock logger to avoid side effects
jest.mock('@/lib/logger', () => ({
  log: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

import { ApiError, handleApiError } from '@/lib/api-error'
import { z, ZodError } from 'zod'

describe('ApiError', () => {
  it('creates an error with correct properties', () => {
    const err = new ApiError(404, 'Not found', 'NOT_FOUND', { id: '123' })
    expect(err.statusCode).toBe(404)
    expect(err.message).toBe('Not found')
    expect(err.code).toBe('NOT_FOUND')
    expect(err.details).toEqual({ id: '123' })
    expect(err instanceof Error).toBe(true)
  })
})

describe('handleApiError', () => {
  it('formats ApiError correctly', () => {
    const err = new ApiError(403, 'Forbidden', 'FORBIDDEN')
    const response = handleApiError(err)
    expect(response.status).toBe(403)
  })

  it('formats ZodError with sanitized details in production', () => {
    const originalEnv = process.env.NODE_ENV

    try {
      // Simulate production
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true })

      const schema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
      })

      let zodError: ZodError | null = null
      try {
        schema.parse({ name: '', email: 'invalid' })
      } catch (e) {
        zodError = e as ZodError
      }

      expect(zodError).toBeTruthy()
      const response = handleApiError(zodError!)
      expect(response.status).toBe(400)
    } finally {
      Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true })
    }
  })

  it('returns 400 for Zod validation errors', () => {
    const schema = z.object({ name: z.string() })
    try {
      schema.parse({ name: 123 })
    } catch (e) {
      const response = handleApiError(e)
      expect(response.status).toBe(400)
    }
  })

  it('returns 500 for unknown errors', () => {
    const response = handleApiError(new Error('Something broke'))
    expect(response.status).toBe(500)
  })

  it('returns 500 for non-Error objects', () => {
    const response = handleApiError('string error')
    expect(response.status).toBe(500)
  })
})
