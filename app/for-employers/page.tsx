import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForEmployersPage() {
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
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Reach Thousands of Qualified Candidates
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Post your job openings on JobStack and get discovered by top tech talent in Poland
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register?role=employer">
              <Button size="lg" className="text-lg px-8 py-6">
                Post a Job - Free Trial
              </Button>
            </Link>
            <Link href="/api-docs">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                📖 API Documentation
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose JobStack?</h2>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <div className="text-4xl mb-4">🎯</div>
              <CardTitle>Targeted Audience</CardTitle>
              <CardDescription>
                Reach developers actively looking for opportunities in Poland. Your jobs appear alongside listings from JustJoin.it, NoFluffJobs, and more.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-4">⚡</div>
              <CardTitle>Quick & Easy Posting</CardTitle>
              <CardDescription>
                Post jobs in minutes via our dashboard or automate the process with our RESTful API. Perfect for ATS integrations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-4">📊</div>
              <CardTitle>Analytics & Insights</CardTitle>
              <CardDescription>
                Track views, clicks, and applications. Understand which tech stacks and salary ranges attract the most candidates.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Pricing */}
        <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <div className="text-4xl font-bold my-4">0 PLN<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              <CardDescription>Perfect for startups and small teams</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
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
              <Link href="/register?role=employer&plan=free">
                <Button variant="outline" className="w-full">Get Started</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-blue-500 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <div className="text-4xl font-bold my-4">199 PLN<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              <CardDescription>For growing companies</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Unlimited</strong> job postings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>30 days listing duration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>⭐ Featured placement (5 jobs/month)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Company branding & logo</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
              <Link href="/register?role=employer&plan=pro">
                <Button className="w-full">Start Free Trial</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Enterprise */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Enterprise</CardTitle>
              <div className="text-4xl font-bold my-4">Custom</div>
              <CardDescription>For large organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>SLA guarantees</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Bulk discounts</span>
                </li>
              </ul>
              <Link href="mailto:sales@jobstack.pl">
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* API Integration */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <CardHeader>
              <CardTitle className="text-3xl">Automate with Our API</CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Integrate JobStack directly with your ATS or HR system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-950 rounded-lg p-6 mb-6 overflow-x-auto">
                <pre className="text-sm text-green-400">
{`curl -X POST https://jobstack.vercel.app/api/employer/jobs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Senior Frontend Developer",
    "location": "Warsaw, Poland",
    "remote": true,
    "salary_min": 15000,
    "salary_max": 25000,
    "tech_stack": ["React", "TypeScript", "Next.js"]
  }'`}
                </pre>
              </div>
              <div className="flex gap-4">
                <Link href="/api-docs">
                  <Button variant="secondary" size="lg">
                    📖 Read API Docs
                  </Button>
                </Link>
                <Link href="/register?role=employer">
                  <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/20">
                    Get API Key
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to hire?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join hundreds of companies using JobStack to find their next hire
          </p>
          <Link href="/register?role=employer">
            <Button size="lg" className="text-lg px-12 py-6">
              Post Your First Job - Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
