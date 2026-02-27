import { useState, useMemo } from 'react';
import type { SavedRoutine } from '../../../lib/utils/routineState';
import { computeStreaks, getStreakSummary, getAllCompletionHistory } from '../../../lib/utils/routineStreaks';
import { generateInsights, type RoutineInsight } from '../../../lib/utils/routineInsights';

interface InsightsPanelProps {
  routines: SavedRoutine[];
  noteCount: number;
}

export default function InsightsPanel({ routines, noteCount }: InsightsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const streaks = useMemo(() => computeStreaks(routines), [routines]);
  const streakSummary = useMemo(() => getStreakSummary(streaks), [streaks]);

  const skinProfile = useMemo(() => {
    try {
      const saved = localStorage.getItem('skinSurveyData');
      if (saved) {
        const data = JSON.parse(saved);
        return { skinType: data.skinType, concerns: data.concerns || [] };
      }
    } catch { /* ignore */ }
    return { skinType: undefined, concerns: [] };
  }, []);

  const insights = useMemo(
    () => generateInsights({ routines, streaks, noteCount, skinProfile }),
    [routines, streaks, noteCount, skinProfile]
  );

  if (insights.length === 0 && streaks.length === 0) return null;

  const severityColors: Record<string, string> = {
    positive: 'border-sage/30 bg-sage/5',
    neutral: 'border-blush bg-white',
    warning: 'border-primary/30 bg-primary/5',
  };

  const severityIconColors: Record<string, string> = {
    positive: 'text-sage',
    neutral: 'text-warm-gray',
    warning: 'text-primary',
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow transition-shadow cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <i className="ri-brain-line text-primary text-lg"></i>
          </div>
          <div className="text-left">
            <h3 className="font-serif text-base font-bold text-deep">Routine Intelligence</h3>
            <p className="text-xs text-warm-gray">
              {insights.length} insight{insights.length !== 1 ? 's' : ''}
              {streakSummary.longestCurrent && streakSummary.longestCurrent.currentStreak > 0
                ? ` · ${streakSummary.longestCurrent.currentStreak}-day top streak`
                : ''}
            </p>
          </div>
        </div>
        <i className={`ri-arrow-${expanded ? 'up' : 'down'}-s-line text-xl text-warm-gray transition-transform`}></i>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Insights */}
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-xl border ${severityColors[insight.severity]}`}
            >
              <div className="flex items-start gap-3">
                <i className={`${insight.icon} text-lg mt-0.5 ${severityIconColors[insight.severity]}`}></i>
                <div>
                  <p className="text-sm font-medium text-deep mb-0.5">{insight.title}</p>
                  <p className="text-xs text-warm-gray leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Streaks */}
          {streaks.length > 0 && (
            <div className="bg-white rounded-xl border border-blush p-4">
              <h4 className="text-sm font-medium text-deep mb-3 flex items-center gap-2">
                <i className="ri-fire-line text-primary"></i>
                Product Streaks
              </h4>
              <div className="space-y-2">
                {streaks.slice(0, 5).map((streak) => (
                  <div key={streak.productName} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${streak.isActive ? 'bg-sage' : 'bg-warm-gray/30'}`}></span>
                      <span className="text-xs text-deep truncate">{streak.productName}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-medium text-deep">
                        {streak.currentStreak}d
                      </span>
                      {streak.longestStreak > streak.currentStreak && (
                        <span className="text-xs text-warm-gray/60">
                          best {streak.longestStreak}d
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
