import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Get user's saved jobs
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    // Get saved jobs with job details
    const { data: savedJobs, error } = await supabase
      .from('saved_jobs')
      .select(`
        id,
        created_at,
        job_id,
        jobs (
          id,
          title,
          company_name,
          company_logo,
          location,
          remote,
          salary_min,
          salary_max,
          salary_currency,
          tech_stack,
          source,
          source_url,
          published_at,
          expires_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch saved jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      savedJobs: savedJobs || [],
      count: savedJobs?.length || 0,
    });
  } catch (error) {
    console.error('Error in GET /api/saved-jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save a job
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in to save jobs' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Check if job exists
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('user_id', user.id)
      .eq('job_id', jobId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Job already saved', alreadySaved: true },
        { status: 409 }
      );
    }

    // Save the job
    const { data: savedJob, error: saveError } = await supabase
      .from('saved_jobs')
      .insert({
        user_id: user.id,
        job_id: jobId,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving job:', saveError);
      return NextResponse.json(
        { error: 'Failed to save job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      savedJob,
      message: 'Job saved successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/saved-jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove saved job
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', user.id)
      .eq('job_id', jobId);

    if (deleteError) {
      console.error('Error removing saved job:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove saved job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job removed from saved',
    });
  } catch (error) {
    console.error('Error in DELETE /api/saved-jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
