import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create a lazy-initialized admin client to avoid throwing at module load time
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) {
    return _supabaseAdmin;
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables for admin client');
    // Return a dummy client that will fail gracefully
    throw new Error('Supabase admin client not configured - check SUPABASE_SERVICE_ROLE_KEY');
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-supabase-bypass-rls': 'true',
      },
    },
  });

  return _supabaseAdmin;
}

// Export as a getter to lazy-initialize
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseAdmin();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});
