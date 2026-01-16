import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * RocketJobs Scraper
 *
 * RocketJobs.pl is a Polish IT/creative job board.
 * Part of the same group as JustJoin.it, so similar API structure.
 */

interface RocketJobsOffer {
  id: string;
  slug: string;
  title: string;
  publishedAt: string;
  validThrough?: string;
  company: {
    name: string;
    logoUrl?: string;
  };
  location: {
    city: string;
    country: string;
  };
  workType: string; // "remote" | "hybrid" | "office"
  employmentTypes: Array<{
    type: string;
    salaryFrom?: number;
    salaryTo?: number;
    salaryCurrency?: string;
  }>;
  experienceLevel: string;
  skills: string[];
}

interface RocketJobsResponse {
  offers?: RocketJobsOffer[];
}

const ROCKETJOBS_API_URL = 'https://rocketjobs.pl/api/offers';

/**
 * Map experience level to our seniority format
 */
function mapSeniority(level: string): string {
  const normalized = level.toLowerCase();
  if (normalized.includes('junior') || normalized.includes('entry')) return 'junior';
  if (normalized.includes('senior') || normalized.includes('experienced')) return 'senior';
  if (normalized.includes('lead') || normalized.includes('principal')) return 'lead';
  if (normalized.includes('c-level') || normalized.includes('manager')) return 'manager';
  return 'mid';
}

export async function fetchRocketJobs() {
  try {
    console.log('Fetching jobs from RocketJobs.pl...');

    const response = await fetch(ROCKETJOBS_API_URL, {
      headers: {
        'User-Agent': 'JobStackBot/1.0 (+https://jobstack.pl/bot; legal@jobstack.pl)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // RocketJobs might require authentication or have changed API
      if (response.status === 403 || response.status === 401) {
        console.warn('RocketJobs API requires authentication or has changed');
        return {
          success: false,
          error: 'API access restricted',
          inserted: 0,
          errors: 0,
        };
      }
      throw new Error(`RocketJobs API error: ${response.status}`);
    }

    const data: RocketJobsResponse = await response.json();
    const offers = data.offers || [];

    console.log(`Fetched ${offers.length} jobs from RocketJobs.pl`);

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const offer of offers) {
      try {
        const isRemote = offer.workType === 'remote';
        const location = isRemote ? 'Remote' :
          [offer.location.city, offer.location.country].filter(Boolean).join(', ') || 'Polska';

        // Get salary - prefer B2B
        const b2b = offer.employmentTypes.find(e => e.type === 'b2b');
        const anySalary = offer.employmentTypes.find(e => e.salaryFrom && e.salaryTo);
        const salary = b2b || anySalary;

        // Set expiry
        const expiryDate = offer.validThrough
          ? new Date(offer.validThrough)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const seniority = mapSeniority(offer.experienceLevel);
        const contractTypes = offer.employmentTypes.map(e => e.type).join(', ');

        const jobData = {
          title: offer.title,
          company_name: offer.company.name,
          company_logo: offer.company.logoUrl || null,
          location,
          remote: isRemote,
          salary_min: salary?.salaryFrom,
          salary_max: salary?.salaryTo,
          salary_currency: salary?.salaryCurrency || 'PLN',
          tech_stack: offer.skills.slice(0, 10),
          description: `Seniority: ${seniority}. Work type: ${offer.workType}. Contract: ${contractTypes || 'Not specified'}.`,
          requirements: offer.skills.map(s => `Experience with ${s}`),
          source: 'rocketjobs' as const,
          source_url: `https://rocketjobs.pl/job/${offer.slug}-${offer.id}`,
          source_id: offer.id,
          featured: false,
          published_at: new Date(offer.publishedAt).toISOString(),
          expires_at: expiryDate.toISOString(),
        };

        const { error } = await supabaseAdmin
          .from('jobs')
          .upsert(jobData, {
            onConflict: 'source,source_id',
            ignoreDuplicates: false,
          });

        if (error) {
          console.error(`Error upserting RocketJob ${offer.id}:`, error);
          errors++;
        } else {
          inserted++;
        }
      } catch (err) {
        console.error(`Error processing RocketJob ${offer.id}:`, err);
        errors++;
      }
    }

    console.log(`RocketJobs.pl import completed: ${inserted} inserted, ${updated} updated, ${errors} errors`);

    // Cleanup expired jobs
    const { data: deletedJobs, error: deleteError } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('source', 'rocketjobs')
      .lt('expires_at', new Date().toISOString())
      .select('id');

    const deletedCount = deletedJobs?.length || 0;
    if (deleteError) {
      console.error('Error deleting expired RocketJobs:', deleteError);
    } else if (deletedCount > 0) {
      console.log(`Deleted ${deletedCount} expired RocketJobs`);
    }

    return {
      success: true,
      total: offers.length,
      inserted,
      updated,
      errors,
      deleted: deletedCount,
    };
  } catch (error) {
    console.error('RocketJobs scraper error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      inserted: 0,
      errors: 1,
    };
  }
}
