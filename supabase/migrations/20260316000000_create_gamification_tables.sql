-- ============================================================
-- Migration: Create Gamification Tables
-- Tables: curae_points, points_transactions, user_badges
-- ============================================================

-- 1. curae_points — one row per user, tracks balance + tier
CREATE TABLE IF NOT EXISTS curae_points (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  points_balance integer DEFAULT 0 NOT NULL,
  lifetime_points integer DEFAULT 0 NOT NULL,
  tier text DEFAULT 'Bronze' NOT NULL CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2. points_transactions — append-only ledger of all point events
CREATE TABLE IF NOT EXISTS points_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points_amount integer NOT NULL,
  transaction_type text NOT NULL,
  description text NOT NULL,
  reference_id text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 3. user_badges — tracks which badges a user has unlocked
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id text NOT NULL,
  unlocked_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_curae_points_user_id ON curae_points(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE curae_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- curae_points: users can read/update their own row
CREATE POLICY "Users can view own points" ON curae_points
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own points" ON curae_points
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own points" ON curae_points
  FOR UPDATE USING (auth.uid() = user_id);

-- points_transactions: users can read their own, insert their own
CREATE POLICY "Users can view own transactions" ON points_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON points_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_badges: users can read their own, insert their own
CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Updated_at trigger for curae_points
-- ============================================================
CREATE OR REPLACE FUNCTION update_curae_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_curae_points_updated_at
  BEFORE UPDATE ON curae_points
  FOR EACH ROW
  EXECUTE FUNCTION update_curae_points_updated_at();
