import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, User, Shield, Bell, Palette, Key, Database, CreditCard } from 'lucide-react'
import { LogoIcon } from '@/components/logo'
import { ErrorBoundary } from '@/components/error-boundary'
import { SettingsForm, DeleteAccountButton, HardDeleteAccountButton } from './settings-form'
import { ChangePasswordForm } from './change-password-form'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ExportDataButton } from './export-data-button'
import { NotificationPreferences } from './notification-preferences'
import { WebhookSettings } from '@/components/webhook-settings'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" aria-label="JobStack Home">
              <LogoIcon size={24} />
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          <div className="grid gap-6">
            {/* Profile Section */}
            <Card className="border-none shadow-md bg-background/60 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <CardHeader className="relative z-10 border-b border-border/50 pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Profile</CardTitle>
                    <CardDescription className="mt-1">
                      Manage your personal information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <SettingsForm user={user} />
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card className="border-none shadow-md bg-background/60 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <CardHeader className="relative z-10 border-b border-border/50 pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Security</CardTitle>
                    <CardDescription className="mt-1">
                      Manage your account security settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div>
                    <p className="font-semibold mb-1">Email Address</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 rounded-md bg-muted text-muted-foreground">
                      <Key className="h-4 w-4" />
                    </div>
                    <p className="font-semibold">Change Password</p>
                  </div>
                  <ChangePasswordForm />
                </div>
              </CardContent>
            </Card>

            {/* Preferences Section */}
            <Card className="border-none shadow-md bg-background/60 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <CardHeader className="relative z-10 border-b border-border/50 pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Preferences</CardTitle>
                    <CardDescription className="mt-1">
                      Customize your experience
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-semibold mb-1">Theme</p>
                    <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
                  </div>
                  <ThemeToggle />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-semibold mb-1">Language</p>
                    <p className="text-sm text-muted-foreground">English</p>
                  </div>
                  <LanguageSwitcher />
                </div>
              </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card className="border-none shadow-md bg-background/60 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <CardHeader className="relative z-10 border-b border-border/50 pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Notifications</CardTitle>
                    <CardDescription className="mt-1">
                      Configure how you receive notifications
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <NotificationPreferences />
              </CardContent>
            </Card>

            {/* Data & Privacy (GDPR / RODO) */}
            <Card className="border-none shadow-md bg-background/60 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <CardHeader className="relative z-10 border-b border-border/50 pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Data &amp; Privacy</CardTitle>
                    <CardDescription className="mt-1">
                      Manage your data in compliance with GDPR (Art.&nbsp;20)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-semibold mb-1">Export Your Data</p>
                    <p className="text-sm text-muted-foreground">
                      Download a copy of all your data including profile, projects, diagrams and organizations
                    </p>
                  </div>
                  <ExportDataButton />
                </div>
              </CardContent>
            </Card>

            {/* Billing Section */}
            <Card className="border-none shadow-md bg-background/60 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <CardHeader className="relative z-10 border-b border-border/50 pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Billing &amp; Plan</CardTitle>
                    <CardDescription className="mt-1">
                      Manage your subscription and payment details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div>
                    <p className="font-semibold mb-1">Current plan</p>
                    <p className="text-sm text-muted-foreground">
                      Free — all features available during launch period
                    </p>
                  </div>
                  <Link href="/settings/billing">
                    <Button variant="outline" size="sm" className="shadow-sm">View plans</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Webhooks Section */}
            <Card className="border-none shadow-md bg-background/60 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <CardHeader className="relative z-10 border-b border-border/50 pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Integrations</CardTitle>
                    <CardDescription className="mt-1">
                      Configure webhooks and external integrations
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <WebhookSettings />
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/30 shadow-md bg-destructive/5 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <CardHeader className="relative z-10 border-b border-destructive/20 pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-destructive/20 text-destructive shadow-sm group-hover:scale-110 transition-transform">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-destructive">Danger Zone</CardTitle>
                    <CardDescription className="mt-1 text-destructive/80">
                      Irreversible actions for your account.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-colors">
                  <div>
                    <p className="font-semibold text-destructive mb-1">Delete Account <span className="text-xs font-normal opacity-80">(7-day grace period)</span></p>
                    <p className="text-sm text-destructive/80">
                      Schedule deletion — you can cancel within 7 days
                    </p>
                  </div>
                  <DeleteAccountButton user={user} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-colors">
                  <div>
                    <p className="font-semibold text-destructive mb-1">Immediate Erasure <span className="text-xs font-normal opacity-80">(GDPR Art.&nbsp;17)</span></p>
                    <p className="text-sm text-destructive/80">
                      Permanently erase all data right now — no grace period
                    </p>
                  </div>
                  <HardDeleteAccountButton user={user} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
