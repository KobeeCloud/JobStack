import { NextRequest, NextResponse } from 'next/server';
import { fetchNoFluffJobs } from '@/lib/scrapers/nofluffjobs';

/**
 * Verify if request is authorized
 */
function isAuthorized(request: NextRequest): boolean {
  // Vercel Cron sends this header automatically
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  if (vercelCronHeader) {
    return true;
  }

  // Allow manual triggers with Authorization header
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;

  if (expectedToken && authHeader === `Bearer ${expectedToken}`) {
    return true;
  }

  // In development, allow requests without auth for testing
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
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

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
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
