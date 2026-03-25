-- ===========================================
-- Migration: Extend product tables for Serper cache layer
-- Description: Adds 'serper' source to products + retailer_prices,
--              cache tracking columns, dedup index,
--              and fixes web_search_cache search_type constraint
-- ===========================================

-- ----- Ensure retailer tables exist (may not have been created yet) -----
CREATE TABLE IF NOT EXISTS retailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  trust_score NUMERIC(3,1) NOT NULL DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 10),
  features TEXT[] NOT NULL DEFAULT '{}',
  is_affiliate BOOLEAN NOT NULL DEFAULT false,
  is_sponsored BOOLEAN NOT NULL DEFAULT false,
  secure_checkout BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'retailers' AND policyname = 'Anyone can view retailers'
  ) THEN
    CREATE POLICY "Anyone can view retailers" ON retailers FOR SELECT USING (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS retailer_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  shipping_label TEXT,
  tax_included BOOLEAN NOT NULL DEFAULT false,
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  in_stock BOOLEAN NOT NULL DEFAULT true,
  delivery_window TEXT,
  url TEXT NOT NULL,
  deep_link TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('affiliate_feed', 'retailer_api', 'manual', 'serper')),
  last_updated TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE retailer_prices ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'retailer_prices' AND policyname = 'Anyone can view retailer prices'
  ) THEN
    CREATE POLICY "Anyone can view retailer prices" ON retailer_prices FOR SELECT USING (true);
  END IF;
END $$;

-- Unique constraint for upsert support (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_retailer_prices_product_retailer'
  ) THEN
    ALTER TABLE retailer_prices ADD CONSTRAINT uq_retailer_prices_product_retailer UNIQUE (product_id, retailer_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_retailer_prices_product ON retailer_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_retailer_prices_retailer ON retailer_prices(retailer_id);
CREATE INDEX IF NOT EXISTS idx_retailer_prices_freshness ON retailer_prices(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_retailers_slug ON retailers(slug);

-- ----- products.source: add 'serper' -----
ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_source_check;
ALTER TABLE products
  ADD CONSTRAINT products_source_check
  CHECK (source IN ('marketplace', 'discovery', 'serper'));

-- ----- Cache tracking columns on products -----
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS serper_last_fetched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS hit_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS search_query TEXT;

-- ----- Dedup index: brand+name case-insensitive -----
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_brand_name_dedup
  ON products (lower(brand), lower(name));

-- ----- retailer_prices.source: ensure 'serper' is allowed -----
ALTER TABLE retailer_prices
  DROP CONSTRAINT IF EXISTS retailer_prices_source_check;
ALTER TABLE retailer_prices
  ADD CONSTRAINT retailer_prices_source_check
  CHECK (source IN ('affiliate_feed', 'retailer_api', 'manual', 'serper'));

-- ----- Cache tracking on retailer_prices -----
ALTER TABLE retailer_prices
  ADD COLUMN IF NOT EXISTS source_query TEXT;

-- ----- web_search_cache.search_type: add 'buy' + 'retailer_reviews' -----
ALTER TABLE web_search_cache
  DROP CONSTRAINT IF EXISTS web_search_cache_search_type_check;
ALTER TABLE web_search_cache
  ADD CONSTRAINT web_search_cache_search_type_check
  CHECK (search_type IN ('compatible', 'similar', 'reviews', 'buy', 'retailer_reviews'));

-- ----- Index for cache freshness lookups -----
CREATE INDEX IF NOT EXISTS idx_products_serper_fetched
  ON products (serper_last_fetched_at DESC)
  WHERE source = 'serper';
