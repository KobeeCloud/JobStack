import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Pracuj.pl Scraper
 *
 * Note: Pracuj.pl doesn't have an official public API.
 * This scraper uses their internal GraphQL API used by their frontend.
 *
 * IMPORTANT: This is for educational purposes. In production, you should:
 * 1. Check Pracuj.pl's robots.txt and terms of service
 * 2. Consider official partnerships or API access
 * 3. Implement rate limiting and respect their servers
 */

interface PracujOffer {
  jobOfferId: string;
  jobTitle: string;
  companyName: string;
  companyLogoUri?: string;
  lastPublicated: string;
  expirationDate?: string;
  salary?: string; // e.g. "8 000 – 15 000 PLN"
  typesOfContract?: string[];
  workModes?: string[];
  workSchedules?: string[];
  positionLevels?: string[];
  technologies?: string[];
  offers: Array<{
    displayWorkplace?: string;
  }>;
}

interface PracujResponse {
  props?: {
    pageProps?: {
      data?: {
        jobOffers?: {
          groupedOffers?: PracujOffer[];
        };
      };
    };
  };
}

// Pracuj.pl uses internal API - we fetch their job listing page and parse __NEXT_DATA__
const PRACUJ_IT_URL = 'https://it.pracuj.pl/praca';

/**
 * Parse salary string like "8 000 – 15 000 PLN brutto / mies."
 */
function parseSalary(salaryStr?: string): { min?: number; max?: number; currency: string } | null {
  if (!salaryStr) return null;

  // Remove spaces in numbers and parse
  const cleaned = salaryStr.replace(/\s/g, '');
  const match = cleaned.match(/(\d+)(?:–|-)(\d+)([A-Z]{3})/);

  if (match) {
    return {
      min: parseInt(match[1], 10),
      max: parseInt(match[2], 10),
      currency: match[3] || 'PLN',
    };
  }

  // Single value
  const singleMatch = cleaned.match(/(\d+)([A-Z]{3})/);
  if (singleMatch) {
    const value = parseInt(singleMatch[1], 10);
    return {
      min: value,
      max: value,
      currency: singleMatch[2] || 'PLN',
    };
  }

  return null;
}

/**
 * Map position level to our seniority format
 */
function mapSeniority(levels?: string[]): string {
  if (!levels || levels.length === 0) return 'mid';

  const level = levels[0].toLowerCase();
  if (level.includes('junior') || level.includes('młodszy')) return 'junior';
  if (level.includes('senior') || level.includes('starszy')) return 'senior';
  if (level.includes('lead') || level.includes('kierownik')) return 'lead';
  if (level.includes('manager') || level.includes('menedżer')) return 'manager';
  return 'mid';
}

export async function fetchPracujJobs() {
  try {
    console.log('Fetching jobs from Pracuj.pl...');

    // Fetch the IT jobs page
    const response = await fetch(PRACUJ_IT_URL, {
      headers: {
        'User-Agent': 'JobStackBot/1.0 (+https://jobstack.pl/bot; legal@jobstack.pl)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`Pracuj.pl fetch error: ${response.status}`);
    }

    const html = await response.text();

    // Extract __NEXT_DATA__ JSON
    const startMarker = '<script id="__NEXT_DATA__" type="application/json">';
    const endMarker = '</script>';
    const startIdx = html.indexOf(startMarker);

    if (startIdx === -1) {
      throw new Error('Could not find __NEXT_DATA__ in Pracuj.pl page');
    }

    const jsonStart = startIdx + startMarker.length;
    const jsonEnd = html.indexOf(endMarker, jsonStart);

    if (jsonEnd === -1) {
      throw new Error('Could not find end of __NEXT_DATA__ in Pracuj.pl page');
    }

    const nextDataJson = html.substring(jsonStart, jsonEnd);
    const nextData: PracujResponse = JSON.parse(nextDataJson);
    const offers = nextData.props?.pageProps?.data?.jobOffers?.groupedOffers || [];

    console.log(`Fetched ${offers.length} jobs from Pracuj.pl`);

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const offer of offers) {
      try {
        const salary = parseSalary(offer.salary);
        const isRemote = offer.workModes?.some(m =>
          m.toLowerCase().includes('zdalna') || m.toLowerCase().includes('remote')
        ) || false;

        const location = offer.offers[0]?.displayWorkplace ||
          (isRemote ? 'Remote' : 'Polska');

        // Set expiry - use their expiration or default to 30 days
        const expiryDate = offer.expirationDate
          ? new Date(offer.expirationDate)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const techStack = offer.technologies || [];
        const seniority = mapSeniority(offer.positionLevels);

        const jobData = {
          title: offer.jobTitle,
          company_name: offer.companyName,
          company_logo: offer.companyLogoUri || null,
          location,
          remote: isRemote,
          salary_min: salary?.min,
          salary_max: salary?.max,
          salary_currency: salary?.currency || 'PLN',
          tech_stack: techStack.slice(0, 10),
          description: `Seniority: ${seniority}. Contract: ${offer.typesOfContract?.join(', ') || 'Not specified'}. Schedule: ${offer.workSchedules?.join(', ') || 'Full-time'}.`,
          requirements: techStack.map(t => `Experience with ${t}`),
          source: 'pracuj' as const,
          source_url: `https://www.pracuj.pl/praca/${offer.jobOfferId}`,
          source_id: offer.jobOfferId,
          featured: false,
          published_at: new Date(offer.lastPublicated).toISOString(),
          expires_at: expiryDate.toISOString(),
        };

        const { error } = await supabaseAdmin
          .from('jobs')
          .upsert(jobData, {
            onConflict: 'source,source_id',
            ignoreDuplicates: false,
          });

        if (error) {
          console.error(`Error upserting Pracuj job ${offer.jobOfferId}:`, error);
          errors++;
        } else {
          inserted++;
        }
      } catch (err) {
        console.error(`Error processing Pracuj job ${offer.jobOfferId}:`, err);
        errors++;
      }
    }

    console.log(`Pracuj.pl import completed: ${inserted} inserted, ${updated} updated, ${errors} errors`);

    // Cleanup expired Pracuj.pl jobs
    const { data: deletedJobs, error: deleteError } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('source', 'pracuj')
      .lt('expires_at', new Date().toISOString())
      .select('id');

    const deletedCount = deletedJobs?.length || 0;
    if (deleteError) {
      console.error('Error deleting expired Pracuj.pl jobs:', deleteError);
    } else if (deletedCount > 0) {
      console.log(`Deleted ${deletedCount} expired Pracuj.pl jobs`);
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
    console.error('Pracuj.pl scraper error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      inserted: 0,
      errors: 1,
    };
  }
}
