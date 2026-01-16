import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  Users,
  Bell,
  TrendingUp,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Settings,
  BarChart3,
  Mail,
  Calendar,
  ArrowRight,
  Building2,
  Search
} from 'lucide-react';

// Mock data for demo - in real app this would come from database
const mockEmployerJobs = [
  {
    id: '1',
    title: 'Senior DevOps Engineer',
    status: 'active',
    views: 234,
    applications: 12,
    publishedAt: '2026-01-10',
    expiresAt: '2026-02-10',
  },
  {
    id: '2',
    title: 'Cloud Platform Engineer',
    status: 'active',
    views: 156,
    applications: 8,
    publishedAt: '2026-01-12',
    expiresAt: '2026-02-12',
  },
  {
    id: '3',
    title: 'Junior Backend Developer',
    status: 'expired',
    views: 89,
    applications: 5,
    publishedAt: '2025-12-15',
    expiresAt: '2026-01-15',
  },
];

const mockApplications = [
  {
    id: '1',
    jobTitle: 'Senior DevOps Engineer',
    candidateName: 'Jan Kowalski',
    email: 'jan.kowalski@example.com',
    appliedAt: '2026-01-14',
    status: 'new',
    cvUrl: '#',
  },
  {
    id: '2',
    jobTitle: 'Senior DevOps Engineer',
    candidateName: 'Anna Nowak',
    email: 'anna.nowak@example.com',
    appliedAt: '2026-01-13',
    status: 'reviewed',
    cvUrl: '#',
  },
  {
    id: '3',
    jobTitle: 'Cloud Platform Engineer',
    candidateName: 'Piotr Wiśniewski',
    email: 'piotr.wisniewski@example.com',
    appliedAt: '2026-01-15',
    status: 'new',
    cvUrl: '#',
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // If profile doesn't exist, create it
  if (profileError && profileError.code === 'PGRST116') {
    // Get role from user metadata or default to candidate
    const role = (user.user_metadata?.role || 'candidate') as 'candidate' | 'employer';

    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email!,
        role: role,
      })
      .select()
      .single();

    profile = newProfile;

    // Create corresponding candidate or employer profile
    if (role === 'candidate') {
      await supabase.from('candidate_profiles').insert({ user_id: user.id });
    } else if (role === 'employer') {
      await supabase.from('employer_profiles').insert({ user_id: user.id });
    }
  }

  const isEmployer = profile?.role === 'employer';

  const handleSignOut = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
  };

  // Candidate Dashboard
  if (!isEmployer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        {/* Navigation */}
        <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                JobStack.pl
              </Link>
              <div className="flex gap-4 items-center">
                <Link href="/jobs">
                  <Button variant="ghost" className="rounded-xl">
                    <Search className="w-4 h-4 mr-2" />
                    Przeglądaj oferty
                  </Button>
                </Link>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </span>
                <form action={handleSignOut}>
                  <Button variant="outline" type="submit" className="rounded-xl">
                    Wyloguj
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Witaj ponownie! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Znajdź swoją wymarzoną pracę
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Zapisane oferty</CardTitle>
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">0</div>
                  <p className="text-xs text-gray-500 mt-1">Brak zapisanych ofert</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Wysłane aplikacje</CardTitle>
                  <FileText className="w-5 h-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">0</div>
                  <p className="text-xs text-gray-500 mt-1">Brak aplikacji</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Alerty email</CardTitle>
                  <Bell className="w-5 h-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">0</div>
                  <p className="text-xs text-gray-500 mt-1">Brak skonfigurowanych alertów</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 mb-8">
              <CardHeader>
                <CardTitle>Szybkie akcje</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Link href="/jobs">
                  <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Search className="w-4 h-4 mr-2" />
                    Przeglądaj oferty
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" className="rounded-xl">
                    <Settings className="w-4 h-4 mr-2" />
                    Edytuj profil
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Coming Soon */}
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Wkrótce</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="opacity-60 bg-white/60 dark:bg-gray-800/60">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    🤖 AI Resume Builder
                  </CardTitle>
                  <CardDescription>
                    Stwórz profesjonalne CV z pomocą AI
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="opacity-60 bg-white/60 dark:bg-gray-800/60">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    🎯 Smart Matching
                  </CardTitle>
                  <CardDescription>
                    Spersonalizowane rekomendacje ofert
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Employer Dashboard
  const newApplicationsCount = mockApplications.filter(a => a.status === 'new').length;
  const activeJobsCount = mockEmployerJobs.filter(j => j.status === 'active').length;
  const totalViews = mockEmployerJobs.reduce((sum, j) => sum + j.views, 0);
  const totalApplications = mockEmployerJobs.reduce((sum, j) => sum + j.applications, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              JobStack.pl
            </Link>
            <div className="flex gap-4 items-center">
              <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                <Building2 className="w-3 h-3 mr-1" />
                Pracodawca
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </span>
              <form action={handleSignOut}>
                <Button variant="outline" type="submit" className="rounded-xl">
                  Wyloguj
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Panel Pracodawcy 💼
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Zarządzaj ofertami pracy i przeglądaj aplikacje
              </p>
            </div>
            <Link href="/dashboard/post-job">
              <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25">
                <Plus className="w-5 h-5 mr-2" />
                Dodaj nową ofertę
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aktywne oferty</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeJobsCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Wszystkie aplikacje</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Wyświetlenia</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalViews}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nowe aplikacje</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{newApplicationsCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Jobs List */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Twoje oferty pracy</CardTitle>
                    <CardDescription>Zarządzaj opublikowanymi ogłoszeniami</CardDescription>
                  </div>
                  <Link href="/dashboard/jobs">
                    <Button variant="ghost" size="sm" className="rounded-xl">
                      Zobacz wszystkie
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockEmployerJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {job.title}
                          </h4>
                          <Badge className={
                            job.status === 'active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }>
                            {job.status === 'active' ? 'Aktywna' : 'Wygasła'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {job.views} wyświetleń
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {job.applications} aplikacji
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Wygasa: {new Date(job.expiresAt).toLocaleDateString('pl-PL')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-xl">
                          Edytuj
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Applications */}
            <div>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      Ostatnie aplikacje
                      {newApplicationsCount > 0 && (
                        <Badge className="bg-red-500 text-white">{newApplicationsCount} nowe</Badge>
                      )}
                    </CardTitle>
                  </div>
                  <CardDescription>Kandydaci, którzy złożyli aplikacje</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {app.candidateName}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {app.jobTitle}
                          </p>
                        </div>
                        {app.status === 'new' ? (
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            Nowa
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            Przejrzana
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <Mail className="w-4 h-4" />
                        {app.email}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {new Date(app.appliedAt).toLocaleDateString('pl-PL')}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="rounded-lg text-xs h-8">
                            <FileText className="w-3 h-3 mr-1" />
                            CV
                          </Button>
                          <Button size="sm" className="rounded-lg text-xs h-8 bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Akceptuj
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-lg text-xs h-8 text-red-600 hover:bg-red-50">
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Link href="/dashboard/applications">
                    <Button variant="outline" className="w-full rounded-xl mt-2">
                      Zobacz wszystkie aplikacje
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 mt-8">
            <CardHeader>
              <CardTitle>Szybkie akcje</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Link href="/dashboard/post-job">
                <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj ofertę
                </Button>
              </Link>
              <Link href="/dashboard/applications">
                <Button variant="outline" className="rounded-xl">
                  <Users className="w-4 h-4 mr-2" />
                  Przeglądaj aplikacje
                </Button>
              </Link>
              <Link href="/api-docs">
                <Button variant="outline" className="rounded-xl">
                  <Settings className="w-4 h-4 mr-2" />
                  Dokumentacja API
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="rounded-xl">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Upgrade planu
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
