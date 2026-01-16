'use client';

import { useStats, getDisplayValue } from '@/hooks/use-stats';
import { Briefcase, TrendingUp, Users } from 'lucide-react';
import { useLocale } from '@/lib/i18n';

export function HomeStats() {
  const { t } = useLocale();
  const { stats, loading } = useStats();

  const displayStats = [
    {
      value: getDisplayValue(stats, 'jobs'),
      labelKey: 'home.stats.jobs' as const,
      icon: Briefcase,
      fallback: '50,000+'
    },
    {
      value: stats.aggregated.boards,
      labelKey: 'home.stats.boards' as const,
      icon: TrendingUp,
      fallback: '5+'
    },
    {
      value: getDisplayValue(stats, 'users'),
      labelKey: 'home.stats.users' as const,
      icon: Users,
      fallback: '10,000+'
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
          <div className={`text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-1 ${loading ? 'animate-pulse' : ''}`}>
            {loading ? stat.fallback : stat.value}
          </div>
          <div className="text-gray-600 dark:text-gray-400 font-medium">
            {t(stat.labelKey)}
          </div>
        </div>
      ))}
    </div>
  );
}

// Simpler stats component for other pages
export function SimpleStats() {
  const { stats, loading } = useStats();

  return (
    <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
      <div>
        <div className={`text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2 ${loading ? 'animate-pulse' : ''}`}>
          {loading ? '...' : getDisplayValue(stats, 'jobs')}
        </div>
        <div className="text-gray-600 dark:text-gray-400">Kandydatów IT</div>
      </div>
      <div>
        <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
          {stats.aggregated.boards}
        </div>
        <div className="text-gray-600 dark:text-gray-400">Portali zintegrowanych</div>
      </div>
      <div>
        <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
          0 PLN
        </div>
        <div className="text-gray-600 dark:text-gray-400">Koszt na start</div>
      </div>
    </div>
  );
}
