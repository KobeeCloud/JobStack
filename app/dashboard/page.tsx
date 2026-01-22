import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Boxes, Plus, FolderOpen } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string | null
  updated_at: string
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects } = await supabase.from('projects').select('*').order('updated_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Boxes className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">JobStack</span>
          </Link>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground">Manage infrastructure projects</p>
          </div>
          <Link href="/projects/new"><Button size="lg"><Plus className="mr-2 h-4 w-4" />New Project</Button></Link>
        </div>
        {!projects || projects.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6">Create your first infrastructure project</p>
              <Link href="/projects/new"><Button><Plus className="mr-2 h-4 w-4" />Create Project</Button></Link>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: Project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{project.description || 'No description'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">Updated {new Date(project.updated_at).toLocaleDateString()}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
