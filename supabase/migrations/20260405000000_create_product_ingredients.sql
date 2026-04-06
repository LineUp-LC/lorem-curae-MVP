-- ===========================================
-- Migration: Create product_ingredients table
-- Description: Stores parsed ingredient data from scan results,
--              enabling ingredient-aware product recommendations
-- ===========================================

-- ----- products.source: add 'scan' -----
ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_source_check;
ALTER TABLE products
  ADD CONSTRAINT products_source_check
  CHECK (source IN ('marketplace', 'discovery', 'serper', 'scan'));

-- ----- product_ingredients table -----
CREATE TABLE IF NOT EXISTS public.product_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  ingredient_name text NOT NULL,
  inci_name text,
  position integer NOT NULL,
  estimated_concentration_range text CHECK (
    estimated_concentration_range IN ('very_high', 'high', 'medium', 'low')
  ),
  safety_tier text NOT NULL CHECK (safety_tier IN ('safe', 'caution', 'avoid')),
  caution_reason text,
  function text,
  category text,
  last_verified_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'scan' CHECK (source IN ('scan', 'agent', 'manual')),
  needs_review boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ----- Indexes -----
CREATE UNIQUE INDEX product_ingredients_product_position_idx
  ON public.product_ingredients(product_id, position);

CREATE INDEX product_ingredients_product_id_idx
  ON public.product_ingredients(product_id);

CREATE INDEX product_ingredients_safety_tier_idx
  ON public.product_ingredients(safety_tier);

-- ----- RLS -----
ALTER TABLE public.product_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access on product_ingredients"
  ON public.product_ingredients FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert product_ingredients"
  ON public.product_ingredients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update product_ingredients"
  ON public.product_ingredients FOR UPDATE
  USING (true);
