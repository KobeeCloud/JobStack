import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get total jobs count
    const { count: jobsCount, error: jobsError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .or('expires_at.is.null,expires_at.gt.now()');

    // Get total users count
    const { count: usersCount, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get total companies count
    const { count: companiesCount, error: companiesError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });

    // Get total applications count
    const { count: applicationsCount, error: applicationsError } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true });

    // If no real data, return demo numbers that look realistic
    const stats = {
      jobs: jobsCount || 0,
      users: usersCount || 0,
      companies: companiesCount || 0,
      applications: applicationsCount || 0,
      // Formatted display values
      display: {
        jobs: formatNumber(jobsCount || 0),
        users: formatNumber(usersCount || 0),
        companies: formatNumber(companiesCount || 0),
        applications: formatNumber(applicationsCount || 0),
      },
      // For marketing - show aggregated jobs from all sources
      aggregated: {
        jobs: '50,000+', // This should be updated based on actual scraping
        boards: '5+',
      },
      // Last updated
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);

    // Return fallback stats on error
    return NextResponse.json({
      jobs: 0,
      users: 0,
      companies: 0,
      applications: 0,
      display: {
        jobs: '0',
        users: '0',
        companies: '0',
        applications: '0',
      },
      aggregated: {
        jobs: '50,000+',
        boards: '5+',
      },
      updatedAt: new Date().toISOString(),
      error: 'Failed to fetch live stats',
    });
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}
