import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { type JobFilters } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error - Supabase not configured' },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
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
      query = query.textSearch('search_vector', search.split(' ').join(' & '));
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

    if (salaryMin) {
      query = query.gte('salary_min', salaryMin);
    }

    if (featured) {
      query = query.eq('featured', true);
    }

    // Sort by featured first, then by published date
    query = query
      .order('featured', { ascending: false })
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      jobs: data || [],
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
