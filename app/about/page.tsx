'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Search, Zap, SlidersHorizontal, Mail, Code, Building2, ArrowRight, Github, Heart } from 'lucide-react';
import { useLocale } from '@/lib/i18n/context';

export default function AboutPage() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            O <span className="text-blue-600">JobStack</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Agregujemy oferty pracy IT z najlepszych portali w Polsce, abyś mógł znaleźć wymarzoną pracę w jednym miejscu.
          </p>
        </div>

        {/* Mission */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Nasza Misja</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              JobStack powstał, aby rozwiązać prosty problem: poszukujący pracy w Polsce tracą godziny codziennie sprawdzając
              wiele portali z ofertami. JustJoin.it, NoFluffJobs, Pracuj.pl, Indeed — każdy ma świetne możliwości, ale
              sprawdzanie ich wszystkich jest czasochłonne i frustrujące.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Wierzymy, że znalezienie wymarzonej pracy powinno być proste, a nie być pracą samą w sobie.
            </p>
          </div>
        </div>

        {/* What We Do */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Co Robimy</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Search, title: 'Agregujemy', desc: 'Oferty z JustJoin.it, NoFluffJobs, Pracuj.pl, Indeed i więcej' },
              { icon: Zap, title: 'Aktualizujemy', desc: 'Codzienne aktualizacje, byś nie przegapił nowych możliwości' },
              { icon: SlidersHorizontal, title: 'Filtrujemy', desc: 'Po technologii, lokalizacji, wynagrodzeniu i pracy zdalnej' },
              { icon: Mail, title: 'Powiadamiamy', desc: 'Alerty email gdy pojawią się pasujące oferty' },
              { icon: Code, title: 'API', desc: 'Dostęp API dla pracodawców do automatyzacji publikacji' },
              { icon: Building2, title: 'Dla Pracodawców', desc: 'Prosty sposób na dotarcie do tysięcy kandydatów' },
            ].map((item, i) => (
              <div key={i} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* For Job Seekers & Employers */}
        <div className="max-w-4xl mx-auto mb-16 grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-4">Dla Kandydatów</h3>
            <p className="mb-4 opacity-90">
              JobStack jest <strong>100% darmowy</strong> dla kandydatów. Na zawsze. Bez ukrytych opłat, bez premium.
            </p>
            <p className="opacity-90">
              Zarabiamy na pracodawcach, nie na poszukujących pracy.
            </p>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-4">Dla Pracodawców</h3>
            <p className="mb-4 opacity-90">
              Oferujemy prosty, przejrzysty cennik publikacji ofert. Zacznij od darmowego triala (1 oferta/mies.).
            </p>
            <p className="opacity-90">
              Upgrade do Pro po nielimitowane publikacje i wyróżnione pozycje.
            </p>
          </div>
        </div>

        {/* Legal */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Prawo i Zgodność</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">JobStack jest w pełni zgodny z:</p>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-6">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <strong>RODO/GDPR</strong> — Twoja prywatność jest chroniona
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <strong>Prawo Polskie</strong> — Zarejestrowana działalność JDG
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <strong>Prawo Autorskie UE</strong> — Szanujemy własność intelektualną
              </li>
            </ul>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Przeczytaj nasz{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">Regulamin</Link>,{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">Politykę Prywatności</Link> i{' '}
              <Link href="/cookies" className="text-blue-600 hover:underline">Politykę Cookies</Link>.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Technologia</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Next.js 15', desc: 'React Framework' },
              { name: 'Supabase', desc: 'PostgreSQL + RLS' },
              { name: 'Vercel', desc: 'Edge Deployment' },
              { name: 'TypeScript', desc: 'Type-safe Code' },
            ].map((tech, i) => (
              <div key={i} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200/50 dark:border-gray-700/50">
                <div className="font-semibold text-gray-900 dark:text-white">{tech.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Open Source */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl p-8 text-center">
            <Github className="w-12 h-12 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Open Source</h2>
            <p className="text-gray-300 mb-6">
              Wierzymy w przejrzystość. Kluczowe części JobStack są open source i dostępne na GitHub.
            </p>
            <a
              href="https://github.com/KobeeCloud/JobStack"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Zobacz na GitHub
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Contact */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Skontaktuj się</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Ogólne</div>
                <a href="mailto:support@jobstack.pl" className="text-blue-600 hover:underline">support@jobstack.pl</a>
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Biznes</div>
                <a href="mailto:sales@jobstack.pl" className="text-blue-600 hover:underline">sales@jobstack.pl</a>
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Prawo</div>
                <a href="mailto:legal@jobstack.pl" className="text-blue-600 hover:underline">legal@jobstack.pl</a>
              </div>
            </div>
          </div>
        </div>

        {/* Made in Poland */}
        <div className="text-center mb-12">
          <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
            <strong>JobStack by KobeeCloud</strong> — Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> in Poland 🇵🇱
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/jobs">
            <Button size="lg" className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25">
              {t('home.browseJobs')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/for-employers">
            <Button size="lg" variant="outline" className="rounded-xl border-gray-300 dark:border-gray-600">
              {t('nav.forEmployers')}
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
