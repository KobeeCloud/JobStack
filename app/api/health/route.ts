import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()
  let dbStatus: 'ok' | 'error' = 'ok'
  let dbLatencyMs: number | null = null

  try {
    const supabase = await createClient()
    const dbStart = Date.now()
    const { error } = await supabase.from('profiles').select('id').limit(1)
    dbLatencyMs = Date.now() - dbStart
    if (error) dbStatus = 'error'
  } catch {
    dbStatus = 'error'
  }

  const healthy = dbStatus === 'ok'

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      latencyMs: Date.now() - start,
      services: {
        database: { status: dbStatus, latencyMs: dbLatencyMs },
      },
      version: process.env.npm_package_version ?? '0.0.0',
    },
    { status: healthy ? 200 : 503 }
  )
}
