-- ===========================================
-- Migration: Create creator_waitlist table
-- Description: Stores creator/seller waitlist entries
-- ===========================================

CREATE TABLE creator_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  brand_name TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- ===========================================
-- Indexes
-- ===========================================

CREATE INDEX idx_creator_waitlist_user ON creator_waitlist(user_id);
CREATE INDEX idx_creator_waitlist_status ON creator_waitlist(status);

-- ===========================================
-- Row Level Security
-- ===========================================

ALTER TABLE creator_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can join waitlist"
  ON creator_waitlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own entry"
  ON creator_waitlist FOR SELECT
  USING (auth.uid() = user_id);
