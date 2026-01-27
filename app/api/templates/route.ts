import { NextRequest, NextResponse } from 'next/server'
import { createApiHandler, applyRateLimit } from '@/lib/api-helpers'
import { logger } from '@/lib/logger'

export const GET = createApiHandler(
  async (request: NextRequest, { auth }) => {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = auth.supabase
      .from('templates')
      .select('*')
      .eq('is_public', true)

    if (category) {
      query = query.eq('category', category)
    }

    const { data: templates, error } = await query.order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch templates', error)
      throw error
    }

    return NextResponse.json(templates || [])
  },
  { requireAuth: false, method: 'GET' }
)
