-- ===========================================
-- Migration: Add admin RLS write policies
-- Description: Allows authenticated users to manage products,
--              version history, and ingredient links.
--              Future enhancement: restrict to admin role.
-- ===========================================

-- ----- Products: authenticated users can see all statuses -----
CREATE POLICY "Authenticated users can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- ----- Product versions: authenticated users can read and create -----
CREATE POLICY "Authenticated users can view versions"
  ON product_versions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert versions"
  ON product_versions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ----- Product ingredient links: authenticated users can manage -----
CREATE POLICY "Authenticated users can insert ingredient links"
  ON product_ingredient_links FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete ingredient links"
  ON product_ingredient_links FOR DELETE
  TO authenticated
  USING (true);

-- ===========================================
-- Storage bucket for product images
-- ===========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');
