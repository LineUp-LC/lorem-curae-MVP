import { supabase } from '../lib/supabase';

export interface PointsTransaction {
  id: string;
  user_id: string;
  points_amount: number;
  transaction_type: string;
  description: string;
  reference_id?: string;
  created_at: string;
}

export interface CuraePointsAccount {
  id: string;
  user_id: string;
  points_balance: number;
  lifetime_points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  created_at: string;
  updated_at: string;
}

// Point earning actions
export const POINTS_ACTIONS = {
  SIGNUP: { points: 100, description: 'Welcome bonus for joining Lorem Curae' },
  SKIN_SURVEY: { points: 50, description: 'Completed skin assessment' },
  PRODUCT_REVIEW: { points: 25, description: 'Wrote a product review' },
  COMMUNITY_POST: { points: 15, description: 'Created a community post' },
  ROUTINE_CREATED: { points: 30, description: 'Created a skincare routine' },
  ROUTINE_LOGGED: { points: 5, description: 'Logged daily routine' },
  PRODUCT_PURCHASE: { points: 1, description: 'Points per dollar spent' }, // 1 point per $1
  REFERRAL: { points: 200, description: 'Referred a friend who signed up' },
  INGREDIENT_SEARCH: { points: 10, description: 'Researched an ingredient' },
  PROFILE_COMPLETE: { points: 75, description: 'Completed profile information' },
  MONTHLY_ACTIVE: { points: 50, description: 'Active user bonus' },
};

// Tier thresholds
export const TIER_THRESHOLDS = {
  Bronze: 0,
  Silver: 500,
  Gold: 2000,
  Platinum: 5000,
};

// Calculate tier based on lifetime points
export const calculateTier = (lifetimePoints: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' => {
  if (lifetimePoints >= TIER_THRESHOLDS.Platinum) return 'Platinum';
  if (lifetimePoints >= TIER_THRESHOLDS.Gold) return 'Gold';
  if (lifetimePoints >= TIER_THRESHOLDS.Silver) return 'Silver';
  return 'Bronze';
};

// Initialize points account for new user
export const initializePointsAccount = async (userId: string): Promise<CuraePointsAccount | null> => {
  try {
    const { data, error } = await supabase
      .from('curae_points')
      .insert({
        user_id: userId,
        points_balance: 0,
        lifetime_points: 0,
        tier: 'Bronze',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error initializing points account:', error);
    return null;
  }
};

// Get user's points account
export const getPointsAccount = async (userId: string): Promise<CuraePointsAccount | null> => {
  try {
    const { data, error } = await supabase
      .from('curae_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If account doesn't exist, create it
      if (error.code === 'PGRST116') {
        return await initializePointsAccount(userId);
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting points account:', error);
    return null;
  }
};

// Award points to user
export const awardPoints = async (
  userId: string,
  pointsAmount: number,
  transactionType: string,
  description: string,
  referenceId?: string
): Promise<boolean> => {
  try {
    // Get current account
    let account = await getPointsAccount(userId);
    if (!account) {
      account = await initializePointsAccount(userId);
      if (!account) return false;
    }

    // Calculate new balances
    const newBalance = account.points_balance + pointsAmount;
    const newLifetimePoints = account.lifetime_points + pointsAmount;
    const newTier = calculateTier(newLifetimePoints);

    // Update points account
    const { error: updateError } = await supabase
      .from('curae_points')
      .update({
        points_balance: newBalance,
        lifetime_points: newLifetimePoints,
        tier: newTier,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Record transaction
    const { error: transactionError } = await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        points_amount: pointsAmount,
        transaction_type: transactionType,
        description,
        reference_id: referenceId,
      });

    if (transactionError) throw transactionError;

    return true;
  } catch (error) {
    console.error('Error awarding points:', error);
    return false;
  }
};

// Redeem points
export const redeemPoints = async (
  userId: string,
  pointsAmount: number,
  description: string,
  referenceId?: string
): Promise<boolean> => {
  try {
    const account = await getPointsAccount(userId);
    if (!account || account.points_balance < pointsAmount) {
      return false; // Insufficient points
    }

    const newBalance = account.points_balance - pointsAmount;

    // Update points account
    const { error: updateError } = await supabase
      .from('curae_points')
      .update({
        points_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Record transaction
    const { error: transactionError } = await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        points_amount: -pointsAmount,
        transaction_type: 'REDEMPTION',
        description,
        reference_id: referenceId,
      });

    if (transactionError) throw transactionError;

    return true;
  } catch (error) {
    console.error('Error redeeming points:', error);
    return false;
  }
};

// Get user's transaction history
export const getTransactionHistory = async (
  userId: string,
  limit: number = 50
): Promise<PointsTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return [];
  }
};

// Get points to next tier
export const getPointsToNextTier = (currentTier: string, lifetimePoints: number): number => {
  switch (currentTier) {
    case 'Bronze':
      return TIER_THRESHOLDS.Silver - lifetimePoints;
    case 'Silver':
      return TIER_THRESHOLDS.Gold - lifetimePoints;
    case 'Gold':
      return TIER_THRESHOLDS.Platinum - lifetimePoints;
    case 'Platinum':
      return 0; // Already at max tier
    default:
      return TIER_THRESHOLDS.Silver - lifetimePoints;
  }
};

// Get tier benefits
export const getTierBenefits = (tier: string): string[] => {
  const benefits: Record<string, string[]> = {
    Bronze: [
      'Earn 1 point per dollar spent',
      'Access to community features',
      'Personalized skincare recommendations',
    ],
    Silver: [
      'All Bronze benefits',
      'Earn 1.25 points per dollar spent',
      'Early access to new features',
      'Priority customer support',
    ],
    Gold: [
      'All Silver benefits',
      'Earn 1.5 points per dollar spent',
      'Exclusive product discounts',
      'Free shipping on all orders',
      'Beta feature access',
    ],
    Platinum: [
      'All Gold benefits',
      'Earn 2 points per dollar spent',
      'VIP customer support',
      'Exclusive events and webinars',
      'Premium content access',
      'Personal skincare consultant',
    ],
  };

  return benefits[tier] || benefits.Bronze;
};
