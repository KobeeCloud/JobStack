'use client';

import { useEffect, useState } from 'react';
import { X, MapPin, Building2, Clock, Banknote, ExternalLink, Bookmark, Share2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/lib/i18n';

export interface JobData {
  id: string;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  employment_type?: string;
  experience_level?: string;
  work_type?: string;
  description?: string;
  requirements?: string[];
  tech_stack?: string[];
  benefits?: string[];
  source?: string;
  source_url?: string;
  created_at?: string;
  expires_at?: string;
}

interface JobDetailModalProps {
  job: JobData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobDetailModal({ job, isOpen, onClose }: JobDetailModalProps) {
  const { t } = useLocale();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isVisible || !job) return null;

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    const currency = job.salary_currency || 'PLN';
    if (job.salary_min && job.salary_max) {
      return `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${currency}`;
    }
    if (job.salary_min) return `od ${job.salary_min.toLocaleString()} ${currency}`;
    if (job.salary_max) return `do ${job.salary_max.toLocaleString()} ${currency}`;
    return null;
  };

  const getWorkTypeBadge = () => {
    switch (job.work_type?.toLowerCase()) {
      case 'remote':
        return { label: t('common.remote'), color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
      case 'hybrid':
        return { label: t('common.hybrid'), color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
      default:
        return { label: t('common.onsite'), color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' };
    }
  };

  const workType = getWorkTypeBadge();
  const salary = formatSalary();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                {job.source && (
                  <>
                    <span>{job.source}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
                <span className="truncate">{job.company}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {job.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-80px-88px)]">
          <div className="p-6 space-y-6">
            {/* Company Card */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              {job.company_logo ? (
                <img
                  src={job.company_logo}
                  alt={job.company}
                  className="w-16 h-16 rounded-xl object-contain bg-white p-2"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {job.company}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{job.location}</span>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3">
              {salary && (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                    <Banknote className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">Wynagrodzenie</p>
                    <p className="font-semibold text-green-700 dark:text-green-300">{salary}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Typ pracy</p>
                  <p className="font-semibold text-blue-700 dark:text-blue-300">{workType.label}</p>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {job.employment_type && (
                <Badge variant="secondary" className="rounded-full">
                  {job.employment_type}
                </Badge>
              )}
              {job.experience_level && (
                <Badge variant="secondary" className="rounded-full">
                  {job.experience_level}
                </Badge>
              )}
              <Badge className={`rounded-full ${workType.color}`}>
                {workType.label}
              </Badge>
            </div>

            {/* Tech Stack */}
            {job.tech_stack && job.tech_stack.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  💻 Technologie
                </h4>
                <div className="flex flex-wrap gap-2">
                  {job.tech_stack.map((tech, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="rounded-full border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {job.description && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  📋 Opis stanowiska
                </h4>
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <div dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br/>') }} />
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  ✅ Wymagania
                </h4>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  🎁 Benefity
                </h4>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((benefit, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                    >
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Source Info */}
            {job.source && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Źródło: <span className="font-medium">{job.source}</span>
                  {job.created_at && (
                    <span className="ml-2">
                      • Dodano: {new Date(job.created_at).toLocaleDateString('pl-PL')}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl"
              onClick={() => {
                // TODO: Implement bookmark
                console.log('Bookmark job:', job.id);
              }}
            >
              <Bookmark className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl"
              onClick={() => {
                navigator.share?.({
                  title: job.title,
                  text: `${job.title} w ${job.company}`,
                  url: window.location.origin + '/jobs/' + job.id,
                }) || navigator.clipboard.writeText(window.location.origin + '/jobs/' + job.id);
              }}
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
              onClick={() => {
                if (job.source_url) {
                  window.open(job.source_url, '_blank');
                }
              }}
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Aplikuj na stronie źródłowej
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
