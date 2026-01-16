import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // Get candidate or employer profile based on role
    if (profile.role === 'candidate') {
      const { data: candidateProfile } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return NextResponse.json({
        ...profile,
        candidateProfile: candidateProfile || null,
      });
    } else {
      const { data: employerProfile } = await supabase
        .from('employer_profiles')
        .select('*, companies(*)')
        .eq('user_id', user.id)
        .single();

      return NextResponse.json({
        ...profile,
        employerProfile: employerProfile || null,
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      title,
      experience,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      skills,
      cvUrl,
    } = body;

    const basePayload = {
      user_id: user.id,
      first_name: firstName || null,
      last_name: lastName || null,
      title: title || null,
      experience: experience || null,
      linkedin_url: linkedinUrl || null,
      github_url: githubUrl || null,
      portfolio_url: portfolioUrl || null,
      skills: Array.isArray(skills) ? skills : [],
      cv_url: cvUrl || null,
      updated_at: new Date().toISOString(),
    };

    // Try extended payload first (if columns exist), fallback to base schema
    const extendedPayload = {
      ...basePayload,
      resume_url: cvUrl || null,
      public_profile: false,
    };

    let updateError = null;
    const { error: extendedError } = await supabaseAdmin
      .from('candidate_profiles')
      .upsert(extendedPayload, { onConflict: 'user_id' });

    if (extendedError && extendedError.code === '42703') {
      const { error: baseError } = await supabaseAdmin
        .from('candidate_profiles')
        .upsert(basePayload, { onConflict: 'user_id' });
      updateError = baseError;
    } else {
      updateError = extendedError;
    }

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
