import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown' as 'ok' | 'error' | 'unknown',
    },
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('profiles').select('id').limit(1)

    if (error) {
      health.services.database = 'error'
      return NextResponse.json(health, { status: 503 })
    }

    health.services.database = 'ok'
    return NextResponse.json(health)
  } catch (error) {
    health.services.database = 'error'
    return NextResponse.json(health, { status: 503 })
  }
}
