import { NextRequest, NextResponse } from 'next/server'
import { createClient } from './supabase/server'
import { checkRateLimit, authRateLimit } from './rate-limit'
import { handleApiError, ApiError } from './api-error'
import { logger } from './logger'
import { ZodSchema } from 'zod'

export interface AuthenticatedRequest {
  user: { id: string; email: string }
  supabase: Awaited<ReturnType<typeof createClient>>
}

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedRequest> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED')
  }

  return {
    user: {
      id: user.id,
      email: user.email || '',
    },
    supabase,
  }
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequestBody<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    throw error
  }
}

/**
 * Apply rate limiting to request
 */
export async function applyRateLimit(
  request: NextRequest,
  limiter: typeof checkRateLimit = checkRateLimit
): Promise<void> {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const result = await limiter(ip)

  if (!result.success) {
    throw new ApiError(
      429,
      'Too many requests. Please try again later.',
      'RATE_LIMIT_EXCEEDED',
      { reset: result.reset }
    )
  }
}

/**
 * Wrapper for API route handlers with authentication, validation, and error handling
 */
export function createApiHandler<T = unknown>(
  handler: (req: NextRequest, context: { auth: AuthenticatedRequest; body?: T }, routeContext?: any) => Promise<NextResponse>,
  options?: {
    requireAuth?: boolean
    validateBody?: ZodSchema<T>
    rateLimit?: typeof checkRateLimit
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  }
) {
  return async (request: NextRequest, routeContext?: any): Promise<NextResponse> => {
    try {
      // Check HTTP method
      if (options?.method && request.method !== options.method) {
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
      }

      // Apply rate limiting
      if (options?.rateLimit) {
        await applyRateLimit(request, options.rateLimit)
      } else {
        await applyRateLimit(request)
      }

      // Get authenticated user if required
      let auth: AuthenticatedRequest | null = null
      if (options?.requireAuth !== false) {
        auth = await getAuthenticatedUser(request)
      } else {
        // For optional auth endpoints, try to get user but don't fail
        try {
          auth = await getAuthenticatedUser(request)
        } catch {
          // User not logged in - that's ok for public endpoints
          auth = null
        }
      }

      // Validate request body if schema provided
      let body: T | undefined
      if (options?.validateBody && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
        body = await validateRequestBody(request, options.validateBody)
      }

      // Call handler - pass routeContext for dynamic routes
      return await handler(request, { auth: auth as any, body }, routeContext)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Create timeout promise
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new ApiError(504, 'Request timeout', 'TIMEOUT')), timeoutMs)
    ),
  ])
}

/**
 * Fetch with timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(504, 'Request timeout', 'TIMEOUT')
    }
    throw error
  }
}
