import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const hasBucket = buckets?.some((bucket) => bucket.name === 'cvs');
    if (!hasBucket) {
      return NextResponse.json({ files: [] });
    }

    const { data: files, error } = await supabaseAdmin.storage
      .from('cvs')
      .list(user.id, {
        limit: 100,
        sortBy: { column: 'updated_at', order: 'desc' },
      });

    if (error) {
      return NextResponse.json({ error: 'Failed to list CVs' }, { status: 500 });
    }

    const fileItems = (files || []).filter((item) => item.name && item.id);

    const signed = await Promise.all(
      fileItems.map(async (item) => {
        const path = `${user.id}/${item.name}`;
        const { data: signedUrl } = await supabaseAdmin.storage
          .from('cvs')
          .createSignedUrl(path, 60 * 60);
        return {
          path,
          name: item.name,
          updated_at: item.updated_at,
          signedUrl: signedUrl?.signedUrl || null,
        };
      })
    );

    return NextResponse.json({ files: signed });
  } catch (error) {
    console.error('CV list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
