import { supabaseAdmin } from '@/lib/supabase/admin';

interface JustJoinItOffer {
  id: string;
  title: string;
  street?: string;
  city?: string;
  country_code: string;
  remote: boolean;
  experience_level: string;
  employment_types: Array<{
    type: string;
    salary?: {
      from: number;
      to: number;
      currency: string;
    };
  }>;
  skills: Array<{
    name: string;
    level: number;
  }>;
  company: {
    name: string;
    logo_url?: string;
    website_url?: string;
  };
  published_at: string;
  open_to_hire_ukrainians: boolean;
}

export async function fetchJustJoinItJobs() {
  try {
    console.log('Fetching jobs from JustJoin.it...');
    const response = await fetch('https://justjoin.it/api/offers', {
      headers: {
        'User-Agent': 'JobStackBot/1.0 (+https://jobstack.pl/bot; legal@jobstack.pl)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`JustJoin.it API error: ${response.status}`);
    }

    const offers: JustJoinItOffer[] = await response.json();
    console.log(`Fetched ${offers.length} jobs from JustJoin.it`);

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const offer of offers) {
      try {
        // Extract tech stack
        const techStack = offer.skills.map(skill => skill.name);

        // Get salary info (prefer B2B)
        const b2bSalary = offer.employment_types.find(t => t.type === 'b2b');
        const anySalary = offer.employment_types.find(t => t.salary);
        const salary = b2bSalary?.salary || anySalary?.salary;

        // Build location
        const location = offer.remote
          ? 'Remote'
          : [offer.city, offer.country_code].filter(Boolean).join(', ');

        // Prepare job data
        const jobData = {
          title: offer.title,
          company_name: offer.company.name,
          company_logo: offer.company.logo_url,
          location,
          remote: offer.remote,
          salary_min: salary?.from,
          salary_max: salary?.to,
          salary_currency: salary?.currency || 'PLN',
          tech_stack: techStack,
          description: `Experience level: ${offer.experience_level}. Open to hire Ukrainians: ${offer.open_to_hire_ukrainians ? 'Yes' : 'No'}.`,
          requirements: offer.skills.map(s => `${s.name} (Level ${s.level})`),
          source: 'justjoinit' as const,
          source_url: `https://justjoin.it/offers/${offer.id}`,
          source_id: offer.id,
          featured: false,
          published_at: new Date(offer.published_at).toISOString(),
          expires_at: null,
        };

        // Upsert to database
        const { error } = await supabaseAdmin
          .from('jobs')
          .upsert(jobData, {
            onConflict: 'source,source_id',
            ignoreDuplicates: false,
          });

        if (error) {
          console.error(`Error upserting job ${offer.id}:`, error);
          errors++;
        } else {
          // Check if it was insert or update
          const { count } = await supabaseAdmin
            .from('jobs')
            .select('id', { count: 'exact', head: true })
            .eq('source_id', offer.id)
            .eq('source', 'justjoinit');

          if (count === 1) {
            inserted++;
          } else {
            updated++;
          }
        }
      } catch (err) {
        console.error(`Error processing job ${offer.id}:`, err);
        errors++;
      }
    }

    console.log(`JustJoin.it import completed: ${inserted} inserted, ${updated} updated, ${errors} errors`);

    return {
      success: true,
      total: offers.length,
      inserted,
      updated,
      errors,
    };
  } catch (error) {
    console.error('JustJoin.it scraper error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
