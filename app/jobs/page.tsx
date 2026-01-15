'use client';

import { useState, useEffect } from 'react';
import { JobSearch } from '@/components/job-search';
import { JobCard } from '@/components/job-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Job } from '@/types';
import Link from 'next/link';

interface JobsResponse {
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchJobs = async (page: number = 1) => {
    setLoading(true);
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

      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, page: 1 }));

    // Fetch with new filters
    const params = new URLSearchParams({
      page: '1',
      limit: '20',
    });

    if (newFilters.query) params.append('search', newFilters.query);
    if (newFilters.location) params.append('location', newFilters.location);
    if (newFilters.remote) params.append('remote', 'true');
    if (newFilters.techStack.length > 0) {
      params.append('techStack', newFilters.techStack.join(','));
    }

    setLoading(true);
    fetch(`/api/jobs?${params.toString()}`)
      .then(res => res.json())
      .then((data: JobsResponse) => {
        setJobs(data.jobs);
        setPagination(data.pagination);
      })
      .catch(err => console.error('Error fetching jobs:', err))
      .finally(() => setLoading(false));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchJobs(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white dark:bg-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              JobStack
            </Link>
            <div className="flex gap-4">
              <Link href="/for-employers">
                <Button variant="ghost">For Employers</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 border-b py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Find Your Next Job</h1>
          <JobSearch onSearch={handleSearch} />
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              {loading ? (
                'Loading...'
              ) : (
                <>
                  {pagination.total} job{pagination.total !== 1 ? 's' : ''} found
                </>
              )}
            </h2>
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
              All Sources
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
              Remote Only
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
              Featured
            </Badge>
          </div>
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-white dark:bg-gray-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>

            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={pagination.page === pageNum ? 'default' : 'outline'}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            {pagination.totalPages > 5 && (
              <>
                <Button variant="ghost" disabled>
                  ...
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.totalPages)}
                >
                  {pagination.totalPages}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
