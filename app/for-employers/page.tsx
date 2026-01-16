'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useLocale } from '@/lib/i18n';
import { Target, Zap, BarChart3, Code2, Check, ArrowRight, Sparkles, Users, Building2 } from 'lucide-react';

export default function ForEmployersPage() {
  const { t } = useLocale();

  const features = [
    {
      icon: Target,
      title: 'Targetowana Grupa',
      description: 'Dotrzyj do programistów aktywnie szukających pracy. Twoje oferty obok NoFluffJobs, Pracuj.pl i innych.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Zap,
      title: 'Szybkie Publikowanie',
      description: 'Dodaj ofertę w minuty przez dashboard lub automatyzuj przez API. Idealne dla integracji z ATS.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: BarChart3,
      title: 'Analityka',
      description: 'Śledź wyświetlenia, kliknięcia i aplikacje. Zrozum, co przyciąga kandydatów.',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const freeFeatures = [
    'Nielimitowane oferty pracy',
    '30 dni wyświetlania oferty',
    'Logo firmy przy ofercie',
    'Podstawowa analityka',
    'Pełny dostęp do API',
    'Wsparcie email',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <Navbar />

      {/* Hero */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 -right-20 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        </div>

        <div className="container mx-auto px-4">
          {/* Free Banner */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-lg animate-pulse">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">🎉 100% Darmowe na Start!</span>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Dotrzej do Tysięcy{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Kandydatów IT
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
              Publikuj oferty pracy i dotrzyj do najlepszych specjalistów IT w Polsce.
              Bez limitów, bez ukrytych opłat, bez karty kredytowej.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register?role=employer">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all group"
                >
                  Dodaj ofertę za darmo
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/api-docs">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Code2 className="w-5 h-5 mr-2" />
                  Dokumentacja API
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                50,000+
              </div>
              <div className="text-gray-600 dark:text-gray-400">Kandydatów IT</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                5+
              </div>
              <div className="text-gray-600 dark:text-gray-400">Portali zintegrowanych</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                0 PLN
              </div>
              <div className="text-gray-600 dark:text-gray-400">Koszt na start</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Funkcje</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Dlaczego JobStack?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Wszystko czego potrzebujesz do skutecznej rekrutacji IT
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-2 border-green-500 shadow-2xl bg-white dark:bg-gray-800/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-bl-full" />

            <CardHeader className="text-center pb-0">
              <Badge className="w-fit mx-auto mb-4 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                AKTUALNIE
              </Badge>
              <CardTitle className="text-3xl md:text-4xl mb-4">Wszystko Za Darmo</CardTitle>
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-6xl font-bold text-green-600">0 PLN</span>
              </div>
              <CardDescription className="text-lg">Bez karty kredytowej, bez zobowiązań</CardDescription>
            </CardHeader>

            <CardContent className="pt-8">
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {freeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link href="/register?role=employer">
                  <Button
                    size="lg"
                    className="px-12 py-6 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl shadow-lg"
                  >
                    Zacznij publikować za darmo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* API Integration */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }} />
            </div>

            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Code2 className="w-6 h-6 text-blue-400" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-300 border-0">API</Badge>
              </div>
              <CardTitle className="text-3xl">Automatyzuj z API</CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Zintegruj JobStack z Twoim ATS lub systemem HR - za darmo!
              </CardDescription>
            </CardHeader>

            <CardContent className="relative">
              <div className="bg-gray-950 rounded-xl p-6 mb-6 overflow-x-auto border border-gray-700">
                <pre className="text-sm text-green-400 font-mono">
{`curl -X POST https://jobstack.pl/api/employer/jobs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Senior Frontend Developer",
    "location": "Warszawa",
    "remote": true,
    "salary_min": 15000,
    "salary_max": 25000,
    "tech_stack": ["React", "TypeScript", "Next.js"]
  }'`}
                </pre>
              </div>
              <div className="flex gap-4 flex-wrap">
                <Link href="/api-docs">
                  <Button variant="secondary" size="lg" className="rounded-xl">
                    <Code2 className="w-5 h-5 mr-2" />
                    Dokumentacja API
                  </Button>
                </Link>
                <Link href="/register?role=employer">
                  <Button variant="outline" size="lg" className="rounded-xl text-white border-white/30 hover:bg-white/10">
                    Pobierz klucz API (za darmo)
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border-0 shadow-2xl">
            <CardContent className="p-12 text-center text-white">
              <Building2 className="w-12 h-12 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Gotowy do rekrutacji?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-lg mx-auto">
                Dołącz do firm korzystających z JobStack, aby znaleźć najlepszych kandydatów
              </p>
              <Link href="/register?role=employer">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-12 py-6 font-semibold shadow-lg hover:shadow-xl transition-all group"
                >
                  Dodaj pierwszą ofertę - Za Darmo
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
