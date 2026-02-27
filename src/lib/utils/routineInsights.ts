import type { SavedRoutine } from './routineState';
import type { ProductStreak } from './routineStreaks';
import { checkMultipleCompatibility } from '../ai/ingredientIntelligence';

// -----------------------------
// Types
// -----------------------------

export interface RoutineInsight {
  id: string;
  type: 'consistency' | 'conflict' | 'product' | 'progress';
  icon: string;
  title: string;
  description: string;
  severity: 'positive' | 'neutral' | 'warning';
}

interface InsightParams {
  routines: SavedRoutine[];
  streaks: ProductStreak[];
  noteCount: number;
  skinProfile: { skinType?: string; concerns?: string[] };
}

// -----------------------------
// Generator
// -----------------------------

export function generateInsights(params: InsightParams): RoutineInsight[] {
  const { routines, streaks, noteCount, skinProfile } = params;
  const insights: RoutineInsight[] = [];

  // 1. Consistency insights from streaks
  const topStreak = streaks.find(s => s.currentStreak >= 7);
  if (topStreak) {
    insights.push({
      id: 'streak-strong',
      type: 'consistency',
      icon: 'ri-fire-line',
      title: `${topStreak.currentStreak}-day streak with ${topStreak.productName}`,
      description: 'Consistency is key for skincare results. Most actives need 4-6 weeks to show visible improvement.',
      severity: 'positive',
    });
  }

  const brokenStreaks = streaks.filter(s => s.currentStreak === 0 && s.longestStreak >= 5);
  if (brokenStreaks.length > 0) {
    insights.push({
      id: 'streak-broken',
      type: 'consistency',
      icon: 'ri-alert-line',
      title: `${brokenStreaks[0].productName} streak ended`,
      description: `You had a ${brokenStreaks[0].longestStreak}-day streak. Resuming consistent use helps maintain benefits.`,
      severity: 'warning',
    });
  }

  // 2. Conflict insights from current routines
  for (const routine of routines) {
    const productNames = routine.steps
      .filter(s => s.product)
      .map(s => s.product!.name.toLowerCase());

    if (productNames.length < 2) continue;

    const conflicts = checkMultipleCompatibility(productNames);
    const avoidConflicts = conflicts.filter(c => c.result.level === 'avoid');

    if (avoidConflicts.length > 0) {
      const pair = avoidConflicts[0].pair;
      insights.push({
        id: `conflict-${pair[0]}-${pair[1]}`,
        type: 'conflict',
        icon: 'ri-error-warning-line',
        title: `${pair[0]} + ${pair[1]} conflict detected`,
        description: avoidConflicts[0].result.resolution || 'Consider using these at different times of day.',
        severity: 'warning',
      });
    }
  }

  // 3. Product-specific insights based on skin profile
  if (skinProfile.concerns && skinProfile.concerns.length > 0) {
    const hasRetinol = streaks.some(s => s.productName.toLowerCase().includes('retinol'));
    const hasVitC = streaks.some(s => s.productName.toLowerCase().includes('vitamin c'));

    if (hasRetinol && skinProfile.concerns.includes('aging')) {
      const retinolStreak = streaks.find(s => s.productName.toLowerCase().includes('retinol'));
      if (retinolStreak && retinolStreak.currentStreak >= 14) {
        insights.push({
          id: 'retinol-progress',
          type: 'product',
          icon: 'ri-leaf-line',
          title: 'Retinol adjustment period',
          description: `${retinolStreak.currentStreak} days in — initial dryness or flaking typically stabilizes around week 4-6.`,
          severity: 'neutral',
        });
      }
    }

    if (hasVitC && skinProfile.concerns.includes('hyperpigmentation')) {
      insights.push({
        id: 'vitc-brightening',
        type: 'product',
        icon: 'ri-sun-line',
        title: 'Brightening progress',
        description: 'Vitamin C works gradually. Visible brightening typically appears after 3-4 weeks of consistent AM use.',
        severity: 'positive',
      });
    }
  }

  // 4. Progress insights based on notes
  if (noteCount >= 5) {
    insights.push({
      id: 'notes-active',
      type: 'progress',
      icon: 'ri-file-text-line',
      title: 'Active skin journal',
      description: `You've logged ${noteCount} notes. Regular tracking helps identify what works for your skin.`,
      severity: 'positive',
    });
  } else if (noteCount === 0 && routines.length > 0) {
    insights.push({
      id: 'notes-missing',
      type: 'progress',
      icon: 'ri-file-text-line',
      title: 'Start tracking observations',
      description: 'Logging how your skin responds helps refine your routine over time.',
      severity: 'neutral',
    });
  }

  // 5. Routine structure insights
  const morningRoutines = routines.filter(r => r.timeOfDay === 'morning');
  const eveningRoutines = routines.filter(r => r.timeOfDay === 'evening');

  if (morningRoutines.length > 0 && eveningRoutines.length > 0) {
    insights.push({
      id: 'balanced-routine',
      type: 'consistency',
      icon: 'ri-sun-line',
      title: 'Balanced AM + PM routine',
      description: 'Having both morning and evening routines provides full-day protection and overnight repair.',
      severity: 'positive',
    });
  } else if (morningRoutines.length > 0 && eveningRoutines.length === 0) {
    insights.push({
      id: 'missing-pm',
      type: 'consistency',
      icon: 'ri-moon-line',
      title: 'Consider adding an evening routine',
      description: 'Nighttime is when skin does most of its repair work. An evening routine maximizes recovery.',
      severity: 'neutral',
    });
  }

  return insights.slice(0, 5); // Cap at 5 insights
}
