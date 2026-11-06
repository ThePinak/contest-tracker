import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, 
  Trophy, 
  Search, 
  Award, 
  TrendingUp, 
  ExternalLink,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const STORAGE_HANDLES_KEY = 'user_cp_handles';

interface ContestHistoryItem {
  id?: number;
  name: string;
  rank: number;
  oldRating?: number;
  newRating?: number;
  diff?: number;
  date: string;
}

interface ProfileData {
  totalContestsAttended: number;
  codeforces: {
    handle: string;
    rating: number;
    maxRating: number;
    rank: string;
    maxRank: string;
    avatar?: string;
    contestsAttended: number;
    recentContests?: ContestHistoryItem[];
  } | null;
  leetcode: {
    username: string;
    rating: number;
    globalRanking: number | null;
    topPercentage: string | null;
    badge: string | null;
    contestsAttended: number;
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    recentContests?: ContestHistoryItem[];
  } | null;
  codechef: {
    handle: string;
    rating: number;
    highestRating: number;
    stars: string;
    globalRank: number | null;
    countryRank: number | null;
    contestsAttended: number;
  } | null;
}

export const ProfileAnalyzer = () => {
  const [handles, setHandles] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HANDLES_KEY);
      return saved ? JSON.parse(saved) : { cf: '', lc: '', cc: '' };
    } catch {
      return { cf: '', lc: '', cc: '' };
    }
  });

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (targetHandles = handles) => {
    if (!targetHandles.cf && !targetHandles.lc && !targetHandles.cc) {
      setError('Please enter at least one platform handle below');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (targetHandles.cf) params.set('cf', targetHandles.cf.trim());
      if (targetHandles.lc) params.set('lc', targetHandles.lc.trim());
      if (targetHandles.cc) params.set('cc', targetHandles.cc.trim());

      const res = await axios.get(`${API_BASE}/user/profile?${params.toString()}`);
      setData(res.data);
      localStorage.setItem(STORAGE_HANDLES_KEY, JSON.stringify(targetHandles));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to fetch profile data. Please verify your handles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (handles.cf || handles.lc || handles.cc) {
      fetchProfile();
    }
  }, []);

  const handleDemoFill = () => {
    const demo = { cf: 'tourist', lc: 'neal_wu', cc: 'tourist' };
    setHandles(demo);
    fetchProfile(demo);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Handles Configuration Card */}
      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-text">
              <User className="w-6 h-6 text-codeforces" />
              Analyze Your Competitive Profile
            </h2>
            <p className="text-textMuted text-sm mt-1">
              Enter your handles across Codeforces, LeetCode, and CodeChef to aggregate all your contest metrics in one place.
            </p>
          </div>

          <button
            onClick={handleDemoFill}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-surfaceHover border border-borderMuted text-text hover:border-codeforces/40 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Load Demo Handles</span>
          </button>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            fetchProfile();
          }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-xs font-semibold uppercase text-textMuted mb-1.5">
              Codeforces Handle
            </label>
            <input
              type="text"
              placeholder="e.g. tourist"
              value={handles.cf}
              onChange={(e) => setHandles({ ...handles, cf: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-borderMuted text-text placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-codeforces/20 focus:border-codeforces text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-textMuted mb-1.5">
              LeetCode Username
            </label>
            <input
              type="text"
              placeholder="e.g. neal_wu"
              value={handles.lc}
              onChange={(e) => setHandles({ ...handles, lc: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-borderMuted text-text placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-leetcode/20 focus:border-leetcode text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-textMuted mb-1.5">
              CodeChef Handle
            </label>
            <input
              type="text"
              placeholder="e.g. chef_xyz"
              value={handles.cc}
              onChange={(e) => setHandles({ ...handles, cc: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-borderMuted text-text placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-codechef/20 focus:border-codechef text-sm transition-all"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end mt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-codeforces text-white font-medium text-sm hover:opacity-90 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Fetching Profile...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Analyze Profiles</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Profile Overview Stats */}
      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-textMuted font-semibold">Total Contests</p>
                <p className="text-3xl font-extrabold font-mono text-text">{data.totalContestsAttended}</p>
                <p className="text-xs text-textMuted mt-0.5">Across all platforms</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-textMuted font-semibold">Codeforces</p>
                <p className="text-3xl font-extrabold font-mono text-text">
                  {data.codeforces ? data.codeforces.rating : '—'}
                </p>
                <p className="text-xs text-textMuted mt-0.5 capitalize">{data.codeforces?.rank || 'Unlinked'}</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-textMuted font-semibold">LeetCode Rating</p>
                <p className="text-3xl font-extrabold font-mono text-text">
                  {data.leetcode ? data.leetcode.rating : '—'}
                </p>
                <p className="text-xs text-textMuted mt-0.5">{data.leetcode?.badge || 'Competitor'}</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-textMuted font-semibold">CodeChef</p>
                <p className="text-3xl font-extrabold font-mono text-text">
                  {data.codechef ? data.codechef.rating : '—'}
                </p>
                <p className="text-xs text-textMuted mt-0.5">{data.codechef?.stars || 'Unlinked'}</p>
              </div>
            </div>
          </div>

          {/* Detailed Platform Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Codeforces Detailed View */}
            {data.codeforces && (
              <div className="glass rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-borderMuted">
                    <div className="flex items-center gap-3">
                      {data.codeforces.avatar && (
                        <img 
                          src={data.codeforces.avatar} 
                          alt={data.codeforces.handle} 
                          className="w-12 h-12 rounded-full border border-codeforces/30 object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-text flex items-center gap-2">
                          {data.codeforces.handle}
                          <a 
                            href={`https://codeforces.com/profile/${data.codeforces.handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-textMuted hover:text-codeforces transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </h3>
                        <p className="text-xs text-codeforces font-semibold capitalize">{data.codeforces.rank}</p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-codeforces/10 text-codeforces border border-codeforces/30">
                      Codeforces
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-3.5 rounded-xl bg-surfaceHover">
                      <p className="text-xs text-textMuted uppercase font-semibold">Rating</p>
                      <p className="text-xl font-bold font-mono text-text">{data.codeforces.rating}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-surfaceHover">
                      <p className="text-xs text-textMuted uppercase font-semibold">Max Rating</p>
                      <p className="text-xl font-bold font-mono text-text">{data.codeforces.maxRating}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-surfaceHover">
                      <p className="text-xs text-textMuted uppercase font-semibold">Contests</p>
                      <p className="text-xl font-bold font-mono text-text">{data.codeforces.contestsAttended}</p>
                    </div>
                  </div>

                  {data.codeforces.recentContests && data.codeforces.recentContests.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold uppercase text-textMuted mb-3 tracking-wide">
                        Recent Contests Attended
                      </h4>
                      <div className="space-y-2">
                        {data.codeforces.recentContests.map((c, i) => (
                          <div 
                            key={i} 
                            className="flex items-center justify-between p-3 rounded-xl bg-surface border border-borderMuted text-xs sm:text-sm"
                          >
                            <span className="font-medium text-text truncate max-w-[200px] sm:max-w-[280px]" title={c.name}>
                              {c.name}
                            </span>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-textMuted">Rank #{c.rank}</span>
                              {c.diff !== undefined && (
                                <span className={cn(
                                  "font-mono font-semibold flex items-center",
                                  c.diff >= 0 ? "text-emerald-500" : "text-rose-500"
                                )}>
                                  {c.diff >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                  {Math.abs(c.diff)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LeetCode Detailed View */}
            {data.leetcode && (
              <div className="glass rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-borderMuted">
                    <div>
                      <h3 className="text-xl font-bold text-text flex items-center gap-2">
                        {data.leetcode.username}
                        <a 
                          href={`https://leetcode.com/${data.leetcode.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-textMuted hover:text-leetcode transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </h3>
                      <p className="text-xs text-leetcode font-semibold">{data.leetcode.badge || 'Competitor'}</p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-leetcode/10 text-leetcode border border-leetcode/30">
                      LeetCode
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-3.5 rounded-xl bg-surfaceHover">
                      <p className="text-xs text-textMuted uppercase font-semibold">Contest Rating</p>
                      <p className="text-xl font-bold font-mono text-text">{data.leetcode.rating}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-surfaceHover">
                      <p className="text-xs text-textMuted uppercase font-semibold">Contests</p>
                      <p className="text-xl font-bold font-mono text-text">{data.leetcode.contestsAttended}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-surfaceHover">
                      <p className="text-xs text-textMuted uppercase font-semibold">Solved</p>
                      <p className="text-xl font-bold font-mono text-text">{data.leetcode.totalSolved}</p>
                    </div>
                  </div>

                  {/* Problem Solving Breakdown */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold uppercase text-textMuted mb-3 tracking-wide">
                      Problems Solved Breakdown
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Easy</span>
                        <p className="text-lg font-bold font-mono text-text mt-0.5">{data.leetcode.easySolved}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase">Medium</span>
                        <p className="text-lg font-bold font-mono text-text mt-0.5">{data.leetcode.mediumSolved}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                        <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold uppercase">Hard</span>
                        <p className="text-lg font-bold font-mono text-text mt-0.5">{data.leetcode.hardSolved}</p>
                      </div>
                    </div>
                  </div>

                  {data.leetcode.recentContests && data.leetcode.recentContests.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold uppercase text-textMuted mb-3 tracking-wide">
                        Recent Contests Attended
                      </h4>
                      <div className="space-y-2">
                        {data.leetcode.recentContests.map((c, i) => (
                          <div 
                            key={i} 
                            className="flex items-center justify-between p-3 rounded-xl bg-surface border border-borderMuted text-xs sm:text-sm"
                          >
                            <span className="font-medium text-text truncate max-w-[200px]" title={c.name}>
                              {c.name}
                            </span>
                            <span className="text-textMuted font-mono">Rank #{c.rank}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

