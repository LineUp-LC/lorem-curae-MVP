-- ===========================================
-- Migration: Create user_routines table
-- Description: Stores routine definitions for users
-- ===========================================

-- Create user_routines table
CREATE TABLE user_routines (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to auth.users
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core fields
  name TEXT NOT NULL,
  description TEXT,
  time_of_day TEXT NOT NULL CHECK (time_of_day IN ('morning', 'evening', 'both')),

  -- Steps stored as JSONB array for flexibility
  -- Each step: { id, stepNumber, title, description, timeOfDay, product?, recommended }
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Derived/cached field (computed from steps)
  step_count INTEGER GENERATED ALWAYS AS (jsonb_array_length(steps)) STORED,

  -- Optional thumbnail URL (routine cover image)
  thumbnail_url TEXT,

  -- Future expansion fields
  tags TEXT[] DEFAULT '{}',
  frequency TEXT, -- 'daily', 'weekly', 'custom'
  is_active BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false, -- For shareable/community templates

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ===========================================
-- Indexes
-- ===========================================

-- Fast lookup by user
CREATE INDEX idx_user_routines_user_id ON user_routines(user_id);

-- Filter by time of day
CREATE INDEX idx_user_routines_time_of_day ON user_routines(user_id, time_of_day);

-- Active routines only
CREATE INDEX idx_user_routines_active ON user_routines(user_id) WHERE is_active = true;

-- GIN index for JSONB steps (enables queries like "find routines with product X")
CREATE INDEX idx_user_routines_steps ON user_routines USING GIN (steps);

-- ===========================================
-- Row Level Security
-- ===========================================

ALTER TABLE user_routines ENABLE ROW LEVEL SECURITY;

-- Users can only see their own routines
CREATE POLICY "Users can view own routines"
  ON user_routines FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own routines
CREATE POLICY "Users can insert own routines"
  ON user_routines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own routines
CREATE POLICY "Users can update own routines"
  ON user_routines FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own routines
CREATE POLICY "Users can delete own routines"
  ON user_routines FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================
-- Trigger for updated_at
-- ===========================================

CREATE OR REPLACE FUNCTION update_user_routines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_routines_updated_at
  BEFORE UPDATE ON user_routines
  FOR EACH ROW
  EXECUTE FUNCTION update_user_routines_updated_at();

-- ===========================================
-- Optional: Link routine_notes to routines
-- ===========================================

-- Add routine_id column to routine_notes if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'routine_notes') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'routine_notes' AND column_name = 'routine_id') THEN
      ALTER TABLE routine_notes ADD COLUMN routine_id UUID REFERENCES user_routines(id) ON DELETE SET NULL;
      CREATE INDEX idx_routine_notes_routine_id ON routine_notes(routine_id);
    END IF;
  END IF;
END $$;
