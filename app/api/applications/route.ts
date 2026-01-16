import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      jobId,
      firstName,
      lastName,
      email,
      phone,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      yearsExperience,
      currentPosition,
      coverLetter,
      expectedSalaryMin,
      expectedSalaryMax,
      availableFrom,
      cvUrl,
      questionAnswers = {},
    } = body;

    // Validate required fields
    if (!jobId || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if job exists
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('id, title, company_name, source')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Only allow applications to native jobs (not scraped)
    if (job.source !== 'native') {
      return NextResponse.json(
        {
          error: 'This job is from an external source. Please apply directly on their website.',
          source_url: job.source
        },
        { status: 400 }
      );
    }

    // Check if user already applied
    const { data: existingApplication } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('email', email)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 409 }
      );
    }

    // Create application
    const { data: application, error: applicationError } = await supabaseAdmin
      .from('applications')
      .insert({
        job_id: jobId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        portfolio_url: portfolioUrl,
        years_experience: yearsExperience ? parseInt(yearsExperience) : null,
        current_position: currentPosition,
        cover_letter: coverLetter,
        expected_salary_min: expectedSalaryMin ? parseInt(expectedSalaryMin) : null,
        expected_salary_max: expectedSalaryMax ? parseInt(expectedSalaryMax) : null,
        available_from: availableFrom || null,
        cv_url: cvUrl,
        status: 'pending',
      })
      .select()
      .single();

    if (applicationError) {
      console.error('Error creating application:', applicationError);
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      );
    }

    // Save answers to custom questions
    if (Object.keys(questionAnswers).length > 0) {
      const answers = Object.entries(questionAnswers).map(([questionId, answer]) => ({
        application_id: application.id,
        question_id: questionId,
        answer_text: typeof answer === 'boolean' ? (answer ? 'Tak' : 'Nie') : String(answer),
      }));

      const { error: answersError } = await supabaseAdmin
        .from('application_answers')
        .insert(answers);

      if (answersError) {
        console.error('Error saving answers:', answersError);
        // Don't fail the whole application if answers fail
      }
    }

    // TODO: Send email notification to employer
    // TODO: Send confirmation email to applicant

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('Application submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/applications - Get applications for current user (employer or candidate)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');
    const email = searchParams.get('email');

    if (!jobId && !email) {
      return NextResponse.json(
        { error: 'jobId or email parameter required' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('applications')
      .select('*, jobs(title, company_name)');

    if (jobId) {
      query = query.eq('job_id', jobId);
    }

    if (email) {
      query = query.eq('email', email);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    return NextResponse.json({ applications: data || [] });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
