'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Briefcase, Calendar, ExternalLink, MapPin, Trash2 } from 'lucide-react';

interface EmployerJob {
  id: string;
  title: string;
  location: string | null;
  remote: boolean | null;
  source_url: string | null;
  expires_at: string | null;
  created_at: string | null;
}

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/employer/jobs');
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Nie udało się pobrać ofert');
        }
        const data = await response.json();
        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      } catch (err) {
        console.error('Jobs fetch error:', err);
        setError(err instanceof Error ? err.message : 'Nie udało się pobrać ofert');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleDelete = async (jobId: string) => {
    if (!confirm('Usunąć ofertę? Ta operacja jest nieodwracalna.')) return;
    setDeletingId(jobId);
    try {
      const response = await fetch(`/api/employer/jobs?jobId=${jobId}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Nie udało się usunąć oferty');
      }
      setJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Delete job error:', err);
      setError(err instanceof Error ? err.message : 'Nie udało się usunąć oferty');
    } finally {
      setDeletingId(null);
    }
  };

  const isActive = (expiresAt?: string | null) => {
    if (!expiresAt) return true;
    return new Date(expiresAt) > new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/post-job" className="text-sm text-blue-600 hover:underline">
              Dodaj ofertę
            </Link>
          </div>
          <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
            <Briefcase className="w-3 h-3 mr-1" />
            Twoje oferty
          </Badge>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Twoje oferty pracy</h1>
            <p className="text-gray-600 dark:text-gray-400">Zarządzaj opublikowanymi ogłoszeniami</p>
          </div>

          {loading && (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="py-8 text-center text-gray-500">Ładowanie ofert...</CardContent>
            </Card>
          )}

          {!loading && error && (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-red-200 dark:border-red-900/40">
              <CardContent className="py-6 text-center text-red-600">{error}</CardContent>
            </Card>
          )}

          {!loading && !error && jobs.length === 0 && (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="py-10 text-center text-gray-500">
                Brak opublikowanych ofert. Dodaj pierwszą ofertę, aby zacząć.
              </CardContent>
            </Card>
          )}

          {!loading && !error && jobs.length > 0 && (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50"
                >
                  <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">{job.title}</CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location || 'Zdalnie'}
                        </span>
                        {job.expires_at && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Wygasa {new Date(job.expires_at).toLocaleDateString('pl-PL')}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {isActive(job.expires_at) ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Aktywna</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">Wygasła</Badge>
                      )}
                      <Link href={`/jobs/${job.id}`}>
                        <Button variant="outline" className="rounded-xl">
                          Podgląd
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(job.id)}
                        disabled={deletingId === job.id}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deletingId === job.id ? 'Usuwanie...' : 'Usuń'}
                      </Button>
                      {job.source_url && (
                        <Button
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => window.open(job.source_url as string, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Zewnętrzny link
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-500 dark:text-gray-400">
                    Opublikowano: {job.created_at ? new Date(job.created_at).toLocaleDateString('pl-PL') : '—'}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
