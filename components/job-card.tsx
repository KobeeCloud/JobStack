'use client';

import { useState } from 'react';
import { MapPin, Building2, Banknote, Clock, Bookmark, BookmarkCheck, Loader2, Briefcase, TrendingUp } from 'lucide-react';
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

// Extract seniority level from description or requirements
function extractSeniority(job: Job): string | null {
  const text = `${job.description || ''} ${job.requirements?.join(' ') || ''}`.toLowerCase();

  if (text.includes('senior') || text.includes('sr.')) return 'Senior';
  if (text.includes('mid') || text.includes('middle')) return 'Mid';
  if (text.includes('junior') || text.includes('jr.')) return 'Junior';
  if (text.includes('lead') || text.includes('principal')) return 'Lead';
  if (text.includes('intern') || text.includes('trainee')) return 'Intern';

  return null;
}

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
  const seniority = extractSeniority(job);

  return (
    <article
      onClick={onClick}
      className={`group relative bg-card/80 backdrop-blur-md dark:bg-card/40 rounded-2xl border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 ${
        isSelected
          ? 'border-primary ring-1 ring-primary shadow-lg shadow-primary/10'
          : 'border-border/50 hover:border-primary/50'
      }`}
    >
      {/* Featured banner */}
      {job.featured && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg rotate-3">
          ⭐ Wyróżniona
        </div>
      )}

      <div className="p-5">
        {/* Header: Logo + Company + Seniority */}
        <div className="flex items-start gap-4 mb-4">
          {/* Company Logo */}
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt={companyName}
              className="w-14 h-14 rounded-xl object-contain bg-gray-50 dark:bg-gray-800 p-2 shadow-sm flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <Building2 className="w-7 h-7 text-white" />
            </div>
          )}

          {/* Title + Company */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
              {job.title || 'Stanowisko'}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Building2 className="w-4 h-4" />
              <span className="font-medium">{companyName}</span>
            </div>
          </div>

          {/* Bookmark button */}
          <Button
            variant="ghost"
            size="icon"
            disabled={saving}
            className={`rounded-xl h-10 w-10 transition-all ${
              saved
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                : 'opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={handleSaveClick}
            title={saved ? 'Usuń z zapisanych' : 'Zapisz ofertę'}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saved ? (
              <BookmarkCheck className="w-5 h-5 fill-current" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Badges: Location, Remote, Seniority, New */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {/* Location */}
          <Badge variant="outline" className="rounded-full text-xs px-3 py-1 bg-gray-50 dark:bg-gray-800">
            <MapPin className="w-3 h-3 mr-1" />
            {job.location || 'Polska'}
          </Badge>

          {/* Work type */}
          <Badge
            variant="outline"
            className={`rounded-full text-xs px-3 py-1 ${getWorkTypeColor()}`}
          >
            {getWorkTypeLabel()}
          </Badge>

          {/* Seniority */}
          {seniority && (
            <Badge variant="outline" className="rounded-full text-xs px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
              <TrendingUp className="w-3 h-3 mr-1" />
              {seniority}
            </Badge>
          )}

          {/* New badge */}
          {isNew && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 rounded-full text-xs px-3 py-1 shadow-md">
              🔥 Nowa
            </Badge>
          )}

          {/* Salary */}
          {salary && (
            <Badge variant="outline" className="ml-auto rounded-full text-xs px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 font-semibold">
              <Banknote className="w-3 h-3 mr-1" />
              {salary}
            </Badge>
          )}
        </div>

        {/* Tech stack */}
        {job.techStack && job.techStack.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {job.techStack.slice(0, 5).map((tech, index) => (
              <Badge
                key={index}
                className="rounded-lg text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                {tech}
              </Badge>
            ))}
            {job.techStack.length > 5 && (
              <Badge className="rounded-lg text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                +{job.techStack.length - 5} więcej
              </Badge>
            )}
          </div>
        )}

        {/* Footer: Source + Time */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            {sourceLabel}
          </span>
          {job.publishedAt && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {new Date(job.publishedAt).toLocaleDateString('pl-PL')}
            </span>
          )}
        </div>

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
