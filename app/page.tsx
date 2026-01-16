'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { HomeStats } from '@/components/home-stats';
import { useLocale } from '@/lib/i18n';
import { Search, Zap, Target, Bot, Mail, Briefcase, ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { t } = useLocale();

  const features = [
    {
      icon: Search,
      titleKey: 'home.features.aggregation.title' as const,
      descKey: 'home.features.aggregation.desc' as const,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Zap,
      titleKey: 'home.features.realtime.title' as const,
      descKey: 'home.features.realtime.desc' as const,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Target,
      titleKey: 'home.features.filters.title' as const,
      descKey: 'home.features.filters.desc' as const,
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Bot,
      titleKey: 'home.features.api.title' as const,
      descKey: 'home.features.api.desc' as const,
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Mail,
      titleKey: 'home.features.alerts.title' as const,
      descKey: 'home.features.alerts.desc' as const,
      color: 'from-red-500 to-rose-500',
    },
    {
      icon: Briefcase,
      titleKey: 'home.features.employers.title' as const,
      descKey: 'home.features.employers.desc' as const,
      color: 'from-indigo-500 to-violet-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-background to-background dark:from-blue-900/20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-[96px] opacity-30 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 dark:bg-indigo-600 rounded-full mix-blend-multiply filter blur-[96px] opacity-30 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-violet-300 dark:bg-violet-600 rounded-full mix-blend-multiply filter blur-[96px] opacity-30 animate-blob animation-delay-4000" />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <Badge className="mb-6 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              {t('home.badge')}
            </Badge>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {t('home.title')}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                {t('home.subtitle')}
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('home.description')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/jobs">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <Search className="w-5 h-5 mr-2" />
                  {t('home.searchButton')}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/for-employers">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                  <Briefcase className="w-5 h-5 mr-2" />
                  {t('home.postJobButton')}
                </Button>
              </Link>
            </div>

            {/* Stats - Dynamic */}
            <HomeStats />
          </div>
        </div>
      </section>

      {/* Job Boards Section */}
      <section className="py-16 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8 font-medium">
            {t('home.trustedBy')}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-opacity">
            {['NoFluffJobs', 'Pracuj.pl', 'Bulldogjob', 'RocketJobs', 'JustJoin.it'].map((board) => (
              <div key={board} className="text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-500">
                {board}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">
              {t('home.featuresLabel')}
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.whyJobStack')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('home.featuresSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold">{t(feature.titleKey)}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {t(feature.descKey)}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-2xl">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }} />
            </div>

            <CardContent className="relative p-8 md:p-16 text-center text-white">
              <Sparkles className="w-12 h-12 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                {t('home.ctaTitle')}
              </h2>
              <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
                {t('home.ctaSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6 font-semibold shadow-lg hover:shadow-xl transition-all group">
                    {t('home.getStartedFree')}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 text-white border-white/50 hover:bg-white/20 backdrop-blur-sm transition-all"
                  >
                    {t('home.browseJobs')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Free Banner */}
      <section className="py-12 bg-gradient-to-r from-green-500 to-emerald-500">
        <div className="container mx-auto px-4 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-2">
            🎉 {t('home.freeBanner.title')}
          </h3>
          <p className="text-lg opacity-90">
            {t('home.freeBanner.subtitle')}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
