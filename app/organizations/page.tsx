import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Boxes, ArrowLeft, Building2, Plus, Users, Settings, Crown, Shield, User } from 'lucide-react'
import { ErrorBoundary } from '@/components/error-boundary'

interface Organization {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  subscription_tier: string
  max_members: number
  created_at: string
}

interface OrgMember {
  organization_id: string
  role: string
  organizations: Organization
}

export default async function OrganizationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get organizations the user is a member of
  const { data: memberships, error } = await supabase
    .from('organization_members')
    .select(`
      organization_id,
      role,
      organizations (
        id,
        name,
        slug,
        description,
        logo_url,
        subscription_tier,
        max_members,
        created_at
      )
    `)
    .eq('user_id', user.id)

  const organizations = (memberships as unknown as OrgMember[])?.map(m => ({
    ...m.organizations,
    role: m.role
  })) || []

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />
      default: return <User className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" aria-label="JobStack Home">
              <Boxes className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="font-bold text-xl">JobStack</span>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Building2 className="h-8 w-8" />
                Organizations
              </h1>
              <p className="text-muted-foreground">Manage your teams and collaborate on projects</p>
            </div>
            <Link href="/organizations/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Organization
              </Button>
            </Link>
          </div>

          {organizations.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No organizations yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create an organization to collaborate with your team on infrastructure projects.
                </p>
                <Link href="/organizations/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Organization
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {organizations.map((org: any) => (
                <Card key={org.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        {org.logo_url ? (
                          <img src={org.logo_url} alt={org.name} className="h-10 w-10 rounded" />
                        ) : (
                          <Building2 className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {org.name}
                          {getRoleIcon(org.role)}
                        </CardTitle>
                        <CardDescription>
                          {org.description || `@${org.slug}`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                        {org.subscription_tier}
                      </span>
                      <Link href={`/organizations/${org.slug}`}>
                        <Button variant="outline" size="sm">
                          <Settings className="mr-2 h-4 w-4" />
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Up to {org.max_members} members
                      </div>
                      <div>
                        Your role: <span className="font-medium capitalize">{org.role}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Enterprise Benefits */}
          <Card className="mt-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Enterprise Features
              </CardTitle>
              <CardDescription>
                Upgrade to Enterprise for advanced team features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid md:grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2">✓ Unlimited team members</li>
                <li className="flex items-center gap-2">✓ Real-time collaboration</li>
                <li className="flex items-center gap-2">✓ Advanced role permissions</li>
                <li className="flex items-center gap-2">✓ SSO / SAML authentication</li>
                <li className="flex items-center gap-2">✓ Audit logs</li>
                <li className="flex items-center gap-2">✓ Priority support</li>
              </ul>
              <Button className="mt-4" variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  )
}
