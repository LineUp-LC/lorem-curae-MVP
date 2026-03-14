/**
 * Seed Products Script
 *
 * Seeds the Supabase `products` and `product_ingredient_links` tables
 * with the 12 mock products from src/mocks/products.ts.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-products.ts
 *
 * Requires:
 *   - SUPABASE_URL (e.g., https://xxx.supabase.co)
 *   - SUPABASE_SERVICE_ROLE_KEY (service role, NOT anon key)
 */

import { createClient } from '@supabase/supabase-js';
import { productData } from '../src/mocks/products';
import { getIngredientSlug } from '../src/lib/utils/ingredientSlug';
import type { Product } from '../src/types/product';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:');
  console.error('  SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Map a Product to the database row shape
 */
function productToRow(product: Product) {
  return {
    legacy_id: product.id,
    slug: product.slug ?? product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: product.price,
    rating: product.rating,
    review_count: product.reviewCount,
    image: product.image,
    description: product.description,
    skin_types: product.skinTypes ?? [],
    concerns: product.concerns ?? [],
    key_ingredients: product.keyIngredients ?? [],
    in_stock: product.inStock,
    source: product.source ?? 'discovery',
    size_value: product.size?.value ?? null,
    size_unit: product.size?.unit ?? null,
    active_ingredients: product.activeIngredients ?? [],
    preferences: product.preferences ?? {},
    time_of_day: product.timeOfDay ?? [],
    texture: product.texture ?? null,
    formulation: product.formulation ?? null,
    status: 'published',
  };
}

async function seed() {
  console.log(`[seed-products] Seeding ${productData.length} products...`);

  let successCount = 0;
  let linkCount = 0;
  let errorCount = 0;

  for (const product of productData) {
    const row = productToRow(product);

    // Upsert product (update if legacy_id already exists)
    const { data, error } = await supabase
      .from('products')
      .upsert(row, { onConflict: 'legacy_id' })
      .select('id')
      .single();

    if (error) {
      console.error(`  [FAIL] Product ${product.id} (${product.name}): ${error.message}`);
      errorCount++;
      continue;
    }

    const productUuid = data.id;
    successCount++;
    console.log(`  [OK] Product ${product.id}: ${product.name} → ${productUuid}`);

    // Insert ingredient links
    for (const ingredientName of product.keyIngredients) {
      const slug = getIngredientSlug(ingredientName);
      if (!slug) continue;

      const { error: linkError } = await supabase
        .from('product_ingredient_links')
        .upsert(
          { product_id: productUuid, ingredient_slug: slug },
          { onConflict: 'product_id,ingredient_slug' },
        );

      if (linkError) {
        console.error(`    [FAIL] Link ${ingredientName} → ${slug}: ${linkError.message}`);
      } else {
        linkCount++;
      }
    }
  }

  console.log('');
  console.log('[seed-products] Complete:');
  console.log(`  Products: ${successCount} inserted, ${errorCount} failed`);
  console.log(`  Ingredient links: ${linkCount} created`);
}

seed().catch((err) => {
  console.error('[seed-products] Fatal error:', err);
  process.exit(1);
});
