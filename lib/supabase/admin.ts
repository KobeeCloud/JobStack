import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { log } from '../logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let _supabaseAdmin: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) {
    return _supabaseAdmin
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    log.error('Missing Supabase environment variables for admin client')
    throw new Error('Supabase admin client not configured - check environment variables')
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return _supabaseAdmin
}

export function createAdminClient() {
  return getSupabaseAdmin()
}
