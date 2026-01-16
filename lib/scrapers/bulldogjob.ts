import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Bulldogjob Scraper
 *
 * Bulldogjob.pl is a Polish IT job board with a public API.
 * We access their GraphQL endpoint to fetch job listings.
 */

interface BulldogJobOffer {
  id: string;
  slug: string;
  title: string;
  publishedAt: string;
  expiresAt?: string;
  company: {
    name: string;
    logoUrl?: string;
    slug: string;
  };
  location: {
    city?: string;
    remote: boolean;
  };
  salary?: {
    from: number;
    to: number;
    currency: string;
    period: string; // "MONTHLY" | "HOURLY"
    type: string; // "B2B" | "UOP"
  };
  seniority: string[];
  skills: Array<{
    name: string;
    level?: number;
  }>;
}

interface BulldogResponse {
  data?: {
    offers?: {
      items?: BulldogJobOffer[];
    };
  };
}

// Bulldogjob GraphQL API endpoint
const BULLDOG_API_URL = 'https://bulldogjob.pl/api/graphql';

const GRAPHQL_QUERY = `
  query GetOffers($first: Int, $filter: OfferFilterInput) {
    offers(first: $first, filter: $filter) {
      items {
        id
        slug
        title
        publishedAt
        expiresAt
        company {
          name
          logoUrl
          slug
        }
        location {
          city
          remote
        }
        salary {
          from
          to
          currency
          period
          type
        }
        seniority
        skills {
          name
          level
        }
      }
    }
  }
`;

/**
 * Map seniority levels
 */
function mapSeniority(levels: string[]): string {
  if (!levels || levels.length === 0) return 'mid';

  const level = levels[0].toLowerCase();
  if (level.includes('junior')) return 'junior';
  if (level.includes('senior')) return 'senior';
  if (level.includes('lead')) return 'lead';
  if (level.includes('expert') || level.includes('architect')) return 'expert';
  return 'mid';
}

export async function fetchBulldogJobs() {
  try {
    console.log('Fetching jobs from Bulldogjob.pl...');

    const response = await fetch(BULLDOG_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'JobStackBot/1.0 (+https://jobstack.pl/bot; legal@jobstack.pl)',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: GRAPHQL_QUERY,
        variables: {
          first: 500,
          filter: {},
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Bulldogjob API error: ${response.status}`);
    }

    const data: BulldogResponse = await response.json();
    const offers = data.data?.offers?.items || [];

    console.log(`Fetched ${offers.length} jobs from Bulldogjob.pl`);

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const offer of offers) {
      try {
        const isRemote = offer.location.remote;
        const location = isRemote ? 'Remote' : (offer.location.city || 'Polska');

        // Set expiry
        const expiryDate = offer.expiresAt
          ? new Date(offer.expiresAt)
          : new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);

        const techStack = offer.skills.map(s => s.name);
        const seniority = mapSeniority(offer.seniority);

        const salaryNote = offer.salary?.type ? ` (${offer.salary.type})` : '';

        const jobData = {
          title: offer.title,
          company_name: offer.company.name,
          company_logo: offer.company.logoUrl || null,
          location,
          remote: isRemote,
          salary_min: offer.salary?.from,
          salary_max: offer.salary?.to,
          salary_currency: offer.salary?.currency || 'PLN',
          tech_stack: techStack.slice(0, 10),
          description: `Seniority: ${seniority}. Contract: ${offer.salary?.type || 'Not specified'}${salaryNote}. Period: ${offer.salary?.period || 'Monthly'}.`,
          requirements: offer.skills.map(s => s.level ? `${s.name} (Level ${s.level})` : s.name),
          source: 'bulldogjob' as const,
          source_url: `https://bulldogjob.pl/companies/jobs/${offer.id}/${offer.slug}`,
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
          console.error(`Error upserting Bulldogjob ${offer.id}:`, error);
          errors++;
        } else {
          inserted++;
        }
      } catch (err) {
        console.error(`Error processing Bulldogjob ${offer.id}:`, err);
        errors++;
      }
    }

    console.log(`Bulldogjob.pl import completed: ${inserted} inserted, ${updated} updated, ${errors} errors`);

    // Cleanup expired jobs
    const { data: deletedJobs, error: deleteError } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('source', 'bulldogjob')
      .lt('expires_at', new Date().toISOString())
      .select('id');

    const deletedCount = deletedJobs?.length || 0;
    if (deleteError) {
      console.error('Error deleting expired Bulldogjob jobs:', deleteError);
    } else if (deletedCount > 0) {
      console.log(`Deleted ${deletedCount} expired Bulldogjob jobs`);
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
    console.error('Bulldogjob scraper error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      inserted: 0,
      errors: 1,
    };
  }
}
