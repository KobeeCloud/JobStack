import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
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

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-4">Simple Pricing for Everyone</h1>
        <p className="text-xl text-center text-muted-foreground mb-12">
          Choose the plan that fits your needs. Cancel anytime.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-2">Job Seekers</h2>
            <div className="text-4xl font-bold mb-4">FREE</div>
            <p className="text-muted-foreground mb-6">Forever free for candidates</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Search all jobs from multiple boards</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Save favorite jobs</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Email alerts for new jobs</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Track applications</span>
              </li>
            </ul>
            <Link href="/register?role=candidate">
              <Button className="w-full" size="lg">Get Started Free</Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 border-2 border-blue-500">
            <div className="text-sm font-semibold text-blue-600 mb-2">EMPLOYERS</div>
            <h2 className="text-2xl font-bold mb-2">Free Trial</h2>
            <div className="text-4xl font-bold mb-4">0 PLN</div>
            <p className="text-muted-foreground mb-6">Start with 1 free job posting</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>1 job posting per month</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>7 days listing duration</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Basic analytics</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>API access</span>
              </li>
            </ul>
            <Link href="/register?role=employer">
              <Button className="w-full" size="lg">Start Free Trial</Button>
            </Link>
            <p className="text-sm text-center text-muted-foreground mt-4">
              <Link href="/for-employers" className="underline">See all employer plans →</Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Need custom solutions? <Link href="mailto:sales@jobstack.pl" className="text-blue-600 underline">Contact our sales team</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
