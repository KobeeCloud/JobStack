import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Use mock client if env vars not configured
  if (!url || !key || url.includes('your-project') || key.includes('your-')) {
    return supabaseResponse
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/projects', '/organizations', '/settings', '/templates']
  const isProtectedRoute = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Enforce email verification for authenticated users on protected routes
  // Skip for OAuth users (they have identity providers) — their email is verified by the provider
  if (user && isProtectedRoute) {
    // OAuth users have their email verified by the provider—skip our own check.
    // A user is OAuth if their primary provider is NOT 'email'.
    const provider = user.app_metadata?.provider
    const isOAuthUser = provider && provider !== 'email'
    const isEmailVerified = user.email_confirmed_at != null
    if (!isEmailVerified && !isOAuthUser) {
      const url = request.nextUrl.clone()
      url.pathname = '/verify-email'
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ['/login', '/register']
  const isAuthRoute = authPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Allow verified users to leave verify-email page
  if (user && request.nextUrl.pathname === '/verify-email') {
    const isEmailVerified = user.email_confirmed_at != null
    if (isEmailVerified) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
