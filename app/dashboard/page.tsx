import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Plus, FolderOpen, LogOut, Settings, User,
  Building2, Activity, Clock, TrendingUp, Layers,
  FileCode, Star, ArrowRight, Sparkles
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { ErrorBoundary } from '@/components/error-boundary'
import { Suspense } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { DashboardCharts } from '@/components/dashboard-charts'
import { RelativeTime } from '@/components/relative-time'
import { getTranslations } from 'next-intl/server'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ProjectCard } from '@/components/project-card'
import { Badge } from '@/components/ui/badge'
import { NotificationBell } from '@/components/notifications/notification-bell'

interface Project {
  id: string
  name: string
  description: string | null
  updated_at: string
  created_at: string
  status: string
  cloud_provider: string
}

// Stats component — BUG-1: accepts userId to avoid redundant getUser() calls
async function DashboardStats({ userId }: { userId: string }) {
  const supabase = await createClient()

  const [projectsRes, orgsRes] = await Promise.all([
    supabase.from('projects').select('id, status, created_at', { count: 'exact' }).eq('user_id', userId),
    supabase.from('organizations').select('id', { count: 'exact' }).eq('owner_id', userId)
  ])

  const projectCount = projectsRes.count || 0
  const orgCount = orgsRes.count || 0

  // Calculate projects created this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const recentProjects = projectsRes.data?.filter((p: { created_at: string }) =>
    new Date(p.created_at) >= startOfMonth
  ).length || 0

  const stats = [
    {
      label: 'Total Projects',
      value: projectCount,
      icon: FolderOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Organizations',
      value: orgCount,
      icon: Building2,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      label: 'This Month',
      value: recentProjects,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'Active',
      value: projectsRes.data?.filter((p: { status: string }) => p.status === 'active').length || 0,
      icon: Activity,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-none shadow-md bg-background/60 backdrop-blur-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full ${stat.bgColor} blur-2xl opacity-50 -mr-8 -mt-8 group-hover:scale-110 transition-transform`} />
          <CardContent className="p-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bgColor} shadow-sm group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-3xl font-extrabold tracking-tight">{stat.value}</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Quick Actions component
function QuickActions() {
  const actions = [
    {
      label: 'New Project',
      href: '/projects/new',
      icon: Plus,
      description: 'Start a new infrastructure diagram',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      label: 'Browse Templates',
      href: '/templates',
      icon: Layers,
      description: 'Use pre-built architectures',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      label: 'Create Organization',
      href: '/organizations/new',
      icon: Building2,
      description: 'Collaborate with your team',
      color: 'bg-gradient-to-br from-green-500 to-green-600'
    },
  ]

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {actions.map((action) => (
        <Link key={action.label} href={action.href} className="block">
          <Card className="group h-full hover:shadow-lg transition-all duration-300 cursor-pointer border border-border/50 bg-background/50 backdrop-blur-sm relative overflow-hidden">
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${action.color}`} />

            <CardContent className="p-6 relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-4 rounded-xl text-white ${action.color} shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary transition-all duration-300" />
              </div>

              <div className="mt-auto">
                <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
                  {action.label}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {action.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

interface RecentProject {
  id: string
  name: string
  updated_at: string
  status: string
  cloud_provider: string
}

// Recent Activity component — BUG-1: accepts userId prop
async function RecentActivity({ userId }: { userId: string }) {
  const supabase = await createClient()

  const { data: recentProjects } = await supabase
    .from('projects')
    .select('id, name, updated_at, status, cloud_provider')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(5)

  if (!recentProjects || recentProjects.length === 0) return null

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'aws': return 'bg-orange-500/10 text-orange-600'
      case 'gcp': return 'bg-blue-500/10 text-blue-600'
      case 'azure': return 'bg-sky-500/10 text-sky-600'
      default: return 'bg-gray-500/10 text-gray-600'
    }
  }

  return (
    <Card className="mb-8 border-none shadow-lg bg-background/50 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold tracking-tight">Recent Activity</CardTitle>
          </div>
          <Link href="/projects" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group">
            View all <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {(recentProjects as RecentProject[]).map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />
              <div className="p-3 rounded-xl bg-background border shadow-sm group-hover:shadow-md group-hover:border-primary/20 transition-all">
                <FileCode className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base truncate group-hover:text-primary transition-colors mb-1">
                  {project.name}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide border ${getProviderColor(project.cloud_provider)}`}>
                    {project.cloud_provider}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <RelativeTime date={project.updated_at} />
                  </span>
                </div>
              </div>
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="px-3 py-1 text-xs font-semibold shadow-sm">
                {project.status.toUpperCase()}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Projects List
async function ProjectsList({ userId }: { userId: string }) {
  const supabase = await createClient()

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2 text-red-600">Error loading projects</h3>
          <p className="text-muted-foreground mb-6">{error.message}</p>
        </div>
      </Card>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <Card className="p-12 border-dashed">
        <div className="text-center">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Create your first project</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Start designing your cloud infrastructure with our visual diagram editor.
          </p>
          <Link href="/projects/new">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project: Project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}

function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-8 bg-muted rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ProjectsListSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-3/4 mb-2" />
            <div className="h-4 bg-muted rounded w-full" />
          </CardHeader>
          <CardContent>
            <div className="h-3 bg-muted rounded w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Analytics data fetching
async function AnalyticsDashboard({ userId }: { userId: string }) {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, cloud_provider, status, created_at')
    .eq('user_id', userId)

  if (!projects || projects.length < 2) return null

  // Projects by provider
  const providerCounts = projects.reduce((acc: Record<string, number>, p: { cloud_provider: string }) => {
    const key = p.cloud_provider || 'other'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const projectsByProvider = Object.entries(providerCounts).map(([name, count]) => ({
    name: name.toUpperCase(),
    count: count as number,
  }))

  // Projects by status
  const statusCounts = projects.reduce((acc: Record<string, number>, p: { status: string }) => {
    const key = p.status || 'draft'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const projectsByStatus = Object.entries(statusCounts).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count: count as number,
  }))

  // Projects by month (last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const now = new Date()
  const projectsByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const month = `${monthNames[d.getMonth()]} ${d.getFullYear()}`
    const count = projects.filter((p: { created_at: string }) => {
      const pd = new Date(p.created_at)
      return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear()
    }).length
    return { month, count }
  })

  // BUG-2: Only fetch diagram nodes for category counting — limit to most recent diagrams.
  // For large datasets, consider a Postgres RPC that aggregates categories server-side.
  const projectIds = projects.map((p: { id: string }) => p.id)
  const { data: diagrams } = projectIds.length > 0
    ? await supabase
      .from('diagrams')
      .select('nodes')
      .in('project_id', projectIds)
      .limit(100)
    : { data: null }

  const categoryCounts: Record<string, number> = {}
  if (diagrams) {
    for (const diagram of diagrams) {
      const nodes = Array.isArray(diagram.nodes) ? diagram.nodes : []
      for (const node of nodes) {
        const category = (node as { data?: { category?: string } }).data?.category || 'unknown'
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      }
    }
  }
  const componentsByCategory = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  return (
    <DashboardCharts
      data={{
        projectsByProvider,
        projectsByStatus,
        projectsByMonth,
        componentsByCategory,
      }}
    />
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // SR-3: Use i18n translations for footer
  const footerT = await getTranslations('footer')

  // Get user profile for personalization
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, subscription_tier, avatar_url')
    .eq('id', user.id)
    .single()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'there'

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
        {/* Navigation */}
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" aria-label="JobStack Home">
              <Logo size={24} />
            </Link>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <NotificationBell />
              <ThemeToggle />
              {profile?.subscription_tier && profile.subscription_tier !== 'free' && (
                <Badge variant="outline" className="hidden sm:flex gap-1 text-primary border-primary/30">
                  <Star className="h-3 w-3 fill-primary" />
                  {profile.subscription_tier.charAt(0).toUpperCase() + profile.subscription_tier.slice(1)}
                </Badge>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt=""
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <span className="hidden sm:inline font-medium">{displayName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/organizations">
                      <Building2 className="mr-2 h-4 w-4" />
                      Organizations
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings/billing">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form action="/auth/signout" method="post" className="w-full">
                      <button type="submit" className="flex w-full items-center text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {greeting}, {displayName}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your infrastructure projects.
            </p>
          </div>

          {/* Stats */}
          <Suspense fallback={<StatsLoadingSkeleton />}>
            <DashboardStats userId={user.id} />
          </Suspense>

          {/* Quick Actions */}
          <QuickActions />

          {/* Recent Activity */}
          <Suspense fallback={null}>
            <RecentActivity userId={user.id} />
          </Suspense>

          {/* Analytics Charts */}
          <Suspense fallback={null}>
            <AnalyticsDashboard userId={user.id} />
          </Suspense>

          {/* Projects Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Your Projects</h2>
              <p className="text-muted-foreground text-sm">Manage and organize your diagrams</p>
            </div>
            <Link href="/projects/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </Link>
          </div>

          <Suspense fallback={<ProjectsListSkeleton />}>
            <ProjectsList userId={user.id} />
          </Suspense>
        </main>

        {/* Footer */}
        <footer className="border-t py-6 mt-auto">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>{footerT('copyright', { year: new Date().getFullYear() })}</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-foreground transition-colors">{footerT('privacy')}</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">{footerT('terms')}</Link>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
