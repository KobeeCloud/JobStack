'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useLocale } from '@/lib/i18n';
import { Check, Sparkles, Users, Building2, Zap, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  const { t } = useLocale();

  const candidateFeatures = [
    'Wyszukaj oferty z wielu portali',
    'Zapisuj ulubione oferty',
    'Powiadomienia email o nowych ofertach',
    'Śledź swoje aplikacje',
    'Zapisz CV w profilu',
  ];

  const employerFeatures = [
    'Nielimitowane oferty pracy',
    '30 dni wyświetlania oferty',
    'Logo firmy przy ofercie',
    'Podstawowa analityka',
    'Dostęp do API',
  ];

  const futureFeatures = [
    'Wyróżnienie oferty (Featured)',
    'Zaawansowana analityka',
    'Priorytetowe wsparcie',
    'Integracja z ATS',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <Navbar />

      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          {/* Free Banner */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full mb-8 shadow-lg">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">🎉 100% Darmowe na Start!</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {t('pricing.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Candidates */}
            <Card className="relative overflow-hidden border-2 border-green-500 shadow-xl bg-white dark:bg-gray-800/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-full" />
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                    KANDYDACI
                  </Badge>
                </div>

                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  Szukaj Pracy
                </h2>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-green-600">GRATIS</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                  Zawsze będzie darmowe dla kandydatów
                </p>

                <ul className="space-y-4 mb-8">
                  {candidateFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full mt-0.5">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register?role=candidate">
                  <Button
                    size="lg"
                    className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
                  >
                    Zarejestruj się za darmo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Employers */}
            <Card className="relative overflow-hidden border-2 border-blue-500 shadow-xl bg-white dark:bg-gray-800/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full" />
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                    PRACODAWCY
                  </Badge>
                </div>

                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  Publikuj Oferty
                </h2>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-blue-600">GRATIS</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                  Darmowe na start - bez limitów!
                </p>

                <ul className="space-y-4 mb-8">
                  {employerFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full mt-0.5">
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register?role=employer">
                  <Button
                    size="lg"
                    className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold"
                  >
                    Dodaj ofertę za darmo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Future Plans */}
      <section className="py-16 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                📢 Co w przyszłości?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
                Gdy JobStack urośnie, planujemy wprowadzić opcjonalne płatne funkcje dla pracodawców:
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {futureFeatures.map((feature, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="rounded-full px-4 py-2 text-sm border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300"
                  >
                    {feature}
                  </Badge>
                ))}
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                ✨ Kandydaci zawsze będą mieli darmowy dostęp!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Masz pytania?
          </p>
          <Link href="/contact">
            <Button variant="outline" className="rounded-xl">
              Skontaktuj się z nami
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
