'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { QuickApply } from '@/components/quick-apply';
import { type Job } from '@/types';
import { formatSalary, formatDate } from '@/lib/utils';

interface ApplicationQuestion {
  id: string;
  question_text: string;
  question_type: 'text' | 'textarea' | 'checkbox' | 'radio' | 'select';
  options?: string[];
  required: boolean;
  order_index: number;
}

const CONTRACT_LABELS: Record<string, string> = {
  uop: 'Umowa o pracę',
  b2b: 'B2B / Kontrakt',
  uz: 'Umowa zlecenie',
  uod: 'Umowa o dzieło',
  internship: 'Staż / praktyki',
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [questions, setQuestions] = useState<ApplicationQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${params.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Job not found');
          } else if (response.status === 410) {
            setError('This job listing has expired');
          } else {
            setError('Failed to load job');
          }
          return;
        }

        const data = await response.json();
        setJob(data.job);

        // Fetch custom questions if this is a native job
        if (data.job.source === 'native') {
          const questionsResponse = await fetch(`/api/jobs/${params.id}/questions`);
          if (questionsResponse.ok) {
            const questionsData = await questionsResponse.json();
            setQuestions(questionsData.questions || []);
          }
        }
      } catch (err) {
        console.error('Error fetching job:', err);
        setError('Failed to load job');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="border-b bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              JobStack
            </Link>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="h-96 bg-white dark:bg-gray-800 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="border-b bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              JobStack
            </Link>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">😞</div>
            <h1 className="text-2xl font-bold mb-2">{error}</h1>
            <Button onClick={() => router.push('/jobs')}>
              ← Back to Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleApply = () => {
    if (job.sourceUrl) {
      window.open(job.sourceUrl, '_blank');
    }
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
              <Link href="/jobs">
                <Button variant="ghost">← Back to Jobs</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {job.featured && (
                      <Badge className="bg-yellow-500 hover:bg-yellow-600">
                        ⭐ Featured
                      </Badge>
                    )}
                    <Badge variant="outline">{job.source}</Badge>
                  </div>
                  <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                  <p className="text-xl text-muted-foreground mb-4">
                    {job.company_name}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      📍 {job.location}
                    </span>
                    {job.remote && (
                      <span className="flex items-center gap-1">
                        🏠 Remote
                      </span>
                    )}
                    {(job.salary || job.salaryType === 'hourly') && (
                      <span className="flex items-center gap-1 font-semibold text-green-600">
                        💰 {job.salaryType === 'hourly'
                          ? `${job.hourlyMin ? job.hourlyMin.toLocaleString('pl-PL') : ''}${job.hourlyMin && job.hourlyMax ? ' - ' : ''}${job.hourlyMax ? job.hourlyMax.toLocaleString('pl-PL') : ''} ${job.salary?.currency || 'PLN'} / h ${job.salaryMode === 'net' ? 'netto' : 'brutto'}`.trim()
                          : `${formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency || 'PLN')} ${job.salaryMode === 'net' ? 'netto' : 'brutto'}`}
                      </span>
                    )}
                    {job.contractType && (
                      <span className="flex items-center gap-1">
                        📄 {CONTRACT_LABELS[job.contractType] || job.contractType}
                      </span>
                    )}
                    {job.seniority && (
                      <span className="flex items-center gap-1">
                        🧭 {job.seniority}
                      </span>
                    )}
                    {job.requiredLanguage && (
                      <span className="flex items-center gap-1">
                        🌐 {job.requiredLanguage}{job.languageLevel ? ` (${job.languageLevel})` : ''}
                      </span>
                    )}
                    <span className="text-muted-foreground">
                      Posted {formatDate(job.publishedAt || job.createdAt)}
                    </span>
                  </div>
                </div>

                {job.companyLogo && (
                  <img
                    src={job.companyLogo}
                    alt={job.company_name}
                    className="w-20 h-20 object-contain"
                  />
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex gap-3">
                <Button size="lg" variant="outline">
                  💾 Save Job
                </Button>
                <Button size="lg" variant="outline">
                  🔗 Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          {job.techStack && job.techStack.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Tech Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.techStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-sm px-3 py-1">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">★</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recruitment Stages */}
          {job.recruitmentStages && job.recruitmentStages.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Etapy rekrutacji</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 list-decimal list-inside">
                  {job.recruitmentStages.map((stage, i) => (
                    <li key={i}>{stage}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Tagi</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {job.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="rounded-full">
                    #{tag}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Apply CTA */}
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Gotowy do aplikowania?</h3>
              <p className="mb-6 opacity-90">
                {job.source === 'native' && !job.sourceUrl
                  ? 'Wyślij szybkie zgłoszenie bezpośrednio do pracodawcy'
                  : 'Kliknij poniżej i aplikuj na stronie pracodawcy'}
              </p>
              {job.source === 'native' && !job.sourceUrl ? (
                <div className="max-w-sm mx-auto">
                  <QuickApply
                    jobId={job.id}
                    jobTitle={job.title}
                    companyName={job.company_name}
                    questions={questions}
                  />
                </div>
              ) : (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleApply}
                  className="text-lg px-8"
                >
                  {job.source === 'native' ? 'Aplikuj na stronie firmy →' : `Apply on ${job.source} →`}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
