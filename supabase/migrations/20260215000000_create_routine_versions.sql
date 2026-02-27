-- ===========================================
-- Migration: Create routine_versions table
-- Description: Stores version snapshots of routines for history/revert
-- ===========================================

CREATE TABLE routine_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id UUID NOT NULL REFERENCES user_routines(id) ON DELETE CASCADE,

  -- Snapshot data
  version_number INTEGER NOT NULL DEFAULT 1,
  label TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  step_count INTEGER GENERATED ALWAYS AS (jsonb_array_length(steps)) STORED,
  name TEXT NOT NULL,
  time_of_day TEXT NOT NULL CHECK (time_of_day IN ('morning', 'evening', 'both')),
  change_summary TEXT,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- Indexes
-- ===========================================

CREATE INDEX idx_routine_versions_user ON routine_versions(user_id);
CREATE INDEX idx_routine_versions_routine ON routine_versions(routine_id);
CREATE INDEX idx_routine_versions_routine_order ON routine_versions(routine_id, version_number DESC);

-- ===========================================
-- Row Level Security
-- ===========================================

ALTER TABLE routine_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own versions"
  ON routine_versions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own versions"
  ON routine_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
