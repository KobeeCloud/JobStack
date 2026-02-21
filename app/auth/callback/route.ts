import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  const error_param = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')
  const origin = requestUrl.origin

  // Handle OAuth error from provider
  if (error_param) {
    console.error('OAuth callback error:', error_param, error_description)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error_description || error_param)}`
    )
  }

  if (code) {
    // We MUST set cookies on the response object, not via cookies() API,
    // because cookies() can't set cookies when the response is a redirect.
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    const redirectTo = new URL(next, origin)

    // Collect cookies to set on the final redirect response
    const cookiesToSet: Array<{ name: string; value: string; options?: any }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookies: Array<{ name: string; value: string; options?: any }>) {
            cookies.forEach((cookie) => {
              cookiesToSet.push(cookie)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Ensure a profile row exists (trigger may have failed or fired before
      // raw_user_meta_data was populated for OAuth users)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const admin = createAdminClient()
        await admin.from('profiles').upsert({
          id: authUser.id,
          email: authUser.email ?? '',
          full_name: authUser.user_metadata?.full_name
            || authUser.user_metadata?.name
            || null,
          avatar_url: authUser.user_metadata?.avatar_url
            || authUser.user_metadata?.picture
            || null,
        }, { onConflict: 'id', ignoreDuplicates: false })
      }

      // Build redirect response and set ALL cookies on it
      const response = NextResponse.redirect(redirectTo)
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
      return response
    }

    console.error('Code exchange failed:', error.message)
  }

  // If there's no code or exchange failed, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
