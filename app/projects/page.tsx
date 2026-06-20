import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ProjectsList } from '@/components/projects-list'

interface Project {
  id: string
  name: string
  description: string | null
  updated_at: string
  created_at: string
  status: string
  cloud_provider: string
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // FIX BUG#7: Remove user_id filter — RLS policy already handles visibility
  // This now shows: (1) user-owned projects AND (2) organization projects where user is a member
  const { data: projects, count } = await supabase
    .from('projects')
    .select('*, organizations!organization_id(name, slug)', { count: 'exact' })
    .order('updated_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo size={24} />
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">Projects</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/projects/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Projects</h1>
          <p className="text-muted-foreground">
            {count || 0} project{(count || 0) !== 1 ? 's' : ''} total
          </p>
        </div>

        <ProjectsList projects={(projects ?? []) as Project[]} />
      </main>

      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            <ArrowLeft className="inline h-3 w-3 mr-1" />
            Back to Dashboard
          </Link>
        </div>
      </footer>
    </div>
  )
}
