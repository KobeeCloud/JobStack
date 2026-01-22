import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { calculateInfrastructureCost } from '@/lib/cost-calculator'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { nodes } = body

  const costEstimate = calculateInfrastructureCost(nodes)

  return NextResponse.json(costEstimate)
}
