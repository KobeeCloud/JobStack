import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a lazy-initialized client to avoid throwing at module load time
let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) {
    return _supabase;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    throw new Error('Supabase client not configured - check environment variables');
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

// Export as a getter to lazy-initialize
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabase();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});
