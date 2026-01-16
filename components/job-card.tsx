import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Job } from '@/types';
import { formatSalary, formatDate } from '@/lib/utils';

interface JobCardProps {
  job: Job;
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

export function JobCard({ job }: JobCardProps) {
  // Safely get source label
  const sourceLabel = SOURCE_LABELS[job.source] || job.source || 'Unknown';

  // Safely get company name
  const companyName = job.company || job.company_name || 'Unknown Company';

  return (
    <Link href={job.sourceUrl || `/jobs/${job.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <CardTitle className="text-xl mb-1">{job.title || 'Untitled Position'}</CardTitle>
              <CardDescription className="text-base">
                {companyName}
              </CardDescription>
            </div>
            {job.companyLogo && (
              <img
                src={job.companyLogo}
                alt={companyName}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  // Hide broken images
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>📍 {job.location || 'Location not specified'}</span>
            {job.remote && <span>🏠 Remote</span>}
            {job.salary && (job.salary.min || job.salary.max) && (
              <span className="font-semibold text-foreground">
                💰 {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {(job.techStack || []).slice(0, 5).map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
            {job.techStack && job.techStack.length > 5 && (
              <Badge variant="outline">+{job.techStack.length - 5} more</Badge>
            )}
          </div>

          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Source Attribution - Legal Compliance */}
              <span className="text-xs">
                Originally posted on:{' '}
                <Badge variant={job.source === 'native' ? 'default' : 'outline'}>
                  {sourceLabel}
                </Badge>
              </span>
              {job.featured && (
                <Badge className="bg-yellow-500 hover:bg-yellow-600">⭐ Featured</Badge>
              )}
            </div>
            <span>{formatDate(job.publishedAt || job.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
