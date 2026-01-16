/**
 * Script to add a test job to the database
 * Run with: npx tsx scripts/add-test-job.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTestJob() {
  console.log('🚀 Adding test job to database...');

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
      source: 'native',
      source_url: null,
      source_id: `test-job-${Date.now()}-1`,
      featured: true,
      published_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
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
      source: 'native',
      source_url: null,
      source_id: `test-job-${Date.now()}-2`,
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
      source: 'native',
      source_url: null,
      source_id: `test-job-${Date.now()}-3`,
      featured: true,
      published_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const job of testJobs) {
    const { data, error } = await supabase
      .from('jobs')
      .upsert(job, { onConflict: 'source,source_id' })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error adding job "${job.title}":`, error.message);
    } else {
      console.log(`✅ Added: "${job.title}" at ${job.company_name} (ID: ${data.id})`);
    }
  }

  // Count total jobs
  const { count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Total jobs in database: ${count}`);
  console.log('\n🎉 Done! Visit http://localhost:3000/jobs to see the jobs.');
}

addTestJob().catch(console.error);
