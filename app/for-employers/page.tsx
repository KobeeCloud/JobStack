import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForEmployersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              JobStack
            </Link>
            <div className="flex gap-4">
              <Link href="/jobs">
                <Button variant="ghost">Browse Jobs</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero with FREE banner */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-xl p-8 max-w-3xl mx-auto text-center mb-12">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-3">100% Darmowe na Start!</h2>
          <p className="text-lg text-green-600 dark:text-green-300">
            JobStack jest obecnie całkowicie <strong>darmowy</strong> dla pracodawców.<br/>
            Bez limitów, bez ukrytych opłat, bez karty kredytowej.
          </p>
        </div>

        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Dotrzej do Tysięcy Kandydatów IT
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Publikuj oferty pracy i dotrzyj do najlepszych specjalistów IT w Polsce
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register?role=employer">
              <Button size="lg" className="text-lg px-8 py-6 bg-green-600 hover:bg-green-700">
                Dodaj ofertę za darmo →
              </Button>
            </Link>
            <Link href="/api-docs">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                📖 Dokumentacja API
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Dlaczego JobStack?</h2>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <div className="text-4xl mb-4">🎯</div>
              <CardTitle>Targetowana Grupa</CardTitle>
              <CardDescription>
                Dotrzyj do programistów aktywnie szukających pracy. Twoje oferty obok NoFluffJobs, Pracuj.pl i innych.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-4">⚡</div>
              <CardTitle>Szybkie Publikowanie</CardTitle>
              <CardDescription>
                Dodaj ofertę w minuty przez dashboard lub automatyzuj przez API. Idealne dla integracji z ATS.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-4">📊</div>
              <CardTitle>Analityka</CardTitle>
              <CardDescription>
                Śledź wyświetlenia, kliknięcia i aplikacje. Zrozum, co przyciąga kandydatów.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* What's Free */}
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-green-500">
            <CardHeader className="text-center">
              <div className="text-sm font-semibold text-green-600 mb-2">AKTUALNIE</div>
              <CardTitle className="text-3xl">Wszystko Za Darmo</CardTitle>
              <div className="text-5xl font-bold my-4 text-green-600">0 PLN</div>
              <CardDescription className="text-lg">Bez karty kredytowej, bez zobowiązań</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 text-xl">✓</span>
                    <span><strong>Nielimitowane</strong> oferty pracy</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 text-xl">✓</span>
                    <span>30 dni wyświetlania oferty</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 text-xl">✓</span>
                    <span>Logo firmy przy ofercie</span>
                  </li>
                </ul>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 text-xl">✓</span>
                    <span>Podstawowa analityka</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 text-xl">✓</span>
                    <span>Pełny dostęp do API</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 text-xl">✓</span>
                    <span>Wsparcie email</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 text-center">
                <Link href="/register?role=employer">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 px-12">
                    Zacznij publikować za darmo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Future plans disclaimer */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="font-bold mb-2">📢 Co w przyszłości?</h3>
            <p className="text-sm text-muted-foreground">
              Gdy JobStack urośnie, planujemy wprowadzić <strong>opcjonalne</strong> płatne funkcje premium:
              wyróżnienie ofert, zaawansowaną analitykę, priorytetowe wsparcie.
              Podstawowy plan pozostanie dostępny.
            </p>
          </div>
        </div>
      </div>

      {/* API Integration */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <CardHeader>
              <CardTitle className="text-3xl">Automatyzuj z API</CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Zintegruj JobStack z Twoim ATS lub systemem HR - za darmo!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-950 rounded-lg p-6 mb-6 overflow-x-auto">
                <pre className="text-sm text-green-400">
{`curl -X POST https://jobstack.vercel.app/api/employer/jobs \\
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
                  <Button variant="secondary" size="lg">
                    📖 Dokumentacja API
                  </Button>
                </Link>
                <Link href="/register?role=employer">
                  <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/20">
                    Pobierz klucz API (za darmo)
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Gotowy do rekrutacji?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Dołącz do firm korzystających z JobStack, aby znaleźć najlepszych kandydatów
          </p>
          <Link href="/register?role=employer">
            <Button size="lg" className="text-lg px-12 py-6 bg-green-600 hover:bg-green-700">
              Dodaj pierwszą ofertę - Za Darmo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
