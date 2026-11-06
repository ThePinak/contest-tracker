import { useState, useEffect } from 'react';
import { Search, Filter, X, Star } from 'lucide-react';
import type { Platform } from '../types';
import { cn } from '../lib/utils';
import { useSearchParams } from 'react-router-dom';

interface SearchFilterBarProps {
  onFilterChange: (filters: { search: string; platforms: Platform[] }) => void;
  activeTab: 'all' | 'starred';
  onTabChange: (tab: 'all' | 'starred') => void;
  starredCount: number;
  totalCount: number;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ 
  onFilterChange,
  activeTab,
  onTabChange,
  starredCount,
  totalCount,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialSearch = searchParams.get('search') || '';
  const initialPlatforms = searchParams.get('platforms') 
    ? (searchParams.get('platforms')!.split(',') as Platform[]) 
    : ['CODEFORCES', 'LEETCODE', 'CODECHEF'] as Platform[];

  const [search, setSearch] = useState(initialSearch);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(initialPlatforms);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search, platforms: selectedPlatforms });
      
      const newParams = new URLSearchParams(searchParams);
      if (search) newParams.set('search', search);
      else newParams.delete('search');
      
      newParams.set('platforms', selectedPlatforms.join(','));
      setSearchParams(newParams, { replace: true });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, selectedPlatforms, onFilterChange, searchParams, setSearchParams]);

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedPlatforms(['CODEFORCES', 'LEETCODE', 'CODECHEF']);
  };

  const platforms: { id: Platform; label: string; activeClass: string }[] = [
    { id: 'CODEFORCES', label: 'Codeforces', activeClass: 'bg-codeforces border-codeforces text-white shadow-sm' },
    { id: 'LEETCODE', label: 'LeetCode', activeClass: 'bg-leetcode border-leetcode text-white shadow-sm' },
    { id: 'CODECHEF', label: 'CodeChef', activeClass: 'bg-codechef border-codechef text-white shadow-sm' },
  ];

  const hasActiveFilters = search !== '' || selectedPlatforms.length < 3;

  return (
    <div className="glass rounded-2xl p-4 sm:p-6 mb-8 flex flex-col gap-4 transition-all duration-300">
      {/* Top Row: Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-borderMuted pb-4">
        <div className="flex items-center gap-1.5 p-1 bg-surfaceHover/70 rounded-xl border border-borderMuted">
          <button
            type="button"
            onClick={() => onTabChange('all')}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
              activeTab === 'all'
                ? "bg-surface text-text shadow-sm"
                : "text-textMuted hover:text-text"
            )}
          >
            <span>All Contests</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-borderMuted text-textMuted font-semibold">
              {totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('starred')}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
              activeTab === 'starred'
                ? "bg-surface text-amber-500 shadow-sm"
                : "text-textMuted hover:text-text"
            )}
          >
            <Star className={cn("w-3.5 h-3.5", starredCount > 0 && "fill-amber-500 text-amber-500")} />
            <span>Starred</span>
            {starredCount > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-semibold">
                {starredCount}
              </span>
            )}
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-textMuted hover:text-text transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Bottom Row: Search & Platform Filters */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-textMuted" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-surface border border-borderMuted rounded-xl leading-5 text-text placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-codeforces/20 focus:border-codeforces sm:text-sm transition-all"
            placeholder={activeTab === 'starred' ? "Search starred contests..." : "Search contests..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-textMuted hidden sm:block" />
          <div className="flex gap-2">
            {platforms.map(p => {
              const isActive = selectedPlatforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 cursor-pointer",
                    isActive 
                      ? p.activeClass 
                      : "border-borderMuted text-textMuted hover:bg-surfaceHover hover:text-text"
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
