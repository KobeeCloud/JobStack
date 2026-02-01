import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Boxes, Plus, FolderOpen, LogOut, Settings, User, MoreVertical, Trash2, Edit, Copy } from 'lucide-react'
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

interface Project {
  id: string
  name: string
  description: string | null
  updated_at: string
}

async function ProjectsList() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(50) // Pagination limit

    if (error) {
      return (
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2 text-red-600">Błąd ładowania projektów</h3>
            <p className="text-muted-foreground mb-6">{error.message || 'Failed to load projects'}</p>
          </div>
        </Card>
      )
    }

    return (
      <>
        {!projects || projects.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6">Create your first infrastructure project</p>
              <Link href="/projects/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Create Project
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: Project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </>
    )
  } catch (err: any) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2 text-red-600">Błąd renderowania Dashboardu</h3>
          <p className="text-muted-foreground mb-6">{err?.message || 'Unknown error'}</p>
        </div>
      </Card>
    )
  }
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

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" aria-label="JobStack Home">
              <Boxes className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="font-bold text-xl">JobStack</span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
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
        </nav>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Projects</h1>
              <p className="text-muted-foreground">Manage infrastructure projects</p>
            </div>
            <Link href="/projects/new">
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                New Project
              </Button>
            </Link>
          </div>
          <Suspense fallback={<ProjectsListSkeleton />}>
            <ProjectsList />
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  )
}
