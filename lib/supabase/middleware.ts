import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // ST-2: In production, block protected routes when Supabase is unconfigured
  if (!url || !key || url.includes('your-project') || key.includes('your-')) {
    if (process.env.NODE_ENV === 'production') {
      const protectedPaths = [
        '/dashboard',
        '/projects',
        '/organizations',
        '/settings',
        '/templates',
      ]
      const isProtectedRoute = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
      )
      if (isProtectedRoute) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/login'
        return NextResponse.redirect(loginUrl)
      }
    }
    return supabaseResponse
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes that require authentication
  const protectedPaths = [
    '/dashboard',
    '/projects',
    '/organizations',
    '/settings',
    '/templates',
    '/accept-terms',
  ]
  const isProtectedRoute = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // MEDIUM-005: Soft-delete enforcement — block access for users with deleted_at set
  if (user && isProtectedRoute) {
    // Cache profile status in a short-lived cookie to avoid a DB query on every request.
    // The cookie stores JSON { deletedAt, tosAccepted, checkedAt }.
    // It expires after 5 minutes, forcing a fresh check periodically.
    const PROFILE_CACHE_COOKIE = '__js_profile_cache'
    const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

    let profileDeletedAt: string | null = null
    let profileTosAccepted: boolean = false
    let cacheHit = false

    const cached = request.cookies.get(PROFILE_CACHE_COOKIE)?.value
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (
          parsed.userId === user.id &&
          parsed.checkedAt &&
          Date.now() - parsed.checkedAt < CACHE_TTL_MS
        ) {
          profileDeletedAt = parsed.deletedAt ?? null
          profileTosAccepted = !!parsed.tosAccepted
          cacheHit = true
        }
      } catch {
        // Corrupted cookie — ignore and refetch
      }
    }

    if (!cacheHit) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('deleted_at, tos_accepted_at')
        .eq('id', user.id)
        .single()

      profileDeletedAt = profile?.deleted_at ?? null
      profileTosAccepted = !!profile?.tos_accepted_at

      // Store result in cookie so subsequent requests skip the DB query
      const cacheValue = JSON.stringify({
        userId: user.id,
        deletedAt: profileDeletedAt,
        tosAccepted: profileTosAccepted,
        checkedAt: Date.now(),
      })
      supabaseResponse.cookies.set(PROFILE_CACHE_COOKIE, cacheValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 300, // 5 minutes
        path: '/',
      })
    }

    if (profileDeletedAt) {
      // User account is scheduled for deletion — sign them out and redirect
      await supabase.auth.signOut()
      const deletedUrl = request.nextUrl.clone()
      deletedUrl.pathname = '/login'
      deletedUrl.searchParams.set('error', 'account_deleted')
      return NextResponse.redirect(deletedUrl)
    }

    // COMPLIANCE: Enforce ToS consent before accessing protected routes
    if (!profileTosAccepted && request.nextUrl.pathname !== '/accept-terms') {
      const tosUrl = request.nextUrl.clone()
      tosUrl.pathname = '/accept-terms'
      return NextResponse.redirect(tosUrl)
    }
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
