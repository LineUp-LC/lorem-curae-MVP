import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("DEBUG: Supabase URL =", supabaseUrl || "[NOT SET]");
console.log("DEBUG: Supabase ANON KEY length =", supabaseAnonKey ? supabaseAnonKey.length : 0);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'plus' | 'premium';
  created_at: string;
  updated_at: string;
  skin_type?: string;
  concerns?: string[];
  preferences?: Record<string, any>;
  lifestyle?: Record<string, any>;
  profile_theme?: string;
  profile_layout?: string;
  show_badges?: boolean;
  show_routines?: boolean;
  show_communities?: boolean;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  cover_image: string;
  member_count: number;
  post_count: number;
  created_by: string;
  created_at: string;
  rules?: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  user_id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_profile?: UserProfile;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_communities: number;
  can_create_communities: boolean;
  storage_limit_mb: number;
  marketplace_discount: number;
  cashback_percentage: number;
}

export interface DataImpactContribution {
  id: string;
  user_id: string;
  opted_in: boolean;
  contribution_count: number;
  last_contribution_at?: string;
  created_at: string;
}

export interface MarketplaceStorefront {
  id: string;
  seller_name: string;
  description: string;
  logo_url?: string;
  tier: 'standard' | 'premium';
  transaction_fee_percentage: number;
  monthly_gmv: number;
  created_at: string;
}

export interface MarketplaceTransaction {
  id: string;
  storefront_id: string;
  user_id: string;
  amount: number;
  fee_amount: number;
  status: 'pending' | 'completed' | 'refunded';
  created_at: string;
}

export interface AffiliateTransaction {
  id: string;
  user_id: string;
  brand_name: string;
  amount: number;
  commission_percentage: number;
  cashback_amount: number;
  status: 'pending' | 'completed';
  created_at: string;
}

// Helper functions
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

  return data;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  const { error } = await supabase
    .from('users_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user profile:', error);
    return false;
  }

  return true;
}

export async function createUserProfile(
  userId: string,
  email: string,
  fullName: string
): Promise<boolean> {
  // Verify we have a valid session before attempting insert
  const { data: { user } } = await supabase.auth.getUser();
  console.log("DEBUG: createUserProfile - current user:", user);
  
  if (!user) {
    console.error('Error creating user profile: No authenticated user');
    return false;
  }

  const { error } = await supabase.from('users_profiles').insert({
    id: userId,
    email,
    full_name: fullName,
    subscription_tier: 'free',
    skin_type: null,
    concerns: [],
    preferences: {},
    lifestyle: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error creating user profile:', error);
    return false;
  }

  console.log("DEBUG: Profile created successfully for user:", userId);
  return true;
}
