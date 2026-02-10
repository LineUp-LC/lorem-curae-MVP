/**
 * Embedding Utility for Lorem Curae AI Engine
 *
 * Creates text embeddings for products and user queries.
 * Uses a TF-IDF inspired approach for local embedding generation.
 * Can be upgraded to use OpenAI/Cohere embeddings in production.
 */

// Vocabulary for skincare domain - weighted terms
const SKINCARE_VOCABULARY: Record<string, number> = {
  // Skin types
  dry: 1.5, oily: 1.5, combination: 1.5, normal: 1.5, sensitive: 1.8,
  // Concerns
  acne: 1.8, aging: 1.6, wrinkles: 1.6, 'fine lines': 1.6, hyperpigmentation: 1.7,
  'dark spots': 1.7, brightening: 1.5, dullness: 1.5, pores: 1.5, texture: 1.4,
  redness: 1.6, inflammation: 1.6, sensitivity: 1.7, hydration: 1.5, moisture: 1.4,
  barrier: 1.6, 'barrier repair': 1.8, dehydration: 1.5, 'oil control': 1.5,
  // Key ingredients
  retinol: 2.0, 'vitamin c': 1.9, niacinamide: 1.9, 'hyaluronic acid': 1.8,
  'salicylic acid': 1.9, 'glycolic acid': 1.8, ceramides: 1.8, peptides: 1.7,
  'centella asiatica': 1.7, squalane: 1.6, 'zinc oxide': 1.5, 'vitamin e': 1.4,
  'ferulic acid': 1.6, 'azelaic acid': 1.7, benzoyl: 1.6, aha: 1.6, bha: 1.6,
  // Product types
  cleanser: 1.3, serum: 1.3, moisturizer: 1.3, sunscreen: 1.3, spf: 1.3,
  treatment: 1.3, mask: 1.3, toner: 1.3, cream: 1.2, gel: 1.2, oil: 1.2,
  // Preferences
  vegan: 1.4, 'cruelty-free': 1.4, 'fragrance-free': 1.5, 'alcohol-free': 1.4,
  organic: 1.3, natural: 1.3, 'reef-safe': 1.3,
};

// Dimension of our embedding vectors
const EMBEDDING_DIM = 128;

// Precomputed term indices for consistent embeddings
const termIndices: Map<string, number> = new Map();
let termIndex = 0;
Object.keys(SKINCARE_VOCABULARY).forEach((term) => {
  termIndices.set(term.toLowerCase(), termIndex++);
});

/**
 * Tokenize and normalize text for embedding
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

/**
 * Create n-grams from tokens (for multi-word terms like "hyaluronic acid")
 */
function createNGrams(tokens: string[], n: number = 2): string[] {
  const ngrams: string[] = [...tokens];
  for (let i = 0; i < tokens.length - n + 1; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
}

/**
 * Generate embedding vector from text
 * Uses weighted term frequency with domain vocabulary
 */
export function generateEmbedding(text: string): number[] {
  const vector = new Array(EMBEDDING_DIM).fill(0);
  const tokens = tokenize(text);
  const ngrams = createNGrams(tokens, 2);
  const allTerms = [...tokens, ...ngrams];

  // Count term frequencies
  const termFreq: Map<string, number> = new Map();
  allTerms.forEach((term) => {
    termFreq.set(term, (termFreq.get(term) || 0) + 1);
  });

  // Build embedding vector
  termFreq.forEach((freq, term) => {
    // Check if term is in our vocabulary
    const vocabWeight = SKINCARE_VOCABULARY[term] || 1.0;
    const index = termIndices.get(term);

    if (index !== undefined && index < EMBEDDING_DIM) {
      // Direct vocabulary match
      vector[index] = freq * vocabWeight;
    } else {
      // Hash to a position for unknown terms
      const hash = hashString(term) % EMBEDDING_DIM;
      vector[hash] += freq * 0.5;
    }
  });

  // Normalize vector to unit length
  return normalizeVector(vector);
}

/**
 * Generate embedding from structured product data
 */
export function generateProductEmbedding(product: {
  name: string;
  brand: string;
  description: string;
  category: string;
  skinTypes?: string[];
  concerns?: string[];
  keyIngredients?: string[];
  preferences?: Record<string, boolean>;
}): number[] {
  // Build weighted text representation
  const parts: string[] = [];

  // Category (high weight - repeat)
  parts.push(product.category, product.category);

  // Skin types (high weight)
  if (product.skinTypes) {
    product.skinTypes.forEach((st) => {
      parts.push(st, st);
    });
  }

  // Concerns (high weight)
  if (product.concerns) {
    product.concerns.forEach((c) => {
      parts.push(c, c, c);
    });
  }

  // Key ingredients (highest weight)
  if (product.keyIngredients) {
    product.keyIngredients.forEach((ing) => {
      parts.push(ing, ing, ing);
    });
  }

  // Preferences
  if (product.preferences) {
    Object.entries(product.preferences).forEach(([key, value]) => {
      if (value) {
        parts.push(key.replace(/([A-Z])/g, ' $1').toLowerCase());
      }
    });
  }

  // Name and description
  parts.push(product.name, product.description);

  return generateEmbedding(parts.join(' '));
}

/**
 * Generate embedding from user skin survey
 */
export function generateSurveyEmbedding(survey: {
  skinType?: string;
  concerns?: string[];
  sensitivities?: string[];
  goals?: string[];
  preferences?: {
    crueltyFree?: boolean;
    vegan?: boolean;
    fragranceFree?: boolean;
    budgetRange?: string;
  };
}): number[] {
  const parts: string[] = [];

  // Skin type (high weight)
  if (survey.skinType) {
    parts.push(survey.skinType, survey.skinType, survey.skinType);
  }

  // Concerns (highest weight)
  if (survey.concerns) {
    survey.concerns.forEach((c) => {
      parts.push(c, c, c, c);
    });
  }

  // Goals
  if (survey.goals) {
    survey.goals.forEach((g) => {
      parts.push(g, g);
    });
  }

  // Sensitivities (negative markers - we'll handle in ranking)
  if (survey.sensitivities) {
    survey.sensitivities.forEach((s) => {
      parts.push(`avoid ${s}`, `no ${s}`);
    });
  }

  // Preferences
  if (survey.preferences) {
    if (survey.preferences.crueltyFree) parts.push('cruelty-free', 'cruelty-free');
    if (survey.preferences.vegan) parts.push('vegan', 'vegan');
    if (survey.preferences.fragranceFree) parts.push('fragrance-free', 'fragrance-free');
  }

  return generateEmbedding(parts.join(' '));
}

/**
 * Generate embedding from natural language query
 */
export function generateQueryEmbedding(query: string): number[] {
  return generateEmbedding(query);
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Normalize vector to unit length
 */
function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vector;
  return vector.map((val) => val / magnitude);
}

/**
 * Simple string hash function
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Embedding schema for storage
 */
export interface EmbeddingRecord {
  id: string | number;
  vector: number[];
  metadata: Record<string, any>;
  createdAt: string;
}

export const EMBEDDING_SCHEMA = {
  dimension: EMBEDDING_DIM,
  similarity: 'cosine' as const,
  vocabularySize: Object.keys(SKINCARE_VOCABULARY).length,
};
