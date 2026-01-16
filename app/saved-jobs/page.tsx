'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import {
  Bookmark,
  BookmarkX,
  MapPin,
  Building2,
  Banknote,
  ExternalLink,
  Trash2,
  Loader2,
  Heart,
  ArrowRight
} from 'lucide-react';

interface SavedJob {
  id: string;
  created_at: string;
  job_id: string;
  jobs: {
    id: string;
    title: string;
    company_name: string;
    company_logo: string | null;
    location: string;
    remote: boolean;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string;
    tech_stack: string[];
    source: string;
    source_url: string | null;
    published_at: string;
    expires_at: string | null;
  };
}

export default function SavedJobsPage() {
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login?redirect=/saved-jobs');
      return;
    }

    setIsAuthenticated(true);
    fetchSavedJobs();
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await fetch('/api/saved-jobs');

      if (response.ok) {
        const data = await response.json();
        setSavedJobs(data.savedJobs || []);
      } else if (response.status === 401) {
        router.push('/login?redirect=/saved-jobs');
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (jobId: string) => {
    setRemoving(jobId);

    try {
      const response = await fetch(`/api/saved-jobs?jobId=${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedJobs(prev => prev.filter(sj => sj.job_id !== jobId));
      }
    } catch (error) {
      console.error('Error removing saved job:', error);
    } finally {
      setRemoving(null);
    }
  };

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return null;
    const curr = currency || 'PLN';
    if (min && max) {
      return `${(min / 1000).toFixed(0)}k - ${(max / 1000).toFixed(0)}k ${curr}`;
    }
    if (min) return `od ${(min / 1000).toFixed(0)}k ${curr}`;
    if (max) return `do ${(max / 1000).toFixed(0)}k ${curr}`;
    return null;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-8 h-8" />
              <h1 className="text-3xl md:text-4xl font-bold">Zapisane oferty</h1>
            </div>
            <p className="text-lg text-blue-100">
              Twoje zapisane oferty pracy w jednym miejscu
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : savedJobs.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <BookmarkX className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Brak zapisanych ofert
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Przeglądaj oferty pracy i zapisuj te, które Cię interesują, klikając ikonę zakładki.
                </p>
                <Link href="/jobs">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    Przeglądaj oferty
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-bold text-gray-900 dark:text-white">{savedJobs.length}</span> zapisanych ofert
                </p>
              </div>

              {savedJobs.map((savedJob) => {
                const job = savedJob.jobs;
                if (!job) return null;

                const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);

                return (
                  <Card
                    key={savedJob.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Company Logo */}
                        {job.company_logo ? (
                          <img
                            src={job.company_logo}
                            alt={job.company_name}
                            className="w-14 h-14 rounded-xl object-contain bg-gray-50 dark:bg-gray-800 p-2 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-7 h-7 text-white" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Link href={`/jobs/${job.id}`}>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
                                  {job.title}
                                </h3>
                              </Link>
                              <p className="text-gray-600 dark:text-gray-400">
                                {job.company_name}
                              </p>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              disabled={removing === job.id}
                              onClick={() => handleRemove(job.id)}
                            >
                              {removing === job.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </Button>
                          </div>

                          {/* Info Row */}
                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location || 'Polska'}</span>
                            </div>

                            <Badge
                              variant="outline"
                              className={`rounded-full text-xs ${
                                job.remote
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {job.remote ? 'Zdalnie' : 'Stacjonarnie'}
                            </Badge>

                            {salary && (
                              <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                                <Banknote className="w-4 h-4" />
                                <span>{salary}</span>
                              </div>
                            )}
                          </div>

                          {/* Tech Stack */}
                          {job.tech_stack && job.tech_stack.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {job.tech_stack.slice(0, 5).map((tech, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="rounded-full text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                >
                                  {tech}
                                </Badge>
                              ))}
                              {job.tech_stack.length > 5 && (
                                <Badge variant="secondary" className="rounded-full text-xs">
                                  +{job.tech_stack.length - 5}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-xs text-gray-400">
                              Zapisano {new Date(savedJob.created_at).toLocaleDateString('pl-PL')}
                            </span>

                            <div className="flex items-center gap-2">
                              {job.source_url && (
                                <a
                                  href={job.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                  Oryginalna oferta
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              <Link href={`/jobs/${job.id}`}>
                                <Button size="sm" variant="outline">
                                  Zobacz szczegóły
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
