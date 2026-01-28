import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler, applyRateLimit } from '@/lib/api-helpers'
import { estimateCostSchema } from '@/lib/validation/schemas'
import { calculateInfrastructureCost } from '@/lib/cost-calculator'
import { logger, log } from '@/lib/logger'

export const POST = createApiHandler(
  async (request: NextRequest, { auth, body }) => {
    try {
      if (!body) {
        throw new Error('Missing request body')
      }
      const costEstimate = calculateInfrastructureCost(body.nodes)
      return NextResponse.json(costEstimate)
    } catch (error) {
      log.error('Failed to estimate cost', error, { userId: auth.user.id })
      throw error
    }
  },
  {
    requireAuth: true,
    validateBody: estimateCostSchema,
    method: 'POST',
  }
)
