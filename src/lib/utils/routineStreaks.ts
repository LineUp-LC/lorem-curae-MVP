import type { SavedRoutine } from './routineState';

// -----------------------------
// Types
// -----------------------------

export interface ProductStreak {
  productName: string;
  productBrand: string;
  currentStreak: number;
  longestStreak: number;
  lastUsedDate: string;
  routineStep: string;
  isActive: boolean;
}

interface CompletionRecord {
  routineId: string;
  completedAt: string;
  date: string;
}

// -----------------------------
// Functions
// -----------------------------

/**
 * Reads the full completion history from localStorage
 * (the existing routineCompletionState only exposes today's data)
 */
export function getAllCompletionHistory(): CompletionRecord[] {
  try {
    const saved = localStorage.getItem('routine_completions');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Compute product-level usage streaks from completion history + routine definitions
 */
export function computeStreaks(
  routines: SavedRoutine[],
  completionHistory?: CompletionRecord[]
): ProductStreak[] {
  const history = completionHistory || getAllCompletionHistory();
  if (history.length === 0 || routines.length === 0) return [];

  // Build a map: routineId -> products in that routine
  const routineProducts = new Map<string, Array<{ name: string; brand: string; step: string }>>();
  for (const routine of routines) {
    const products = routine.steps
      .filter(s => s.product)
      .map(s => ({
        name: s.product!.name,
        brand: s.product!.brand,
        step: `${routine.timeOfDay === 'morning' ? 'AM' : 'PM'} — ${s.title}`,
      }));
    routineProducts.set(routine.id, products);
  }

  // Build a map: productName -> Set of dates it was used
  const productDates = new Map<string, { brand: string; step: string; dates: Set<string> }>();

  for (const completion of history) {
    const products = routineProducts.get(completion.routineId);
    if (!products) continue;

    for (const product of products) {
      const key = product.name.toLowerCase();
      if (!productDates.has(key)) {
        productDates.set(key, { brand: product.brand, step: product.step, dates: new Set() });
      }
      productDates.get(key)!.dates.add(completion.date);
    }
  }

  // Compute streaks for each product
  const today = new Date().toISOString().split('T')[0];
  const streaks: ProductStreak[] = [];

  for (const [key, data] of productDates) {
    const sortedDates = Array.from(data.dates).sort().reverse();
    if (sortedDates.length === 0) continue;

    const lastUsed = sortedDates[0];
    const isActive = lastUsed === today;

    // Current streak: count consecutive days from today backwards
    let currentStreak = 0;
    const checkDate = new Date(today);
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (data.dates.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Longest streak: scan all dates
    let longestStreak = 0;
    let runningStreak = 0;
    const allSorted = Array.from(data.dates).sort();
    for (let i = 0; i < allSorted.length; i++) {
      if (i === 0) {
        runningStreak = 1;
      } else {
        const prev = new Date(allSorted[i - 1]);
        const curr = new Date(allSorted[i]);
        const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        runningStreak = diffDays === 1 ? runningStreak + 1 : 1;
      }
      longestStreak = Math.max(longestStreak, runningStreak);
    }

    streaks.push({
      productName: key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      productBrand: data.brand,
      currentStreak,
      longestStreak,
      lastUsedDate: lastUsed,
      routineStep: data.step,
      isActive,
    });
  }

  return streaks.sort((a, b) => b.currentStreak - a.currentStreak);
}

export function getStreakSummary(streaks: ProductStreak[]) {
  const active = streaks.filter(s => s.isActive);
  const longest = streaks.reduce<ProductStreak | null>(
    (max, s) => (!max || s.currentStreak > max.currentStreak ? s : max),
    null
  );
  const needsAttention = streaks.filter(s => s.currentStreak === 0 && s.longestStreak > 3);

  return { activeCount: active.length, longestCurrent: longest, needsAttention };
}
