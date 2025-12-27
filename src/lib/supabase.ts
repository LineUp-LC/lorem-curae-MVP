import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase-browser'
import {
  sessionState,
  getEffectiveSkinType,
  getEffectiveConcerns
} from './utils/sessionState'

// -----------------------------
// Types
// -----------------------------

// Subscription tier type (for user profile field)
export type SubscriptionPlan = 'free' | 'plus' | 'premium';

// Database row type for subscription_plans table
export interface SubscriptionPlanRow {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  max_communities: number;
  can_create_communities: boolean;
  storage_limit_mb: number;
  marketplace_discount: number;
  cashback_percentage: number;
  features: string[] | string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string | null;
  skin_type: string | null;
  concerns: string[];
  preferences: Record<string, any>;
  lifestyle: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// -----------------------------
// Load user profile
// -----------------------------
export async function loadUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error loading user profile:', error);
    return null;
  }

  return data as UserProfile;
}

// -----------------------------
// Update user profile
// -----------------------------
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data as UserProfile;
}

// -----------------------------
// Create user profile
// -----------------------------
export async function createUserProfile(authUser: User): Promise<boolean> {
  const userId = authUser.id;

  const tempSkinType = getEffectiveSkinType();
  const tempConcerns = getEffectiveConcerns();

  const { error } = await supabase.from('users_profiles').insert({
    id: userId,
    email: authUser.email,
    full_name: authUser.user_metadata?.full_name || null,
    subscription_tier: 'free',

    skin_type: tempSkinType || null,
    concerns: tempConcerns.length > 0 ? tempConcerns : [],

    preferences: {},
    lifestyle: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error inserting profile:", error);
    return false;
  }

  sessionState.clearTempData();
  return true;
}

// -----------------------------
// Delete user profile
// -----------------------------
export async function deleteUserProfile(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('users_profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error deleting user profile:', error);
    return false;
  }

  return true;
}