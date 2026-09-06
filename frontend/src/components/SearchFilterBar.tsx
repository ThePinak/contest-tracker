import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { Platform } from '../types';
import { cn } from '../lib/utils';
import { useSearchParams } from 'react-router-dom';

interface SearchFilterBarProps {
  onFilterChange: (filters: { search: string; platforms: Platform[] }) => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ onFilterChange }) => {
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
    <div className="glass rounded-2xl p-4 sm:p-6 mb-8 flex flex-col sm:flex-row gap-4 sm:items-center justify-between transition-all duration-300">
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-textMuted" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2.5 bg-surface border border-borderMuted rounded-xl leading-5 text-text placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-codeforces/20 focus:border-codeforces sm:text-sm transition-all"
          placeholder="Search contests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
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
                    "px-4 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 cursor-pointer",
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
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-textMuted hover:text-text transition-colors self-start sm:self-auto cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
