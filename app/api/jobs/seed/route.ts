import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// POST /api/jobs/seed - Add test jobs (only in development)
export async function POST(request: NextRequest) {
  try {
    // Security: Only allow in development or with secret
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'dev-secret-token';
    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized - only available in development or with valid token' },
        { status: 401 }
      );
    }

    console.log('🌱 Seeding test jobs...');

    const testJobs = [
      {
        title: 'Senior Full-Stack Developer',
        company_name: 'TechCorp Poland',
        company_logo: 'https://placehold.co/200x200/3B82F6/FFFFFF?text=TC',
        location: 'Warsaw',
        remote: true,
        salary_min: 18000,
        salary_max: 28000,
        salary_currency: 'PLN',
        tech_stack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
        description: `We are looking for a passionate Senior Full-Stack Developer to join our growing team!

As a Senior Developer, you will:
- Design and implement scalable web applications
- Mentor junior developers
- Collaborate with product team on new features
- Participate in code reviews and architectural decisions

We offer:
- Fully remote work
- Flexible hours
- MacBook Pro + additional equipment
- Private healthcare
- Learning budget`,
        requirements: [
          '5+ years of experience with TypeScript/JavaScript',
          'Strong knowledge of React and Node.js',
          'Experience with PostgreSQL or similar databases',
          'Docker and CI/CD experience',
          'AWS or GCP cloud experience',
          'Good English communication skills',
        ],
        benefits: [
          '🏠 Fully remote work',
          '⏰ Flexible working hours',
          '💻 MacBook Pro + monitors',
          '🏥 Private healthcare (Medicover)',
          '📚 10,000 PLN annual learning budget',
          '🎮 Gaming room in Warsaw office',
          '🍕 Team events and parties',
        ],
        source: 'native' as const,
        source_url: null,
        source_id: `seed-job-senior-fullstack`,
        featured: true,
        published_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Junior React Developer',
        company_name: 'StartupXYZ',
        company_logo: 'https://placehold.co/200x200/10B981/FFFFFF?text=XYZ',
        location: 'Kraków',
        remote: false,
        salary_min: 8000,
        salary_max: 12000,
        salary_currency: 'PLN',
        tech_stack: ['JavaScript', 'React', 'CSS', 'Git'],
        description: `Perfect opportunity for junior developers to kickstart their career!

We're a friendly startup looking for enthusiastic Junior React Developer.

What you'll do:
- Build UI components with React
- Work closely with senior developers
- Learn best practices in modern web development`,
        requirements: [
          '1+ year of JavaScript experience',
          'Basic React knowledge',
          'Understanding of HTML/CSS',
          'Git basics',
          'Eagerness to learn',
        ],
        benefits: [
          '🎓 Mentorship program',
          '📈 Clear career path',
          '🏥 Private healthcare',
          '🎮 PlayStation in the office',
        ],
        source: 'native' as const,
        source_url: null,
        source_id: `seed-job-junior-react`,
        featured: false,
        published_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'DevOps Engineer',
        company_name: 'CloudMasters',
        company_logo: 'https://placehold.co/200x200/8B5CF6/FFFFFF?text=CM',
        location: 'Remote',
        remote: true,
        salary_min: 20000,
        salary_max: 32000,
        salary_currency: 'PLN',
        tech_stack: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'GCP', 'Python', 'Bash'],
        description: `Join our DevOps team and help us scale infrastructure for millions of users!

We're building next-generation cloud infrastructure and need experienced DevOps engineers.`,
        requirements: [
          '3+ years of DevOps experience',
          'Kubernetes expertise',
          'Infrastructure as Code (Terraform, Pulumi)',
          'AWS or GCP certifications preferred',
          'Scripting (Python, Bash)',
        ],
        benefits: [
          '🌍 Work from anywhere',
          '💰 Competitive salary + bonuses',
          '📚 Conference budget',
          '🏥 Premium healthcare',
        ],
        source: 'native' as const,
        source_url: null,
        source_id: `seed-job-devops`,
        featured: true,
        published_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Python Backend Developer',
        company_name: 'DataFlow Inc',
        company_logo: 'https://placehold.co/200x200/F59E0B/FFFFFF?text=DF',
        location: 'Wrocław',
        remote: true,
        salary_min: 15000,
        salary_max: 25000,
        salary_currency: 'PLN',
        tech_stack: ['Python', 'FastAPI', 'Django', 'PostgreSQL', 'Redis', 'Docker'],
        description: `We're building data pipelines that process billions of records daily.

Join us if you love Python and want to work on challenging problems!`,
        requirements: [
          '3+ years Python experience',
          'FastAPI or Django experience',
          'SQL databases knowledge',
          'Understanding of async programming',
        ],
        benefits: [
          '🏠 Hybrid work (2 days office)',
          '💰 Performance bonuses',
          '🏥 Private healthcare + dental',
        ],
        source: 'native' as const,
        source_url: null,
        source_id: `seed-job-python`,
        featured: false,
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        expires_at: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'QA Automation Engineer',
        company_name: 'TestPro',
        company_logo: 'https://placehold.co/200x200/EF4444/FFFFFF?text=TP',
        location: 'Poznań',
        remote: true,
        salary_min: 12000,
        salary_max: 18000,
        salary_currency: 'PLN',
        tech_stack: ['Playwright', 'Cypress', 'TypeScript', 'Jest', 'CI/CD'],
        description: `Quality is our top priority! We're looking for QA engineers who love breaking things.

You'll work with modern testing frameworks and ensure our products are bug-free.`,
        requirements: [
          '2+ years in test automation',
          'Playwright or Cypress experience',
          'TypeScript/JavaScript',
          'API testing experience',
        ],
        benefits: [
          '🏠 Fully remote',
          '📚 Training budget',
          '🎯 No crunch culture',
        ],
        source: 'native' as const,
        source_url: null,
        source_id: `seed-job-qa`,
        featured: false,
        published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        expires_at: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const results = [];

    for (const job of testJobs) {
      const { data, error } = await supabaseAdmin
        .from('jobs')
        .upsert(job, { onConflict: 'source,source_id' })
        .select()
        .single();

      if (error) {
        results.push({ title: job.title, status: 'error', error: error.message });
      } else {
        results.push({ title: job.title, status: 'success', id: data.id });
      }
    }

    // Count total jobs
    const { count } = await supabaseAdmin
      .from('jobs')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      message: 'Test jobs seeded successfully',
      results,
      totalJobs: count,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed jobs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - show instructions
export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to seed test jobs',
    note: 'This endpoint is only available in development mode or with valid authorization token',
    usage: 'curl -X POST http://localhost:3000/api/jobs/seed',
  });
}
