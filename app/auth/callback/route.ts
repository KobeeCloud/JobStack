import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const roleParam = requestUrl.searchParams.get('role');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      let resolvedRole: 'candidate' | 'employer' | null = null;

      if (roleParam === 'employer' || roleParam === 'candidate') {
        resolvedRole = roleParam;
      } else if (user.user_metadata?.role === 'employer' || user.user_metadata?.role === 'candidate') {
        resolvedRole = user.user_metadata.role;
      } else {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role === 'employer' || profile?.role === 'candidate') {
          resolvedRole = profile.role;
        }
      }

      if (resolvedRole) {
        await supabase.auth.updateUser({ data: { role: resolvedRole } });

        await supabaseAdmin
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email || '',
            role: resolvedRole,
          }, { onConflict: 'id' });

        const table = resolvedRole === 'employer' ? 'employer_profiles' : 'candidate_profiles';
        const { data: existing } = await supabaseAdmin
          .from(table)
          .select('id')
          .eq('user_id', user.id);

        if (!existing || existing.length === 0) {
          await supabaseAdmin
            .from(table)
            .insert({ user_id: user.id });
        }
      }
    }
  }

  // Redirect to dashboard after successful auth
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
