import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET /api/jobs/[id]/questions - Get custom questions for a job
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await context.params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    let data;
    let error;

    try {
      const result = await supabaseAdmin
        .from('application_questions')
        .select('*')
        .eq('job_id', jobId)
        .order('order_index', { ascending: true });

      data = result.data;
      error = result.error;
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ questions: [] });
    }

    if (error) {
      console.error('Error fetching questions:', error);
      // Return empty array instead of error - questions are optional
      return NextResponse.json({ questions: [] });
    }

    return NextResponse.json({ questions: data || [] });
  } catch (error) {
    console.error('Error:', error);
    // Return empty array instead of failing
    return NextResponse.json({ questions: [] });
  }
}
