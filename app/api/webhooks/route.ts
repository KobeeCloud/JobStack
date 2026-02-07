import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK_EVENTS = [
  'project.created',
  'project.updated',
  'project.deleted',
  'diagram.saved',
  'diagram.exported',
  'member.joined',
  'member.left',
]

// GET — list user's webhooks
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('webhooks')
      .select('id, name, url, events, is_active, last_triggered_at, failure_count, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('List webhooks error:', error)
    return NextResponse.json({ error: 'Failed to list webhooks' }, { status: 500 })
  }
}

// POST — create a new webhook
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, url, events } = body

    if (!name || !url) {
      return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 })
    }

    // Validate URL
    try {
      const parsed = new URL(url)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol')
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // Validate events
    const validEvents = (events || []).filter((e: string) => WEBHOOK_EVENTS.includes(e))
    if (validEvents.length === 0) {
      return NextResponse.json({ error: 'At least one valid event is required' }, { status: 400 })
    }

    // Limit to 10 webhooks per user
    const { count } = await supabase
      .from('webhooks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count || 0) >= 10) {
      return NextResponse.json({ error: 'Maximum 10 webhooks allowed' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        user_id: user.id,
        name,
        url,
        events: validEvents,
      })
      .select('id, name, url, secret, events, is_active, created_at')
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Create webhook error:', error)
    return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 })
  }
}
