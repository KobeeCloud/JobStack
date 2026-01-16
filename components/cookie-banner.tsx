'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type CookieConsent = {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  timestamp: string;
};

const CONSENT_KEY = 'cookie-consent';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>({
    essential: true, // Always required
    functional: false,
    analytics: false,
    timestamp: '',
  });

  useEffect(() => {
    // Check if consent was already given
    const savedConsent = localStorage.getItem(CONSENT_KEY);
    if (!savedConsent) {
      // Show banner after a small delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (newConsent: CookieConsent) => {
    const consentWithTimestamp = {
      ...newConsent,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentWithTimestamp));
    setShowBanner(false);

    // If analytics consent was given and Google Analytics is configured
    if (newConsent.analytics && typeof window !== 'undefined') {
      // Enable Google Analytics
      // @ts-ignore
      if (window.gtag) {
        // @ts-ignore
        window.gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      }
    }
  };

  const acceptAll = () => {
    saveConsent({
      essential: true,
      functional: true,
      analytics: true,
      timestamp: '',
    });
  };

  const acceptEssential = () => {
    saveConsent({
      essential: true,
      functional: false,
      analytics: false,
      timestamp: '',
    });
  };

  const saveCustom = () => {
    saveConsent(consent);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="container mx-auto max-w-6xl">
        {!showDetails ? (
          // Simple banner
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">🍪 Ta strona używa plików cookies</h3>
              <p className="text-sm text-muted-foreground">
                Używamy plików cookies, aby zapewnić najlepsze doświadczenia na naszej stronie.
                Możesz zaakceptować wszystkie lub tylko niezbędne cookies.{' '}
                <Link href="/cookies" className="text-blue-600 hover:underline">
                  Dowiedz się więcej
                </Link>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDetails(true)}>
                Dostosuj
              </Button>
              <Button variant="outline" size="sm" onClick={acceptEssential}>
                Tylko niezbędne
              </Button>
              <Button size="sm" onClick={acceptAll}>
                Akceptuj wszystkie
              </Button>
            </div>
          </div>
        ) : (
          // Detailed settings
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Ustawienia cookies</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                ← Wróć
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Essential cookies */}
              <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Niezbędne</h4>
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    Zawsze aktywne
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Niezbędne do działania strony. Obejmują logowanie, bezpieczeństwo i podstawowe funkcje.
                </p>
              </div>

              {/* Functional cookies */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Funkcjonalne</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent.functional}
                      onChange={(e) => setConsent({ ...consent, functional: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Zapamiętują twoje preferencje jak język, motyw czy ostatnie wyszukiwania.
                </p>
              </div>

              {/* Analytics cookies */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Analityczne</h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent.analytics}
                      onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Pomagają nam zrozumieć jak używasz strony, abyśmy mogli ją ulepszać (Google Analytics).
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={acceptEssential}>
                Tylko niezbędne
              </Button>
              <Button size="sm" onClick={saveCustom}>
                Zapisz moje wybory
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Możesz zmienić swoje preferencje w każdej chwili na stronie{' '}
              <Link href="/cookies" className="text-blue-600 hover:underline">
                Polityka Cookies
              </Link>.
              Zgodnie z RODO (GDPR) masz prawo do wycofania zgody w dowolnym momencie.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook to get current cookie consent status
 */
export function useCookieConsent(): CookieConsent | null {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved) {
      try {
        setConsent(JSON.parse(saved));
      } catch {
        setConsent(null);
      }
    }
  }, []);

  return consent;
}

/**
 * Function to reset cookie consent (for testing or user request)
 */
export function resetCookieConsent() {
  localStorage.removeItem(CONSENT_KEY);
  window.location.reload();
}
