import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// POST /api/employer/jobs - Create a new job
export async function POST(request: NextRequest) {
  try {
    // Check for API key or session auth
    const apiKey = request.headers.get('x-api-key');
    let userId: string | null = null;
    let companyId: string | null = null;

    if (apiKey) {
      // API Key authentication
      const { data: company, error } = await supabaseAdmin
        .from('companies')
        .select('id, owner_id, plan')
        .eq('api_key', apiKey)
        .single();

      if (error || !company) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }

      userId = company.owner_id;
      companyId = company.id;

      // Check plan limits (free plan: 1 job/month)
      if (company.plan === 'free') {
        const { count } = await supabaseAdmin
          .from('jobs')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', company.id)
          .gte('created_at', new Date(new Date().setDate(1)).toISOString());

        if (count && count >= 1) {
          return NextResponse.json(
            { error: 'Free plan limit reached. Upgrade to post more jobs.' },
            { status: 403 }
          );
        }
      }
    } else {
      // Session authentication
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      userId = user.id;

      // Get user's company
      const { data: employerProfile } = await supabase
        .from('employer_profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!employerProfile) {
        return NextResponse.json(
          { error: 'Employer profile not found' },
          { status: 404 }
        );
      }

      companyId = employerProfile.company_id;
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      company_name,
      company_website,
      company_logo,
      location,
      remote = false,
      salary_min,
      salary_max,
      salary_currency = 'PLN',
      salary_type = 'monthly',
      salary_mode = 'gross',
      hourly_min,
      hourly_max,
      tech_stack = [],
      contract_type,
      work_mode,
      seniority,
      required_language,
      language_level,
      recruitment_stages = [],
      tags = [],
      description,
      requirements = [],
      benefits = [],
      apply_url,
      featured = false,
      expires_in_days = 30,
    } = body;

    // Validation
    if (!title || !location || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: title, location, description' },
        { status: 400 }
      );
    }

    if (!companyId) {
      const { data: existingCompany } = await supabaseAdmin
        .from('companies')
        .select('id, name, logo_url, website')
        .eq('owner_id', userId)
        .maybeSingle();

      if (existingCompany?.id) {
        companyId = existingCompany.id;
        const { error: profileUpdateError } = await supabaseAdmin
          .from('employer_profiles')
          .update({ company_id: companyId })
          .eq('user_id', userId);

        if (profileUpdateError) {
          console.error('Employer profile update error:', profileUpdateError);
        }
      } else if (userId && company_name) {
        const { data: newCompany, error: companyError } = await supabaseAdmin
          .from('companies')
          .insert({
            name: company_name,
            website: company_website || null,
            logo_url: company_logo || null,
            owner_id: userId,
          })
          .select('id')
          .single();

        if (companyError || !newCompany) {
          console.error('Company creation error:', companyError);
          return NextResponse.json(
            { error: 'Failed to create company profile' },
            { status: 500 }
          );
        }

        companyId = newCompany.id;
        const { error: profileUpdateError } = await supabaseAdmin
          .from('employer_profiles')
          .update({ company_id: companyId })
          .eq('user_id', userId);

        if (profileUpdateError) {
          console.error('Employer profile update error:', profileUpdateError);
        }
      }
    }

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company profile missing. Please add company details.' },
        { status: 400 }
      );
    }

    // Get company name
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('name, logo_url')
      .eq('id', companyId)
      .single();

    if (company_name || company_logo || company_website) {
      const { error: companyUpdateError } = await supabaseAdmin
        .from('companies')
        .update({
          name: company_name || company?.name,
          logo_url: company_logo || company?.logo_url,
          website: company_website || null,
        })
        .eq('id', companyId);

      if (companyUpdateError) {
        console.error('Company update error:', companyUpdateError);
      }
    }

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires_in_days);

    // Create job
    const resolvedCompanyName = company_name || company?.name || 'Unknown Company';
    const resolvedCompanyLogo = company_logo || company?.logo_url || null;

    const basePayload = {
      company_id: companyId,
      company_name: resolvedCompanyName,
      company_logo: resolvedCompanyLogo,
      title,
      location,
      remote,
      salary_min,
      salary_max,
      salary_currency,
      tech_stack,
      description,
      requirements,
      benefits,
      source: 'native',
      source_url: apply_url,
      featured,
      expires_at: expiresAt.toISOString(),
    };

    const extendedPayload = {
      ...basePayload,
      salary_type,
      salary_mode,
      hourly_min,
      hourly_max,
      contract_type,
      work_mode,
      seniority,
      required_language,
      language_level,
      recruitment_stages,
      tags,
    };

    let insertError = null;
    let job = null as any;

    const { data: extendedJob, error: extendedError } = await supabaseAdmin
      .from('jobs')
      .insert(extendedPayload)
      .select()
      .single();

    if (extendedError && extendedError.code === '42703') {
      const { data: baseJob, error: baseError } = await supabaseAdmin
        .from('jobs')
        .insert(basePayload)
        .select()
        .single();
      insertError = baseError;
      job = baseJob;
    } else {
      insertError = extendedError;
      job = extendedJob;
    }

    if (insertError) {
      console.error('Job creation error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/employer/jobs - List employer's jobs
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's company
    const { data: employerProfile } = await supabase
      .from('employer_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (!employerProfile) {
      return NextResponse.json(
        { error: 'Employer profile not found' },
        { status: 404 }
      );
    }

    let resolvedCompanyId = employerProfile.company_id || null;
    if (!resolvedCompanyId) {
      const { data: companyByOwner } = await supabaseAdmin
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (companyByOwner?.id) {
        resolvedCompanyId = companyByOwner.id;
        const { error: profileUpdateError } = await supabaseAdmin
          .from('employer_profiles')
          .update({ company_id: resolvedCompanyId })
          .eq('user_id', user.id);

        if (profileUpdateError) {
          console.error('Employer profile update error:', profileUpdateError);
        }
      }
    }

    if (!resolvedCompanyId) {
      return NextResponse.json({ jobs: [] });
    }

    // Get company's jobs
    const { data: jobs, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('company_id', resolvedCompanyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/employer/jobs?jobId=... - Delete employer's job
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = request.nextUrl.searchParams.get('jobId');
    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const { data: employerProfile } = await supabase
      .from('employer_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    let resolvedCompanyId = employerProfile?.company_id || null;
    if (!resolvedCompanyId) {
      const { data: companyByOwner } = await supabaseAdmin
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();
      resolvedCompanyId = companyByOwner?.id || null;
    }

    if (!resolvedCompanyId) {
      return NextResponse.json({ error: 'Employer profile not found' }, { status: 404 });
    }

    const { data: job } = await supabaseAdmin
      .from('jobs')
      .select('id, company_id')
      .eq('id', jobId)
      .single();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.company_id !== resolvedCompanyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (error) {
      console.error('Delete job error:', error);
      return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
