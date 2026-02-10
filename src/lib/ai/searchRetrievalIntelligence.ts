/**
 * Search & Retrieval Intelligence for Lorem Curae AI
 *
 * Orchestrates retrieval from all knowledge sources:
 * - Ingredient encyclopedia
 * - Product metadata
 * - Concern guides
 * - Routine rules
 * - FAQ content
 * - Educational content
 * - User context
 *
 * Applies personalization and safety filters to all results.
 */

import { INGREDIENT_ENCYCLOPEDIA, FAQ_CONTENT, EDUCATIONAL_CONTENT, ROUTINE_CONFLICTS, type KnowledgeChunk } from './knowledgeBase';
import { CONCERN_ENCYCLOPEDIA, type ConcernId, type ConcernKnowledge } from './concernIntelligence';
import { checkCompatibility, PHOTOSENSITIZING_INGREDIENTS, PREGNANCY_UNSAFE, BEGINNER_SAFE, ADVANCED_INGREDIENTS } from './ingredientIntelligence';
import { type SkinProfile, generateIngredientFilter, evaluateProfileSafety } from './skinProfileIntelligence';
import { type RankedProduct, type ProductSource } from './retrievalPipeline';

// ============================================================================
// Types
// ============================================================================

/**
 * Query intent classification
 */
export type QueryIntent =
  | 'ingredient'
  | 'product'
  | 'concern'
  | 'routine'
  | 'comparison'
  | 'general'
  | 'faq'
  | 'navigation';

/**
 * Retrieval source type
 */
export type RetrievalSource =
  | 'ingredient'
  | 'product'
  | 'concern'
  | 'routine'
  | 'faq'
  | 'educational'
  | 'user-context';

/**
 * Retrieved chunk with metadata
 */
export interface RetrievedChunk {
  id: string;
  source: RetrievalSource;
  title: string;
  content: string;
  relevanceScore: number;
  metadata: {
    url?: string;
    category?: string;
    concerns?: string[];
    ingredients?: string[];
    skinTypes?: string[];
  };
}

/**
 * User context for personalization
 */
export interface UserContext {
  profile?: SkinProfile;
  viewedProducts?: Array<{ id: number; name: string; category: string }>;
  savedProducts?: Array<{ id: number; name: string; category: string }>;
  purchasedProducts?: Array<{ id: number; name: string; category: string }>;
  recentSearches?: string[];
  frequentConcerns?: string[];
}

/**
 * Retrieval options
 */
export interface RetrievalOptions {
  maxResults?: number;
  sources?: RetrievalSource[];
  applyPersonalization?: boolean;
  applySafetyFilters?: boolean;
  includeAlternatives?: boolean;
}

/**
 * Retrieval result
 */
export interface RetrievalResult {
  intent: QueryIntent;
  chunks: RetrievedChunk[];
  safetyWarnings: string[];
  personalizationNotes: string[];
  suggestedLinks: Array<{ label: string; url: string }>;
  fallbackMessage?: string;
}

/**
 * Safety filter result
 */
export interface SafetyFilterResult {
  passed: boolean;
  warnings: string[];
  removedItems: Array<{ item: string; reason: string }>;
}

// ============================================================================
// Intent Detection
// ============================================================================

/**
 * Detect query intent from user message
 */
export function detectQueryIntent(query: string): QueryIntent {
  const lowerQuery = query.toLowerCase();

  // Ingredient intent
  const ingredientKeywords = ['ingredient', 'what is', 'what does', 'how does', 'niacinamide', 'retinol', 'vitamin c', 'hyaluronic', 'salicylic', 'glycolic', 'ceramide', 'peptide'];
  if (ingredientKeywords.some(kw => lowerQuery.includes(kw))) {
    return 'ingredient';
  }

  // Product intent
  const productKeywords = ['product', 'recommend', 'best', 'buy', 'serum', 'cleanser', 'moisturizer', 'sunscreen', 'treatment', 'find me', 'show me'];
  if (productKeywords.some(kw => lowerQuery.includes(kw))) {
    return 'product';
  }

  // Concern intent
  const concernKeywords = ['acne', 'dark spots', 'redness', 'sensitive', 'dry', 'oily', 'wrinkle', 'fine line', 'dull', 'texture', 'pore', 'hyperpigmentation', 'breakout'];
  if (concernKeywords.some(kw => lowerQuery.includes(kw))) {
    return 'concern';
  }

  // Routine intent
  const routineKeywords = ['routine', 'morning', 'evening', 'am', 'pm', 'order', 'layer', 'step', 'build'];
  if (routineKeywords.some(kw => lowerQuery.includes(kw))) {
    return 'routine';
  }

  // Comparison intent
  const comparisonKeywords = ['vs', 'versus', 'compare', 'difference', 'better', 'or'];
  if (comparisonKeywords.some(kw => lowerQuery.includes(kw))) {
    return 'comparison';
  }

  // FAQ intent
  const faqKeywords = ['shipping', 'return', 'refund', 'account', 'password', 'policy', 'how do i', 'can i'];
  if (faqKeywords.some(kw => lowerQuery.includes(kw))) {
    return 'faq';
  }

  // Navigation intent
  const navKeywords = ['where', 'find', 'go to', 'link', 'page'];
  if (navKeywords.some(kw => lowerQuery.includes(kw))) {
    return 'navigation';
  }

  return 'general';
}

// ============================================================================
// Retrieval Functions
// ============================================================================

/**
 * Retrieve ingredient knowledge
 */
export function retrieveIngredients(
  query: string,
  maxResults: number = 5
): RetrievedChunk[] {
  const lowerQuery = query.toLowerCase();
  const results: RetrievedChunk[] = [];

  for (const [key, ingredient] of Object.entries(INGREDIENT_ENCYCLOPEDIA)) {
    // Calculate relevance score
    let score = 0;

    // Direct name match
    if (ingredient.name.toLowerCase().includes(lowerQuery) || lowerQuery.includes(ingredient.name.toLowerCase())) {
      score += 50;
    }

    // Alias match
    if (ingredient.aliases.some(a => a.toLowerCase().includes(lowerQuery) || lowerQuery.includes(a.toLowerCase()))) {
      score += 40;
    }

    // Benefit match
    if (ingredient.benefits.some(b => b.toLowerCase().includes(lowerQuery))) {
      score += 20;
    }

    // Concern match
    if (ingredient.concerns.some(c => c.toLowerCase().includes(lowerQuery))) {
      score += 30;
    }

    if (score > 0) {
      results.push({
        id: `ingredient-${key}`,
        source: 'ingredient',
        title: ingredient.name,
        content: `${ingredient.name}: ${ingredient.benefits.slice(0, 3).join(', ')}. ${ingredient.usageGuidelines}`,
        relevanceScore: score,
        metadata: {
          url: `/ingredients/${key}`,
          concerns: ingredient.concerns,
          skinTypes: ingredient.skinTypes,
        },
      });
    }
  }

  return results
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults);
}

/**
 * Retrieve concern knowledge
 */
export function retrieveConcerns(
  query: string,
  maxResults: number = 5
): RetrievedChunk[] {
  const lowerQuery = query.toLowerCase();
  const results: RetrievedChunk[] = [];

  for (const [key, concern] of Object.entries(CONCERN_ENCYCLOPEDIA)) {
    let score = 0;

    // Name match
    if (concern.name.toLowerCase().includes(lowerQuery) || lowerQuery.includes(concern.name.toLowerCase())) {
      score += 50;
    }

    // Alias match
    if (concern.aliases.some(a => a.toLowerCase().includes(lowerQuery) || lowerQuery.includes(a.toLowerCase()))) {
      score += 40;
    }

    // Description match
    if (concern.description.toLowerCase().includes(lowerQuery)) {
      score += 15;
    }

    if (score > 0) {
      results.push({
        id: `concern-${key}`,
        source: 'concern',
        title: concern.name,
        content: concern.description,
        relevanceScore: score,
        metadata: {
          url: `/learn/${key}`,
          ingredients: concern.recommendedIngredients.primary,
        },
      });
    }
  }

  return results
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults);
}

/**
 * Retrieve FAQ content
 */
export function retrieveFAQ(
  query: string,
  maxResults: number = 3
): RetrievedChunk[] {
  const lowerQuery = query.toLowerCase();
  const results: RetrievedChunk[] = [];

  FAQ_CONTENT.forEach((faq, index) => {
    let score = 0;

    // Question match
    if (faq.question.toLowerCase().includes(lowerQuery) || lowerQuery.includes(faq.question.toLowerCase())) {
      score += 40;
    }

    // Keyword match
    if (faq.keywords.some(kw => lowerQuery.includes(kw))) {
      score += 30;
    }

    // Answer contains query terms
    const queryWords = lowerQuery.split(' ').filter(w => w.length > 3);
    const answerMatches = queryWords.filter(w => faq.answer.toLowerCase().includes(w));
    score += answerMatches.length * 5;

    if (score > 0) {
      results.push({
        id: `faq-${index}`,
        source: 'faq',
        title: faq.question,
        content: faq.answer,
        relevanceScore: score,
        metadata: {
          url: '/faq',
          category: faq.category,
        },
      });
    }
  });

  return results
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults);
}

/**
 * Retrieve educational content
 */
export function retrieveEducational(
  query: string,
  maxResults: number = 3
): RetrievedChunk[] {
  const lowerQuery = query.toLowerCase();
  const results: RetrievedChunk[] = [];

  EDUCATIONAL_CONTENT.forEach(edu => {
    let score = 0;

    // Title match
    if (edu.title.toLowerCase().includes(lowerQuery) || lowerQuery.includes(edu.title.toLowerCase())) {
      score += 40;
    }

    // Content match
    const queryWords = lowerQuery.split(' ').filter(w => w.length > 3);
    const contentMatches = queryWords.filter(w => edu.content.toLowerCase().includes(w));
    score += contentMatches.length * 10;

    // Topic match
    if (edu.metadata.topic && edu.metadata.topic.toLowerCase().includes(lowerQuery)) {
      score += 30;
    }

    // Related concerns match
    if (edu.metadata.relatedConcerns?.some(c => lowerQuery.includes(c.toLowerCase()))) {
      score += 20;
    }

    if (score > 0) {
      results.push({
        id: edu.id,
        source: 'educational',
        title: edu.title,
        content: edu.content,
        relevanceScore: score,
        metadata: {
          url: edu.metadata.url,
          concerns: edu.metadata.relatedConcerns,
          ingredients: edu.metadata.relatedIngredients,
        },
      });
    }
  });

  return results
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults);
}

/**
 * Retrieve routine rules for ingredient conflicts
 */
export function retrieveRoutineConflicts(ingredients: string[]): RetrievedChunk[] {
  const results: RetrievedChunk[] = [];
  const lowerIngredients = ingredients.map(i => i.toLowerCase());

  ROUTINE_CONFLICTS.forEach((conflict, index) => {
    const hasMatch = conflict.ingredients.some(ci =>
      lowerIngredients.some(li => li.includes(ci) || ci.includes(li))
    );

    if (hasMatch) {
      results.push({
        id: `conflict-${index}`,
        source: 'routine',
        title: `Conflict: ${conflict.ingredients.join(' + ')}`,
        content: conflict.reason,
        relevanceScore: 100,
        metadata: {
          url: '/routines',
          ingredients: conflict.ingredients,
        },
      });
    }
  });

  return results;
}

// ============================================================================
// Personalization Filters
// ============================================================================

/**
 * Apply personalization filters to retrieved chunks
 */
export function applyPersonalizationFilters(
  chunks: RetrievedChunk[],
  userContext: UserContext
): { chunks: RetrievedChunk[]; notes: string[] } {
  if (!userContext.profile) {
    return { chunks, notes: [] };
  }

  const profile = userContext.profile;
  const ingredientFilter = generateIngredientFilter(profile);
  const notes: string[] = [];
  const filteredChunks: RetrievedChunk[] = [];

  for (const chunk of chunks) {
    let include = true;
    let boosted = false;

    // Check ingredient chunks against profile
    if (chunk.source === 'ingredient') {
      const ingredientName = chunk.title.toLowerCase();

      // Check if ingredient is in avoid list
      const isAvoided = ingredientFilter.avoid.some(a =>
        ingredientName.includes(a.ingredient.toLowerCase())
      );
      if (isAvoided) {
        include = false;
        notes.push(`Filtered out ${chunk.title} - not suitable for your profile`);
        continue;
      }

      // Boost if ingredient is recommended
      const isRecommended = ingredientFilter.recommended.some(r =>
        ingredientName.includes(r.ingredient.toLowerCase())
      );
      if (isRecommended) {
        chunk.relevanceScore += 20;
        boosted = true;
      }
    }

    // Check concern chunks against user concerns
    if (chunk.source === 'concern' && profile.primaryConcerns) {
      const concernName = chunk.title.toLowerCase();
      const isUserConcern = profile.primaryConcerns.some(c =>
        concernName.includes(c.toLowerCase()) || c.toLowerCase().includes(concernName)
      );
      if (isUserConcern) {
        chunk.relevanceScore += 25;
        boosted = true;
      }
    }

    // Check skin type suitability
    if (chunk.metadata.skinTypes && profile.skinType) {
      const isSuitable = chunk.metadata.skinTypes.some(st =>
        st.toLowerCase() === profile.skinType.toLowerCase() || st.toLowerCase() === 'all'
      );
      if (!isSuitable) {
        chunk.relevanceScore -= 15;
      } else {
        chunk.relevanceScore += 10;
      }
    }

    if (include) {
      filteredChunks.push(chunk);
    }
  }

  // Re-sort after score adjustments
  filteredChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return { chunks: filteredChunks, notes };
}

/**
 * Apply safety filters to retrieved chunks
 */
export function applySafetyFilters(
  chunks: RetrievedChunk[],
  userContext: UserContext
): SafetyFilterResult {
  const warnings: string[] = [];
  const removedItems: Array<{ item: string; reason: string }> = [];

  if (!userContext.profile) {
    return { passed: true, warnings: [], removedItems: [] };
  }

  const profile = userContext.profile;
  const safety = evaluateProfileSafety(profile);

  // Check each chunk for safety issues
  for (const chunk of chunks) {
    // Check for pregnancy-unsafe ingredients
    if (profile.contraindications?.pregnant || profile.contraindications?.breastfeeding) {
      const hasUnsafe = PREGNANCY_UNSAFE.some(unsafe =>
        chunk.content.toLowerCase().includes(unsafe) ||
        chunk.title.toLowerCase().includes(unsafe)
      );
      if (hasUnsafe) {
        warnings.push(`${chunk.title} contains ingredients not recommended during pregnancy`);
      }
    }

    // Check for sensitivity conflicts
    if (profile.sensitivityLevel === 'severe' || profile.sensitivityLevel === 'moderate') {
      const hasStrong = ADVANCED_INGREDIENTS.some(adv =>
        chunk.content.toLowerCase().includes(adv) ||
        chunk.title.toLowerCase().includes(adv)
      );
      if (hasStrong && chunk.source === 'ingredient') {
        warnings.push(`${chunk.title} is a strong active - use with caution given your sensitivity`);
      }
    }

    // Check for photosensitizing ingredients
    const hasPhotosensitizing = PHOTOSENSITIZING_INGREDIENTS.some(ps =>
      chunk.content.toLowerCase().includes(ps) ||
      chunk.title.toLowerCase().includes(ps)
    );
    if (hasPhotosensitizing) {
      warnings.push(`${chunk.title} increases sun sensitivity - use in PM and apply SPF daily`);
    }
  }

  // Add general safety warnings from profile
  safety.generalGuidance.forEach(guidance => {
    if (!warnings.includes(guidance)) {
      warnings.push(guidance);
    }
  });

  return {
    passed: removedItems.length === 0,
    warnings: [...new Set(warnings)].slice(0, 5),
    removedItems,
  };
}

// ============================================================================
// Main Retrieval Function
// ============================================================================

/**
 * Retrieve relevant knowledge for a query
 */
export function retrieve(
  query: string,
  userContext: UserContext,
  options: RetrievalOptions = {}
): RetrievalResult {
  const {
    maxResults = 10,
    sources = ['ingredient', 'product', 'concern', 'routine', 'faq', 'educational'],
    applyPersonalization = true,
    applySafetyFilters: applySafety = true,
  } = options;

  // Detect intent
  const intent = detectQueryIntent(query);

  // Collect chunks from all sources
  let allChunks: RetrievedChunk[] = [];

  if (sources.includes('ingredient')) {
    allChunks.push(...retrieveIngredients(query, maxResults));
  }

  if (sources.includes('concern')) {
    allChunks.push(...retrieveConcerns(query, maxResults));
  }

  if (sources.includes('faq')) {
    allChunks.push(...retrieveFAQ(query, 3));
  }

  if (sources.includes('educational')) {
    allChunks.push(...retrieveEducational(query, 3));
  }

  // Apply personalization
  let personalizationNotes: string[] = [];
  if (applyPersonalization && userContext.profile) {
    const personalized = applyPersonalizationFilters(allChunks, userContext);
    allChunks = personalized.chunks;
    personalizationNotes = personalized.notes;
  }

  // Apply safety filters
  let safetyWarnings: string[] = [];
  if (applySafety && userContext.profile) {
    const safetyResult = applySafetyFilters(allChunks, userContext);
    safetyWarnings = safetyResult.warnings;
  }

  // Sort by relevance and limit
  allChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const finalChunks = allChunks.slice(0, maxResults);

  // Build suggested links
  const suggestedLinks: Array<{ label: string; url: string }> = [];
  finalChunks.forEach(chunk => {
    if (chunk.metadata.url && !suggestedLinks.some(l => l.url === chunk.metadata.url)) {
      suggestedLinks.push({
        label: chunk.title,
        url: chunk.metadata.url,
      });
    }
  });

  // Build fallback message if no results
  let fallbackMessage: string | undefined;
  if (finalChunks.length === 0) {
    fallbackMessage = "I don't have specific information on that yet. Here's what I can help you explore: product recommendations, ingredient education, routine building, or skin concern guidance.";
  }

  return {
    intent,
    chunks: finalChunks,
    safetyWarnings,
    personalizationNotes,
    suggestedLinks: suggestedLinks.slice(0, 5),
    fallbackMessage,
  };
}

/**
 * Retrieve for multi-step queries (e.g., routine building)
 */
export function retrieveForRoutine(
  concerns: string[],
  userContext: UserContext
): {
  ingredientChunks: RetrievedChunk[];
  concernChunks: RetrievedChunk[];
  conflictChunks: RetrievedChunk[];
  safetyWarnings: string[];
} {
  // Retrieve ingredients for each concern
  const ingredientChunks: RetrievedChunk[] = [];
  const concernChunks: RetrievedChunk[] = [];

  concerns.forEach(concern => {
    ingredientChunks.push(...retrieveIngredients(concern, 3));
    concernChunks.push(...retrieveConcerns(concern, 2));
  });

  // Deduplicate
  const uniqueIngredients = ingredientChunks.filter((chunk, index, self) =>
    index === self.findIndex(c => c.id === chunk.id)
  );

  // Get all ingredient names for conflict checking
  const allIngredientNames = uniqueIngredients.map(c => c.title);
  const conflictChunks = retrieveRoutineConflicts(allIngredientNames);

  // Apply safety filters
  let safetyWarnings: string[] = [];
  if (userContext.profile) {
    const safetyResult = applySafetyFilters([...uniqueIngredients, ...concernChunks], userContext);
    safetyWarnings = safetyResult.warnings;
  }

  return {
    ingredientChunks: uniqueIngredients,
    concernChunks,
    conflictChunks,
    safetyWarnings,
  };
}

/**
 * Format retrieved chunks for AI context
 */
export function formatRetrievedForAI(result: RetrievalResult): string {
  const lines: string[] = [];

  if (result.chunks.length === 0) {
    return result.fallbackMessage || 'No relevant information found.';
  }

  lines.push('## Retrieved Knowledge\n');

  // Group by source
  const bySource = new Map<RetrievalSource, RetrievedChunk[]>();
  result.chunks.forEach(chunk => {
    const existing = bySource.get(chunk.source) || [];
    existing.push(chunk);
    bySource.set(chunk.source, existing);
  });

  bySource.forEach((chunks, source) => {
    lines.push(`### ${source.charAt(0).toUpperCase() + source.slice(1)} Knowledge`);
    chunks.forEach(chunk => {
      lines.push(`- **${chunk.title}**: ${chunk.content.slice(0, 200)}...`);
    });
    lines.push('');
  });

  // Add safety warnings
  if (result.safetyWarnings.length > 0) {
    lines.push('### Safety Notes');
    result.safetyWarnings.forEach(w => lines.push(`- ${w}`));
    lines.push('');
  }

  // Add suggested links
  if (result.suggestedLinks.length > 0) {
    lines.push('### Relevant Links');
    result.suggestedLinks.forEach(l => lines.push(`- [${l.label}](${l.url})`));
  }

  return lines.join('\n');
}

/**
 * Check if retrieval found sufficient content
 */
export function hasRelevantContent(result: RetrievalResult): boolean {
  return result.chunks.length > 0 && result.chunks[0].relevanceScore > 20;
}

/**
 * Get retrieval confidence level
 */
export function getRetrievalConfidence(result: RetrievalResult): 'high' | 'medium' | 'low' | 'none' {
  if (result.chunks.length === 0) return 'none';

  const topScore = result.chunks[0].relevanceScore;
  const avgScore = result.chunks.reduce((sum, c) => sum + c.relevanceScore, 0) / result.chunks.length;

  if (topScore > 40 && avgScore > 25) return 'high';
  if (topScore > 25 && avgScore > 15) return 'medium';
  if (topScore > 10) return 'low';
  return 'none';
}
