'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DatabaseZap, Loader2 } from 'lucide-react';

const providerLabels = {
  lever: 'Lever',
  greenhouse: 'Greenhouse',
} as const;

type Provider = keyof typeof providerLabels;

export function AtsImporter() {
  const [provider, setProvider] = useState<Provider>('lever');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; total: number; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/import/ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, company: company.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nie udało się zaimportować ofert z ATS');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się zaimportować ofert z ATS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-100/80 dark:border-indigo-900/40 bg-white/80 dark:bg-gray-900/60 backdrop-blur-md p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
          <DatabaseZap className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Import z ATS (publiczne job boardy)</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Wybierz ATS i wpisz slug firmy. Import działa z publicznych boardów Lever/Greenhouse.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as Provider)}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
        >
          <option value="lever">Lever</option>
          <option value="greenhouse">Greenhouse</option>
        </select>
        <Input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder={provider === 'lever' ? 'np. netflix (api.lever.co/v0/postings/netflix)' : 'np. airbnb (boards-api.greenhouse.io/v1/boards/airbnb/jobs)'}
          className="rounded-xl"
        />
        <Button
          onClick={handleImport}
          disabled={loading || !company.trim()}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Importuj'}
        </Button>
      </div>

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Wykorzystywane są oficjalne publiczne endpointy ATS. Przykład: lever → api.lever.co/v0/postings/
        <span className="font-semibold">spotify</span> lub greenhouse → boards-api.greenhouse.io/v1/boards/
        <span className="font-semibold">airbnb</span>/jobs. Szanujemy warunki dostawców.
      </div>

      {result && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            Zaimportowano {result.imported} z {result.total}
          </Badge>
          <span className="text-gray-600 dark:text-gray-300">{result.message}</span>
        </div>
      )}

      {error && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-xl px-4 py-3">
          {error}
        </div>
      )}
    </div>
  );
}
