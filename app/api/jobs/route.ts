import { NextRequest, NextResponse } from 'next/server';
import { type JobFilters } from '@/types';

// Helper to safely create the admin client
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  // Dynamic import to avoid throw at module load time
  const { createClient } = require('@supabase/supabase-js');
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    const supabaseAdmin = getSupabaseAdmin();

    if (!supabaseAdmin) {
      console.error('Missing Supabase environment variables');
      // Return empty jobs instead of error for better UX
      return NextResponse.json({
        jobs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
        warning: 'Database not configured - showing empty results',
      });
    }

    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20));
    const offset = (page - 1) * limit;

    // Filters
    const search = searchParams.get('search') || undefined;
    const location = searchParams.get('location') || undefined;
    const remote = searchParams.get('remote') === 'true';
    const techStack = searchParams.get('techStack')?.split(',').filter(Boolean) || undefined;
    const source = searchParams.get('source')?.split(',').filter(Boolean) || undefined;
    const salaryMin = searchParams.get('salaryMin') ? parseInt(searchParams.get('salaryMin')!) : undefined;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;

    // Build query
    let query = supabaseAdmin
      .from('jobs')
      .select('*', { count: 'exact' });

    // Apply filters
    query = query.or('expires_at.is.null,expires_at.gt.now()');

    if (search) {
      // Sanitize search query for full-text search
      const sanitizedSearch = search.trim().split(/\s+/).filter(Boolean).join(' & ');
      if (sanitizedSearch) {
        query = query.textSearch('search_vector', sanitizedSearch);
      }
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (remote) {
      query = query.eq('remote', true);
    }

    if (techStack && techStack.length > 0) {
      query = query.contains('tech_stack', techStack);
    }

    if (source && source.length > 0) {
      query = query.in('source', source);
    }

    if (salaryMin && !isNaN(salaryMin)) {
      query = query.gte('salary_min', salaryMin);
    }

    if (featured) {
      query = query.eq('featured', true);
    }

    // Sort by featured first, then by published date
    query = query
      .order('featured', { ascending: false })
      .order('published_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      // Return empty jobs with error info instead of failing
      return NextResponse.json({
        jobs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
        error: 'Failed to fetch jobs - please try again later',
      });
    }

    // Transform database format to frontend format with null safety
    const transformedJobs = (data || []).map((job: any) => {
      try {
        return {
          id: job.id,
          title: job.title || 'Untitled Position',
          company_name: job.company_name || 'Unknown Company',
          companyLogo: job.company_logo || null,
          location: job.location || 'Not specified',
          remote: Boolean(job.remote),
          techStack: Array.isArray(job.tech_stack) ? job.tech_stack : [],
          description: job.description || '',
          requirements: Array.isArray(job.requirements) ? job.requirements : [],
          benefits: Array.isArray(job.benefits) ? job.benefits : [],
          contractType: job.contract_type || null,
          workMode: job.work_mode || null,
          seniority: job.seniority || null,
          requiredLanguage: job.required_language || null,
          languageLevel: job.language_level || null,
          recruitmentStages: Array.isArray(job.recruitment_stages) ? job.recruitment_stages : [],
          tags: Array.isArray(job.tags) ? job.tags : [],
          source: job.source || 'native',
          sourceUrl: job.source_url || null,
          featured: Boolean(job.featured),
          publishedAt: job.published_at || null,
          expiresAt: job.expires_at || null,
          createdAt: job.created_at || new Date().toISOString(),
          salaryType: job.salary_type || 'monthly',
          salaryMode: job.salary_mode || 'gross',
          hourlyMin: job.hourly_min || null,
          hourlyMax: job.hourly_max || null,
          salary: (job.salary_min || job.salary_max) ? {
            min: job.salary_min || 0,
            max: job.salary_max || 0,
            currency: job.salary_currency || 'PLN',
          } : null,
        };
      } catch (transformError) {
        console.error('Error transforming job:', job.id, transformError);
        return null;
      }
    }).filter(Boolean); // Remove any null entries from failed transformations

    return NextResponse.json({
      jobs: transformedJobs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
