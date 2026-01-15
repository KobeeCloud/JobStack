'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TECH_STACKS, LOCATIONS } from '@/lib/constants';

interface JobSearchProps {
  onSearch: (filters: {
    query: string;
    location: string;
    techStack: string[];
    remote: boolean;
  }) => void;
}

export function JobSearch({ onSearch }: JobSearchProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [remote, setRemote] = useState(false);

  const handleSearch = () => {
    onSearch({
      query,
      location,
      techStack: selectedTech,
      remote,
    });
  };

  const toggleTech = (tech: string) => {
    setSelectedTech(prev =>
      prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Search Bar */}
      <div className="flex gap-4">
        <Input
          type="text"
          placeholder="Job title, keywords, or company"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-48"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} size="lg">
          Search
        </Button>
      </div>

      {/* Remote Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="remote"
          checked={remote}
          onChange={(e) => setRemote(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="remote" className="cursor-pointer">
          Remote only
        </label>
      </div>

      {/* Tech Stack Filter */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Tech Stack</h3>
        <div className="flex flex-wrap gap-2">
          {TECH_STACKS.slice(0, 20).map((tech) => (
            <Badge
              key={tech}
              variant={selectedTech.includes(tech) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleTech(tech)}
            >
              {tech}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Filters */}
      {(selectedTech.length > 0 || query || location || remote) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {query && (
            <Badge variant="secondary">
              Query: {query}
              <button
                onClick={() => setQuery('')}
                className="ml-2 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {location && (
            <Badge variant="secondary">
              Location: {location}
              <button
                onClick={() => setLocation('')}
                className="ml-2 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {remote && (
            <Badge variant="secondary">
              Remote
              <button
                onClick={() => setRemote(false)}
                className="ml-2 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {selectedTech.map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
              <button
                onClick={() => toggleTech(tech)}
                className="ml-2 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setLocation('');
              setSelectedTech([]);
              setRemote(false);
            }}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
