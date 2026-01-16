import { NextRequest, NextResponse } from 'next/server';
import { fetchNoFluffJobs } from '@/lib/scrapers/nofluffjobs';
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

    const totalInserted = Object.values(results).reduce((sum, r) => sum + (r.inserted || 0), 0);
    const totalErrors = Object.values(results).reduce((sum, r) => sum + (r.errors || 0), 0);

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total_inserted: totalInserted,
        total_errors: totalErrors,
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

// Allow GET for manual testing
export async function GET(request: NextRequest) {
  try {
    console.log('Manual scraper trigger via GET - running all scrapers');

    const results = {
      nofluffjobs: await fetchNoFluffJobs(),
      // justjoinit: await fetchJustJoinItJobs(), // Disabled - API changed
    };

    const totalInserted = Object.values(results).reduce((sum, r) => sum + (r.inserted || 0), 0);
    const totalErrors = Object.values(results).reduce((sum, r) => sum + (r.errors || 0), 0);

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total_inserted: totalInserted,
        total_errors: totalErrors,
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
