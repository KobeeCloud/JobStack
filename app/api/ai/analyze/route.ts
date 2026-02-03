import { NextRequest, NextResponse } from 'next/server'
import { analyzeArchitecture } from '@/lib/ai/architecture-analyzer'
import { createApiHandler } from '@/lib/api-helpers'
import { z } from 'zod'

const analyzeSchema = z.object({
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
})

export const POST = createApiHandler(
  async (request: NextRequest) => {
    const body = await request.json()
    const { nodes, edges } = analyzeSchema.parse(body)

    const issues = await analyzeArchitecture(nodes, edges)

    return NextResponse.json({ issues, count: issues.length })
  },
  { requireAuth: true }
)
