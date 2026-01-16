'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Link as LinkIcon, Loader2 } from 'lucide-react';

export function CareersImporter() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; total: number; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/import/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nie udało się zaimportować ofert');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się zaimportować ofert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-blue-100/80 dark:border-blue-900/40 bg-white/80 dark:bg-gray-900/60 backdrop-blur-md p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
          <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-300" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Import ofert z strony firmy</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Podaj URL zakładki "Kariera" lub feed RSS/Atom. Import działa tylko, jeśli robots.txt pozwala.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://twojafirma.pl/careers lub https://twojafirma.pl/jobs.xml"
            className="rounded-xl"
          />
        </div>
        <Button
          onClick={handleImport}
          disabled={loading || !url.trim()}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4 mr-2" />}
          Importuj
        </Button>
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
