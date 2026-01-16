'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TECH_STACKS,
  LOCATIONS,
  JOB_ROLES,
  WORK_MODES,
  VOIVODESHIPS,
  DISTANCE_OPTIONS
} from '@/lib/constants';
import {
  Search,
  MapPin,
  X,
  ChevronDown,
  Monitor,
  Building2,
  Home,
  Filter,
  Sparkles
} from 'lucide-react';

type WorkMode = 'remote' | 'hybrid' | 'onsite';

interface JobSearchProps {
  onSearch: (filters: {
    query: string;
    location: string;
    techStack: string[];
    remote: boolean;
    workMode?: WorkMode;
    role?: string;
    voivodeship?: string;
    distance?: number;
  }) => void;
}

export function JobSearch({ onSearch }: JobSearchProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [workMode, setWorkMode] = useState<WorkMode | null>(null);
  const [voivodeship, setVoivodeship] = useState<string | null>(null);
  const [distance, setDistance] = useState<number>(50);
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  const [showAllRoles, setShowAllRoles] = useState(false);
  const [suggestedStacks, setSuggestedStacks] = useState<string[]>([]);

  // Update suggested stacks when role changes
  useEffect(() => {
    if (selectedRole && JOB_ROLES[selectedRole as keyof typeof JOB_ROLES]) {
      setSuggestedStacks([...JOB_ROLES[selectedRole as keyof typeof JOB_ROLES].stacks]);
    } else {
      setSuggestedStacks([...TECH_STACKS.slice(0, 15)]);
    }
  }, [selectedRole]);

  const handleSearch = () => {
    // Collapse expanded sections on search
    setShowAllRoles(false);

    onSearch({
      query: selectedRole ? `${selectedRole} ${query}`.trim() : query,
      location: workMode === 'remote' ? '' : location,
      techStack: selectedTech,
      remote: workMode === 'remote',
      workMode: workMode || undefined,
      role: selectedRole || undefined,
      voivodeship: voivodeship || undefined,
      distance: workMode !== 'remote' ? distance : undefined,
    });
  };

  const toggleTech = (tech: string) => {
    setSelectedTech(prev =>
      prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  const selectRole = (role: string) => {
    setSelectedRole(role === selectedRole ? null : role);
  };

  const clearAllFilters = () => {
    setQuery('');
    setLocation('');
    setSelectedTech([]);
    setSelectedRole(null);
    setWorkMode(null);
    setVoivodeship(null);
    setDistance(50);
  };

  const hasActiveFilters = selectedTech.length > 0 || query || location || workMode || selectedRole || voivodeship;

  return (
    <div className="w-full space-y-6">
      {/* Main Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Wpisz stanowisko, technologię lub firmę..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl text-base"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Location Input (only if not remote) */}
          {workMode !== 'remote' && (
            <div className="md:w-56 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Lokalizacja"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-12 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl text-base"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => setShowLocationOptions(true)}
                onBlur={() => setTimeout(() => setShowLocationOptions(false), 200)}
              />

              {/* Location Dropdown */}
              {showLocationOptions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-64 overflow-auto">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1 font-medium">Popularne miasta</div>
                    {LOCATIONS.map(loc => (
                      <button
                        key={loc}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                        onClick={() => {
                          setLocation(loc);
                          setShowLocationOptions(false);
                        }}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1 font-medium">Województwa</div>
                    {VOIVODESHIPS.slice(0, 5).map(v => (
                      <button
                        key={v}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm capitalize"
                        onClick={() => {
                          setVoivodeship(v);
                          setLocation(`woj. ${v}`);
                          setShowLocationOptions(false);
                        }}
                      >
                        woj. {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            size="lg"
            className="h-12 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
          >
            <Search className="w-5 h-5 mr-2" />
            Szukaj
          </Button>
        </div>
      </div>

      {/* Work Mode Selection */}
      <div className="flex flex-wrap gap-3 justify-center">
        {(Object.entries(WORK_MODES) as [WorkMode, typeof WORK_MODES['remote']][]).map(([key, mode]) => {
          const isActive = workMode === key;
          const Icon = key === 'remote' ? Home : key === 'hybrid' ? Monitor : Building2;

          return (
            <button
              key={key}
              onClick={() => setWorkMode(workMode === key ? null : key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{mode.label}</span>
              {isActive && (
                <X className="w-4 h-4 ml-1 opacity-70" />
              )}
            </button>
          );
        })}
      </div>

      {/* Distance slider for hybrid/onsite */}
      {(workMode === 'hybrid' || workMode === 'onsite') && location && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Promień od {location}
            </span>
            <span className="text-sm font-bold text-blue-600">{distance} km</span>
          </div>
          <div className="flex gap-2">
            {DISTANCE_OPTIONS.map(d => (
              <button
                key={d}
                onClick={() => setDistance(d)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  distance === d
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {d} km
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Role Selection */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Wybierz stanowisko
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Show first 6 roles, or all if expanded */}
          {Object.entries(JOB_ROLES).slice(0, showAllRoles ? undefined : 6).map(([role, data]) => (
            <button
              key={role}
              onClick={() => selectRole(role)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedRole === role
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <span>{data.icon}</span>
              <span>{role}</span>
            </button>
          ))}
          {/* Show more/less button */}
          {Object.keys(JOB_ROLES).length > 6 && (
            <button
              onClick={() => setShowAllRoles(!showAllRoles)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {showAllRoles ? 'Mniej' : 'Więcej'}
              <ChevronDown className={`w-4 h-4 transition-transform ${showAllRoles ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Tech Stack Filter */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {selectedRole ? `Popularne technologie dla ${selectedRole}` : 'Technologie'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedStacks.map((tech) => {
            const isSelected = selectedTech.includes(tech);
            return (
              <button
                key={tech}
                onClick={() => toggleTech(tech)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {tech}
                {isSelected && <X className="w-3 h-3 ml-1.5 inline" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Aktywne filtry:</span>

          {selectedRole && (
            <Badge className="bg-blue-600 text-white gap-1">
              {JOB_ROLES[selectedRole as keyof typeof JOB_ROLES]?.icon} {selectedRole}
              <button onClick={() => setSelectedRole(null)} className="hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {workMode && (
            <Badge className="bg-green-600 text-white gap-1">
              {WORK_MODES[workMode].label}
              <button onClick={() => setWorkMode(null)} className="hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {location && workMode !== 'remote' && (
            <Badge className="bg-purple-600 text-white gap-1">
              📍 {location} ({distance} km)
              <button onClick={() => { setLocation(''); setVoivodeship(null); }} className="hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {selectedTech.slice(0, 3).map((tech) => (
            <Badge key={tech} className="bg-indigo-600 text-white gap-1">
              {tech}
              <button onClick={() => toggleTech(tech)} className="hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {selectedTech.length > 3 && (
            <Badge variant="outline" className="text-blue-600">
              +{selectedTech.length - 3} więcej
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 ml-auto"
          >
            Wyczyść wszystko
          </Button>
        </div>
      )}
    </div>
  );
}
