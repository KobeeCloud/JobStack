'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, FileText, Lock, AlertCircle } from 'lucide-react'
import { LogoIcon } from '@/components/logo'
import { toast } from 'sonner'

export default function AcceptTermsPage() {
  const [tosChecked, setTosChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const canAccept = tosChecked && privacyChecked

  const handleAccept = async () => {
    if (!canAccept) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/user/accept-tos', { method: 'POST' })
      const body = await res.json()

      if (!res.ok) {
        throw new Error(body.error || 'Failed to record consent')
      }

      toast.success('Terms accepted', { description: 'Welcome to JobStack!' })
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'An unexpected error occurred.'
      setError(msg)
      toast.error('Error', { description: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 p-4">
      <Link href="/" className="flex items-center gap-2 mb-8" aria-label="JobStack Home">
        <LogoIcon size={32} className="text-primary" />
        <span className="text-2xl font-bold">JobStack</span>
      </Link>

      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Terms &amp; Privacy Consent</CardTitle>
          <CardDescription className="text-base">
            Before you continue, please review and accept our legal agreements. This is required to
            use JobStack.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* AS-IS Disclaimer Banner */}
          <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> JobStack generates Infrastructure as Code (Terraform,
              etc.) provided <strong>&quot;AS IS&quot;</strong> without any warranties. The creator
              is not liable for any infrastructure damage, data loss, costs, or system downtime
              resulting from the use of generated code. You are solely responsible for reviewing and
              testing all generated code before applying it to any environment.
            </AlertDescription>
          </Alert>

          {/* Terms of Service */}
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
            <input
              type="checkbox"
              id="tos"
              checked={tosChecked}
              onChange={e => setTosChecked(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-border accent-primary cursor-pointer"
            />
            <label htmlFor="tos" className="cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Terms of Service</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                I have read and agree to the{' '}
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-primary hover:underline font-medium"
                >
                  Terms of Service
                </Link>
                , including that all generated code is provided &quot;AS IS&quot; and the creator
                assumes no liability for its use.
              </p>
            </label>
          </div>

          {/* Privacy Policy */}
          <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
            <input
              type="checkbox"
              id="privacy"
              checked={privacyChecked}
              onChange={e => setPrivacyChecked(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-border accent-primary cursor-pointer"
            />
            <label htmlFor="privacy" className="cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Privacy Policy (GDPR / RODO)</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                I have read and agree to the{' '}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="text-primary hover:underline font-medium"
                >
                  Privacy Policy
                </Link>
                , including how my personal data is collected, processed, and stored in accordance
                with GDPR (RODO).
              </p>
            </label>
          </div>

          <Button
            onClick={handleAccept}
            disabled={!canAccept || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              'Accept & Continue to Dashboard'
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You can withdraw consent and delete your account at any time from{' '}
            <Link href="/settings" className="text-primary hover:underline">
              Settings
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
