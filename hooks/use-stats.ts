'use client';

import { useState, useEffect } from 'react';

interface Stats {
  jobs: number;
  users: number;
  companies: number;
  applications: number;
  display: {
    jobs: string;
    users: string;
    companies: string;
    applications: string;
  };
  aggregated: {
    jobs: string;
    boards: string;
  };
}

const DEFAULT_STATS: Stats = {
  jobs: 0,
  users: 0,
  companies: 0,
  applications: 0,
  display: {
    jobs: '0',
    users: '0',
    companies: '0',
    applications: '0',
  },
  aggregated: {
    jobs: '50,000+',
    boards: '5+',
  },
};

export function useStats() {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

// Format number with animation potential
export function formatStatNumber(num: number, suffix: string = ''): string {
  if (num === 0) return '0' + suffix;
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M${suffix}`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}k${suffix}`;
  }
  return `${num}${suffix}`;
}

// Get display value - uses real data if available, otherwise shows marketing number
export function getDisplayValue(stats: Stats, key: 'jobs' | 'users' | 'companies' | 'applications'): string {
  // If we have real data (more than 0), show it
  if (stats[key] > 0) {
    return stats.display[key] + '+';
  }

  // Otherwise show marketing approximations
  switch (key) {
    case 'jobs':
      return stats.aggregated.jobs;
    case 'users':
      return '10,000+';
    case 'companies':
      return '500+';
    case 'applications':
      return '5,000+';
    default:
      return '0';
  }
}
