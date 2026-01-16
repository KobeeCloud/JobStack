import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const role = requestUrl.searchParams.get('role');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    if (role) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({ data: { role } });

        await supabaseAdmin
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email || '',
            role: role === 'employer' ? 'employer' : 'candidate',
          }, { onConflict: 'id' });

        const isEmployer = role === 'employer';
        const table = isEmployer ? 'employer_profiles' : 'candidate_profiles';
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
