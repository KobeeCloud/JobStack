import { NextRequest, NextResponse } from 'next/server';
import { fetchNoFluffJobs } from '@/lib/scrapers/nofluffjobs';
import { cleanupExpiredJobs, cleanupStaleJobs } from '@/lib/cleanup';
// import { fetchJustJoinItJobs } from '@/lib/scrapers/justjoinit'; // Commented - API changed

export async function POST(request: NextRequest) {
  try {
    // Simple auth check (for Vercel cron)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'dev-secret-token';

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const results = {
      nofluffjobs: await fetchNoFluffJobs(),
      // justjoinit: await fetchJustJoinItJobs(), // Disabled - API changed
    };

    // Cleanup expired and stale jobs after scraping
    const cleanupResults = {
      expired: await cleanupExpiredJobs(), // Jobs with expires_at < now
      stale: await cleanupStaleJobs(90), // Jobs not updated in 90 days
    };

    const totalInserted = Object.values(results).reduce((sum, r) => sum + (r.inserted || 0), 0);
    const totalErrors = Object.values(results).reduce((sum, r) => sum + (r.errors || 0), 0);
    const totalDeleted = (cleanupResults.expired.deleted || 0) + (cleanupResults.stale.deleted || 0);

    return NextResponse.json({
      success: true,
      results,
      cleanup: cleanupResults,
      summary: {
        total_inserted: totalInserted,
        total_errors: totalErrors,
        total_deleted: totalDeleted,
      },
    });
  } catch (error) {
    console.error('Scraper API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing (but require auth to prevent abuse)
export async function GET(request: NextRequest) {
  try {
    // Same auth check as POST
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'dev-secret-token';

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized - scraper requires authentication' },
        { status: 401 }
      );
    }

    console.log('Manual scraper trigger via GET - running all scrapers');

    const results = {
      nofluffjobs: await fetchNoFluffJobs(),
      // justjoinit: await fetchJustJoinItJobs(), // Disabled - API changed
    };

    // Cleanup expired and stale jobs after scraping
    const cleanupResults = {
      expired: await cleanupExpiredJobs(),
      stale: await cleanupStaleJobs(90),
    };

    const totalInserted = Object.values(results).reduce((sum, r) => sum + (r.inserted || 0), 0);
    const totalErrors = Object.values(results).reduce((sum, r) => sum + (r.errors || 0), 0);
    const totalDeleted = (cleanupResults.expired.deleted || 0) + (cleanupResults.stale.deleted || 0);

    return NextResponse.json({
      success: true,
      results,
      cleanup: cleanupResults,
      summary: {
        total_inserted: totalInserted,
        total_errors: totalErrors,
        total_deleted: totalDeleted,
      },
    });
  } catch (error) {
    console.error('Scraper GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
