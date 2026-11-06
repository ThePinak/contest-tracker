import { format, formatDuration, intervalToDuration } from 'date-fns';
import { ExternalLink, Clock, Calendar, Star } from 'lucide-react';
import type { Contest } from '../types';
import { cn } from '../lib/utils';
import { AddToCalendarMenu } from './AddToCalendarMenu';

interface ContestCardProps {
  contest: Contest;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

const platformConfig = {
  CODEFORCES: {
    label: 'Codeforces',
    colorClass: 'text-codeforces',
    glowClass: 'hover:shadow-md hover:border-codeforces/40',
    bgClass: 'bg-codeforces/10',
    borderClass: 'border-codeforces/30',
  },
  LEETCODE: {
    label: 'LeetCode',
    colorClass: 'text-leetcode',
    glowClass: 'hover:shadow-md hover:border-leetcode/40',
    bgClass: 'bg-leetcode/10',
    borderClass: 'border-leetcode/30',
  },
  CODECHEF: {
    label: 'CodeChef',
    colorClass: 'text-codechef',
    glowClass: 'hover:shadow-md hover:border-codechef/40',
    bgClass: 'bg-codechef/10',
    borderClass: 'border-codechef/30',
  },
};

export const ContestCard: React.FC<ContestCardProps> = ({ contest, isBookmarked, onToggleBookmark }) => {
  const config = platformConfig[contest.platform];
  const startDate = new Date(contest.startTime);
  
  const duration = intervalToDuration({ start: 0, end: contest.durationSecs * 1000 });
  const formattedDuration = formatDuration(duration, { format: ['days', 'hours', 'minutes'] });

  const timeZoneStr = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className={cn(
      "group relative glass rounded-xl p-6 transition-all duration-300 ease-out",
      "hover:scale-[1.01] border border-borderMuted hover:z-20",
      config.glowClass
    )}>
      <div className="flex justify-between items-start mb-4">
        <span className={cn(
          "px-3 py-1 text-xs font-semibold rounded-full border",
          config.bgClass,
          config.colorClass,
          config.borderClass
        )}>
          {config.label}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(contest.id);
            }}
            className={cn(
              "p-1.5 rounded-lg transition-all duration-200 cursor-pointer border border-transparent hover:border-borderMuted",
              isBookmarked
                ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                : "text-textMuted hover:text-amber-500 hover:bg-surfaceHover"
            )}
            title={isBookmarked ? "Remove from starred" : "Star contest"}
            aria-label={isBookmarked ? "Remove from starred" : "Star contest"}
          >
            <Star className={cn("w-4 h-4 transition-transform", isBookmarked && "fill-amber-500 scale-110")} />
          </button>
          
          <AddToCalendarMenu contest={contest} variant="compact" />
          
          <a 
            href={contest.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-textMuted hover:text-text transition-colors p-1.5 rounded-lg hover:bg-surfaceHover"
            title="Register / View Contest"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <h3 className="text-lg font-bold mb-4 line-clamp-2 text-text group-hover:text-codeforces transition-colors" title={contest.name}>
        {contest.name}
      </h3>

      <div className="space-y-2 text-sm text-textMuted">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 shrink-0 text-textMuted" />
          <span>
            {format(startDate, 'MMM d, yyyy • h:mm a')} <span className="text-xs opacity-75">({timeZoneStr})</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0 text-textMuted" />
          <span>{formattedDuration}</span>
        </div>
      </div>
    </div>
  );
};
