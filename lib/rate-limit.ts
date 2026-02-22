import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ── In-memory sliding-window fallback (ST-3) ────────────────────────────────
// Used when Upstash Redis is not configured so that rate-limiting still works.
const inMemoryStore = new Map<string, { count: number; resetAt: number }>()

function inMemoryLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number,
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now()
  const entry = inMemoryStore.get(identifier)
  if (!entry || now > entry.resetAt) {
    inMemoryStore.set(identifier, { count: 1, resetAt: now + windowMs })
    return { success: true, limit: maxRequests, remaining: maxRequests - 1, reset: now + windowMs }
  }
  entry.count++
  const remaining = Math.max(0, maxRequests - entry.count)
  return {
    success: entry.count <= maxRequests,
    limit: maxRequests,
    remaining,
    reset: entry.resetAt,
  }
}

// Periodically purge expired entries so the Map doesn't grow forever.
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of inMemoryStore) {
    if (now > entry.resetAt) inMemoryStore.delete(key)
  }
}, 60_000)

// ── Redis-backed rate limiter (when available) ───────────────────────────────
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
} catch {
  // Redis init failed — the in-memory fallback will be used automatically.
}

// Rate limiters for different endpoints
export const generalRateLimit = ratelimit
  ? ratelimit
  : {
      limit: async (id: string) => inMemoryLimit(id, 100, 60_000),
    }

export const authRateLimit = ratelimit
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute for auth
      analytics: true,
    })
  : {
      limit: async (id: string) => inMemoryLimit(id, 5, 60_000),
    }

export async function checkRateLimit(
  identifier: string,
  limiter: typeof generalRateLimit = generalRateLimit
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  return await limiter.limit(identifier)
}
