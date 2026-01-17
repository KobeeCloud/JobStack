import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF and DOC/DOCX files are allowed' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedEmail = (user.email || user.id).replace(/[^a-zA-Z0-9]/g, '_');
    const fileExt = file.name.split('.').pop();
    const filename = `cv_${sanitizedEmail}_${timestamp}.${fileExt}`;

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const hasBucket = buckets?.some((bucket) => bucket.name === 'cvs');
    if (!hasBucket) {
      await supabaseAdmin.storage.createBucket('cvs', {
        public: false,
        fileSizeLimit: '5MB',
      });
    }

    const { data: candidateProfile } = await supabaseAdmin
      .from('candidate_profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();

    const namePart = [candidateProfile?.first_name, candidateProfile?.last_name]
      .filter(Boolean)
      .join('_') || 'profile';
    const safeNamePart = namePart.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeOriginal = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('cvs')
      .upload(`${user.id}/${safeNamePart}_${timestamp}_${safeOriginal}`, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get signed URL
    const { data: urlData } = await supabaseAdmin.storage
      .from('cvs')
      .createSignedUrl(data.path, 60 * 60);

    return NextResponse.json({
      success: true,
      url: urlData?.signedUrl,
      path: data.path,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
