-- ===========================================
-- Migration: Create product catalog tables
-- Description: Stores curated product catalog with versioning
--              and ingredient linking for the Discovery system
-- ===========================================

-- ----- Products table -----
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id INTEGER UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  rating NUMERIC(2,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  image TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',

  -- Arrays
  skin_types TEXT[] NOT NULL DEFAULT '{}',
  concerns TEXT[] NOT NULL DEFAULT '{}',
  key_ingredients TEXT[] NOT NULL DEFAULT '{}',

  -- Availability
  in_stock BOOLEAN NOT NULL DEFAULT true,
  source TEXT NOT NULL DEFAULT 'discovery' CHECK (source IN ('marketplace', 'discovery')),

  -- Size (nullable — not all products have size data)
  size_value NUMERIC(10,2),
  size_unit TEXT CHECK (size_unit IN ('ml', 'oz', 'g', 'fl oz')),

  -- Nested JSON fields
  active_ingredients JSONB NOT NULL DEFAULT '[]',
  preferences JSONB NOT NULL DEFAULT '{}',

  -- Optional enrichment fields
  time_of_day TEXT[] DEFAULT '{}',
  texture TEXT,
  formulation TEXT,

  -- Curation workflow
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ----- Product versions table (audit trail) -----
CREATE TABLE product_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1 CHECK (version_number >= 1),
  changed_by TEXT NOT NULL DEFAULT 'system',
  change_reason TEXT,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE (product_id, version_number)
);

-- ----- Product–ingredient links (junction table) -----
CREATE TABLE product_ingredient_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ingredient_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE (product_id, ingredient_slug)
);

-- ===========================================
-- Indexes
-- ===========================================

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_legacy_id ON products(legacy_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating DESC);

CREATE INDEX idx_product_versions_product ON product_versions(product_id);
CREATE INDEX idx_product_versions_created ON product_versions(created_at DESC);

CREATE INDEX idx_product_ingredient_links_product ON product_ingredient_links(product_id);
CREATE INDEX idx_product_ingredient_links_ingredient ON product_ingredient_links(ingredient_slug);

-- ===========================================
-- Row Level Security
-- ===========================================

-- Products: public read on published, admin write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published products"
  ON products FOR SELECT
  USING (status = 'published');

-- Product versions: admin only (no public access)
ALTER TABLE product_versions ENABLE ROW LEVEL SECURITY;

-- Product ingredient links: public read
ALTER TABLE product_ingredient_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product ingredient links"
  ON product_ingredient_links FOR SELECT
  USING (true);
