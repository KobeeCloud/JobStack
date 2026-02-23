import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { ApiError } from '@/lib/api-error'
import { z } from 'zod'

const WEBHOOK_EVENTS = [
  'project.created',
  'project.updated',
  'project.deleted',
  'diagram.saved',
  'diagram.exported',
  'member.joined',
  'member.left',
] as const

const createWebhookSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  url: z.string().url('Invalid URL').refine(
    (u) => { try { const p = new URL(u); return ['http:', 'https:'].includes(p.protocol) } catch { return false } },
    'URL must use http or https'
  ),
  events: z.array(z.enum(WEBHOOK_EVENTS)).min(1, 'At least one valid event is required'),
})

// GET — list user's webhooks
export const GET = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const { data, error } = await auth.supabase
      .from('webhooks')
      .select('id, name, url, events, is_active, last_triggered_at, failure_count, created_at')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  },
  { requireAuth: true, method: 'GET' }
)

// POST — create a new webhook
export const POST = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const body = await request.json()
    const parsed = createWebhookSchema.safeParse(body)
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors[0]?.message ?? 'Invalid input', 'VALIDATION_ERROR')
    }

    const { name, url, events } = parsed.data

    // Limit to 10 webhooks per user
    const { count } = await auth.supabase
      .from('webhooks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', auth.user.id)

    if ((count || 0) >= 10) {
      throw new ApiError(400, 'Maximum 10 webhooks allowed', 'WEBHOOK_LIMIT')
    }

    const { data, error } = await auth.supabase
      .from('webhooks')
      .insert({
        user_id: auth.user.id,
        name,
        url,
        events,
      })
      .select('id, name, url, secret, events, is_active, created_at')
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  },
  { requireAuth: true, method: 'POST' }
)
