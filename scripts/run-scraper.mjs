#!/usr/bin/env node

/**
 * Direct scraper runner for GitHub Actions
 * Runs scrapers without HTTP overhead
 */

import { fetchNoFluffJobs } from '../lib/scrapers/nofluffjobs.js';
import { cleanupExpiredJobs, cleanupStaleJobs } from '../lib/cleanup.js';

async function runScrapers() {
  console.log('🚀 Starting scraper run at', new Date().toISOString());

  const startTime = Date.now();
  const results = {};
  const errors = [];

  // Run NoFluffJobs scraper
  try {
    console.log('📡 Fetching from NoFluffJobs...');
    results.nofluffjobs = await fetchNoFluffJobs();
    console.log('✅ NoFluffJobs completed:', results.nofluffjobs);
  } catch (error) {
    console.error('❌ NoFluffJobs failed:', error);
    results.nofluffjobs = { success: false, error: error.message };
    errors.push(`NoFluffJobs: ${error.message}`);
  }

  // Cleanup expired jobs
  try {
    console.log('🧹 Cleaning up expired jobs...');
    const expiredResult = await cleanupExpiredJobs();
    results.cleanupExpired = expiredResult;
    console.log('✅ Expired cleanup completed:', expiredResult);
  } catch (error) {
    console.error('❌ Expired cleanup failed:', error);
    results.cleanupExpired = { success: false, error: error.message };
  }

  // Cleanup stale jobs
  try {
    console.log('🧹 Cleaning up stale jobs...');
    const staleResult = await cleanupStaleJobs();
    results.cleanupStale = staleResult;
    console.log('✅ Stale cleanup completed:', staleResult);
  } catch (error) {
    console.error('❌ Stale cleanup failed:', error);
    results.cleanupStale = { success: false, error: error.message };
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n📊 Summary:');
  console.log('Duration:', duration, 'seconds');
  console.log('Results:', JSON.stringify(results, null, 2));

  if (errors.length > 0) {
    console.log('\n⚠️ Errors:', errors);
    process.exit(1);
  }

  console.log('\n✅ All scrapers completed successfully!');
  process.exit(0);
}

runScrapers().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
