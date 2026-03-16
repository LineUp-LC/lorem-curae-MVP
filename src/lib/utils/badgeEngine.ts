import { supabase } from '../supabase-browser';
import type { BadgeDefinition, BadgeCheckContext, Badge } from '@/types/gamification';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ── Existing 9 (from badges/page.tsx) ──
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Joined Lorem Curae in its first month',
    icon: 'ri-rocket-line',
    rarity: 'Legendary',
    requirement: 'Join during launch period',
    checkUnlock: (ctx) => ctx.action === 'SIGNUP',
  },
  {
    id: 'routine-master',
    name: 'Routine Master',
    description: 'Created 5 complete skincare routines',
    icon: 'ri-calendar-check-line',
    rarity: 'Epic',
    requirement: 'Create 5 routines',
    checkUnlock: (ctx) => ctx.action === 'ROUTINE_CREATED' && (ctx.totalRoutines ?? 0) >= 5,
  },
  {
    id: 'community-helper',
    name: 'Community Helper',
    description: 'Helped 10 community members with advice',
    icon: 'ri-heart-line',
    rarity: 'Rare',
    requirement: 'Help 10 community members',
    checkUnlock: () => false, // Community feature not yet wired
  },
  {
    id: 'ingredient-expert',
    name: 'Ingredient Expert',
    description: 'Learned about 50 skincare ingredients',
    icon: 'ri-flask-fill',
    rarity: 'Epic',
    requirement: 'View 50 ingredient profiles',
    checkUnlock: (ctx) => ctx.action === 'INGREDIENT_SEARCH' && (ctx.ingredientViews ?? 0) >= 50,
  },
  {
    id: 'consistent-tracker',
    name: 'Consistent Tracker',
    description: 'Logged skincare routine for 30 days straight',
    icon: 'ri-calendar-check-fill',
    rarity: 'Rare',
    requirement: 'Log routine for 30 consecutive days',
    checkUnlock: (ctx) => ctx.action === 'STREAK_30_DAY',
  },
  {
    id: 'product-reviewer',
    name: 'Product Reviewer',
    description: 'Wrote 10 detailed product reviews',
    icon: 'ri-edit-fill',
    rarity: 'Common',
    requirement: 'Write 10 product reviews',
    checkUnlock: (ctx) => ctx.action === 'PRODUCT_REVIEW' && (ctx.totalReviews ?? 0) >= 10,
  },
  {
    id: 'skin-transformation',
    name: 'Skin Transformation',
    description: 'Document a complete skin transformation journey',
    icon: 'ri-magic-fill',
    rarity: 'Legendary',
    requirement: 'Upload before/after photos spanning 90 days',
    checkUnlock: () => false, // Not yet wired
  },
  {
    id: 'science-enthusiast',
    name: 'Science Enthusiast',
    description: 'Read and understand 100 ingredient profiles',
    icon: 'ri-microscope-line',
    rarity: 'Rare',
    requirement: 'View 100 different ingredient detail pages',
    checkUnlock: (ctx) => ctx.action === 'INGREDIENT_SEARCH' && (ctx.ingredientViews ?? 0) >= 100,
  },
  {
    id: 'year-one',
    name: 'Year One',
    description: 'Be a member for one full year',
    icon: 'ri-cake-2-line',
    rarity: 'Epic',
    requirement: 'Maintain active membership for 365 days',
    checkUnlock: () => false, // Checked via cron, not action-based
  },

  // ── 11 New badges ──
  {
    id: 'first-scan',
    name: 'First Scan',
    description: 'Scanned your first product with the camera',
    icon: 'ri-camera-line',
    rarity: 'Common',
    requirement: 'Scan 1 product',
    checkUnlock: (ctx) => ctx.action === 'PRODUCT_SCAN' && (ctx.totalScans ?? 0) >= 1,
  },
  {
    id: 'scan-master',
    name: 'Scan Master',
    description: 'Scanned 25 products',
    icon: 'ri-camera-fill',
    rarity: 'Rare',
    requirement: 'Scan 25 products',
    checkUnlock: (ctx) => ctx.action === 'PRODUCT_SCAN' && (ctx.totalScans ?? 0) >= 25,
  },
  {
    id: 'first-routine',
    name: 'First Routine',
    description: 'Created your first skincare routine',
    icon: 'ri-calendar-line',
    rarity: 'Common',
    requirement: 'Create 1 routine',
    checkUnlock: (ctx) => ctx.action === 'ROUTINE_CREATED' && (ctx.totalRoutines ?? 0) >= 1,
  },
  {
    id: 'streak-starter',
    name: 'Streak Starter',
    description: 'Maintained a 7-day routine streak',
    icon: 'ri-fire-line',
    rarity: 'Common',
    requirement: 'Log routine for 7 consecutive days',
    checkUnlock: (ctx) => ctx.action === 'STREAK_7_DAY',
  },
  {
    id: 'skin-aware',
    name: 'Skin Aware',
    description: 'Completed your skin assessment survey',
    icon: 'ri-survey-line',
    rarity: 'Common',
    requirement: 'Complete the skin survey',
    checkUnlock: (ctx) => ctx.action === 'SKIN_SURVEY',
  },
  {
    id: 'curator',
    name: 'Curator',
    description: 'Saved 10 products to your collection',
    icon: 'ri-bookmark-fill',
    rarity: 'Common',
    requirement: 'Save 10 products',
    checkUnlock: (ctx) => ctx.action === 'PRODUCT_SAVED' && (ctx.totalSavedProducts ?? 0) >= 10,
  },
  {
    id: 'ai-explorer',
    name: 'AI Explorer',
    description: 'Had 5 conversations with Curae AI',
    icon: 'ri-sparkling-line',
    rarity: 'Rare',
    requirement: 'Start 5 AI chat sessions',
    checkUnlock: (ctx) => ctx.action === 'AI_CHAT' && (ctx.chatSessions ?? 0) >= 5,
  },
  {
    id: 'first-review',
    name: 'First Review',
    description: 'Wrote your first product review',
    icon: 'ri-edit-line',
    rarity: 'Common',
    requirement: 'Write 1 product review',
    checkUnlock: (ctx) => ctx.action === 'PRODUCT_REVIEW' && (ctx.totalReviews ?? 0) >= 1,
  },
  {
    id: 'comparison-shopper',
    name: 'Comparison Shopper',
    description: 'Compared products for the first time',
    icon: 'ri-scales-line',
    rarity: 'Common',
    requirement: 'Use the comparison feature',
    checkUnlock: (ctx) => ctx.action === 'FIRST_COMPARISON',
  },
  {
    id: 'profile-complete',
    name: 'Profile Complete',
    description: 'Filled out your complete profile',
    icon: 'ri-user-star-line',
    rarity: 'Common',
    requirement: 'Complete all profile fields',
    checkUnlock: (ctx) => ctx.action === 'PROFILE_COMPLETE',
  },
  {
    id: 'points-collector',
    name: 'Points Collector',
    description: 'Earned 1,000 lifetime Curae Points',
    icon: 'ri-coin-fill',
    rarity: 'Rare',
    requirement: 'Accumulate 1,000 lifetime points',
    checkUnlock: (ctx) => (ctx.lifetimePoints ?? 0) >= 1000,
  },
];

export function getBadgeDefinitions(): BadgeDefinition[] {
  return BADGE_DEFINITIONS;
}

export function getBadgeDefinition(badgeId: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((b) => b.id === badgeId);
}

export async function getUserBadges(userId: string): Promise<Badge[]> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }
}

export async function awardBadge(userId: string, badgeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_badges')
      .insert({ user_id: userId, badge_id: badgeId });

    if (error) {
      // Unique constraint violation = already awarded, not an error
      if (error.code === '23505') return false;
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error awarding badge:', error);
    return false;
  }
}

export async function checkBadgeUnlock(
  userId: string,
  context: BadgeCheckContext
): Promise<BadgeDefinition[]> {
  const existingBadges = await getUserBadges(userId);
  const existingIds = new Set(existingBadges.map((b) => b.badge_id));
  const ctxWithExisting = { ...context, existingBadges: Array.from(existingIds) };

  const newlyUnlocked: BadgeDefinition[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    if (existingIds.has(badge.id)) continue;
    try {
      if (badge.checkUnlock(ctxWithExisting)) {
        const awarded = await awardBadge(userId, badge.id);
        if (awarded) newlyUnlocked.push(badge);
      }
    } catch {
      // Individual badge check failure should not block others
    }
  }

  return newlyUnlocked;
}
