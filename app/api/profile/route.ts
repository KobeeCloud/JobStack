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
      phone,
      location,
      bio,
      title,
      yearsExperience,
      currentPosition,
      expectedSalaryMin,
      expectedSalaryMax,
      availableFrom,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      skills,
      cvUrl,
      publicProfile,
    } = body;

    // Update candidate profile
    const { error: updateError } = await supabaseAdmin
      .from('candidate_profiles')
      .upsert({
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        phone,
        location,
        bio,
        title,
        years_experience: yearsExperience ? parseInt(yearsExperience) : null,
        current_position: currentPosition,
        expected_salary_min: expectedSalaryMin ? parseInt(expectedSalaryMin) : null,
        expected_salary_max: expectedSalaryMax ? parseInt(expectedSalaryMax) : null,
        available_from: availableFrom || null,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        portfolio_url: portfolioUrl,
        skills: skills || [],
        resume_url: cvUrl,
        public_profile: publicProfile || false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

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
