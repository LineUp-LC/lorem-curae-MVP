-- Add onboarding v2 columns to users_profiles
ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS skincare_experience TEXT;
ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS monthly_spend TEXT;
ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS spend_satisfaction TEXT;
ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS spend_pain_points TEXT[];
ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS product_count TEXT;
ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS routine_goal TEXT;
ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS purchase_channels TEXT[];
ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS retailer_satisfaction TEXT;
ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS retailer_pain_points TEXT[];
ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS frustrations TEXT[];
ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS frustration_free_response TEXT;
ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS referral_source TEXT;
ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS referral_source_other TEXT;
ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS skin_goal TEXT;
ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS search_use_climate BOOLEAN DEFAULT true;
ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS search_use_preferences BOOLEAN DEFAULT true;
ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS search_use_budget BOOLEAN DEFAULT true;
ALTER TABLE users_profiles ADD COLUMN IF NOT EXISTS prioritized_goals TEXT[];
