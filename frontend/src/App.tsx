import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, Sun, Moon, CalendarDays, UserCheck } from 'lucide-react';
import type { Contest, Platform } from './types';
import { CountdownWidget } from './components/CountdownWidget';
import { SearchFilterBar } from './components/SearchFilterBar';
import { ContestList } from './components/ContestList';
import { ProfileAnalyzer } from './components/ProfileAnalyzer';
import { useBookmarks } from './lib/useBookmarks';
import { cn } from './lib/utils';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

function App() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [nextContest, setNextContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextLoading, setNextLoading] = useState(true);

  // Main Page Navigation: 'contests' or 'profile'
  const [mainView, setMainView] = useState<'contests' | 'profile'>('contests');

  // Filter Sub-tab state: 'all' or 'starred'
  const [activeTab, setActiveTab] = useState<'all' | 'starred'>('all');

  // Bookmarks hook
  const { bookmarkedIds, toggleBookmark, isBookmarked, bookmarkedCount } = useBookmarks();

  // Theme state: defaults to 'light', stored in localStorage
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('contest_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('contest_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Parse filters from URL
  const query = new URLSearchParams(window.location.search);
  const [filters, setFilters] = useState({
    search: query.get('search') || '',
    platforms: query.get('platforms') 
      ? (query.get('platforms')!.split(',') as Platform[]) 
      : ['CODEFORCES', 'LEETCODE', 'CODECHEF'] as Platform[],
  });

  const fetchNextContest = async () => {
    try {
      const res = await axios.get(`${API_BASE}/contests/next`);
      setNextContest(res.data);
    } catch (error) {
      console.error('Failed to fetch next contest', error);
      setNextContest(null);
    } finally {
      setNextLoading(false);
    }
  };

  const fetchContests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.platforms.length) params.set('platform', filters.platforms.join(','));

      const res = await axios.get(`${API_BASE}/contests?${params.toString()}`);
      setContests(res.data);
    } catch (error) {
      console.error('Failed to fetch contests', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextContest();
  }, []);

  useEffect(() => {
    fetchContests();
  }, [filters]);

  const displayedContests = activeTab === 'starred'
    ? contests.filter(c => bookmarkedIds.includes(c.id))
    : contests;

  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-text transition-colors duration-300">
      {/* Dynamic background glow */}
      <div className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-20 transition-opacity duration-300">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-codeforces/20 rounded-full blur-[130px]" />
        <div className="absolute top-[40%] right-[-10%] w-[35%] h-[35%] bg-leetcode/20 rounded-full blur-[110px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-codechef/20 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface border border-borderMuted shadow-sm flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">Contest Tracker</h1>
              <p className="text-textMuted text-sm sm:text-base">Your competitive programming journey</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            {/* Main Tabs Navigation */}
            <nav className="flex items-center p-1 bg-surface rounded-xl border border-borderMuted shadow-sm">
              <button
                type="button"
                onClick={() => setMainView('contests')}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer",
                  mainView === 'contests'
                    ? "bg-codeforces text-white shadow-sm"
                    : "text-textMuted hover:text-text hover:bg-surfaceHover"
                )}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Contests</span>
              </button>

              <button
                type="button"
                onClick={() => setMainView('profile')}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer",
                  mainView === 'profile'
                    ? "bg-codeforces text-white shadow-sm"
                    : "text-textMuted hover:text-text hover:bg-surfaceHover"
                )}
              >
                <UserCheck className="w-4 h-4" />
                <span>Analyze My Profile</span>
              </button>
            </nav>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-borderMuted shadow-sm hover:bg-surfaceHover text-text transition-all duration-200 cursor-pointer"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="text-sm font-medium hidden md:inline text-slate-700">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium hidden md:inline text-amber-200">Light</span>
                </>
              )}
            </button>
          </div>
        </header>

        <main>
          {mainView === 'contests' ? (
            <>
              <CountdownWidget 
                contest={nextContest} 
                loading={nextLoading} 
                isBookmarked={nextContest ? isBookmarked(nextContest.id) : false}
                onToggleBookmark={toggleBookmark}
              />
              
              <SearchFilterBar 
                onFilterChange={setFilters} 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                starredCount={bookmarkedCount}
                totalCount={contests.length}
              />
              
              <ContestList 
                contests={displayedContests} 
                loading={loading} 
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={toggleBookmark}
                activeTab={activeTab}
                onExploreAll={() => setActiveTab('all')}
              />
            </>
          ) : (
            <ProfileAnalyzer />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
