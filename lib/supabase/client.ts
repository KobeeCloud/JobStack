import { createBrowserClient } from '@supabase/ssr'
import { createMockSupabaseClient } from './mock-client'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Use mock client if env vars not configured
  if (!url || !key || url.includes('your-project') || key.includes('your-')) {
    console.warn('⚠️  Using mock Supabase client - configure .env.local for real backend')
    return createMockSupabaseClient() as any
  }

  return createBrowserClient(url, key)
}
