import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredJobs, cleanupStaleJobs } from '@/lib/cleanup';

export async function POST(request: NextRequest) {
  try {
    // Simple auth check
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'dev-secret-token';

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const daysOld = parseInt(searchParams.get('daysOld') || '90');
    const source = searchParams.get('source') || undefined;

    const results = {
      expired: await cleanupExpiredJobs(source),
      stale: await cleanupStaleJobs(daysOld, source),
    };

    const totalDeleted = (results.expired.deleted || 0) + (results.stale.deleted || 0);

    return NextResponse.json({
      success: true,
      results,
      total_deleted: totalDeleted,
    });
  } catch (error) {
    console.error('Cleanup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing
export async function GET(request: NextRequest) {
  try {
    console.log('Manual cleanup trigger via GET');

    const { searchParams } = new URL(request.url);
    const daysOld = parseInt(searchParams.get('daysOld') || '90');
    const source = searchParams.get('source') || undefined;

    const results = {
      expired: await cleanupExpiredJobs(source),
      stale: await cleanupStaleJobs(daysOld, source),
    };

    const totalDeleted = (results.expired.deleted || 0) + (results.stale.deleted || 0);

    return NextResponse.json({
      success: true,
      results,
      total_deleted: totalDeleted,
    });
  } catch (error) {
    console.error('Cleanup GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
