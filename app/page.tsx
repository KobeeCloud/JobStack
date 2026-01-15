import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
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
              <Link href="/for-employers">
                <Button variant="ghost">For Employers</Button>
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

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <Badge className="mb-4" variant="secondary">
            🚀 Now aggregating 50,000+ jobs from 5+ boards
          </Badge>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Find Your Perfect Job
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              In One Place
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Stop wasting time checking multiple job boards. We aggregate thousands of opportunities from JustJoin.it, NoFluffJobs, Pracuj.pl and more.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-12">
            <Link href="/jobs">
              <Button size="lg" className="text-lg px-8 py-6">
                🔍 Search Jobs Now
              </Button>
            </Link>
            <Link href="/for-employers">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                👔 Post a Job
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50,000+</div>
              <div className="text-gray-600 dark:text-gray-400">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">5+</div>
              <div className="text-gray-600 dark:text-gray-400">Job Boards</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-400">Updated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
          Why JobStack?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <div className="text-5xl mb-4">🔍</div>
              <CardTitle>All Jobs in One Place</CardTitle>
              <CardDescription className="text-base">
                No more switching between multiple job boards. Find everything from JustJoin.it, NoFluffJobs, Pracuj.pl and more.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <div className="text-5xl mb-4">⚡</div>
              <CardTitle>Real-time Updates</CardTitle>
              <CardDescription className="text-base">
                New jobs are added every hour. Get instant access to the latest opportunities before anyone else.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <div className="text-5xl mb-4">🎯</div>
              <CardTitle>Smart Filtering</CardTitle>
              <CardDescription className="text-base">
                Filter by technology, location, salary, remote work and more. Find exactly what you're looking for.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <div className="text-5xl mb-4">🤖</div>
              <CardTitle>API for Automation</CardTitle>
              <CardDescription className="text-base">
                Automate your job posting process with our RESTful API. Perfect for HR teams and ATS integrations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <div className="text-5xl mb-4">📧</div>
              <CardTitle>Email Alerts</CardTitle>
              <CardDescription className="text-base">
                Get notified when new jobs matching your criteria are posted. Never miss an opportunity.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <div className="text-5xl mb-4">💼</div>
              <CardTitle>For Employers</CardTitle>
              <CardDescription className="text-base">
                Post jobs easily with our dashboard or API. Reach thousands of qualified candidates.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0">
          <CardContent className="p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to find your dream job?</h2>
            <p className="text-xl mb-8 opacity-90">Join thousands of job seekers using JobStack</p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/for-employers">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 text-white border-white hover:bg-white/20"
                >
                  For Employers
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">JobStack</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Find your perfect job in one place. Aggregating opportunities from all major Polish job boards.
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>JobStack by KobeeCloud</strong><br />
                Jednoosobowa Działalność Gospodarcza<br />
                NIP: [Your NIP]<br />
                REGON: [Your REGON]
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/jobs" className="hover:text-foreground">Browse Jobs</Link></li>
                <li><Link href="/register" className="hover:text-foreground">Create Account</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/for-employers" className="hover:text-foreground">Post a Job</Link></li>
                <li><Link href="/api-docs" className="hover:text-foreground">API Documentation</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal & Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy (RODO)</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground">Cookie Policy</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
                <li className="pt-2">
                  <a href="mailto:legal@jobstack.pl" className="hover:text-foreground">
                    legal@jobstack.pl
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="border-t pt-6 mb-6">
            <p className="text-xs text-muted-foreground text-center max-w-4xl mx-auto">
              <strong>Legal Disclaimer:</strong> JobStack is a job aggregation platform. We collect publicly available job listings from various sources
              (JustJoin.it, NoFluffJobs, etc.) and display them with clear attribution. We are NOT an employer and do NOT guarantee the accuracy
              of third-party job listings. By applying to jobs, you will be redirected to the original job board. See our{' '}
              <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link> and{' '}
              <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link> for details.
            </p>
          </div>

          {/* Copyright */}
          <div className="text-center text-sm text-muted-foreground border-t pt-8">
            <p>© 2026 JobStack by KobeeCloud. All rights reserved. Made with ❤️ in Poland 🇵🇱</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
