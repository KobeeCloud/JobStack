'use client';

import { useLocale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <Button
        variant={locale === 'pl' ? 'default' : 'ghost'}
        size="sm"
        className={`px-2 py-1 h-7 text-xs font-medium ${
          locale === 'pl'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        onClick={() => setLocale('pl')}
      >
        🇵🇱 PL
      </Button>
      <Button
        variant={locale === 'en' ? 'default' : 'ghost'}
        size="sm"
        className={`px-2 py-1 h-7 text-xs font-medium ${
          locale === 'en'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        onClick={() => setLocale('en')}
      >
        🇬🇧 EN
      </Button>
    </div>
  );
}
