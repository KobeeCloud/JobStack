import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler } from '@/lib/api-helpers'
import { log } from '@/lib/logger'

export const GET = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('org_id')
    const action = searchParams.get('action')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const offset = (page - 1) * limit

    let query = auth.supabase
      .from('activity_log')
      .select(
        `
        id,
        action,
        resource_type,
        resource_id,
        metadata,
        ip_address,
        created_at,
        actor:profiles!user_id (
          full_name,
          avatar_url
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (orgId) {
      // Verify caller is a member of the org before showing org logs
      const { data: membership } = await auth.supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', auth.user.id)
        .single()

      if (!membership) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      query = query.eq('organization_id', orgId)
    } else {
      // Personal log — only own actions
      query = query.eq('user_id', auth.user.id)
    }

    if (action) {
      query = query.eq('action', action)
    }

    const { data: logs, error, count } = await query

    if (error) {
      log.error('Failed to fetch audit log', error, { userId: auth.user.id })
      throw error
    }

    return NextResponse.json({
      logs: logs ?? [],
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    })
  },
  { requireAuth: true, method: 'GET' }
)
