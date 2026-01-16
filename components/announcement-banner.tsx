'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const STORAGE_KEY = 'jobstack_announcement_dismissed_v1';

export function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true';
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-2xl border border-blue-100/80 dark:border-blue-900/40 bg-white/80 dark:bg-gray-900/60 backdrop-blur-md shadow-sm">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-blue-400/20 blur-2xl" />
          <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-indigo-400/20 blur-2xl" />
        </div>
        <div className="relative flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Właśnie wystartowaliśmy w 2026 🎉
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Przez dłuższy czas serwis jest w pełni darmowy. Zapraszamy do korzystania i dzielenia się opinią.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link href="/jobs" className="w-full sm:w-auto">
              <Button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Zobacz oferty
              </Button>
            </Link>
            <Button variant="outline" className="rounded-xl" onClick={handleClose}>
              Zamknij
            </Button>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Zamknij baner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
