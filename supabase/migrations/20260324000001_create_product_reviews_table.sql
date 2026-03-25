-- ===========================================
-- Migration: Create product_reviews table
-- Description: User-submitted product reviews with skin profile,
--              pros/cons, and recommendation tracking.
--              Matches src/types/review.ts ProductReview interface.
-- ===========================================

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  skin_type TEXT,
  skin_concerns TEXT[] NOT NULL DEFAULT '{}',
  pros TEXT[] NOT NULL DEFAULT '{}',
  cons TEXT[] NOT NULL DEFAULT '{}',
  would_recommend BOOLEAN,
  usage_duration_weeks INTEGER CHECK (usage_duration_weeks IS NULL OR usage_duration_weeks >= 0),
  helpful_count INTEGER NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One review per user per product (upsert support)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_product_reviews_user_product'
  ) THEN
    ALTER TABLE product_reviews ADD CONSTRAINT uq_product_reviews_user_product UNIQUE (user_id, product_id);
  END IF;
END $$;

-- ===========================================
-- Indexes
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created ON product_reviews(created_at DESC);

-- ===========================================
-- Row Level Security
-- ===========================================

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_reviews' AND policyname = 'Anyone can view product reviews') THEN
    CREATE POLICY "Anyone can view product reviews" ON product_reviews FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_reviews' AND policyname = 'Users can insert own reviews') THEN
    CREATE POLICY "Users can insert own reviews" ON product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_reviews' AND policyname = 'Users can update own reviews') THEN
    CREATE POLICY "Users can update own reviews" ON product_reviews FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_reviews' AND policyname = 'Users can delete own reviews') THEN
    CREATE POLICY "Users can delete own reviews" ON product_reviews FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ===========================================
-- Auto-update updated_at trigger
-- ===========================================

CREATE OR REPLACE FUNCTION update_product_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_product_reviews_updated_at'
  ) THEN
    CREATE TRIGGER trg_product_reviews_updated_at
      BEFORE UPDATE ON product_reviews
      FOR EACH ROW
      EXECUTE FUNCTION update_product_reviews_updated_at();
  END IF;
END $$;
