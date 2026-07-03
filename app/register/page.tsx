'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle, Github } from 'lucide-react'
import { LogoIcon } from '@/components/logo'
import { createClient } from '@/lib/supabase/client'
import { registerSchema, type RegisterInput } from '@/lib/validation/schemas'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('auth.register')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  // GDPR: OAuth sign-in requires consent checkbox to be checked first
  const consentAccepted = watch('consent')

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    if (!consentAccepted) {
      setError('You must accept the Terms of Service and Privacy Policy before signing in.')
      return
    }
    setOauthLoading(provider)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?consent=true`,
        },
      })

      if (error) {
        setError(error.message)
        toast.error('Sign in failed', { description: error.message })
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'An unexpected error occurred.'
      setError(errorMessage)
      toast.error('Sign in failed', { description: errorMessage })
    } finally {
      setOauthLoading(null)
    }
  }

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?consent=true`,
        },
      })

      if (authError) {
        // Handle specific error messages
        if (authError.message.includes('already registered')) {
          setError('This email is already registered. Please sign in instead.')
        } else if (authError.message.includes('Invalid email')) {
          setError('Please enter a valid email address.')
        } else if (authError.message.includes('Password')) {
          setError('Password does not meet requirements.')
        } else {
          setError(authError.message)
        }
        return
      }

      // Check if email confirmation is required
      if (authData.user && !authData.session) {
        // Email confirmation required
        setSuccess(true)
        toast.success('Check your email to confirm your account!')
      } else if (authData.session) {
        // No email confirmation needed, redirect directly
        toast.success('Account created successfully!')
        router.push('/dashboard')
      } else {
        // Fallback for mock mode or other cases
        toast.success('Account created!')
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      console.error('Registration error:', err)
      setError((err as Error)?.message || 'An unexpected error occurred. Please try again.')
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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Start building infrastructure</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Success message */}
          {success && (
            <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                <strong>Check your email!</strong> We&apos;ve sent you a confirmation link. Please
                click it to activate your account.
              </AlertDescription>
            </Alert>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                disabled={loading || success}
                {...register('email')}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  disabled={loading || success}
                  {...register('password')}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive" role="alert">
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, number, and special
                character
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p id="confirm-password-error" className="text-sm text-destructive" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="consent"
                {...register('consent')}
                className="mt-1 h-4 w-4 rounded border-border"
                aria-invalid={errors.consent ? 'true' : 'false'}
              />
              <Label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed">
                {t.rich('consent', {
                  terms: _chunks => (
                    <a href="/terms" target="_blank" className="text-primary hover:underline">
                      {t('termsLink')}
                    </a>
                  ),
                  privacy: _chunks => (
                    <a href="/privacy" target="_blank" className="text-primary hover:underline">
                      {t('privacyLink')}
                    </a>
                  ),
                })}
              </Label>
            </div>
            {errors.consent && (
              <p className="text-sm text-destructive" role="alert">
                {errors.consent.message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn('github')}
                disabled={!!oauthLoading || loading || success || !consentAccepted}
                title={!consentAccepted ? 'Accept Terms & Privacy Policy first' : undefined}
              >
                {oauthLoading === 'github' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Github className="mr-2 h-4 w-4" />
                )}
                GitHub
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn('google')}
                disabled={!!oauthLoading || loading || success || !consentAccepted}
                title={!consentAccepted ? 'Accept Terms & Privacy Policy first' : undefined}
              >
                {oauthLoading === 'google' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Google
              </Button>
            </div>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
