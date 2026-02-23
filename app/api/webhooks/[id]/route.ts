import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { ApiError } from '@/lib/api-error'
import { uuidSchema } from '@/lib/validation/schemas'
import { z } from 'zod'

interface RouteContext {
  params: Promise<{ id: string }>
}

const updateWebhookSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  events: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
}).refine(obj => Object.keys(obj).length > 0, 'At least one field must be provided')

// PATCH — update webhook
export const PATCH = createApiHandler(
  async (request: NextRequest, { auth }, routeContext?: RouteContext) => {
    const params = await routeContext?.params
    if (!params?.id) throw new ApiError(400, 'Missing webhook ID', 'MISSING_ID')
    const id = uuidSchema.parse(params.id)

    const body = await request.json()
    const parsed = updateWebhookSchema.safeParse(body)
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Invalid input', 'VALIDATION_ERROR')
    }

    const updates: Record<string, unknown> = {}
    if (parsed.data.name !== undefined) updates.name = parsed.data.name
    if (parsed.data.url !== undefined) updates.url = parsed.data.url
    if (parsed.data.events !== undefined) updates.events = parsed.data.events
    if (parsed.data.is_active !== undefined) updates.is_active = parsed.data.is_active

    // SECURITY: Explicit select to avoid leaking webhook secret
    const { data, error } = await auth.supabase
      .from('webhooks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', auth.user.id)
      .select('id, name, url, events, is_active, created_at, updated_at')
      .single()

    if (error) throw error
    if (!data) throw new ApiError(404, 'Webhook not found', 'NOT_FOUND')

    return NextResponse.json(data)
  },
  { requireAuth: true, method: 'PATCH' }
)

// DELETE — remove webhook
export const DELETE = createApiHandler(
  async (request: NextRequest, { auth }, routeContext?: RouteContext) => {
    const params = await routeContext?.params
    if (!params?.id) throw new ApiError(400, 'Missing webhook ID', 'MISSING_ID')
    const id = uuidSchema.parse(params.id)

    const { error } = await auth.supabase
      .from('webhooks')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.user.id)

    if (error) throw error

    return NextResponse.json({ message: 'Webhook deleted' })
  },
  { requireAuth: true, method: 'DELETE' }
)
