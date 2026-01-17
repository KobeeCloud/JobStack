import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const path = request.nextUrl.searchParams.get('path');
    if (!path) {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 });
    }

    if (!path.startsWith(`${user.id}/`)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin.storage
      .from('cvs')
      .createSignedUrl(path, 60 * 60);

    if (error) {
      return NextResponse.json({ error: 'Failed to sign URL' }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: data?.signedUrl || null });
  } catch (error) {
    console.error('CV signed error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
