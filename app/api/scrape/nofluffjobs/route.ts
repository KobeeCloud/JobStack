import { NextRequest, NextResponse } from 'next/server';
import { fetchNoFluffJobs } from '@/lib/scrapers/nofluffjobs';

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

    const result = await fetchNoFluffJobs();

    return NextResponse.json(result);
  } catch (error) {
    console.error('NoFluffJobs scraper API error:', error);
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

    console.log('Manual NoFluffJobs scraper trigger via GET');
    const result = await fetchNoFluffJobs();
    return NextResponse.json(result);
  } catch (error) {
    console.error('NoFluffJobs scraper GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
