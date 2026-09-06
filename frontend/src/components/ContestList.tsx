import type { Contest } from '../types';
import { ContestCard } from './ContestCard';
import { AlertCircle } from 'lucide-react';

interface ContestListProps {
  contests: Contest[];
  loading: boolean;
}

export const ContestList: React.FC<ContestListProps> = ({ contests, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass rounded-xl p-6 h-48 animate-pulse flex flex-col justify-between border-borderMuted">
            <div className="flex justify-between">
              <div className="w-24 h-6 bg-surfaceHover rounded-full"></div>
              <div className="w-6 h-6 bg-surfaceHover rounded-full"></div>
            </div>
            <div className="w-3/4 h-6 bg-surfaceHover rounded"></div>
            <div className="space-y-2">
              <div className="w-1/2 h-4 bg-surfaceHover rounded"></div>
              <div className="w-1/3 h-4 bg-surfaceHover rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (contests.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center text-center border-borderMuted">
        <div className="w-16 h-16 bg-surfaceHover rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-textMuted" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-text">No contests found</h3>
        <p className="text-textMuted max-w-md text-sm">
          We couldn't find any upcoming contests matching your current filters. Try adjusting your search or platform selections.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contests.map(contest => (
        <ContestCard key={contest.id} contest={contest} />
      ))}
    </div>
  );
};
