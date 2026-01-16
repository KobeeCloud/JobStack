#!/usr/bin/env node

/**
 * Direct scraper runner for GitHub Actions
 * Calls the same API route that worked with curl
 */

async function runScrapers() {
  console.log('🚀 Starting scraper run at', new Date().toISOString());

  // Debug environment variables
  console.log('🔍 Environment check:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('  SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  console.log('');

  const startTime = Date.now();

  try {
    // Import and run the EXACT same code as the API route
    const { fetchNoFluffJobs } = await import('../lib/scrapers/nofluffjobs.ts');
    const { cleanupExpiredJobs, cleanupStaleJobs } = await import('../lib/cleanup.ts');

    console.log('📡 Fetching from NoFluffJobs...');
    const nofluffResult = await fetchNoFluffJobs();
    console.log('✅ NoFluffJobs completed:', nofluffResult);

    console.log('🧹 Cleaning up expired jobs...');
    const expiredResult = await cleanupExpiredJobs();
    console.log('✅ Expired cleanup completed:', expiredResult);

    console.log('🧹 Cleaning up stale jobs...');
    const staleResult = await cleanupStaleJobs();
    console.log('✅ Stale cleanup completed:', staleResult);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ All scrapers completed successfully in ${duration}s!`);
    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

runScrapers();
