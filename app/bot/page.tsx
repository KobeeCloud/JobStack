import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'JobStack Bot - Web Crawler Information',
  description: 'Information about JobStack web crawler and how to contact us.',
};

export default function BotPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              JobStack
            </Link>
            <div className="flex gap-4">
              <Link href="/jobs">
                <Button variant="ghost">Browse Jobs</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 prose prose-blue dark:prose-invert max-w-none">
          <h1>🤖 JobStack Bot Information</h1>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 my-4">
            <p className="font-bold">User-Agent:</p>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              JobStackBot/1.0 (+https://jobstack.pl/bot; legal@jobstack.pl)
            </code>
          </div>

          <h2>What is JobStack Bot?</h2>
          <p>
            JobStack Bot is an automated web crawler that collects <strong>publicly available job listings</strong>
            from various job boards to aggregate them on JobStack.pl - a job search aggregator for the Polish IT market.
          </p>

          <h2>What We Collect</h2>
          <p>Our bot only collects:</p>
          <ul>
            <li>Job titles and descriptions</li>
            <li>Company names and logos (publicly displayed)</li>
            <li>Salary ranges (if publicly available)</li>
            <li>Location and remote work information</li>
            <li>Required skills and technologies</li>
            <li>Links back to the original job posting</li>
          </ul>

          <h2>What We Do NOT Collect</h2>
          <ul>
            <li>❌ Personal data of job seekers</li>
            <li>❌ Private or password-protected content</li>
            <li>❌ Content behind login walls</li>
            <li>❌ User profiles or contact information</li>
          </ul>

          <h2>Our Crawling Practices</h2>
          <p>We follow ethical web crawling practices:</p>
          <ul>
            <li>✅ We respect <code>robots.txt</code> files</li>
            <li>✅ We use reasonable rate limiting (max 1 request/second)</li>
            <li>✅ We identify ourselves with a proper User-Agent</li>
            <li>✅ We provide full attribution to original sources</li>
            <li>✅ We link back to original job postings</li>
            <li>✅ We crawl only during off-peak hours (3x daily)</li>
          </ul>

          <h2>Attribution</h2>
          <p>
            Every job listing on JobStack clearly displays the original source and links directly
            to the original job posting. We do not claim ownership of aggregated content.
          </p>

          <h2>Request Removal</h2>
          <p>
            If you are a job board operator or employer and would like your listings removed from JobStack,
            please contact us:
          </p>
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:legal@jobstack.pl" className="text-blue-600 hover:underline">
              legal@jobstack.pl
            </a>
          </p>
          <p>
            Please include:
          </p>
          <ul>
            <li>The domain(s) you represent</li>
            <li>Proof of authority (e.g., email from official domain)</li>
            <li>Specific URLs you want removed (or &quot;all&quot;)</li>
          </ul>
          <p>
            We will process removal requests within <strong>5 business days</strong>.
          </p>

          <h2>Block Our Bot</h2>
          <p>
            To block JobStack Bot from crawling your site, add the following to your <code>robots.txt</code>:
          </p>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto">
{`User-agent: JobStackBot
Disallow: /`}
          </pre>

          <h2>Technical Details</h2>
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
            <tbody>
              <tr>
                <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">User-Agent</th>
                <td className="border border-gray-300 dark:border-gray-700 p-2">
                  <code>JobStackBot/1.0</code>
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">Crawl Frequency</th>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Once daily (06:00 UTC)</td>
              </tr>
              <tr>
                <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">Rate Limit</th>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Max 1 request per second per domain</td>
              </tr>
              <tr>
                <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">IP Range</th>
                <td className="border border-gray-300 dark:border-gray-700 p-2">Vercel Edge Network</td>
              </tr>
            </tbody>
          </table>

          <h2>Contact</h2>
          <p>
            <strong>Legal inquiries:</strong>{' '}
            <a href="mailto:legal@jobstack.pl" className="text-blue-600 hover:underline">
              legal@jobstack.pl
            </a>
            <br />
            <strong>Technical issues:</strong>{' '}
            <a href="mailto:tech@jobstack.pl" className="text-blue-600 hover:underline">
              tech@jobstack.pl
            </a>
          </p>

          <h2>Legal Basis</h2>
          <p>
            Our crawling activities are conducted in accordance with:
          </p>
          <ul>
            <li>Polish Copyright Law (Art. 34 - fair use for information purposes)</li>
            <li>EU Database Directive 96/9/EC</li>
            <li>GDPR/RODO (we only process publicly available business information)</li>
          </ul>

          <hr className="my-8" />

          <div className="flex gap-4 justify-center mt-8">
            <Link href="/terms">
              <Button variant="outline">Terms of Service</Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline">Privacy Policy</Button>
            </Link>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
