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
import { LogoIcon } from '@/components/logo'
import { ErrorBoundary } from '@/components/error-boundary'
import { Suspense } from 'react'
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

interface Project {
  id: string
  name: string
  description: string | null
  updated_at: string
  created_at: string
  status: string
  cloud_provider: string
}

// Stats component
async function DashboardStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [projectsRes, orgsRes] = await Promise.all([
    supabase.from('projects').select('id, status, created_at', { count: 'exact' }).eq('user_id', user.id),
    supabase.from('organizations').select('id', { count: 'exact' }).eq('owner_id', user.id)
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
        <Card key={stat.label} className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
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
    <div className="grid md:grid-cols-3 gap-4 mb-8">
      {actions.map((action) => (
        <Link key={action.label} href={action.href}>
          <Card className="group hover:shadow-md transition-all cursor-pointer border-dashed hover:border-solid hover:border-primary/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl text-white ${action.color} group-hover:scale-110 transition-transform`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {action.label}
                </h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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

// Recent Activity component
async function RecentActivity() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: recentProjects } = await supabase
    .from('projects')
    .select('id, name, updated_at, status, cloud_provider')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(5)

  if (!recentProjects || recentProjects.length === 0) return null

  // Calculate relative time during render (server-side)
  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'aws': return 'bg-orange-500/10 text-orange-600'
      case 'gcp': return 'bg-blue-500/10 text-blue-600'
      case 'azure': return 'bg-sky-500/10 text-sky-600'
      default: return 'bg-gray-500/10 text-gray-600'
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </div>
          <Link href="/projects" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {(recentProjects as RecentProject[]).map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-muted">
                <FileCode className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate group-hover:text-primary transition-colors">
                  {project.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-medium ${getProviderColor(project.cloud_provider)}`}>
                    {project.cloud_provider}
                  </span>
                  <span>•</span>
                  <span>{getTimeAgo(project.updated_at)}</span>
                </div>
              </div>
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                {project.status}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Projects List
async function ProjectsList() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
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

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user profile for personalization
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, subscription_tier, avatar_url')
    .eq('id', user.id)
    .single()

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'there'

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
        {/* Navigation */}
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" aria-label="JobStack Home">
              <LogoIcon size={24} />
              <span className="font-bold text-xl">JobStack</span>
            </Link>

            <div className="flex items-center gap-4">
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
              {greeting()}, {displayName}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your infrastructure projects.
            </p>
          </div>

          {/* Stats */}
          <Suspense fallback={<StatsLoadingSkeleton />}>
            <DashboardStats />
          </Suspense>

          {/* Quick Actions */}
          <QuickActions />

          {/* Recent Activity */}
          <Suspense fallback={null}>
            <RecentActivity />
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
            <ProjectsList />
          </Suspense>
        </main>

        {/* Footer */}
        <footer className="border-t py-6 mt-auto">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2026 JobStack. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Polityka Prywatności</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Regulamin</Link>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
