export type BadgeRarity = 'Legendary' | 'Epic' | 'Rare' | 'Common';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  requirement: string;
  checkUnlock: (context: BadgeCheckContext) => boolean;
}

export interface Badge {
  id: string;
  badge_id: string;
  user_id: string;
  unlocked_at: string;
}

export interface BadgeCheckContext {
  action: GamificationAction;
  lifetimePoints?: number;
  totalReviews?: number;
  totalRoutines?: number;
  totalScans?: number;
  totalSavedProducts?: number;
  ingredientViews?: number;
  longestStreak?: number;
  currentStreak?: number;
  chatSessions?: number;
  comparisons?: number;
  surveyCompleted?: boolean;
  profileComplete?: boolean;
  existingBadges?: string[];
}

export type GamificationAction =
  | 'SIGNUP'
  | 'SKIN_SURVEY'
  | 'PRODUCT_REVIEW'
  | 'COMMUNITY_POST'
  | 'ROUTINE_CREATED'
  | 'ROUTINE_LOGGED'
  | 'PRODUCT_PURCHASE'
  | 'REFERRAL'
  | 'INGREDIENT_SEARCH'
  | 'PROFILE_COMPLETE'
  | 'MONTHLY_ACTIVE'
  | 'PRODUCT_SCAN'
  | 'PRODUCT_SAVED'
  | 'AI_CHAT'
  | 'STREAK_7_DAY'
  | 'STREAK_30_DAY'
  | 'FIRST_COMPARISON';

export interface StreakMilestone {
  days: number;
  action: 'STREAK_7_DAY' | 'STREAK_30_DAY';
  label: string;
}

export interface GamificationResult {
  pointsAwarded: number;
  badgesUnlocked: BadgeDefinition[];
}
