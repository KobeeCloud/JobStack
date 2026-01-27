import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis client (use environment variables or fallback to mock)
let redis: Redis | null = null
let ratelimit: Ratelimit | null = null

try {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (redisUrl && redisToken) {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    })

    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
      analytics: true,
    })
  }
} catch (error) {
  // Fallback to no rate limiting if Redis is not configured
  // This is fine for free tier - rate limiting is optional
}

// Rate limiters for different endpoints
export const generalRateLimit = ratelimit
  ? ratelimit
  : {
      limit: async () => ({ success: true, limit: 100, remaining: 100, reset: Date.now() }),
    }

export const authRateLimit = ratelimit
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute for auth
      analytics: true,
    })
  : {
      limit: async () => ({ success: true, limit: 5, remaining: 5, reset: Date.now() }),
    }

export async function checkRateLimit(
  identifier: string,
  limiter: typeof generalRateLimit = generalRateLimit
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (!ratelimit) {
    // No rate limiting configured - allow all requests
    return { success: true, limit: 100, remaining: 100, reset: Date.now() }
  }

  return await limiter.limit(identifier)
}
