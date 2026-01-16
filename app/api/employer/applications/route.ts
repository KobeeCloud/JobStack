import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const statusMap: Record<string, string> = {
  pending: 'new',
  viewed: 'reviewed',
  rejected: 'rejected',
  hired: 'hired',
  new: 'new',
  reviewed: 'reviewed',
  interview: 'interview',
  offered: 'offered',
};

const formatSalary = (min?: number | null, max?: number | null, currency: string = 'PLN') => {
  if (!min && !max) return '';
  if (min && max) return `${min.toLocaleString('pl-PL')} - ${max.toLocaleString('pl-PL')} ${currency}`;
  if (min) return `od ${min.toLocaleString('pl-PL')} ${currency}`;
  return `do ${max?.toLocaleString('pl-PL')} ${currency}`;
};

const formatExperience = (years?: number | null, fallback?: string | null) => {
  if (typeof years === 'number') {
    return years === 1 ? '1 rok' : `${years} lat`;
  }
  return fallback || '';
};

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: employerProfile } = await supabase
      .from('employer_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (!employerProfile?.company_id) {
      return NextResponse.json({ error: 'Employer profile not found' }, { status: 404 });
    }

    const { data: jobs } = await supabaseAdmin
      .from('jobs')
      .select('id, title')
      .eq('company_id', employerProfile.company_id);

    const jobIds = (jobs || []).map((job) => job.id);
    const jobTitleMap = new Map((jobs || []).map((job) => [job.id, job.title]));

    if (jobIds.length === 0) {
      return NextResponse.json({ applications: [] });
    }

    let applications: any[] = [];
    let extendedColumns = true;

    const { data: extendedData, error: extendedError } = await supabaseAdmin
      .from('applications')
      .select(
        'id, job_id, candidate_id, first_name, last_name, email, phone, status, created_at, cv_url, cover_letter, linkedin_url, github_url, portfolio_url, years_experience, current_position, expected_salary_min, expected_salary_max'
      )
      .in('job_id', jobIds)
      .order('created_at', { ascending: false });

    if (extendedError && extendedError.code === '42703') {
      extendedColumns = false;
      const { data: baseData, error: baseError } = await supabaseAdmin
        .from('applications')
        .select('id, job_id, candidate_id, cv_url, cover_letter, status, created_at')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false });

      if (baseError) {
        console.error('Error fetching applications:', baseError);
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
      }

      applications = baseData || [];
    } else if (extendedError) {
      console.error('Error fetching applications:', extendedError);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    } else {
      applications = extendedData || [];
    }

    const candidateIds = applications
      .map((app) => app.candidate_id)
      .filter(Boolean) as string[];

    let candidateProfiles: any[] = [];
    let profiles: any[] = [];

    if (candidateIds.length > 0) {
      const { data: candidateData } = await supabaseAdmin
        .from('candidate_profiles')
        .select('user_id, first_name, last_name, skills, linkedin_url, github_url, portfolio_url, experience, cv_url')
        .in('user_id', candidateIds);
      candidateProfiles = candidateData || [];

      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .in('id', candidateIds);
      profiles = profileData || [];
    }

    const candidateMap = new Map(candidateProfiles.map((profile) => [profile.user_id, profile]));
    const emailMap = new Map(profiles.map((profile) => [profile.id, profile.email]));

    const view = applications.map((app) => {
      const candidateProfile = candidateMap.get(app.candidate_id) || {};
      const candidateName = [app.first_name || candidateProfile.first_name, app.last_name || candidateProfile.last_name]
        .filter(Boolean)
        .join(' ') || 'Kandydat';

      const email = app.email || emailMap.get(app.candidate_id) || '';
      const experience = formatExperience(app.years_experience, candidateProfile.experience);
      const salaryExpectation = formatSalary(app.expected_salary_min, app.expected_salary_max);

      return {
        id: app.id,
        jobId: app.job_id,
        jobTitle: jobTitleMap.get(app.job_id) || 'Oferta pracy',
        candidateName,
        email,
        phone: app.phone || '',
        appliedAt: app.created_at,
        status: statusMap[app.status] || app.status || 'new',
        experience,
        currentPosition: app.current_position || candidateProfile.title || '',
        cvUrl: app.cv_url || candidateProfile.cv_url || '',
        linkedIn: app.linkedin_url || candidateProfile.linkedin_url || '',
        coverLetter: app.cover_letter || '',
        techStack: candidateProfile.skills || [],
        salaryExpectation,
        rating: 0,
        notes: '',
      };
    });

    return NextResponse.json({ applications: view });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
