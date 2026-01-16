import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">JobStack</Link>
            <div className="flex gap-4">
              <Link href="/jobs"><Button variant="ghost">Browse Jobs</Button></Link>
              <Link href="/login"><Button variant="outline">Sign In</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-lg p-6 max-w-2xl mx-auto mb-12 text-center">
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">🎉 100% Darmowe na Start!</h2>
          <p className="text-green-600 dark:text-green-300">
            JobStack jest obecnie całkowicie darmowy zarówno dla kandydatów jak i pracodawców.
            Budujemy społeczność - płatne plany pojawią się w przyszłości.
          </p>
        </div>

        <h1 className="text-4xl font-bold text-center mb-4">Wszystko Za Darmo</h1>
        <p className="text-xl text-center text-muted-foreground mb-12">
          Na start oferujemy pełny dostęp bez opłat. Żadnych ukrytych kosztów.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 border-2 border-green-500">
            <div className="text-sm font-semibold text-green-600 mb-2">KANDYDACI</div>
            <h2 className="text-2xl font-bold mb-2">Szukaj Pracy</h2>
            <div className="text-4xl font-bold mb-4 text-green-600">GRATIS</div>
            <p className="text-muted-foreground mb-6">Zawsze będzie darmowe dla kandydatów</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Wyszukaj oferty z wielu portali</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Zapisuj ulubione oferty</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Powiadomienia email o nowych ofertach</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Śledź swoje aplikacje</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Zapisz CV w profilu</span>
              </li>
            </ul>
            <Link href="/register?role=candidate">
              <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">Zarejestruj się za darmo</Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 border-2 border-blue-500">
            <div className="text-sm font-semibold text-blue-600 mb-2">PRACODAWCY</div>
            <h2 className="text-2xl font-bold mb-2">Publikuj Oferty</h2>
            <div className="text-4xl font-bold mb-4 text-blue-600">GRATIS</div>
            <p className="text-muted-foreground mb-6">Darmowe na start - bez limitów!</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Nielimitowane oferty pracy</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>30 dni wyświetlania oferty</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Logo firmy przy ofercie</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Podstawowa analityka</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Dostęp do API</span>
              </li>
            </ul>
            <Link href="/register?role=employer">
              <Button className="w-full" size="lg">Dodaj ofertę za darmo</Button>
            </Link>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 max-w-2xl mx-auto mt-12 text-center">
          <h3 className="text-xl font-bold mb-4">📢 Co w przyszłości?</h3>
          <p className="text-muted-foreground mb-4">
            Gdy JobStack urośnie, planujemy wprowadzić opcjonalne płatne funkcje dla pracodawców:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
            <li>• Wyróżnienie oferty (Featured)</li>
            <li>• Zaawansowana analityka</li>
            <li>• Priorytetowe wsparcie</li>
            <li>• Integracja z ATS</li>
          </ul>
          <p className="text-sm mt-4 text-muted-foreground">
            Kandydaci zawsze będą mieli darmowy dostęp!
          </p>
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Masz pytania? <Link href="/contact" className="text-blue-600 underline">Skontaktuj się z nami</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
