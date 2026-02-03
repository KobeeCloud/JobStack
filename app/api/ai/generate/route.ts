import { NextRequest, NextResponse } from 'next/server'
import { generateDiagramFromText } from '@/lib/ai/openai-client'
import { createApiHandler } from '@/lib/api-helpers'
import { z } from 'zod'

const generateSchema = z.object({
  description: z.string().min(10).max(500),
})

export const POST = createApiHandler(
  async (request: NextRequest) => {
    const body = await request.json()
    const { description } = generateSchema.parse(body)

    const diagram = await generateDiagramFromText(description)

    if (!diagram) {
      return NextResponse.json(
        { error: 'Failed to generate diagram. Please try rephrasing your description.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ diagram })
  },
  { requireAuth: true }
)
