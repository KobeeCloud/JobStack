import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Delete expired jobs from database
 * Jobs with expires_at < now() will be removed
 *
 * @param source - Optional: only delete jobs from specific source (e.g. 'nofluffjobs')
 * @returns Count of deleted jobs
 */
export async function cleanupExpiredJobs(source?: string) {
  try {
    console.log(`Cleaning up expired jobs${source ? ` from ${source}` : ''}...`);

    let query = supabaseAdmin
      .from('jobs')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    // Filter by source if specified
    if (source) {
      query = query.eq('source', source);
    }

    const { data: deletedJobs, error } = await query;

    const deletedCount = deletedJobs?.length || 0;

    if (error) {
      console.error('Error deleting expired jobs:', error);
      return { success: false, deleted: 0, error: error.message };
    }

    console.log(`Deleted ${deletedCount} expired jobs${source ? ` from ${source}` : ''}`);

    return { success: true, deleted: deletedCount };
  } catch (error) {
    console.error('Cleanup error:', error);
    return {
      success: false,
      deleted: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete jobs that haven't been updated in X days (stale jobs)
 * Useful for jobs from sources that don't set expires_at
 *
 * @param daysOld - Number of days after which job is considered stale
 * @param source - Optional: only delete jobs from specific source
 * @returns Count of deleted jobs
 */
export async function cleanupStaleJobs(daysOld: number = 90, source?: string) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    console.log(`Cleaning up jobs not updated since ${cutoffDate.toISOString()}...`);

    let query = supabaseAdmin
      .from('jobs')
      .delete()
      .lt('updated_at', cutoffDate.toISOString())
      .select('id');

    if (source) {
      query = query.eq('source', source);
    }

    const { data: deletedJobs, error } = await query;
    const deletedCount = deletedJobs?.length || 0;

    if (error) {
      console.error('Error deleting stale jobs:', error);
      return { success: false, deleted: 0, error: error.message };
    }

    console.log(`Deleted ${deletedCount} stale jobs (>${daysOld} days old)`);

    return { success: true, deleted: deletedCount };
  } catch (error) {
    console.error('Stale cleanup error:', error);
    return {
      success: false,
      deleted: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
