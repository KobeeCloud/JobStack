import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID format (should be UUID)
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    let data;
    let error;

    try {
      const result = await supabaseAdmin
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      data = result.data;
      error = result.error;
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch job' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if job is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Job listing has expired' },
        { status: 410 }
      );
    }

    // Transform database format to frontend format with null safety
    const transformedJob = {
      id: data.id,
      title: data.title || 'Untitled Position',
      company_name: data.company_name || 'Unknown Company',
      companyLogo: data.company_logo || null,
      location: data.location || 'Not specified',
      remote: Boolean(data.remote),
      techStack: Array.isArray(data.tech_stack) ? data.tech_stack : [],
      description: data.description || '',
      requirements: Array.isArray(data.requirements) ? data.requirements : [],
      benefits: Array.isArray(data.benefits) ? data.benefits : [],
      contractType: data.contract_type || null,
      workMode: data.work_mode || null,
      seniority: data.seniority || null,
      requiredLanguage: data.required_language || null,
      languageLevel: data.language_level || null,
      recruitmentStages: Array.isArray(data.recruitment_stages) ? data.recruitment_stages : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      source: data.source || 'native',
      sourceUrl: data.source_url || null,
      featured: Boolean(data.featured),
      publishedAt: data.published_at || null,
      expiresAt: data.expires_at || null,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || null,
      salaryType: data.salary_type || 'monthly',
      salaryMode: data.salary_mode || 'gross',
      hourlyMin: data.hourly_min || null,
      hourlyMax: data.hourly_max || null,
      salary: (data.salary_min || data.salary_max) ? {
        min: data.salary_min || 0,
        max: data.salary_max || 0,
        currency: data.salary_currency || 'PLN',
      } : null,
    };

    return NextResponse.json({ job: transformedJob });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
