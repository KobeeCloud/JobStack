import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">JobStack</Link>
            <div className="flex gap-4">
              <Link href="/jobs"><Button variant="ghost">Browse Jobs</Button></Link>
              <Link href="/login"><Button variant="outline">Sign In</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 prose prose-blue dark:prose-invert max-w-none">
          <h1>About JobStack</h1>

          <h2>Our Mission</h2>
          <p>
            JobStack was created to solve a simple problem: job seekers in Poland waste hours checking multiple job boards
            every day. JustJoin.it, NoFluffJobs, Pracuj.pl, Indeed — each has great opportunities, but checking them all
            is time-consuming and frustrating.
          </p>
          <p>
            We believe finding your dream job should be simple, not a full-time job itself.
          </p>

          <h2>What We Do</h2>
          <p>JobStack is a <strong>job aggregation platform</strong> that brings together opportunities from all major Polish job boards into one searchable interface.</p>

          <p>We:</p>
          <ul>
            <li>🔍 <strong>Aggregate</strong> jobs from JustJoin.it, NoFluffJobs, Pracuj.pl, Indeed, and more</li>
            <li>⚡ <strong>Update</strong> listings daily so you never miss new opportunities</li>
            <li>🎯 <strong>Filter</strong> by technology, location, salary, and remote work options</li>
            <li>📧 <strong>Alert</strong> you when jobs matching your criteria are posted</li>
            <li>🤖 <strong>Provide</strong> API access for employers to automate job posting</li>
          </ul>

          <h2>For Job Seekers</h2>
          <p>
            JobStack is <strong>100% free</strong> for candidates. Forever. No hidden fees, no premium tiers.
            We make money from employers, not job seekers.
          </p>

          <h2>For Employers</h2>
          <p>
            We offer simple, transparent pricing for posting jobs. Start with a free trial (1 job/month),
            then upgrade to Pro for unlimited postings, featured placement, and advanced analytics.
          </p>

          <h2>Legal & Compliance</h2>
          <p>JobStack is fully compliant with:</p>
          <ul>
            <li><strong>RODO/GDPR</strong> — Your privacy is protected</li>
            <li><strong>Polish Law</strong> — Registered JDG business</li>
            <li><strong>EU Copyright Law</strong> — We respect intellectual property</li>
          </ul>
          <p>
            All job listings are aggregated from publicly available sources with clear attribution.
            We link to the original postings and are not responsible for their accuracy.
          </p>
          <p>
            Read our <Link href="/terms">Terms of Service</Link>, <Link href="/privacy">Privacy Policy</Link>,
            and <Link href="/cookies">Cookie Policy</Link>.
          </p>

          <h2>Technology</h2>
          <p>Built with modern, scalable technologies:</p>
          <ul>
            <li><strong>Next.js 15</strong> — React framework for production</li>
            <li><strong>Supabase</strong> — PostgreSQL database with Row-Level Security</li>
            <li><strong>Vercel</strong> — Edge deployment for fast, global access</li>
            <li><strong>TypeScript</strong> — Type-safe, maintainable code</li>
          </ul>

          <h2>Open Source</h2>
          <p>
            We believe in transparency. Key parts of JobStack are open source and available on{' '}
            <a href="https://github.com/KobeeCloud/JobStack" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>.
          </p>

          <h2>Contact Us</h2>
          <p>
            Have questions, feedback, or want to partner with us? Reach out:
          </p>
          <ul>
            <li><strong>General:</strong> <a href="mailto:support@jobstack.pl">support@jobstack.pl</a></li>
            <li><strong>Business:</strong> <a href="mailto:sales@jobstack.pl">sales@jobstack.pl</a></li>
            <li><strong>Legal:</strong> <a href="mailto:legal@jobstack.pl">legal@jobstack.pl</a></li>
          </ul>

          <hr className="my-8" />

          <p className="text-center">
            <strong>JobStack by KobeeCloud</strong><br />
            Made with ❤️ in Poland 🇵🇱
          </p>

          <div className="flex gap-4 justify-center mt-8">
            <Link href="/jobs">
              <Button size="lg">Browse Jobs</Button>
            </Link>
            <Link href="/for-employers">
              <Button size="lg" variant="outline">For Employers</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
