'use client';

import { useState, useEffect, useCallback } from 'react';
import { JobSearch } from '@/components/job-search';
import { JobCard } from '@/components/job-card';
import { JobDetailModal, JobData } from '@/components/job-detail-modal';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Job } from '@/types';
import { useLocale } from '@/lib/i18n';
import { Search, SlidersHorizontal, MapPin, Briefcase, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface JobsResponse {
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
  warning?: string;
}

// Transform Job to JobData for modal
function jobToJobData(job: Job): JobData {
  return {
    id: job.id,
    title: job.title,
    company: job.company || job.company_name,
    company_logo: job.companyLogo,
    location: job.location,
    salary_min: job.salary?.min,
    salary_max: job.salary?.max,
    salary_currency: job.salary?.currency,
    work_type: job.remote ? 'remote' : 'onsite',
    description: job.description,
    requirements: job.requirements,
    tech_stack: job.techStack,
    benefits: job.benefits,
    source: job.source,
    source_url: job.sourceUrl,
    created_at: job.publishedAt || job.createdAt,
    expires_at: job.expiresAt,
  };
}

export default function JobsPage() {
  const { t } = useLocale();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    query: '',
    location: '',
    techStack: [] as string[],
    remote: false,
  });
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (filters.query) params.append('search', filters.query);
      if (filters.location) params.append('location', filters.location);
      if (filters.remote) params.append('remote', 'true');
      if (filters.techStack.length > 0) {
        params.append('techStack', filters.techStack.join(','));
      }

      const response = await fetch(`/api/jobs?${params.toString()}`);
      const data: JobsResponse = await response.json();

      if (data.error) {
        console.warn('API returned error:', data.error);
        setError(data.error);
      }

      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Nie udało się załadować ofert. Spróbuj ponownie później.');
      setJobs([]);
      setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setError(null);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchJobs(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedJob(null), 300);
  };

  const quickFilters = [
    { id: 'all', label: 'Wszystkie', icon: Briefcase },
    { id: 'remote', label: 'Tylko zdalne', icon: MapPin },
    { id: 'featured', label: 'Wyróżnione', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {t('jobs.title')}
            </h1>
            <p className="text-lg text-blue-100">
              {t('jobs.subtitle')}
            </p>
          </div>

          {/* Search */}
          <div className="max-w-4xl mx-auto">
            <JobSearch onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => fetchJobs(pagination.page)}
                className="mt-2 text-sm text-red-700 dark:text-red-300 underline hover:no-underline"
              >
                {t('common.retry')}
              </button>
            </div>
          )}

          {/* Quick Filters & Results Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    setActiveFilter(activeFilter === filter.id ? null : filter.id);
                    if (filter.id === 'remote') {
                      setFilters(prev => ({ ...prev, remote: !prev.remote }));
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeFilter === filter.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
                  }`}
                >
                  <filter.icon className="w-4 h-4" />
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Results Count */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {loading ? (
                  <span className="animate-pulse">{t('common.loading')}</span>
                ) : (
                  <span>
                    <span className="font-bold text-gray-900 dark:text-white">{pagination.total}</span>
                    {' '}ofert pracy
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Job Listings */}
          {loading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-white dark:bg-gray-800 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
              <div className="text-7xl mb-6">{error ? '😞' : '🔍'}</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                {t('jobs.noResults')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Spróbuj zmienić filtry lub kryteria wyszukiwania
              </p>
              <Button
                onClick={() => {
                  setFilters({ query: '', location: '', techStack: [], remote: false });
                  setActiveFilter(null);
                }}
                variant="outline"
              >
                Wyczyść filtry
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() => handleJobClick(job)}
                  isSelected={selectedJob?.id === job.id}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? 'default' : 'ghost'}
                      size="sm"
                      className={`rounded-xl min-w-[40px] ${
                        pagination.page === pageNum
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : ''
                      }`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="rounded-xl"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Job Detail Modal */}
      <JobDetailModal
        job={selectedJob ? jobToJobData(selectedJob) : null}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
