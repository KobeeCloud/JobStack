import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { log } from '@/lib/logger'

export const GET = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100)

    let query = auth.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: notifications, error } = await query

    if (error) {
      log.error('Failed to fetch notifications', error, { userId: auth.user.id })
      throw error
    }

    const { count: unreadCount } = await auth.supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', auth.user.id)
      .eq('is_read', false)

    return NextResponse.json({
      notifications: notifications ?? [],
      unreadCount: unreadCount ?? 0,
    })
  },
  { requireAuth: true, method: 'GET' }
)

// Mark all as read
export const POST = createApiHandler(
  async (_request: NextRequest, { auth }) => {
    const { error } = await auth.supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', auth.user.id)
      .eq('is_read', false)

    if (error) {
      log.error('Failed to mark all notifications as read', error, { userId: auth.user.id })
      throw error
    }

    log.info('All notifications marked as read', { userId: auth.user.id })
    return NextResponse.json({ success: true })
  },
  { requireAuth: true, method: 'POST' }
)
