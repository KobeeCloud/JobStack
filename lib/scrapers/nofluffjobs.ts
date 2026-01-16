import { supabaseAdmin } from '@/lib/supabase/admin';

interface NoFluffJobsOffer {
  id: string;
  name: string;
  title: string;
  technology: string;
  posted: number;
  renewed: number;
  location: {
    places: Array<{
      city: string;
      country: {
        code: string;
        name: string;
      };
    }>;
    fullyRemote: boolean;
  };
  salary?: {
    from: number;
    to: number;
    currency: string;
    type: string; // "month" | "hour"
  };
  seniority: Array<{
    name: string;
    level: number;
  }>;
  requirements?: {
    musts?: Array<{
      value: string;
      level?: number;
    }>;
    nices?: Array<{
      value: string;
      level?: number;
    }>;
  };
  logo?: {
    original?: string;
  };
  url: string;
}

interface NoFluffJobsResponse {
  postings: NoFluffJobsOffer[];
}

export async function fetchNoFluffJobs() {
  try {
    console.log('Fetching jobs from NoFluffJobs...');

    const response = await fetch('https://nofluffjobs.com/api/posting?region=pl&limit=1000', {
      headers: {
        'User-Agent': 'JobStackBot/1.0 (+https://jobstack.pl/bot; legal@jobstack.pl)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`NoFluffJobs API error: ${response.status}`);
    }

    const data: NoFluffJobsResponse = await response.json();
    const offers = data.postings || [];
    console.log(`Fetched ${offers.length} jobs from NoFluffJobs`);

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const offer of offers) {
      try {
        // Build location string
        const isRemote = offer.location.fullyRemote;
        const city = offer.location.places[0]?.city || '';
        const location = isRemote ? 'Remote' : city || 'Poland';

        // Extract tech stack from requirements
        const techStack: string[] = [offer.technology];
        if (offer.requirements?.musts) {
          techStack.push(...offer.requirements.musts.map(m => m.value));
        }

        // Get seniority level
        const seniorityLevel = offer.seniority?.[0]?.name || 'mid';

        // Build requirements list
        const requirements: string[] = [];
        if (offer.requirements?.musts) {
          requirements.push(...offer.requirements.musts.map(m =>
            m.level ? `${m.value} (Level ${m.level})` : m.value
          ));
        }
        if (offer.requirements?.nices) {
          requirements.push(...offer.requirements.nices.map(n =>
            `Nice to have: ${n.value}`
          ));
        }

        // Prepare job data
        // Set expiry to 60 days from now (jobs older than this will be cleaned up)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 60);

        const jobData = {
          title: offer.title,
          company_name: offer.name,
          company_logo: offer.logo?.original ? `https://nofluffjobs.com/${offer.logo.original}` : null,
          location,
          remote: isRemote,
          salary_min: offer.salary?.from,
          salary_max: offer.salary?.to,
          salary_currency: offer.salary?.currency || 'PLN',
          tech_stack: techStack.slice(0, 10), // Limit to 10 skills
          description: `Seniority: ${seniorityLevel}. Technology: ${offer.technology}`,
          requirements: requirements.slice(0, 20), // Limit to 20 requirements
          source: 'nofluffjobs' as const,
          source_url: `https://nofluffjobs.com${offer.url}`,
          source_id: offer.id,
          featured: false,
          published_at: new Date(offer.posted).toISOString(),
          expires_at: expiryDate.toISOString(),
        };

        // Upsert to database
        const { error } = await supabaseAdmin
          .from('jobs')
          .upsert(jobData, {
            onConflict: 'source,source_id',
            ignoreDuplicates: false,
          });

        if (error) {
          console.error(`Error upserting job ${offer.id}:`, {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          console.error('Job data that failed:', JSON.stringify(jobData, null, 2));
          errors++;
        } else {
          inserted++;
        }
      } catch (err) {
        console.error(`Error processing job ${offer.id}:`, err);
        errors++;
      }
    }

    console.log(`NoFluffJobs import completed: ${inserted} inserted, ${updated} updated, ${errors} errors`);

    // Cleanup expired jobs from NoFluffJobs (older than expiry date)
    const { data: deletedJobs, error: deleteError } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('source', 'nofluffjobs')
      .lt('expires_at', new Date().toISOString())
      .select('id');

    const deletedCount = deletedJobs?.length || 0;
    if (deleteError) {
      console.error('Error deleting expired NoFluffJobs:', deleteError);
    } else {
      console.log(`Deleted ${deletedCount} expired NoFluffJobs jobs`);
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
    console.error('NoFluffJobs scraper error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
