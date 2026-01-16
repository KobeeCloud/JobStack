'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Mail, Scale, Briefcase, Code, Building2, FileText, Shield } from 'lucide-react';
import { useLocale } from '@/lib/i18n/context';

export default function ContactPage() {
  const { t } = useLocale();

  const contactCards = [
    {
      icon: Mail,
      title: 'Zapytania Ogólne',
      description: 'Pytania dotyczące naszych usług',
      email: 'support@jobstack.pl',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Scale,
      title: 'Prawo i Prywatność',
      description: 'RODO, pytania o regulamin',
      emails: ['legal@jobstack.pl', 'privacy@jobstack.pl'],
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Briefcase,
      title: 'Pracodawcy i Sprzedaż',
      description: 'Cennik, plany enterprise',
      email: 'sales@jobstack.pl',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Code,
      title: 'Techniczne i API',
      description: 'Wsparcie API, integracje',
      email: 'api@jobstack.pl',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Skontaktuj się
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Jesteśmy tutaj, aby pomóc. Wybierz najlepszy sposób kontaktu.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 gap-6">
            {contactCards.map((card, i) => (
              <div key={i} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-4`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{card.description}</p>
                {card.emails ? (
                  <div className="space-y-1">
                    {card.emails.map((email, j) => (
                      <a key={j} href={`mailto:${email}`} className="block text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                        {email}
                      </a>
                    ))}
                  </div>
                ) : (
                  <a href={`mailto:${card.email}`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium text-lg">
                    {card.email}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Business Info */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Informacje o firmie</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Nazwa</div>
                  <div className="font-semibold text-gray-900 dark:text-white">JobStack by KobeCloud</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Właściciel</div>
                  <div className="font-semibold text-gray-900 dark:text-white">Jakub Pospieszny</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Forma prawna</div>
                  <div className="font-semibold text-gray-900 dark:text-white">Jednoosobowa Działalność Gospodarcza (JDG)</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">NIP</div>
                  <div className="font-semibold text-gray-900 dark:text-white">5882530612</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">REGON</div>
                  <div className="font-semibold text-gray-900 dark:text-white">541797979</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Adres</div>
                  <div className="font-semibold text-gray-900 dark:text-white">Mickiewicza 19, 84-242 Luzino, Poland</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">Szukasz odpowiedzi? Sprawdź nasze zasoby:</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/api-docs">
              <Button variant="outline" className="rounded-xl border-gray-300 dark:border-gray-600">
                <Code className="w-4 h-4 mr-2" />
                API Docs
              </Button>
            </Link>
            <Link href="/terms">
              <Button variant="outline" className="rounded-xl border-gray-300 dark:border-gray-600">
                <FileText className="w-4 h-4 mr-2" />
                Regulamin
              </Button>
            </Link>
            <Link href="/privacy">
              <Button variant="outline" className="rounded-xl border-gray-300 dark:border-gray-600">
                <Shield className="w-4 h-4 mr-2" />
                Polityka Prywatności
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
