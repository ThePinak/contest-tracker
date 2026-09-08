import { useEffect, useState } from 'react';
import type { Contest } from '../types';
import { intervalToDuration, isPast, type Duration } from 'date-fns';
import { Timer, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { AddToCalendarMenu } from './AddToCalendarMenu';

interface CountdownWidgetProps {
  contest: Contest | null;
  loading: boolean;
}

export const CountdownWidget: React.FC<CountdownWidgetProps> = ({ contest, loading }) => {
  const [timeLeft, setTimeLeft] = useState<Duration | null>(null);

  useEffect(() => {
    if (!contest) return;

    const targetDate = new Date(contest.startTime);

    const updateTimer = () => {
      if (isPast(targetDate)) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const duration = intervalToDuration({
        start: new Date(),
        end: targetDate,
      });
      setTimeLeft(duration);
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [contest]);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-8 mb-8 animate-pulse flex flex-col items-center justify-center min-h-[200px]">
        <div className="w-12 h-12 bg-surfaceHover rounded-full mb-4"></div>
        <div className="h-6 w-48 bg-surfaceHover rounded mb-4"></div>
        <div className="flex gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 w-16 bg-surfaceHover rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!contest || !timeLeft) {
    return null;
  }

  const platformColors = {
    CODEFORCES: 'text-codeforces',
    LEETCODE: 'text-leetcode',
    CODECHEF: 'text-codechef',
  };

  const accentColor = platformColors[contest.platform];

  const TimeBox = ({ value, label }: { value: number | undefined; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="glass w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl mb-2 text-2xl sm:text-4xl font-bold font-mono tracking-wider text-text">
        {(value || 0).toString().padStart(2, '0')}
      </div>
      <span className="text-xs sm:text-sm text-textMuted uppercase tracking-widest font-medium">{label}</span>
    </div>
  );

  return (
    <div className="glass rounded-2xl p-6 sm:p-10 mb-8 flex flex-col items-center relative overflow-hidden transition-all duration-300">
      {/* Decorative background blob */}
      <div className={cn("absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-15 dark:opacity-10", {
        'bg-codeforces': contest.platform === 'CODEFORCES',
        'bg-leetcode': contest.platform === 'LEETCODE',
        'bg-codechef': contest.platform === 'CODECHEF',
      })}></div>

      <div className="flex items-center gap-2 mb-2">
        <Timer className={cn("w-5 h-5", accentColor)} />
        <h2 className="text-sm font-semibold tracking-wide uppercase text-textMuted">Next Upcoming Contest</h2>
      </div>
      
      <a 
        href={contest.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-2xl sm:text-3xl font-bold mb-8 text-center text-text hover:text-codeforces transition-colors z-10"
      >
        {contest.name}
      </a>

      <div className="flex gap-3 sm:gap-6 z-10 items-center">
        <TimeBox value={timeLeft.days} label="Days" />
        <div className="text-3xl sm:text-5xl font-light text-textMuted opacity-60 mb-6">:</div>
        <TimeBox value={timeLeft.hours} label="Hours" />
        <div className="text-3xl sm:text-5xl font-light text-textMuted opacity-60 mb-6">:</div>
        <TimeBox value={timeLeft.minutes} label="Minutes" />
        <div className="text-3xl sm:text-5xl font-light text-textMuted opacity-60 mb-6">:</div>
        <TimeBox value={timeLeft.seconds} label="Seconds" />
      </div>

      <div className="mt-8 z-10 flex flex-wrap items-center justify-center gap-3">
        <a 
          href={contest.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium bg-codeforces text-white hover:opacity-90 shadow-md hover:shadow-lg transition-all"
        >
          <span>Register / View Contest</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        <AddToCalendarMenu contest={contest} variant="button" />
      </div>
    </div>
  );
};
