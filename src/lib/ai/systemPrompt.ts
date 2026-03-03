/**
 * System Prompt Builder
 *
 * Constructs the system prompt sent to Claude for each AI surface request.
 * Uses a 5-layer architecture:
 *   1. Governance (always present — brand, safety, personalization rules)
 *   2. Mode instructions (surface-specific behavior and output structure)
 *   3. User profile (skin type, concerns, sensitivity, preferences)
 *   4. Evidence & data (product, environment, reviews, safety)
 *   5. Interaction history (recently viewed, saved, conversation memory)
 */

import type { AISurfaceContext, AIMode } from './surfaceContext';

// ============================================================================
// LAYER 1: GOVERNANCE (always present)
// ============================================================================

const GOVERNANCE_PROMPT = `You are the Lorem Curae AI assistant — a knowledgeable, calm, premium skincare advisor.

IDENTITY:
- Tone: calm, premium, educational, supportive, science-rooted
- Never salesy, loud, or gimmicky
- Never use exclamation marks unless quoting a user
- Frame as "knowledgeable friend" — not a salesperson or clinician
- Use "we" language that feels collaborative, not clinical

SAFETY RULES:
- Never diagnose, treat, cure, or prescribe
- Never say "you have [condition]" or "this will fix [problem]"
- Use conditional voice: "may help", "commonly associated with", "can support"
- For concerns beyond skincare scope: "Consider consulting a dermatologist"
- Never hallucinate products, ingredients, or retailers not in the provided data
- Only reference data explicitly provided in context — never invent
- Never use urgency or scarcity language

PERSONALIZATION RULES:
- Reference user's skin profile when available
- When profile is missing, respond generically — never fabricate a profile
- Never contradict personalization highlights shown on other surfaces
- Degrade gracefully for guest users

EVIDENCE RULES:
- Cite reviewer evidence as: "reviewers with similar profiles"
- Cite environment evidence as: "in your area" or "for [location]"
- Never present rule-based outputs as AI analysis — be transparent
- Confidence framing: use "based on your profile" not "we know"`;

// ============================================================================
// LAYER 2: MODE INSTRUCTIONS
// ============================================================================

const MODE_INSTRUCTIONS: Record<AIMode, string> = {
  product_detail: `TASK: Analyze how this product suits this user's profile and environment.
OUTPUT STRUCTURE:
1. Environment fit (1-2 sentences) — how key ingredients behave in user's climate
2. Profile alignment (1 sentence) — which concerns this product addresses
3. Reviewer evidence (1 sentence) — what similar users experienced
4. Caution (if applicable) — photosensitivity, sensitivity risks
Keep total response under 4 sentences. Use the product name once.
Include "This is not medical advice" as a closing note.`,

  ingredient_detail: `TASK: Explain this ingredient for this user's specific skin profile.
OUTPUT STRUCTURE:
1. What it does (1 sentence, mechanism-level)
2. Why it matters for you (1 sentence, profile-specific)
3. How to use it (1 sentence, practical)
4. Watch for (if applicable) — interactions, sensitivity
Keep total response under 4 sentences.
Include "This is not medical advice" as a closing note.`,

  routine_builder: `TASK: Analyze the current routine for conflicts, missing steps, and ordering.
OUTPUT STRUCTURE:
1. Conflicts found (list with severity)
2. Ordering suggestions
3. Missing steps (if any)
4. Overall assessment (1 sentence)
Reference specific products by name. Be actionable.
Keep response concise — under 6 sentences.`,

  search: `TASK: Help the user find the right product based on their query and profile.
OUTPUT STRUCTURE:
1. Intent interpretation (1 sentence — what you understand the user is looking for)
2. Top recommendation reasoning (1-2 sentences — why these results match)
3. Profile-specific note (1 sentence — relevance to their skin type/concerns)
Keep total response under 3 sentences.`,

  comparison: `TASK: Compare these products head-to-head for this user's profile.
OUTPUT STRUCTURE:
1. Key differences (2-3 sentences — formulation, texture, ingredient focus)
2. Profile-specific winner (1 sentence — which is better for this user and why)
3. Consideration (1 sentence — trade-off the user should weigh)
Keep total response under 5 sentences.`,

  marketplace: `TASK: Analyze products and retailers for value, trust, and fit.
OUTPUT STRUCTURE:
1. Value assessment (1-2 sentences — price, trust score, shipping)
2. Profile relevance (1 sentence — product fit for user)
3. Retailer note (1 sentence — trust or fulfillment highlight)
Keep total response under 4 sentences.
Never present trust scores as endorsements or guarantees.`,

  nutrition: `TASK: Explain the skin-health connection for these foods/nutrients.
OUTPUT STRUCTURE:
1. Nutrient-skin connection (1-2 sentences — evidence-based)
2. Profile relevance (1 sentence — how this relates to user's concerns)
3. Practical suggestion (1 sentence — meal or intake guidance)
Keep total response under 4 sentences.
Always include: "Nutrition is one factor among many that may influence skin health."
Never make medical dietary claims.`,

  chat: `TASK: Respond to the user's message as a knowledgeable skincare advisor.
- Use the full context provided (profile, products, history, memory)
- Reference specific products, ingredients, and evidence when relevant
- Keep responses conversational and curated — not bullet-point dumps
- Follow up with a natural question when appropriate to guide the conversation
- Limit response to 3-5 sentences for focused questions, up to 8 for complex topics`,

  survey_results: `TASK: Generate a personalized skincare roadmap based on quiz results.
OUTPUT STRUCTURE:
1. Profile summary (1-2 sentences — skin type, key concerns, priorities)
2. Priority concern (1 sentence — what to focus on first and why)
3. Product category suggestions (2-3 sentences — what to look for)
4. Next step (1 sentence — actionable guidance)
Keep total response under 6 sentences.
Include "This is not medical advice" as a closing note.`,
};

// ============================================================================
// LAYER 3: USER PROFILE
// ============================================================================

function buildUserProfileSection(ctx: AISurfaceContext): string {
  const { user } = ctx;

  if (!user.skinType && user.concerns.length === 0) {
    return 'USER PROFILE: Not available. Respond generically without personalization.';
  }

  const lines: string[] = ['USER PROFILE:'];

  if (user.skinType) lines.push(`- Skin type: ${user.skinType}`);
  if (user.concerns.length > 0) lines.push(`- Primary concerns: ${user.concerns.join(', ')}`);
  if (user.complexion) lines.push(`- Complexion: ${user.complexion}`);
  if (user.sensitivity) lines.push(`- Sensitivity: ${user.sensitivity}`);
  if (user.lifestyle.length > 0) lines.push(`- Lifestyle factors: ${user.lifestyle.join(', ')}`);
  if (user.age) lines.push(`- Age: ${user.age}`);
  if (user.experienceLevel) lines.push(`- Experience level: ${user.experienceLevel}`);

  const prefEntries = Object.entries(user.preferences).filter(([, v]) => v);
  if (prefEntries.length > 0) {
    lines.push(`- Preferences: ${prefEntries.map(([k]) => k).join(', ')}`);
  }

  return lines.join('\n');
}

// ============================================================================
// LAYER 4: EVIDENCE & DATA
// ============================================================================

function buildEvidenceSection(ctx: AISurfaceContext): string {
  const sections: string[] = [];
  const { page, evidence, environment } = ctx;

  // Environment context
  if (environment) {
    const envParts: string[] = ['ENVIRONMENT:'];
    if (environment.location?.city) envParts.push(`- Location: ${environment.location.city}${environment.location.region ? `, ${environment.location.region}` : ''}`);
    if (environment.climate) envParts.push(`- Climate: ${environment.climate.replace(/_/g, ' ')}`);
    if (environment.uvBand) envParts.push(`- UV level: ${environment.uvBand}`);
    if (environment.season) envParts.push(`- Season: ${environment.season}`);
    sections.push(envParts.join('\n'));
  }

  // Page-specific data
  if (page.mode === 'product_detail') {
    const p = page.product;
    sections.push([
      'PRODUCT:',
      `- Name: ${p.name}`,
      `- Brand: ${p.brand}`,
      `- Category: ${p.category}`,
      `- Key ingredients: ${p.keyIngredients.join(', ')}`,
      `- Targets skin types: ${p.skinTypes.join(', ')}`,
      `- Targets concerns: ${(p.concerns ?? []).join(', ')}`,
      p.texture ? `- Texture: ${p.texture}` : '',
    ].filter(Boolean).join('\n'));
  } else if (page.mode === 'ingredient_detail') {
    const ing = page.ingredient;
    sections.push([
      'INGREDIENT:',
      `- Name: ${ing.name}`,
      `- Category: ${ing.category}`,
      `- Benefits: ${ing.benefits.join(', ')}`,
      `- Usage: ${ing.usageGuidelines}`,
      `- Works well with: ${ing.compatibility.worksWellWith.join(', ')}`,
      ing.compatibility.avoidWith.length > 0 ? `- Avoid with: ${ing.compatibility.avoidWith.join(', ')}` : '',
      `- Concentration range: ${ing.concentrationRange.min}–${ing.concentrationRange.max}${ing.concentrationRange.unit}`,
      ing.safetyNotes.length > 0 ? `- Safety notes: ${ing.safetyNotes.join('; ')}` : '',
    ].filter(Boolean).join('\n'));
  } else if (page.mode === 'routine_builder') {
    const steps = page.steps.map((s, i) =>
      `  ${i + 1}. ${s.title}${s.product ? ` — ${s.product.name} (${(s.product.keyIngredients ?? []).join(', ')})` : ''}`
    );
    sections.push([
      `ROUTINE (${page.timeOfDay}):`,
      ...steps,
    ].join('\n'));
  } else if (page.mode === 'comparison') {
    page.products.forEach((p, i) => {
      sections.push([
        `PRODUCT ${i + 1}:`,
        `- Name: ${p.name}`,
        `- Brand: ${p.brand}`,
        `- Category: ${p.category}`,
        `- Key ingredients: ${p.keyIngredients.join(', ')}`,
        `- Targets: ${(p.concerns ?? []).join(', ')}`,
      ].join('\n'));
    });
  } else if (page.mode === 'search') {
    sections.push(`SEARCH QUERY: "${page.query}"`);
    if (page.results.length > 0) {
      const resultsSummary = page.results.slice(0, 5).map(p =>
        `  - ${p.name} (${p.brand}) — ${p.category} — targets: ${(p.concerns ?? []).join(', ')}`
      );
      sections.push(['TOP RESULTS:', ...resultsSummary].join('\n'));
    }
  } else if (page.mode === 'survey_results') {
    const profile = page.generatedProfile;
    sections.push([
      'SURVEY RESULTS:',
      profile.skinType ? `- Skin type: ${profile.skinType}` : '',
      profile.concerns.length > 0 ? `- Concerns: ${profile.concerns.join(', ')}` : '',
      profile.sensitivity ? `- Sensitivity: ${profile.sensitivity}` : '',
    ].filter(Boolean).join('\n'));
  }

  // Pre-computed evidence
  if (evidence.environmentFit) {
    sections.push([
      'ENVIRONMENT FIT EVIDENCE:',
      `- ${evidence.environmentFit.explanation}`,
    ].join('\n'));
  }

  if (evidence.reviewerEvidence) {
    const re = evidence.reviewerEvidence;
    sections.push([
      'REVIEWER EVIDENCE:',
      `- ${re.count} reviewers with similar profiles`,
      `- Sentiment: ${re.sentiment}`,
      re.detail ? `- ${re.detail}` : '',
    ].filter(Boolean).join('\n'));
  }

  if (evidence.concernAlignment) {
    const ca = evidence.concernAlignment;
    const parts: string[] = ['CONCERN ALIGNMENT:'];
    if (ca.matched.length > 0) parts.push(`- Addressed: ${ca.matched.join(', ')}`);
    if (ca.unmatched.length > 0) parts.push(`- Not addressed: ${ca.unmatched.join(', ')}`);
    sections.push(parts.join('\n'));
  }

  if (evidence.safetyAssessment) {
    const sa = evidence.safetyAssessment;
    sections.push([
      'SAFETY ASSESSMENT:',
      `- Level: ${sa.level}`,
      ...(sa.warnings.map(w => `- ${w.level}: ${w.label} — ${w.detail}`)),
    ].join('\n'));
  }

  if (evidence.ingredientConflicts && evidence.ingredientConflicts.length > 0) {
    const conflicts = evidence.ingredientConflicts.map(c =>
      `- [${c.severity}] ${c.ingredients.join(' + ')}: ${c.message}`
    );
    sections.push(['INGREDIENT CONFLICTS:', ...conflicts].join('\n'));
  }

  return sections.length > 0 ? sections.join('\n\n') : '';
}

// ============================================================================
// LAYER 5: INTERACTION HISTORY
// ============================================================================

function buildHistorySection(ctx: AISurfaceContext): string {
  const parts: string[] = [];
  const { history, memory } = ctx;

  if (history.savedProducts.length > 0) {
    const saved = history.savedProducts.slice(0, 5).map(p => `  - ${p.name} (${p.brand})`);
    parts.push(['SAVED PRODUCTS:', ...saved].join('\n'));
  }

  if (history.recentlyViewed.length > 0) {
    const viewed = history.recentlyViewed.slice(0, 5).map(p =>
      `  - Product ID ${p.id}${p.name ? ` (${p.name})` : ''}`
    );
    parts.push(['RECENTLY VIEWED:', ...viewed].join('\n'));
  }

  if (history.recentSearches.length > 0) {
    parts.push(`RECENT SEARCHES: ${history.recentSearches.slice(0, 5).join(', ')}`);
  }

  // Conversation memory (chat mode)
  if (memory) {
    const memParts: string[] = ['CONVERSATION MEMORY:'];
    if (memory.skinProfile.skinType) memParts.push(`- Remembered skin type: ${memory.skinProfile.skinType}`);
    if (memory.skinProfile.concerns.length > 0) memParts.push(`- Remembered concerns: ${memory.skinProfile.concerns.join(', ')}`);
    if (memory.experienceLevel) memParts.push(`- Experience level: ${memory.experienceLevel}`);
    if (memory.budgetRange) memParts.push(`- Budget: ${memory.budgetRange}`);
    if (memory.ingredientPreferences.liked.length > 0) memParts.push(`- Liked ingredients: ${memory.ingredientPreferences.liked.join(', ')}`);
    if (memory.ingredientPreferences.disliked.length > 0) memParts.push(`- Disliked ingredients: ${memory.ingredientPreferences.disliked.join(', ')}`);
    if (memory.routinePreferences.style) memParts.push(`- Routine style: ${memory.routinePreferences.style}`);
    if (memory.skincareGoals.length > 0) memParts.push(`- Goals: ${memory.skincareGoals.join(', ')}`);
    if (memParts.length > 1) parts.push(memParts.join('\n'));
  }

  return parts.length > 0 ? parts.join('\n\n') : '';
}

// ============================================================================
// PROMPT ASSEMBLY
// ============================================================================

/**
 * Build the complete system prompt for an AI surface request.
 *
 * Assembles all 5 layers into a single string prompt.
 * Layers are separated by horizontal rules for readability in debug mode.
 * Empty layers are omitted.
 */
export function buildSystemPrompt(ctx: AISurfaceContext): string {
  const layers: string[] = [];

  // Layer 1: Governance (always present)
  layers.push(GOVERNANCE_PROMPT);

  // Layer 2: Mode instructions
  const modeInstructions = MODE_INSTRUCTIONS[ctx.mode];
  if (modeInstructions) {
    layers.push(`MODE: ${ctx.mode}\n\n${modeInstructions}`);
  }

  // Layer 3: User profile
  layers.push(buildUserProfileSection(ctx));

  // Layer 4: Evidence & data
  const evidence = buildEvidenceSection(ctx);
  if (evidence) layers.push(evidence);

  // Layer 5: Interaction history
  const history = buildHistorySection(ctx);
  if (history) layers.push(history);

  return layers.join('\n\n---\n\n');
}

/**
 * Get the maximum token limit for a given mode.
 * Used by the Edge Function to set max_tokens.
 */
export function getMaxTokensForMode(mode: AIMode): number {
  switch (mode) {
    case 'chat': return 4096;
    case 'comparison': return 1536;
    case 'routine_builder': return 1024;
    case 'survey_results': return 1024;
    default: return 1024;
  }
}

/**
 * Validate an AI response for prohibited language.
 * Returns issues found — empty array means response is safe.
 */
export function validateAIResponse(response: string, mode: AIMode): string[] {
  const issues: string[] = [];

  // Prohibited terms
  const prohibited = ['diagnose', 'treat', 'cure', 'prescribe', 'medical advice', 'clinical result'];
  for (const term of prohibited) {
    if (response.toLowerCase().includes(term)) {
      // Allow "this is not medical advice" as a disclaimer
      if (term === 'medical advice' && response.toLowerCase().includes('this is not medical advice')) {
        continue;
      }
      issues.push(`Contains prohibited term: "${term}"`);
    }
  }

  // Length check per mode
  const maxChars: Partial<Record<AIMode, number>> = {
    product_detail: 600,
    ingredient_detail: 500,
    routine_builder: 800,
    search: 400,
    comparison: 700,
    marketplace: 500,
    nutrition: 500,
    chat: 3000,
    survey_results: 800,
  };

  const limit = maxChars[mode] ?? 1000;
  if (response.length > limit) {
    issues.push(`Response length ${response.length} exceeds limit of ${limit} for mode "${mode}"`);
  }

  return issues;
}
