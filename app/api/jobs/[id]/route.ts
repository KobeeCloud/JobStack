import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

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

    // Check if job is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Job listing has expired' },
        { status: 410 }
      );
    }

    // Transform database format to frontend format
    const transformedJob = {
      ...data,
      company_name: data.company_name,
      companyLogo: data.company_logo,
      techStack: data.tech_stack,
      sourceUrl: data.source_url,
      publishedAt: data.published_at,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      salary: data.salary_min || data.salary_max ? {
        min: data.salary_min,
        max: data.salary_max,
        currency: data.salary_currency || 'PLN',
      } : undefined,
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
