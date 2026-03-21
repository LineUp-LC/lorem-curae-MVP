import { awardPoints, getPointsAccount, POINTS_ACTIONS } from './curaePoints';
import { checkBadgeUnlock } from './badgeEngine';
import type { GamificationAction, GamificationResult, BadgeCheckContext } from '@/types/gamification';

// Track one-time actions per session to prevent duplicate awards
const sessionAwardedActions = new Set<string>();

// Track one-time-ever actions via localStorage
const ONCE_EVER_KEY = 'gamification_once_ever';

function getOnceEverActions(): Set<string> {
  try {
    const saved = localStorage.getItem(ONCE_EVER_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
}

function markOnceEver(action: string): void {
  try {
    const set = getOnceEverActions();
    set.add(action);
    localStorage.setItem(ONCE_EVER_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // Silent fail — localStorage not critical
  }
}

// All actions award points once ever per user
const ONCE_EVER_ACTIONS: Set<GamificationAction> = new Set([
  'SIGNUP',
  'SKIN_SURVEY',
  'PRODUCT_REVIEW',
  'COMMUNITY_POST',
  'ROUTINE_CREATED',
  'ROUTINE_LOGGED',
  'PRODUCT_PURCHASE',
  'REFERRAL',
  'INGREDIENT_SEARCH',
  'PROFILE_COMPLETE',
  'MONTHLY_ACTIVE',
  'PRODUCT_SCAN',
  'PRODUCT_SAVED',
  'AI_CHAT',
  'STREAK_7_DAY',
  'STREAK_30_DAY',
  'FIRST_COMPARISON',
]);

// Reserved for future per-session actions (currently empty — all actions are once-ever)
const ONCE_PER_SESSION_ACTIONS: Set<GamificationAction> = new Set([]);

export async function onAction(
  userId: string | null | undefined,
  action: GamificationAction,
  context?: Partial<BadgeCheckContext>
): Promise<GamificationResult | null> {
  // Guest check — no Supabase calls
  if (!userId) return null;

  try {
    // Once-ever duplicate check
    if (ONCE_EVER_ACTIONS.has(action)) {
      const onceEver = getOnceEverActions();
      if (onceEver.has(action)) {
        console.log('[Gamification] Action already awarded (once-ever):', action);
        return null;
      }
      markOnceEver(action);
    }

    // Once-per-session duplicate check
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
      if (success) pointsAwarded = actionConfig.points;
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
