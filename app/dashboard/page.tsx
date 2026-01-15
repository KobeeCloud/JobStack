import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const handleSignOut = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              JobStack
            </Link>
            <div className="flex gap-4 items-center">
              <Link href="/jobs">
                <Button variant="ghost">Browse Jobs</Button>
              </Link>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <form action={handleSignOut}>
                <Button variant="outline" type="submit">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back{profile?.role === 'employer' ? ', Recruiter' : ''}! 👋
          </h1>
          <p className="text-muted-foreground mb-8">
            {profile?.role === 'candidate'
              ? 'Find your next opportunity'
              : 'Manage your job postings'}
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Saved Jobs</CardTitle>
                <CardDescription>Jobs you're interested in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">0</div>
                <p className="text-sm text-muted-foreground mt-2">
                  No saved jobs yet
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Applications</CardTitle>
                <CardDescription>Jobs you've applied to</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">0</div>
                <p className="text-sm text-muted-foreground mt-2">
                  No applications yet
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Alerts</CardTitle>
                <CardDescription>Active job alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">0</div>
                <p className="text-sm text-muted-foreground mt-2">
                  No alerts configured
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Link href="/jobs">
                <Button>🔍 Browse Jobs</Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="outline">👤 Edit Profile</Button>
              </Link>
              {profile?.role === 'employer' && (
                <Link href="/dashboard/post-job">
                  <Button variant="outline">📝 Post a Job</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Coming Soon Features */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="opacity-60">
                <CardHeader>
                  <CardTitle className="text-lg">AI Resume Builder</CardTitle>
                  <CardDescription>
                    Create professional resumes with AI assistance
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="opacity-60">
                <CardHeader>
                  <CardTitle className="text-lg">Smart Matching</CardTitle>
                  <CardDescription>
                    Get personalized job recommendations based on your skills
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="opacity-60">
                <CardHeader>
                  <CardTitle className="text-lg">Interview Prep</CardTitle>
                  <CardDescription>
                    Practice with AI-powered interview questions
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="opacity-60">
                <CardHeader>
                  <CardTitle className="text-lg">Salary Insights</CardTitle>
                  <CardDescription>
                    Compare salaries across companies and roles
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
