import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function DELETE(request: NextRequest) {
  try {
    // Simple auth check - only allow with secret
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'dev-secret-token';

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized - this endpoint requires authentication' },
        { status: 401 }
      );
    }

    console.log('Clearing all jobs from database...');

    // Delete all jobs
    const { error, count } = await supabaseAdmin
      .from('jobs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (dummy condition)

    if (error) {
      console.error('Error deleting jobs:', error);
      return NextResponse.json(
        { error: 'Failed to clear jobs', details: error.message },
        { status: 500 }
      );
    }

    console.log(`Successfully deleted all jobs`);

    return NextResponse.json({
      success: true,
      message: 'All jobs deleted successfully',
      deleted_count: count || 0,
    });
  } catch (error) {
    console.error('Clear jobs error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Also allow POST for convenience
export async function POST(request: NextRequest) {
  return DELETE(request);
}
