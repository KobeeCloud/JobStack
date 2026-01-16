'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLocale } from '@/lib/i18n';

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const { t } = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-all duration-200 ${
        transparent
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md'
          : 'bg-white dark:bg-gray-900'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">
              <span className="text-blue-600">Job</span>
              <span className="text-indigo-600">Stack</span>
              <span className="text-gray-400">.pl</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/jobs"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t('nav.jobs')}
            </Link>
            <Link
              href="/for-employers"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t('nav.forEmployers')}
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t('nav.pricing')}
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t('nav.login')}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                {t('nav.register')}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t space-y-3">
            <Link
              href="/jobs"
              className="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.jobs')}
            </Link>
            <Link
              href="/for-employers"
              className="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.forEmployers')}
            </Link>
            <Link
              href="/pricing"
              className="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.pricing')}
            </Link>
            <div className="pt-3 border-t flex items-center justify-between">
              <LanguageSwitcher />
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    {t('nav.register')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
