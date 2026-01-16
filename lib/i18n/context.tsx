'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { translations, Locale } from './translations';

type TranslationValue = string | readonly string[] | { [key: string]: TranslationValue };
type TranslationsType = { [key: string]: TranslationValue };

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  translations: TranslationsType;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const LOCALE_KEY = 'jobstack-locale';

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: TranslationsType, path: string): string {
  const keys = path.split('.');
  let current: TranslationValue = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && !Array.isArray(current) && key in current) {
      current = (current as { [key: string]: TranslationValue })[key];
    } else {
      return path; // Return the key if not found
    }
  }

  return typeof current === 'string' ? current : path;
}

/**
 * Interpolate variables into a template string
 */
function interpolateString(template: string, vars: Record<string, string | number>): string {
  return template.replace(/{(\w+)}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pl');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved locale from localStorage
    const saved = localStorage.getItem(LOCALE_KEY) as Locale;
    if (saved && (saved === 'pl' || saved === 'en')) {
      setLocaleState(saved);
    } else {
      // Default to Polish for Polish job board
      setLocaleState('pl');
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_KEY, newLocale);
    // Update html lang attribute
    document.documentElement.lang = newLocale;
  };

  const t = useCallback((key: string, vars?: Record<string, string | number>): string => {
    const value = getNestedValue(translations[locale] as TranslationsType, key);
    if (vars) {
      return interpolateString(value, vars);
    }
    return value;
  }, [locale]);

  // Prevent hydration mismatch by returning null during SSR
  if (!mounted) {
    // Return default Polish translations during SSR
    const defaultT = (key: string, vars?: Record<string, string | number>): string => {
      const value = getNestedValue(translations.pl as TranslationsType, key);
      if (vars) {
        return interpolateString(value, vars);
      }
      return value;
    };

    return (
      <LocaleContext.Provider value={{
        locale: 'pl',
        setLocale,
        t: defaultT,
        translations: translations.pl as TranslationsType,
      }}>
        {children}
      </LocaleContext.Provider>
    );
  }

  const value: LocaleContextType = {
    locale,
    setLocale,
    t,
    translations: translations[locale] as TranslationsType,
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

/**
 * Get translation with variable interpolation
 * Usage: interpolate(t.jobs.resultsCount, { count: 42 })
 */
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/{(\w+)}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}
