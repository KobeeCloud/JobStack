/**
 * Tests for lib/rate-limit.ts
 * Verifies in-memory rate limiter works correctly as fallback.
 */

// Mock @upstash modules to avoid ESM/uncrypto issues in Jest
jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: class MockRatelimit {
    static slidingWindow() { return {} }
    constructor() {}
    async limit() { return { success: true, limit: 100, remaining: 99, reset: Date.now() + 60000 } }
  },
}))
jest.mock('@upstash/redis', () => ({
  Redis: class MockRedis { constructor() {} },
}))
jest.mock('@/lib/logger', () => ({
  log: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

import { generalRateLimit, authRateLimit, checkRateLimit } from '@/lib/rate-limit'

describe('generalRateLimit (in-memory fallback)', () => {
  it('allows requests under the limit', async () => {
    const id = `test-general-${Date.now()}`
    const result = await generalRateLimit.limit(id)
    expect(result.success).toBe(true)
    expect(result.remaining).toBeGreaterThanOrEqual(0)
  })

  it('tracks requests for same identifier', async () => {
    const id = `test-tracking-${Date.now()}`
    const r1 = await generalRateLimit.limit(id)
    const r2 = await generalRateLimit.limit(id)
    expect(r2.remaining).toBeLessThan(r1.remaining)
  })
})

describe('authRateLimit (in-memory fallback)', () => {
  it('allows initial request', async () => {
    const id = `test-auth-${Date.now()}`
    const result = await authRateLimit.limit(id)
    expect(result.success).toBe(true)
  })

  it('blocks after 5 requests (stricter limit)', async () => {
    const id = `test-auth-block-${Date.now()}`
    // Auth limit is 5 per minute
    for (let i = 0; i < 5; i++) {
      await authRateLimit.limit(id)
    }
    const blocked = await authRateLimit.limit(id)
    expect(blocked.success).toBe(false)
    expect(blocked.remaining).toBe(0)
  })
})

describe('checkRateLimit', () => {
  it('returns success for new identifiers', async () => {
    const id = `test-check-${Date.now()}`
    const result = await checkRateLimit(id)
    expect(result.success).toBe(true)
  })
})
