-- Add survey_completed flag to users_profiles
ALTER TABLE users_profiles
  ADD COLUMN IF NOT EXISTS survey_completed boolean NOT NULL DEFAULT false;
