-- ===========================================
-- Migration: Create routine_usage_events table
-- Description: Tracks routine analytics events per user
-- ===========================================

CREATE TABLE routine_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id UUID,
  action TEXT NOT NULL CHECK (action IN (
    'routine_created','routine_updated','routine_deleted',
    'routine_viewed','notes_opened','progress_updated'
  )),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- Indexes
-- ===========================================

CREATE INDEX idx_routine_usage_user ON routine_usage_events(user_id);
CREATE INDEX idx_routine_usage_action ON routine_usage_events(action);

-- ===========================================
-- Row Level Security
-- ===========================================

ALTER TABLE routine_usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own events"
  ON routine_usage_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own events"
  ON routine_usage_events FOR SELECT
  USING (auth.uid() = user_id);
