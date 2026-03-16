import type { ProductStreak } from '@/lib/utils/routineStreaks';

interface StreakDisplayProps {
  streaks: ProductStreak[];
}

const StreakDisplay = ({ streaks }: StreakDisplayProps) => {
  const activeStreaks = streaks.filter(s => s.currentStreak > 0);
  const longestCurrent = streaks.reduce((max, s) => Math.max(max, s.currentStreak), 0);

  return (
    <div className="bg-white rounded-xl border border-blush/30 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-semibold text-deep text-sm">Active Streaks</h3>
        {longestCurrent > 0 && (
          <span className="text-xs text-primary font-medium">
            <i className="ri-fire-line mr-0.5"></i>{longestCurrent} day best
          </span>
        )}
      </div>

      {activeStreaks.length === 0 ? (
        <div className="text-center py-6">
          <i className="ri-fire-line text-2xl text-warm-gray/30 mb-2"></i>
          <p className="text-xs text-warm-gray">No active streaks yet</p>
          <p className="text-[10px] text-warm-gray/60 mt-1">Complete a routine to start a streak</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeStreaks.slice(0, 5).map((streak) => (
            <div key={streak.productName} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <i className="ri-fire-line text-primary text-lg"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-deep truncate">{streak.productName}</p>
                <p className="text-[10px] text-warm-gray">{streak.routineStep}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-deep">{streak.currentStreak}</p>
                <p className="text-[10px] text-warm-gray">days</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StreakDisplay;
