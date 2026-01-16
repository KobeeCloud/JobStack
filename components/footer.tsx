'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n';

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold">
                <span className="text-blue-400">Job</span>
                <span className="text-indigo-400">Stack</span>
                <span className="text-gray-500">.pl</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400">
              {t('footer.description')}
            </p>
            <div className="flex gap-4 mt-4">
              <a
                href="https://twitter.com/jobstackpl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/jobstack"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                </svg>
              </a>
              <a
                href="https://github.com/jobstack"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.links.title')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/jobs" className="text-sm hover:text-white transition-colors">
                  {t('footer.links.jobs')}
                </Link>
              </li>
              <li>
                <Link href="/for-employers" className="text-sm hover:text-white transition-colors">
                  {t('footer.links.employers')}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm hover:text-white transition-colors">
                  {t('footer.links.pricing')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-white transition-colors">
                  {t('footer.links.about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.legal.title')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm hover:text-white transition-colors">
                  {t('footer.legal.terms')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-white transition-colors">
                  {t('footer.legal.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm hover:text-white transition-colors">
                  {t('footer.legal.cookies')}
                </Link>
              </li>
              <li>
                <Link href="/bot" className="text-sm hover:text-white transition-colors">
                  Bot Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.contact.title')}</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:kontakt@jobstack.pl"
                  className="text-sm hover:text-white transition-colors"
                >
                  {t('footer.contact.email')}
                </a>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-white transition-colors">
                  Formularz kontaktowy
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="text-sm hover:text-white transition-colors">
                  API Docs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>🇵🇱 Made in Poland</span>
            <span>•</span>
            <span>Powered by</span>
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Supabase
            </a>
            <span>&</span>
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Vercel
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
