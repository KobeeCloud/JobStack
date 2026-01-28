import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Wyklucz wszystkie pliki statyczne i katalog public
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap.xml|site.webmanifest|apple-touch-icon|android-chrome|browserconfig.xml|mstile|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|xml|txt|webmanifest)$).*)',
  ],
}
