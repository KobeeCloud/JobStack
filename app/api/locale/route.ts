import { NextRequest, NextResponse } from 'next/server'

const VALID_LOCALES = ['en', 'pl']

export async function POST(request: NextRequest) {
  try {
    const { locale } = await request.json()

    if (!VALID_LOCALES.includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
    }

    const response = NextResponse.json({ locale })
    response.cookies.set('locale', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
      httpOnly: false, // needs to be readable by client
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
