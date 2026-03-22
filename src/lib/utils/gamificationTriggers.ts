import { supabase } from '../supabase-browser';
import { awardPoints, getPointsAccount, POINTS_ACTIONS } from './curaePoints';
import { checkBadgeUnlock } from './badgeEngine';
import type { GamificationAction, GamificationResult, BadgeCheckContext } from '@/types/gamification';

// ---------------------------------------------------------------------------
// Session-level caches (reset on page reload — DB is source of truth)
// ---------------------------------------------------------------------------

/** Tracks once-per-session actions */
const sessionAwardedActions = new Set<string>();

/** Caches DB lookups for once-ever actions to avoid repeated queries */
const onceEverCache = new Map<string, boolean>();

// ---------------------------------------------------------------------------
// Once-ever action sets
// ---------------------------------------------------------------------------

const ONCE_EVER_ACTIONS: Set<GamificationAction> = new Set([
  'SIGNUP',
  'SKIN_SURVEY',
  'PROFILE_COMPLETE',
  'FIRST_COMPARISON',
]);

// Reserved for future per-session actions
const ONCE_PER_SESSION_ACTIONS: Set<GamificationAction> = new Set([
  'AI_CHAT',
]);

// ---------------------------------------------------------------------------
// Supabase-backed once-ever check
// ---------------------------------------------------------------------------

async function hasActionBeenAwarded(userId: string, action: string): Promise<boolean> {
  // Check session cache first
  const cacheKey = `${userId}:${action}`;
  if (onceEverCache.has(cacheKey)) {
    return onceEverCache.get(cacheKey)!;
  }

  try {
    const { count, error } = await supabase
      .from('points_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('transaction_type', action)
      .limit(1);

    if (error) {
      console.error('[Gamification] DB check failed for', action, error);
      // On error, assume awarded to prevent duplicate points (safe default)
      return true;
    }

    const awarded = (count ?? 0) > 0;
    onceEverCache.set(cacheKey, awarded);
    return awarded;
  } catch {
    // Network error — assume awarded (safe default)
    return true;
  }
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

export async function onAction(
  userId: string | null | undefined,
  action: GamificationAction,
  context?: Partial<BadgeCheckContext>
): Promise<GamificationResult | null> {
  // Guest check — no Supabase calls
  if (!userId) return null;

  try {
    // Once-ever duplicate check (Supabase-backed)
    if (ONCE_EVER_ACTIONS.has(action)) {
      const alreadyAwarded = await hasActionBeenAwarded(userId, action);
      if (alreadyAwarded) {
        console.log('[Gamification] Action already awarded (once-ever):', action);
        return null;
      }
    }

    // Once-per-session duplicate check (in-memory)
    if (ONCE_PER_SESSION_ACTIONS.has(action)) {
      if (sessionAwardedActions.has(action)) return null;
      sessionAwardedActions.add(action);
    }

    // Award points
    const actionConfig = POINTS_ACTIONS[action as keyof typeof POINTS_ACTIONS];
    let pointsAwarded = 0;

    if (actionConfig) {
      const success = await awardPoints(
        userId,
        actionConfig.points,
        action,
        actionConfig.description
      );
      if (success) {
        pointsAwarded = actionConfig.points;
        // Update cache — this action is now awarded
        onceEverCache.set(`${userId}:${action}`, true);
      }
    }

    // Check badge unlocks
    const account = await getPointsAccount(userId);
    const badgeContext: BadgeCheckContext = {
      action,
      lifetimePoints: account?.lifetime_points ?? 0,
      ...context,
    };

    const badgesUnlocked = await checkBadgeUnlock(userId, badgeContext);

    const result = { pointsAwarded, badgesUnlocked };

    // Emit event for toast display (non-blocking)
    if (pointsAwarded > 0 || badgesUnlocked.length > 0) {
      const actionDesc = actionConfig?.description ?? action;
      window.dispatchEvent(
        new CustomEvent('curae:gamification', {
          detail: { ...result, description: actionDesc },
        })
      );
    }

    return result;
  } catch (error) {
    console.error('Gamification trigger error (non-blocking):', error);
    return null;
  }
}
