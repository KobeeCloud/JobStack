import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { checkRobotsTxt } from '@/lib/utils/robots-checker';
import { fetchCareersUrl, parseJobsFromHtml, parseJobsFromXml } from '@/lib/utils/careers-importer';

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
    const { url } = body as { url?: string };

    if (!url) {
      return NextResponse.json({ error: 'Missing careers URL.' }, { status: 400 });
    }

    const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    const isAllowed = await checkRobotsTxt(parsedUrl.origin, parsedUrl.pathname);

    if (!isAllowed) {
      return NextResponse.json({ error: 'Robots.txt disallows crawling this URL.' }, { status: 403 });
    }

    const { data: employerProfile } = await supabase
      .from('employer_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    const companyId = employerProfile?.company_id || null;
    const { data: company } = companyId
      ? await supabaseAdmin.from('companies').select('name, logo_url').eq('id', companyId).single()
      : { data: null };

    const { content, contentType, normalized } = await fetchCareersUrl(parsedUrl.toString());

    const isXml = /xml|rss|atom/i.test(contentType) || normalized.endsWith('.xml');
    const jobs = isXml
      ? parseJobsFromXml(content)
      : parseJobsFromHtml(content, normalized);

    if (jobs.length === 0) {
      return NextResponse.json({ error: 'No job postings found on the provided URL.' }, { status: 422 });
    }

    const payload = jobs
      .filter((job) => job.title && job.description)
      .map((job) => ({
        title: job.title,
        description: job.description,
        location: job.location || 'Zdalnie',
        remote: job.remote,
        company_id: companyId,
        company_name: job.companyName || company?.name || parsedUrl.hostname,
        company_logo: company?.logo_url || null,
        source: 'native',
        source_url: job.url,
        source_id: job.url,
        tech_stack: [],
        requirements: [],
        benefits: [],
      }));

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .upsert(payload, { onConflict: 'source,source_id' })
      .select('id');

    if (error) {
      console.error('Import error:', error);
      return NextResponse.json({ error: 'Failed to import jobs.' }, { status: 500 });
    }

    return NextResponse.json({
      imported: data?.length || 0,
      total: payload.length,
      message: 'Jobs imported successfully.',
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
