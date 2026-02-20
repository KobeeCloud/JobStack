import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { ApiError } from '@/lib/api-error'
import { uuidSchema } from '@/lib/validation/schemas'
import { log } from '@/lib/logger'

interface RouteContext {
  params: Promise<{ id: string }>
}

// PATCH — mark single notification as read / unread
export const PATCH = createApiHandler(
  async (request: NextRequest, { auth }, routeContext?: RouteContext) => {
    const params = await routeContext?.params
    if (!params?.id) throw new ApiError(400, 'Missing notification id', 'MISSING_PARAMS')

    const notificationId = uuidSchema.parse(params.id)
    const body = await request.json().catch(() => ({}))
    const isRead: boolean = body.is_read !== false // default true

    const { data, error } = await auth.supabase
      .from('notifications')
      .update({
        is_read: isRead,
        read_at: isRead ? new Date().toISOString() : null,
      })
      .eq('id', notificationId)
      .eq('user_id', auth.user.id)
      .select()
      .single()

    if (error || !data) {
      throw new ApiError(404, 'Notification not found', 'NOT_FOUND')
    }

    log.info('Notification updated', { notificationId, isRead, userId: auth.user.id })
    return NextResponse.json(data)
  },
  { requireAuth: true, method: 'PATCH' }
)

// DELETE — remove notification
export const DELETE = createApiHandler(
  async (_request: NextRequest, { auth }, routeContext?: RouteContext) => {
    const params = await routeContext?.params
    if (!params?.id) throw new ApiError(400, 'Missing notification id', 'MISSING_PARAMS')

    const notificationId = uuidSchema.parse(params.id)

    const { error } = await auth.supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', auth.user.id)

    if (error) {
      log.error('Failed to delete notification', error, { notificationId })
      throw error
    }

    return NextResponse.json({ success: true })
  },
  { requireAuth: true, method: 'DELETE' }
)
