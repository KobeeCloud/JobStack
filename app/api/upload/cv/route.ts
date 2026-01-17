import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const emailFromForm = (formData.get('email') as string | null) || null;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
    const fileExt = file.name.split('.').pop();
    const filename = `cv_${timestamp}.${fileExt}`;

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

    let ownerFolder = 'guest';
    let safeNamePart = 'profile';

    if (user) {
      ownerFolder = user.id;
      const { data: candidateProfile } = await supabaseAdmin
        .from('candidate_profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();

      const namePart = [candidateProfile?.first_name, candidateProfile?.last_name]
        .filter(Boolean)
        .join('_') || 'profile';
      safeNamePart = namePart.replace(/[^a-zA-Z0-9_-]/g, '_');
    } else if (emailFromForm) {
      const hash = createHash('sha256').update(emailFromForm).digest('hex').slice(0, 12);
      ownerFolder = `guest/${hash}`;
      safeNamePart = emailFromForm.replace(/[^a-zA-Z0-9_-]/g, '_');
    } else {
      return NextResponse.json({ error: 'Email is required for CV upload' }, { status: 400 });
    }

    const safeOriginal = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('cvs')
      .upload(`${ownerFolder}/${safeNamePart}_${timestamp}_${safeOriginal}`, buffer, {
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
