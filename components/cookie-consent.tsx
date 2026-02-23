'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Cookie, X } from 'lucide-react'

const COOKIE_CONSENT_KEY = 'jobstack-cookie-consent'

type ConsentChoice = 'all' | 'necessary' | null

interface ConsentRecord {
  choice: ConsentChoice
  timestamp: string
}

/**
 * Read the user's cookie consent choice.
 * Returns 'all' | 'necessary' | null (no decision yet).
 * Safe to call server-side — returns null when localStorage is unavailable.
 */
export function getConsentChoice(): ConsentChoice {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!raw) return null
    const record: ConsentRecord = JSON.parse(raw)
    return record.choice ?? null
  } catch {
    return null
  }
}

/**
 * Returns true only when the user has explicitly accepted ALL cookies.
 * Use this guard before initializing any analytics / marketing scripts.
 */
export function hasAnalyticsConsent(): boolean {
  return getConsentChoice() === 'all'
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Small delay so banner doesn't flash on initial load
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleConsent = useCallback((choice: ConsentChoice) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      choice,
      timestamp: new Date().toISOString(),
    } satisfies ConsentRecord))
    setShowBanner(false)

    // Dispatch a custom event so other components can react to the choice
    window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: { choice } }))
  }, [])

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-background/95 backdrop-blur border-t shadow-lg">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Pliki cookies 🍪</p>
              <p className="text-muted-foreground">
                Używamy plików cookies niezbędnych do prawidłowego działania serwisu.
                Mogą być również używane cookies analityczne w celu poprawy jakości usług.
                Więcej informacji w naszej{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Polityce Prywatności
                </Link>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConsent('necessary')}
            >
              Tylko niezbędne
            </Button>
            <Button
              size="sm"
              onClick={() => handleConsent('all')}
            >
              Akceptuję wszystkie
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleConsent('necessary')}
              aria-label="Zamknij"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
