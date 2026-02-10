/**
 * Vector Store for Lorem Curae AI Engine
 *
 * Local vector database for storing and querying product embeddings.
 * Uses localStorage for persistence in the browser.
 * Can be upgraded to Supabase pgvector in production.
 */

import { cosineSimilarity, type EmbeddingRecord } from './embeddings';

const VECTOR_STORE_KEY = 'lorem_curae_vector_store';
const VECTOR_STORE_VERSION = '1.0';

export interface VectorDocument {
  id: string | number;
  vector: number[];
  metadata: {
    productId: number;
    brand: string;
    name: string;
    category: string;
    price: number;
    skinTypes: string[];
    concerns: string[];
    keyIngredients: string[];
    preferences: Record<string, boolean>;
    marketplaceUrl: string;
    [key: string]: any;
  };
}

export interface SearchResult {
  document: VectorDocument;
  similarity: number;
}

export interface VectorStoreState {
  version: string;
  documents: VectorDocument[];
  lastUpdated: string;
}

class LocalVectorStore {
  private documents: Map<string | number, VectorDocument> = new Map();
  private initialized: boolean = false;

  /**
   * Initialize the vector store from localStorage
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const stored = localStorage.getItem(VECTOR_STORE_KEY);
      if (stored) {
        const state: VectorStoreState = JSON.parse(stored);
        if (state.version === VECTOR_STORE_VERSION) {
          state.documents.forEach((doc) => {
            this.documents.set(doc.id, doc);
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load vector store from localStorage:', error);
    }

    this.initialized = true;
  }

  /**
   * Save the vector store to localStorage
   */
  private persist(): void {
    try {
      const state: VectorStoreState = {
        version: VECTOR_STORE_VERSION,
        documents: Array.from(this.documents.values()),
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(VECTOR_STORE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to persist vector store:', error);
    }
  }

  /**
   * Add a document to the vector store
   */
  async upsert(document: VectorDocument): Promise<void> {
    await this.initialize();
    this.documents.set(document.id, document);
    this.persist();
  }

  /**
   * Add multiple documents to the vector store
   */
  async upsertMany(documents: VectorDocument[]): Promise<void> {
    await this.initialize();
    documents.forEach((doc) => {
      this.documents.set(doc.id, doc);
    });
    this.persist();
  }

  /**
   * Get a document by ID
   */
  async get(id: string | number): Promise<VectorDocument | null> {
    await this.initialize();
    return this.documents.get(id) || null;
  }

  /**
   * Delete a document by ID
   */
  async delete(id: string | number): Promise<void> {
    await this.initialize();
    this.documents.delete(id);
    this.persist();
  }

  /**
   * Search for similar documents using cosine similarity
   */
  async search(
    queryVector: number[],
    options: {
      topK?: number;
      minSimilarity?: number;
      filter?: (doc: VectorDocument) => boolean;
    } = {}
  ): Promise<SearchResult[]> {
    await this.initialize();

    const { topK = 10, minSimilarity = 0.1, filter } = options;

    const results: SearchResult[] = [];

    this.documents.forEach((doc) => {
      // Apply filter if provided
      if (filter && !filter(doc)) return;

      const similarity = cosineSimilarity(queryVector, doc.vector);

      if (similarity >= minSimilarity) {
        results.push({ document: doc, similarity });
      }
    });

    // Sort by similarity (descending) and take top K
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Search with metadata filtering
   */
  async searchWithFilters(
    queryVector: number[],
    filters: {
      category?: string;
      skinTypes?: string[];
      concerns?: string[];
      maxPrice?: number;
      preferences?: Record<string, boolean>;
    },
    topK: number = 10
  ): Promise<SearchResult[]> {
    const filterFn = (doc: VectorDocument): boolean => {
      const meta = doc.metadata;

      // Category filter
      if (filters.category && meta.category !== filters.category) {
        return false;
      }

      // Price filter
      if (filters.maxPrice && meta.price > filters.maxPrice) {
        return false;
      }

      // Preferences filter (must match all specified preferences)
      if (filters.preferences) {
        for (const [key, required] of Object.entries(filters.preferences)) {
          if (required && !meta.preferences?.[key]) {
            return false;
          }
        }
      }

      return true;
    };

    return this.search(queryVector, { topK, filter: filterFn });
  }

  /**
   * Get all documents
   */
  async getAll(): Promise<VectorDocument[]> {
    await this.initialize();
    return Array.from(this.documents.values());
  }

  /**
   * Get document count
   */
  async count(): Promise<number> {
    await this.initialize();
    return this.documents.size;
  }

  /**
   * Clear all documents
   */
  async clear(): Promise<void> {
    this.documents.clear();
    localStorage.removeItem(VECTOR_STORE_KEY);
  }

  /**
   * Check if store is populated
   */
  async isPopulated(): Promise<boolean> {
    await this.initialize();
    return this.documents.size > 0;
  }
}

// Singleton instance
export const vectorStore = new LocalVectorStore();

/**
 * Supabase pgvector schema (for production upgrade)
 *
 * CREATE TABLE product_embeddings (
 *   id SERIAL PRIMARY KEY,
 *   product_id INTEGER REFERENCES products(id),
 *   brand TEXT NOT NULL,
 *   name TEXT NOT NULL,
 *   category TEXT NOT NULL,
 *   price DECIMAL(10,2),
 *   skin_types TEXT[],
 *   concerns TEXT[],
 *   key_ingredients TEXT[],
 *   preferences JSONB,
 *   marketplace_url TEXT,
 *   embedding vector(128),
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * CREATE INDEX ON product_embeddings USING ivfflat (embedding vector_cosine_ops);
 *
 * -- Similarity search function
 * CREATE OR REPLACE FUNCTION search_products(
 *   query_embedding vector(128),
 *   match_threshold FLOAT DEFAULT 0.1,
 *   match_count INT DEFAULT 10
 * )
 * RETURNS TABLE (
 *   id INTEGER,
 *   product_id INTEGER,
 *   brand TEXT,
 *   name TEXT,
 *   similarity FLOAT
 * )
 * LANGUAGE plpgsql
 * AS $$
 * BEGIN
 *   RETURN QUERY
 *   SELECT
 *     pe.id,
 *     pe.product_id,
 *     pe.brand,
 *     pe.name,
 *     1 - (pe.embedding <=> query_embedding) as similarity
 *   FROM product_embeddings pe
 *   WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
 *   ORDER BY pe.embedding <=> query_embedding
 *   LIMIT match_count;
 * END;
 * $$;
 */
