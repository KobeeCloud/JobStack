'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Search,
  Users,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Star,
  Calendar,
  Building2,
  Eye
} from 'lucide-react';

type EmployerApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  email: string;
  phone: string;
  appliedAt: string;
  status: string;
  experience: string;
  currentPosition: string;
  cvUrl: string;
  linkedIn: string;
  coverLetter: string;
  techStack: string[];
  salaryExpectation: string;
  rating: number;
  notes: string;
};

const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: 'Nowa', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  reviewed: { label: 'Przejrzana', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  interview: { label: 'Rozmowa', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  offered: { label: 'Oferta', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  rejected: { label: 'Odrzucona', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  hired: { label: 'Zatrudniony', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
};

export default function ApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [applications, setApplications] = useState<EmployerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<EmployerApplication | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/employer/applications');
        if (!response.ok) {
          throw new Error('Nie udało się pobrać aplikacji');
        }
        const data = await response.json();
        setApplications(data.applications || []);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Nie udało się pobrać aplikacji');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const jobs = [...new Set(applications.map(a => a.jobTitle))];

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesJob = jobFilter === 'all' || app.jobTitle === jobFilter;

    return matchesSearch && matchesStatus && matchesJob;
  });

  const newCount = applications.filter(a => a.status === 'new').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                JobStack.pl
              </Link>
            </div>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              <Building2 className="w-3 h-3 mr-1" />
              Pracodawca
            </Badge>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Aplikacje kandydatów
              {newCount > 0 && (
                <Badge className="bg-red-500 text-white text-sm">{newCount} nowe</Badge>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Przeglądaj i zarządzaj aplikacjami na Twoje oferty pracy
            </p>
          </div>

          {/* Filters */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[250px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Szukaj po imieniu, emailu lub technologii..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-xl bg-white dark:bg-gray-900"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Wszystkie statusy</option>
                    <option value="new">Nowe</option>
                    <option value="reviewed">Przejrzane</option>
                    <option value="interview">Rozmowa</option>
                    <option value="offered">Oferta</option>
                    <option value="rejected">Odrzucone</option>
                    <option value="hired">Zatrudnieni</option>
                  </select>

                  <select
                    value={jobFilter}
                    onChange={(e) => setJobFilter(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Wszystkie oferty</option>
                    {jobs.map(job => (
                      <option key={job} value={job}>{job}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Applications List */}
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
                  <CardContent className="py-12 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500 dark:text-gray-400">Ładowanie aplikacji...</p>
                  </CardContent>
                </Card>
              ) : error ? (
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
                  <CardContent className="py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">{error}</p>
                  </CardContent>
                </Card>
              ) : filteredApplications.length === 0 ? (
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
                  <CardContent className="py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Brak aplikacji spełniających kryteria wyszukiwania
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredApplications.map((app) => (
                  <Card
                    key={app.id}
                    className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 cursor-pointer transition-all hover:shadow-lg ${
                      selectedApplication?.id === app.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedApplication(app)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                              {app.candidateName}
                            </h3>
                            <Badge className={(statusLabels[app.status] || statusLabels.new).color}>
                              {(statusLabels[app.status] || statusLabels.new).label}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {app.currentPosition}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= app.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {app.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {app.techStack.slice(0, 4).map((tech) => (
                            <Badge key={tech} variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {tech}
                            </Badge>
                          ))}
                          {app.techStack.length > 4 && (
                            <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-500">
                              +{app.techStack.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(app.appliedAt).toLocaleDateString('pl-PL')}
                          </span>
                          {app.experience && <span>{app.experience}</span>}
                          {app.salaryExpectation && (
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {app.salaryExpectation}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          {app.jobTitle}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Application Detail */}
            <div className="lg:col-span-1">
              {selectedApplication ? (
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 sticky top-24">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{selectedApplication.candidateName}</CardTitle>
                      <Badge className={(statusLabels[selectedApplication.status] || statusLabels.new).color}>
                        {(statusLabels[selectedApplication.status] || statusLabels.new).label}
                      </Badge>
                    </div>
                    <CardDescription>{selectedApplication.currentPosition}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Contact Info */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Kontakt</h4>
                      <div className="space-y-2 text-sm">
                        <a
                          href={`mailto:${selectedApplication.email}`}
                          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                        >
                          <Mail className="w-4 h-4" />
                          {selectedApplication.email}
                        </a>
                        {selectedApplication.phone && (
                          <a
                            href={`tel:${selectedApplication.phone}`}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600"
                          >
                            <Phone className="w-4 h-4" />
                            {selectedApplication.phone}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Tech Stack */}
                    {selectedApplication.techStack.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedApplication.techStack.map((tech) => (
                            <Badge key={tech} variant="secondary" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Details */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Szczegóły</h4>
                      <div className="space-y-2 text-sm">
                        {selectedApplication.experience && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Doświadczenie:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{selectedApplication.experience}</span>
                          </div>
                        )}
                        {selectedApplication.salaryExpectation && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Oczekiwania:</span>
                            <span className="font-medium text-green-600">{selectedApplication.salaryExpectation}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Data aplikacji:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {new Date(selectedApplication.appliedAt).toLocaleDateString('pl-PL', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    {selectedApplication.coverLetter && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">List motywacyjny</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
                          {selectedApplication.coverLetter}
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedApplication.notes && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Notatki
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl border border-yellow-200 dark:border-yellow-900/50">
                          {selectedApplication.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                      <div className="flex gap-2">
                        {selectedApplication.cvUrl ? (
                          <Button className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" asChild>
                            <a href={selectedApplication.cvUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="w-4 h-4 mr-2" />
                              Pobierz CV
                            </a>
                          </Button>
                        ) : (
                          <Button className="flex-1 rounded-xl" variant="outline" disabled>
                            <FileText className="w-4 h-4 mr-2" />
                            Brak CV
                          </Button>
                        )}
                        {selectedApplication.linkedIn && (
                          <Button variant="outline" className="rounded-xl" asChild>
                            <a href={selectedApplication.linkedIn} target="_blank" rel="noopener noreferrer">
                              LinkedIn
                            </a>
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="rounded-xl text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/30">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Zaproś
                        </Button>
                        <Button variant="outline" className="rounded-xl text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30">
                          <XCircle className="w-4 h-4 mr-2" />
                          Odrzuć
                        </Button>
                      </div>

                      <select className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                        <option value="">Zmień status...</option>
                        <option value="reviewed">Przejrzana</option>
                        <option value="interview">Rozmowa zaplanowana</option>
                        <option value="offered">Oferta wysłana</option>
                        <option value="hired">Zatrudniony</option>
                        <option value="rejected">Odrzucony</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
                  <CardContent className="py-12 text-center">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Wybierz aplikację, aby zobaczyć szczegóły
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
