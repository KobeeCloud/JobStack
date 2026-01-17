import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { fetchGreenhouseJobs, fetchLeverJobs } from '@/lib/utils/ats-importer';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'employer') {
      return NextResponse.json({ error: 'Only employers can import jobs.' }, { status: 403 });
    }

    const body = await request.json();
    const { provider, company } = body as { provider?: 'lever' | 'greenhouse'; company?: string };

    if (!provider || !company) {
      return NextResponse.json({ error: 'Missing provider or company.' }, { status: 400 });
    }

    const { data: employerProfile } = await supabase
      .from('employer_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    const companyId = employerProfile?.company_id || null;
    const { data: companyData } = companyId
      ? await supabaseAdmin.from('companies').select('name, logo_url').eq('id', companyId).single()
      : { data: null };

    const rawJobs = provider === 'lever'
      ? await fetchLeverJobs(company)
      : await fetchGreenhouseJobs(company);

    const jobs = rawJobs.filter((job) => {
      const location = (job.location || '').toLowerCase();
      return location.includes('poland') || location.includes('polska') || location.includes('pl') || location.includes('warsaw') || location.includes('krak') || location.includes('wroc') || location.includes('pozn') || location.includes('gdansk') || location.includes('gdańsk') || location.includes('katow') || location.includes('lodz') || location.includes('łódź') || location.includes('remote poland') || location.includes('zdalnie');
    });

    const prettyCompanyName = company
      .replace(/[-_]+/g, ' ')
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    if (jobs.length === 0) {
      return NextResponse.json({ error: 'No job postings found for this ATS (Poland only).' }, { status: 422 });
    }

    const payload = jobs.map((job) => ({
      title: job.title,
      description: job.description,
      location: job.location || 'Zdalnie',
      remote: job.remote,
      company_id: companyId,
      company_name: job.companyName || companyData?.name || prettyCompanyName,
      company_logo: companyData?.logo_url || null,
      source: 'native',
      source_url: job.url,
      source_id: job.url,
      tech_stack: [],
      requirements: job.requirements || [],
      benefits: job.benefits || [],
    }));

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .upsert(payload, { onConflict: 'source,source_id' })
      .select('id');

    if (error) {
      console.error('ATS import error:', error);
      return NextResponse.json({ error: 'Failed to import jobs.' }, { status: 500 });
    }

    return NextResponse.json({
      imported: data?.length || 0,
      total: payload.length,
      message: 'Jobs imported successfully.',
    });
  } catch (error) {
    console.error('ATS import error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
