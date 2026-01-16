import { NextRequest, NextResponse } from 'next/server';
import { fetchNoFluffJobs } from '@/lib/scrapers/nofluffjobs';
import { fetchPracujJobs } from '@/lib/scrapers/pracuj';
import { fetchBulldogJobs } from '@/lib/scrapers/bulldogjob';
import { fetchRocketJobs } from '@/lib/scrapers/rocketjobs';
import { cleanupExpiredJobs, cleanupStaleJobs } from '@/lib/cleanup';
// import { fetchJustJoinItJobs } from '@/lib/scrapers/justjoinit'; // Commented - API changed

/**
 * Verify if request is from Vercel Cron or has valid auth token
 */
function isAuthorized(request: NextRequest): boolean {
  // Vercel Cron sends this header automatically
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  if (vercelCronHeader) {
    return true;
  }

  // Also allow manual triggers with Authorization header
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

/**
 * Run all scrapers and cleanup
 */
async function runScrapers() {
  console.log('🚀 Starting scraper run at', new Date().toISOString());

  const startTime = Date.now();

  const results: Record<string, any> = {};
  const errors: string[] = [];

  // Run NoFluffJobs scraper
  try {
    results.nofluffjobs = await fetchNoFluffJobs();
    console.log('✅ NoFluffJobs scraper completed');
  } catch (error) {
    console.error('❌ NoFluffJobs scraper failed:', error);
    results.nofluffjobs = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    errors.push(`NoFluffJobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // TODO: Uncomment when ready to enable other scrapers
  // // Run Pracuj.pl scraper
  // try {
  //   results.pracuj = await fetchPracujJobs();
  //   console.log('✅ Pracuj.pl scraper completed');
  // } catch (error) {
  //   console.error('❌ Pracuj.pl scraper failed:', error);
  //   results.pracuj = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  //   errors.push(`Pracuj.pl: ${error instanceof Error ? error.message : 'Unknown error'}`);
  // }

  // // Run Bulldogjob scraper
  // try {
  //   results.bulldogjob = await fetchBulldogJobs();
  //   console.log('✅ Bulldogjob scraper completed');
  // } catch (error) {
  //   console.error('❌ Bulldogjob scraper failed:', error);
  //   results.bulldogjob = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  //   errors.push(`Bulldogjob: ${error instanceof Error ? error.message : 'Unknown error'}`);
  // }

  // // Run RocketJobs scraper
  // try {
  //   results.rocketjobs = await fetchRocketJobs();
  //   console.log('✅ RocketJobs scraper completed');
  // } catch (error) {
  //   console.error('❌ RocketJobs scraper failed:', error);
  //   results.rocketjobs = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  //   errors.push(`RocketJobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  // }

  // JustJoin.it - disabled (API changed)
  // try {
  //   results.justjoinit = await fetchJustJoinItJobs();
  // } catch (error) { ... }

  // Cleanup expired and stale jobs after scraping
  const cleanupResults: Record<string, any> = {};

  try {
    cleanupResults.expired = await cleanupExpiredJobs();
    console.log('✅ Expired jobs cleanup completed');
  } catch (error) {
    console.error('❌ Expired jobs cleanup failed:', error);
    cleanupResults.expired = { success: false, error: error instanceof Error ? error.message : 'Unknown' };
  }

  try {
    cleanupResults.stale = await cleanupStaleJobs(90);
    console.log('✅ Stale jobs cleanup completed');
  } catch (error) {
    console.error('❌ Stale jobs cleanup failed:', error);
    cleanupResults.stale = { success: false, error: error instanceof Error ? error.message : 'Unknown' };
  }

  const totalInserted = Object.values(results).reduce((sum: number, r: any) => sum + (r?.inserted || 0), 0);
  const totalErrors = Object.values(results).reduce((sum: number, r: any) => sum + (r?.errors || 0), 0);
  const totalDeleted = (cleanupResults.expired?.deleted || 0) + (cleanupResults.stale?.deleted || 0);
  const duration = Date.now() - startTime;

  console.log(`📊 Scraper run completed in ${duration}ms - Inserted: ${totalInserted}, Errors: ${totalErrors}, Deleted: ${totalDeleted}`);

  return {
    success: errors.length === 0,
    timestamp: new Date().toISOString(),
    duration_ms: duration,
    results,
    cleanup: cleanupResults,
    summary: {
      total_inserted: totalInserted,
      total_errors: totalErrors,
      total_deleted: totalDeleted,
    },
    errors: errors.length > 0 ? errors : undefined,
  };
}

// GET handler - used by Vercel Cron
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      console.warn('⚠️ Unauthorized scraper access attempt');
      return NextResponse.json(
        { error: 'Unauthorized - scraper requires authentication' },
        { status: 401 }
      );
    }

    const result = await runScrapers();
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Scraper API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST handler - for manual triggers
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await runScrapers();
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Scraper API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
