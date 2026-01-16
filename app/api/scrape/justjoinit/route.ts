import { NextRequest, NextResponse } from 'next/server';
import { fetchJustJoinItJobs } from '@/lib/scrapers/justjoinit';

export async function POST(request: NextRequest) {
  try {
    // Simple auth check (w przyszłości dodamy proper auth)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'dev-secret-token';

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await fetchJustJoinItJobs();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Scraper API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing (temporary - remove after first successful scrape)
export async function GET(request: NextRequest) {
  try {
    console.log('Manual scraper trigger via GET');
    const result = await fetchJustJoinItJobs();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Scraper GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
