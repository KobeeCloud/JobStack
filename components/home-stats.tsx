'use client';

import { useStats } from '@/hooks/use-stats';
import { useCountUp, formatNumber } from '@/hooks/use-count-up';
import { Briefcase, TrendingUp, Users } from 'lucide-react';
import { useLocale } from '@/lib/i18n';

// Animated counter component
function AnimatedStat({
  value,
  loading,
  suffix = '+',
}: {
  value: number;
  loading: boolean;
  suffix?: string;
}) {
  const count = useCountUp({
    end: value,
    duration: 2000,
    enabled: !loading && value > 0,
  });

  if (loading) {
    return <span className="inline-block w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />;
  }

  return (
    <span>
      {formatNumber(count)}{suffix}
    </span>
  );
}

export function HomeStats() {
  const { t } = useLocale();
  const { stats, loading } = useStats();

  const displayStats = [
    {
      value: stats.jobs,
      labelKey: 'home.stats.jobs' as const,
      icon: Briefcase,
    },
    {
      value: parseInt(stats.aggregated.boards) || 5,
      labelKey: 'home.stats.boards' as const,
      icon: TrendingUp,
    },
    {
      value: stats.users,
      labelKey: 'home.stats.users' as const,
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
      {displayStats.map((stat, index) => (
        <div
          key={index}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
            <AnimatedStat
              value={stat.value}
              loading={loading}
            />
          </div>
          <div className="text-gray-600 dark:text-gray-400 font-medium">
            {t(stat.labelKey)}
          </div>
        </div>
      ))}
    </div>
  );
}

// Stats for employers page
export function EmployerStats() {
  const { stats, loading } = useStats();

  const displayStats = [
    {
      value: stats.users,
      label: 'Kandydatów IT',
      suffix: '+',
    },
    {
      value: parseInt(stats.aggregated.boards) || 5,
      label: 'Portali zintegrowanych',
      suffix: '+',
    },
    {
      value: 0,
      label: 'Koszt na start',
      suffix: ' PLN',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
      {displayStats.map((stat, index) => (
        <div key={index}>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            <AnimatedStat
              value={stat.value}
              loading={loading}
              suffix={stat.suffix}
            />
          </div>
          <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// Simple stats - backward compatibility
export function SimpleStats() {
  return <EmployerStats />;
}
