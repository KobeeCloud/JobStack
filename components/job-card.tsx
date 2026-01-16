'use client';

import { useState } from 'react';
import { MapPin, Building2, Banknote, Clock, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type Job } from '@/types';
import { useLocale } from '@/lib/i18n';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
  isSelected?: boolean;
  isSaved?: boolean;
  onSaveToggle?: (jobId: string, saved: boolean) => void;
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

export function JobCard({ job, onClick, isSelected, isSaved = false, onSaveToggle }: JobCardProps) {
  const { t } = useLocale();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(isSaved);
  const [saveError, setSaveError] = useState<string | null>(null);

  const sourceLabel = SOURCE_LABELS[job.source] || job.source || 'Unknown';
  const companyName = job.company || job.company_name || 'Firma';

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaveError(null);
    setSaving(true);

    try {
      if (saved) {
        // Remove from saved
        const response = await fetch(`/api/saved-jobs?jobId=${job.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setSaved(false);
          onSaveToggle?.(job.id, false);
        } else {
          const data = await response.json();
          if (response.status === 401) {
            setSaveError('Zaloguj się, aby zapisywać oferty');
          } else {
            setSaveError(data.error || 'Nie udało się usunąć');
          }
        }
      } else {
        // Add to saved
        const response = await fetch('/api/saved-jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: job.id }),
        });

        if (response.ok) {
          setSaved(true);
          onSaveToggle?.(job.id, true);
        } else {
          const data = await response.json();
          if (response.status === 401) {
            setSaveError('Zaloguj się, aby zapisywać oferty');
          } else if (data.alreadySaved) {
            setSaved(true);
          } else {
            setSaveError(data.error || 'Nie udało się zapisać');
          }
        }
      }
    } catch (error) {
      console.error('Error saving job:', error);
      setSaveError('Wystąpił błąd');
    } finally {
      setSaving(false);
      // Clear error after 3 seconds
      if (saveError) {
        setTimeout(() => setSaveError(null), 3000);
      }
    }
  };

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
      className={`group relative bg-white dark:bg-gray-800/50 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 ${
        isSelected
          ? 'border-blue-500 dark:border-blue-500 shadow-md ring-1 ring-blue-500/20'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="p-3 sm:p-4">
        {/* Compact single-row layout */}
        <div className="flex items-center gap-3">
          {/* Company Logo - smaller */}
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt={companyName}
              className="w-10 h-10 rounded-lg object-contain bg-gray-50 dark:bg-gray-800 p-1 flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Title + badges row */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                {job.title || 'Stanowisko'}
              </h3>
              {isNew && (
                <Badge className="bg-orange-500 text-white border-0 text-[10px] px-1.5 py-0">
                  {t('common.new')}
                </Badge>
              )}
              {job.featured && (
                <Badge className="bg-yellow-500 text-white border-0 text-[10px] px-1.5 py-0">
                  ⭐
                </Badge>
              )}
            </div>

            {/* Company + Location row */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <span className="truncate">{companyName}</span>
              <span className="flex items-center gap-1 flex-shrink-0">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{job.location || 'Polska'}</span>
              </span>
            </div>
          </div>

          {/* Right side: Salary + Work type + Save */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Salary - compact */}
            {salary && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Banknote className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-700 dark:text-green-300 text-xs whitespace-nowrap">
                  {salary}
                </span>
              </div>
            )}

            {/* Work type badge */}
            <Badge variant="outline" className={`rounded-full text-[10px] px-2 py-0.5 ${getWorkTypeColor()}`}>
              {getWorkTypeLabel()}
            </Badge>

            {/* Bookmark button */}
            <Button
              variant="ghost"
              size="icon"
              disabled={saving}
              className={`rounded-lg h-8 w-8 transition-all ${
                saved
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'opacity-0 group-hover:opacity-100'
              }`}
              onClick={handleSaveClick}
              title={saved ? 'Usuń z zapisanych' : 'Zapisz ofertę'}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <BookmarkCheck className="w-4 h-4 fill-current" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Tech stack row - compact */}
        {job.techStack && job.techStack.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {job.techStack.slice(0, 4).map((tech, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="rounded-md text-[10px] px-1.5 py-0 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-0"
              >
                {tech}
              </Badge>
            ))}
            {job.techStack.length > 4 && (
              <Badge variant="secondary" className="rounded-md text-[10px] px-1.5 py-0">
                +{job.techStack.length - 4}
              </Badge>
            )}
            {/* Source label - inline with tech */}
            <span className="ml-auto text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
              {sourceLabel}
            </span>
          </div>
        )}

        {/* Mobile salary (shown on small screens if hidden above) */}
        {salary && (
          <div className="sm:hidden flex items-center gap-1 mt-2 text-xs">
            <Banknote className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-700 dark:text-green-300">
              {salary}
            </span>
          </div>
        )}

        {/* Save error tooltip */}
        {saveError && (
          <div className="absolute top-full right-2 mt-1 px-2 py-1 text-xs bg-red-500 text-white rounded-lg whitespace-nowrap z-20">
            {saveError}
          </div>
        )}
      </div>
    </article>
  );
}
