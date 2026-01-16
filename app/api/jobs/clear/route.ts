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

    // First, count how many jobs we have
    const { count: initialCount } = await supabaseAdmin
      .from('jobs')
      .select('*', { count: 'exact', head: true });

    console.log(`Found ${initialCount} jobs to delete`);

    // Delete all jobs - use gt(id, empty UUID) to match all rows
    const { error } = await supabaseAdmin
      .from('jobs')
      .delete()
      .gte('created_at', '2020-01-01'); // Match all jobs (created after 2020)

    if (error) {
      console.error('Error deleting jobs:', error);
      return NextResponse.json(
        { error: 'Failed to clear jobs', details: error.message },
        { status: 500 }
      );
    }

    console.log(`Successfully deleted ${initialCount} jobs`);

    return NextResponse.json({
      success: true,
      message: 'All jobs deleted successfully',
      deleted_count: initialCount || 0,
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
