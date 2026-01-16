'use client';

import { MapPin, Building2, Banknote, Clock, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type Job } from '@/types';
import { useLocale } from '@/lib/i18n';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
  isSelected?: boolean;
}

const SOURCE_LABELS: Record<string, string> = {
  justjoinit: 'JustJoin.it',
  nofluffjobs: 'NoFluffJobs',
  pracuj: 'Pracuj.pl',
  bulldogjob: 'Bulldogjob',
  rocketjobs: 'RocketJobs',
  indeed: 'Indeed',
  native: 'JobStack',
};

export function JobCard({ job, onClick, isSelected }: JobCardProps) {
  const { t } = useLocale();

  const sourceLabel = SOURCE_LABELS[job.source] || job.source || 'Unknown';
  const companyName = job.company || job.company_name || 'Firma';

  const formatSalary = () => {
    if (!job.salary?.min && !job.salary?.max) return null;
    const currency = job.salary?.currency || 'PLN';
    const min = job.salary?.min;
    const max = job.salary?.max;
    if (min && max) {
      return `${(min / 1000).toFixed(0)}k - ${(max / 1000).toFixed(0)}k ${currency}`;
    }
    if (min) return `od ${(min / 1000).toFixed(0)}k ${currency}`;
    if (max) return `do ${(max / 1000).toFixed(0)}k ${currency}`;
    return null;
  };

  const getWorkTypeColor = () => {
    if (job.remote) {
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  };

  const getWorkTypeLabel = () => {
    if (job.remote) return t('common.remote');
    return t('common.onsite');
  };

  const salary = formatSalary();
  const isNew = job.publishedAt && new Date(job.publishedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);

  return (
    <article
      onClick={onClick}
      className={`group relative bg-white dark:bg-gray-800/50 rounded-2xl border-2 transition-all duration-200 cursor-pointer hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 hover:-translate-y-1 ${
        isSelected
          ? 'border-blue-500 dark:border-blue-500 shadow-lg ring-2 ring-blue-500/20'
          : 'border-gray-100 dark:border-gray-800'
      }`}
    >
      {/* New badge */}
      {isNew && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
            {t('common.new')}
          </Badge>
        </div>
      )}

      {/* Featured badge */}
      {job.featured && (
        <div className="absolute -top-2 -left-2 z-10">
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 shadow-lg">
            ⭐ Wyróżnione
          </Badge>
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Company Logo */}
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt={companyName}
              className="w-14 h-14 rounded-xl object-contain bg-gray-50 dark:bg-gray-800 p-2 flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-white" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {job.title || 'Stanowisko'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 truncate">
              {companyName}
            </p>
          </div>

          {/* Bookmark button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement bookmark
            }}
          >
            <Bookmark className="w-5 h-5" />
          </Button>
        </div>

        {/* Quick Info Row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate max-w-[150px]">{job.location || 'Polska'}</span>
          </div>

          <Badge variant="outline" className={`rounded-full text-xs ${getWorkTypeColor()}`}>
            {getWorkTypeLabel()}
          </Badge>
        </div>

        {/* Salary */}
        {salary && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <Banknote className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="font-bold text-green-700 dark:text-green-300">
              {salary}
            </span>
            <span className="text-green-600 dark:text-green-400 text-sm">
              {t('common.perMonth')}
            </span>
          </div>
        )}

        {/* Tech Stack */}
        {job.techStack && job.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.techStack.slice(0, 5).map((tech, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="rounded-full text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800"
              >
                {tech}
              </Badge>
            ))}
            {job.techStack.length > 5 && (
              <Badge variant="secondary" className="rounded-full text-xs">
                +{job.techStack.length - 5}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
              {sourceLabel}
            </span>
            {job.publishedAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(job.publishedAt).toLocaleDateString('pl-PL')}
              </span>
            )}
          </div>

          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Zobacz szczegóły →
          </span>
        </div>
      </div>
    </article>
  );
}
