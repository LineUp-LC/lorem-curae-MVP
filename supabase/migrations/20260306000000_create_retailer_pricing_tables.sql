-- ===========================================
-- Migration: Create retailer pricing tables
-- Description: Stores retailer catalog and per-product pricing data
--              sourced from affiliate feeds, retailer APIs, or manual entry
-- ===========================================

-- ----- Retailers table -----
CREATE TABLE retailers (
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

-- ----- Retailer prices table -----
CREATE TABLE retailer_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,

  -- Pricing
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  shipping_label TEXT,
  tax_included BOOLEAN NOT NULL DEFAULT false,
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),

  -- Availability
  in_stock BOOLEAN NOT NULL DEFAULT true,
  delivery_window TEXT,

  -- Links
  url TEXT NOT NULL,
  deep_link TEXT,

  -- Provenance
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('affiliate_feed', 'retailer_api', 'manual')),
  last_updated TIMESTAMPTZ DEFAULT now() NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Unique constraint for upsert support
ALTER TABLE retailer_prices
  ADD CONSTRAINT uq_retailer_prices_product_retailer UNIQUE (product_id, retailer_id);

-- ===========================================
-- Indexes
-- ===========================================

CREATE INDEX idx_retailer_prices_product ON retailer_prices(product_id);
CREATE INDEX idx_retailer_prices_retailer ON retailer_prices(retailer_id);
CREATE INDEX idx_retailer_prices_product_retailer ON retailer_prices(product_id, retailer_id);
CREATE INDEX idx_retailer_prices_freshness ON retailer_prices(last_updated DESC);
CREATE INDEX idx_retailers_slug ON retailers(slug);

-- ===========================================
-- Feed import log (for ingestion auditing)
-- ===========================================

CREATE TABLE feed_import_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  records_processed INTEGER NOT NULL DEFAULT 0,
  records_failed INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- ===========================================
-- Row Level Security
-- ===========================================

-- Retailers: public read, admin write
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view retailers"
  ON retailers FOR SELECT
  USING (true);

-- Retailer prices: public read, admin write
ALTER TABLE retailer_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view retailer prices"
  ON retailer_prices FOR SELECT
  USING (true);

-- Feed import log: admin only (no public access)
ALTER TABLE feed_import_log ENABLE ROW LEVEL SECURITY;
