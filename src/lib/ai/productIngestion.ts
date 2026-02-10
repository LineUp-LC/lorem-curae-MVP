/**
 * Product Ingestion for Lorem Curae AI Engine
 *
 * Embeds all products from the catalog and stores them in the vector store.
 * Run this on app initialization or when products are updated.
 */

import { productData } from '../../mocks/products';
import type { Product } from '../../types/product';
import { generateProductEmbedding } from './embeddings';
import { vectorStore, type VectorDocument } from './vectorStore';

/**
 * Convert a product to a vector document
 */
function productToVectorDocument(product: Product): VectorDocument {
  // Generate embedding from product data
  const vector = generateProductEmbedding({
    name: product.name,
    brand: product.brand,
    description: product.description,
    category: product.category,
    skinTypes: product.skinTypes,
    concerns: product.concerns,
    keyIngredients: product.keyIngredients,
    preferences: product.preferences,
  });

  // Determine source and generate appropriate URL
  const source = product.source || 'discovery';
  const productUrl = source === 'marketplace'
    ? `/marketplace/product/${product.id}`
    : `/product-detail/${product.id}`;

  // Build metadata
  const metadata = {
    productId: product.id,
    brand: product.brand,
    name: product.name,
    category: product.category,
    price: product.price,
    rating: product.rating,
    reviewCount: product.reviewCount,
    skinTypes: product.skinTypes || [],
    concerns: product.concerns || [],
    keyIngredients: product.keyIngredients || [],
    activeIngredients: product.activeIngredients || [],
    preferences: product.preferences || {},
    inStock: product.inStock,
    size: product.size,
    image: product.image,
    description: product.description,
    source,
    productUrl,
    // Keep marketplaceUrl for backwards compatibility
    marketplaceUrl: productUrl,
  };

  return {
    id: `product_${product.id}`,
    vector,
    metadata,
  };
}

/**
 * Ingest all products from the catalog into the vector store
 */
export async function ingestProducts(): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  try {
    console.log('[ProductIngestion] Starting product ingestion...');

    // Convert all products to vector documents
    const documents = productData.map(productToVectorDocument);

    // Upsert all documents into the vector store
    await vectorStore.upsertMany(documents);

    const count = await vectorStore.count();
    console.log(`[ProductIngestion] Successfully ingested ${count} products`);

    return { success: true, count };
  } catch (error) {
    console.error('[ProductIngestion] Failed to ingest products:', error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Ingest a single product (for incremental updates)
 */
export async function ingestProduct(product: Product): Promise<boolean> {
  try {
    const document = productToVectorDocument(product);
    await vectorStore.upsert(document);
    return true;
  } catch (error) {
    console.error(`[ProductIngestion] Failed to ingest product ${product.id}:`, error);
    return false;
  }
}

/**
 * Check if products are already ingested
 */
export async function isIngested(): Promise<boolean> {
  return vectorStore.isPopulated();
}

/**
 * Re-ingest all products (clear and reload)
 */
export async function reIngestProducts(): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  try {
    await vectorStore.clear();
    return ingestProducts();
  } catch (error) {
    console.error('[ProductIngestion] Failed to re-ingest products:', error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get ingestion status
 */
export async function getIngestionStatus(): Promise<{
  isIngested: boolean;
  documentCount: number;
  catalogCount: number;
}> {
  const documentCount = await vectorStore.count();
  return {
    isIngested: documentCount > 0,
    documentCount,
    catalogCount: productData.length,
  };
}

/**
 * Initialize ingestion on first load
 * Call this in app initialization
 */
export async function initializeProductIngestion(): Promise<void> {
  const ingested = await isIngested();

  if (!ingested) {
    console.log('[ProductIngestion] No products found in vector store, ingesting...');
    await ingestProducts();
  } else {
    const status = await getIngestionStatus();
    console.log(`[ProductIngestion] Vector store initialized with ${status.documentCount} products`);

    // Re-ingest if catalog has changed
    if (status.documentCount !== status.catalogCount) {
      console.log('[ProductIngestion] Catalog size changed, re-ingesting...');
      await reIngestProducts();
    }
  }
}
