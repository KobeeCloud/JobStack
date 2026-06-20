'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Mail, Building2 } from 'lucide-react'
import { LogoIcon } from '@/components/logo'
import { createClient } from '@/lib/supabase/client'

type InviteStatus = 'loading' | 'ready' | 'accepting' | 'success' | 'error' | 'login-required'

interface InviteInfo {
  organization_name?: string
  role?: string
  email?: string
  expires_at?: string
}

interface PageProps {
  params: Promise<{ token: string }>
}

export default function AcceptInvitePage({ params }: PageProps) {
  const { token } = use(params)
  const [status, setStatus] = useState<InviteStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [inviteInfo, setInviteInfo] = useState<InviteInfo>({})
  const [_orgId, setOrgId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkInvite()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function checkInvite() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setStatus('login-required')
        return
      }

      // Fetch invite info via a GET-style check (we'll peek at the invite)
      // Since only POST exists, we validate client-side by attempting accept
      setInviteInfo({ email: user.email })
      setStatus('ready')
    } catch {
      setStatus('error')
      setError('Failed to verify your session')
    }
  }

  async function handleAccept() {
    setStatus('accepting')
    setError(null)

    try {
      const res = await fetch(`/api/invites/accept/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setError(data.error || 'Failed to accept invite')
        return
      }

      setOrgId(data.organization_id)
      setStatus('success')
    } catch {
      setStatus('error')
      setError('Network error. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2" aria-label="JobStack Home">
            <LogoIcon size={24} />
            <span className="font-bold text-xl">JobStack</span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {status === 'success' ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : status === 'error' ? (
                <XCircle className="h-6 w-6 text-destructive" />
              ) : (
                <Building2 className="h-6 w-6 text-primary" />
              )}
            </div>
            <CardTitle>
              {status === 'success'
                ? 'Welcome to the team!'
                : status === 'error'
                ? 'Invite Error'
                : status === 'login-required'
                ? 'Sign in Required'
                : 'Organization Invite'}
            </CardTitle>
            <CardDescription>
              {status === 'success'
                ? 'You have successfully joined the organization.'
                : status === 'login-required'
                ? 'You need to sign in to accept this invite.'
                : status === 'error'
                ? 'There was a problem with this invite.'
                : "You've been invited to join an organization on JobStack."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Loading */}
            {status === 'loading' && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Login required */}
            {status === 'login-required' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Sign in with the email address the invite was sent to.</span>
                </div>
                <Button className="w-full" asChild>
                  <Link href={`/login?redirect=/invites/accept/${token}`}>
                    Sign In to Accept
                  </Link>
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link href={`/register?redirect=/invites/accept/${token}`} className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            )}

            {/* Ready to accept */}
            {status === 'ready' && (
              <div className="space-y-4">
                {inviteInfo.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span>Signed in as <strong>{inviteInfo.email}</strong></span>
                  </div>
                )}
                <Button className="w-full" onClick={handleAccept}>
                  Accept Invite
                </Button>
              </div>
            )}

            {/* Accepting */}
            {status === 'accepting' && (
              <div className="flex items-center justify-center py-6 gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm text-muted-foreground">Joining organization...</span>
              </div>
            )}

            {/* Success */}
            {status === 'success' && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    You are now a member of the organization. You can access shared projects and resources.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => router.push('/organizations')}>
                    Go to Organizations
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => router.push('/dashboard')}>
                    Dashboard
                  </Button>
                </div>
              </div>
            )}

            {/* Error */}
            {status === 'error' && error && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleAccept}>
                    Try Again
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
