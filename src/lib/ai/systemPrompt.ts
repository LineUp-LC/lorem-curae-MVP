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
//
// SYNC: This prompt must stay aligned with /ai-governance/CLAUDE_PRODUCT.md.
// When that file changes, update this prompt in the same PR.
// See CLAUDE.md Section 28 for the full sync protocol.
// GOVERNANCE_VERSION: 2.0 — Last synced 2026-03-04 (CLAUDE_PRODUCT.md Sections 1-17)
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
- Reference user's skin profile specifically when available ("for your oily skin" not "based on your profile")
- Lead with the user's environment or skin reality, then explain how the product or recommendation connects
- Use plain, everyday language — no clinical jargon, no ingredient name-dropping without explaining what they do
- Every sentence must relate to the user's real conditions, skin type, or concerns
- When profile is missing, respond generically — never fabricate a profile
- Never contradict personalization highlights shown on other surfaces
- Degrade gracefully for guest users

EVIDENCE RULES:
- Cite reviewer evidence as: "people with similar skin" — never imply identical conditions
- Use conversational reviewer framing: "People with similar skin said..." not "3 reviewers noted..."
- Never expose raw similarity scores — translate to tiers ("Very Similar", "Similar")
- Cite environment evidence as: "in your area" or "for [location]"
- Never present rule-based outputs as AI analysis — be transparent
- Confidence framing: use "based on your skin type" not "we know"

COMMUNITY & REVIEWER VOICE:
- Be supportive, empathetic, non-judgmental on community surfaces
- Never compare users competitively or imply progress is expected
- Frame sharing as optional: "share if you'd like" not "tell everyone"

RETAILER & TRUST SCORE VOICE:
- Trust scores are community-derived, not endorsements or guarantees
- Never say "we recommend this retailer" — explain what the score measures
- Frame rewards transparently: "You earn back a portion of our commission"

PRICING VOICE:
- Show price ranges, not just highest price
- Show value indicators alongside prices (free shipping, rewards)
- Never use urgency pricing language

NUTRITION VOICE:
- Use evidence-based framing only: "commonly associated with", "may support"
- Always include: "Nutrition is one factor among many that may influence skin health"
- Never make medical dietary claims

SAFETY & WARNING VOICE:
- Explain WHY a safety rating exists — reference ingredient properties
- Frame warnings as information, not alarm
- Never overstate risk or safety

CONCERN ALIGNMENT VOICE:
- Name specific concerns: "This product addresses [concern]" not "aligns with your profile"
- For unmatched concerns, be neutral: "doesn't specifically target [concern]"
- Acknowledge partial matches honestly`;

// ============================================================================
// LAYER 2: MODE INSTRUCTIONS
// ============================================================================

const MODE_INSTRUCTIONS: Record<AIMode, string> = {
  product_detail: `TASK: Explain how this product fits this user's current environment and skin.
OUTPUT STRUCTURE:
1. Environment reality (1 sentence) — what the user's current conditions mean for their skin, in plain language
2. Product connection (1-2 sentences) — how this product helps in those conditions, tied to the user's skin type and concerns
3. Concern alignment (1 sentence, if applicable) — how this connects to what the user's skin needs right now
4. Gentle reminder (if applicable) — sensitivity, sun protection, or lifestyle consideration
Use plain language — no ingredient names unless explaining what they do. No clinical terms.
Keep total response under 4 sentences. Do not include "This is not medical advice."`,

  ingredient_detail: `TASK: Explain this ingredient in plain language, personalized for this user's skin concerns and environment.
OUTPUT STRUCTURE:
1. What it does for your skin (1 sentence) — explain the benefit in everyday terms, not mechanism names
2. Why this matters for YOUR concerns (1-2 sentences) — name the user's specific concerns (e.g. "dryness", "dark spots") and explain how this ingredient helps with each. If multiple concerns match, address each briefly. If no concerns match, explain the general benefit for their skin type.
3. How to use it (1 sentence) — practical, specific to their routine context and environment
4. Watch for (if applicable) — sensitivity or interaction note relevant to their profile
Use plain language throughout — explain what the ingredient does, not its chemical mechanism.
When the user has concerns, lead with "For your [concern]..." or "Since you're dealing with [concern]..." framing.
Keep total response under 5 sentences. Do not include "This is not medical advice."
Do not use markdown formatting (no #, **, or bullet points). Return plain prose sentences only.`,

  routine_builder: `TASK: Analyze this routine for the user's skin type, concerns, and current environment.
OUTPUT STRUCTURE:
1. How this routine works for your skin (1 sentence) — overall fit for their skin type and conditions
2. Conflicts or ordering issues (if any) — explain why in plain language, not ingredient chemistry
3. What's missing (if applicable) — tied to their specific concerns or environment
4. One actionable next step (1 sentence)
Use plain language — explain what products do, not ingredient mechanisms.
Reference the user's skin type and concerns specifically.
Keep response concise — under 6 sentences.`,

  search: `TASK: Help the user find the right product for their skin, concerns, and environment.
OUTPUT STRUCTURE:
1. What you're looking for (1 sentence) — restate their need in context of their skin type
2. Why these results fit (1-2 sentences) — connect to their specific concerns, environment, or preferences
3. Something to consider (1 sentence) — a relevant note tied to their skin reality
Use plain language. Reference their skin type and concerns by name.
Keep total response under 3 sentences.`,

  comparison: `TASK: Compare these products head-to-head for this user's profile.
OUTPUT STRUCTURE:
1. Key differences (2-3 sentences — what each product does, texture, ingredient approach)
2. Profile-specific winner (1 sentence — which is better for this user and why)
3. Consideration (1 sentence — trade-off the user should weigh)
Keep total response under 5 sentences.`,

  marketplace: `TASK: Assess these products and retailers for this user's skin, budget, and preferences.
OUTPUT STRUCTURE:
1. Value for you (1-2 sentences) — price context tied to the user's budget range or preferences
2. How it fits your skin (1 sentence) — connect product to their skin type, concerns, or environment
3. About this retailer (1 sentence) — trust or fulfillment note, never framed as an endorsement
Use plain language. Reference the user's skin type and concerns specifically.
Keep total response under 4 sentences.
Never present trust scores as endorsements or guarantees.`,

  nutrition: `TASK: Explain how these foods or nutrients connect to this user's skin and concerns.
OUTPUT STRUCTURE:
1. What this does for skin (1-2 sentences) — plain language, tied to the user's concerns or skin type
2. Why it matters for you (1 sentence) — specific to their profile and current environment if relevant
3. A practical idea (1 sentence) — actionable, simple meal or intake suggestion
Use plain language — no clinical nutrition terminology.
Keep total response under 4 sentences.
Always include: "Nutrition is one factor among many that may influence skin health."
Never make medical dietary claims.`,

  chat: `TASK: Respond as a knowledgeable skincare advisor who knows this user's skin and environment.
- Lead with what matters for their skin type, concerns, and current conditions
- Use the full context provided — profile, environment, products, history, memory, lifestyle, preferences
- When mentioning ingredients, explain what they do in plain terms
- Keep responses conversational and curated — not bullet-point dumps
- Reference their skin type and concerns by name, not vaguely ("for your oily skin" not "for your profile")
- Follow up with a natural question when appropriate
- Limit response to 3-5 sentences for focused questions, up to 8 for complex topics`,

  survey_results: `TASK: Generate a personalized skincare starting point based on this user's quiz results.
OUTPUT STRUCTURE:
1. Your skin snapshot (1-2 sentences) — summarize their skin type, key concerns, and what that means day-to-day
2. Where to start (1 sentence) — the most impactful concern to focus on first and why
3. What to look for (2-3 sentences) — product types and qualities that suit their skin, explained in plain terms
4. Your next step (1 sentence) — one clear, actionable thing to do
Use plain language throughout. Reference their specific skin type and concerns.
Keep total response under 6 sentences. Do not include "This is not medical advice."`,

  explain_product: `TASK: Explain this product in plain language for this user.
OUTPUT STRUCTURE:
1. What this product does (1-2 sentences) — in plain terms, tied to the user's skin type
2. Why it might work for you (1-2 sentences) — connect to their concerns and environment
3. Key ingredients explained (1-2 sentences) — what each does, no jargon
4. How to use it (1 sentence) — practical, time-of-day specific
5. Things to know (if applicable) — sensitivity, layering order, or sun protection note
Cite deterministic factors: skin type, concerns, ingredients, environment.
Keep total response under 6 sentences. Do not include "This is not medical advice."`,

  find_alternatives: `TASK: Explain why these alternatives are relevant to this user.
OUTPUT STRUCTURE:
1. What you're currently looking at (1 sentence) — summarize the source product
2. Why these alternatives fit (2-3 sentences) — shared ingredients, shared concerns, complementary approaches
3. Key differences (1-2 sentences) — what each alternative offers differently
4. For your skin specifically (1 sentence) — which alternative might suit their profile best and why
Cite shared ingredients and concern overlap. Reference skin type.
Keep total response under 5 sentences.`,

  review_summary: `TASK: Summarize reviews for this product in a safe, non-hallucinatory way.
OUTPUT STRUCTURE:
1. Overall sentiment (1 sentence) — what most reviewers experienced
2. Common positives (1-2 sentences) — what worked, tied to specific skin types or concerns
3. Common concerns (1 sentence) — what some reviewers noted, with context
4. For someone like you (1 sentence) — what reviewers with a similar skin profile said
SAFETY: Only reference data provided in the evidence. Never fabricate reviewer quotes or statistics.
Use "reviewers noted" not "studies show." Use "people with similar skin" not exact counts.
Keep total response under 5 sentences.`,

  natural_discovery: `TASK: Help the user understand their search results in the context of their skin.
OUTPUT STRUCTURE:
1. What you're looking for (1 sentence) — restate their query in skin-profile context
2. Why these results rank highly (2-3 sentences) — explain scoring factors in plain terms (skin type match, concern alignment, ingredient relevance, preferences)
3. A suggestion (1 sentence) — what to prioritize or look at first
Cite deterministic scoring factors. Reference skin type and concerns by name.
Keep total response under 4 sentences.`,

  rewrite_explanation: `TASK: Rewrite the provided text at the requested complexity level.
LEVELS:
- beginner: Use simple words, analogies, no ingredient names without explaining them. Target someone who has never used skincare products.
- intermediate: Use common skincare terms, explain mechanisms briefly. Target someone with 6+ months experience.
- advanced: Use precise terminology, reference ingredient mechanisms, concentrations, and interactions. Target someone with deep skincare knowledge.
Preserve the factual content and safety guardrails. Never add claims not in the original.
Keep the same approximate length as the original.`,

  guided_comparison: `TASK: You are a guided product comparison assistant. The user is deciding between 2-4 products.
You have deterministic comparison data (scores, attributes, concern alignment). Narrate the comparison in plain language.
OUTPUT STRUCTURE:
1. Quick summary (1 sentence) — what the user is comparing and what matters most for their skin
2. Key differences (2-3 sentences) — what each product does differently, tied to the user's skin type and concerns
3. Recommendation (1 sentence) — which product fits best and why, citing deterministic scores
4. Follow-up prompt (1 sentence) — a natural question to help narrow the decision further
Cite deterministic factors: skin type match, concern alignment, ingredient overlap, environment fit.
Keep total response under 6 sentences. Use the user's skin type and concerns by name.`,

  guided_routine_build: `TASK: You are a guided routine building assistant. Help the user build a personalized routine step by step.
You have deterministic routine data (product selections, conflicts, layering order). Explain each step and why it was chosen.
OUTPUT STRUCTURE:
1. Routine overview (1 sentence) — what this routine targets and how many steps
2. Step explanations (1-2 sentences each) — what each product does and why it was chosen for this user
3. Conflict notes (if any) — explain in plain language, not ingredient chemistry
4. Next steps (1 sentence) — what the user should do next
Use plain language. Reference skin type and concerns by name.
Keep total response under 8 sentences.`,

  guided_routine_explain: `TASK: You are a routine explanation assistant. Explain the user's existing routine at their preferred depth.
You have deterministic analysis (layering order, conflicts, role of each product). Explain clearly.
TONE LEVELS:
- simple: Use everyday language, analogies, no ingredient names. "This product locks in moisture."
- detailed: Use common skincare terms, explain mechanisms briefly. "This serum delivers hyaluronic acid to attract moisture."
- science: Use precise terminology, reference concentrations and interactions.
OUTPUT STRUCTURE:
1. Routine summary (1 sentence) — what this routine does overall
2. Step-by-step explanation (1-2 sentences each) — what each product does and why it's in this position
3. Conflict or ordering notes (if any)
4. Improvement suggestion (1 sentence, optional)
Keep total response under 8 sentences.`,

  curated_recommendation: `TASK: For each compatible product listed below, explain why it pairs well with the scanned product for this user.
OUTPUT FORMAT:
Return one line per product, starting with the product ID in square brackets:
[1] This cleanser complements your scanned serum because it provides gentle hydration without disrupting active ingredients.
[3] This moisturizer locks in the benefits of your scanned product while adding ceramides your skin needs.
RULES:
- Keep each explanation to 1-2 sentences.
- Reference the user's skin type and concerns by name.
- Explain the ingredient compatibility in plain language.
- Never use clinical jargon — explain what products DO, not ingredient mechanisms.
- Do not use markdown formatting. Return plain text lines only.`,

  is_it_for_me: `TASK: Give this user a clear, personalized verdict on whether this scanned product is right for them.
OUTPUT STRUCTURE:
Line 1: Start with EXACTLY one of these verdict phrases (the UI parses this line):
- "Great fit for you" — if the product aligns well with their skin type, concerns, and preferences
- "Good fit with precautions" — if it could work but has risks for their sensitivity, conflicts with shelf products, or needs careful use
- "Not the best fit" — if it conflicts with their skin type, sensitivity, or existing routine
Line 2-6: Evidence bullets. Each bullet must start with "•" and reference SPECIFIC user data:
- Name their skin type: "Your oily skin benefits from..."
- Name their concerns: "For your dark spots, the vitamin C in this product..."
- Reference shelf/routine conflicts: "The retinol in your evening routine may conflict with the AHA in this product"
- Reference reviews if provided: "Among reviewers with similar skin, most saw results within..."
- Reference environment if provided: "In your current humid climate, this lightweight texture..."
- Reference preferences if provided: "This product is fragrance-free, matching your preference"
Line 7: End with one practical tip: "Start with..." or "Apply after..." or "Use SPF when..."
RULES:
- Be specific — never say "based on your profile" without naming what in their profile
- If shelf or routine products may conflict, explain which ingredients and why
- If no review data is provided, skip the review bullet — do not fabricate
- If no environment data, skip the environment bullet
- Never use clinical jargon — explain what ingredients DO in plain language
- Never say "diagnose", "treat", "cure", "prescribe", or "guaranteed"
- Use conditional voice: "may help", "can support", "commonly associated with"`,

  curated_review_summary: `TASK: Summarize reviews from people with similar skin profiles who used this product.
OUTPUT STRUCTURE:
1. Match summary (1 sentence) — "Among X reviewers with similar skin..." with a key statistic
2. Common experience (1 sentence) — what most matching reviewers experienced, with timeframe if available
3. Relevance note (1 sentence) — why this matters for the user's specific concerns
SAFETY: Only reference data provided in the evidence. Never fabricate quotes, statistics, or reviewer details.
Use conversational framing: "people with similar skin" not exact reviewer counts or percentages.
Keep total response to exactly 3 sentences. Do not use markdown formatting.`,

  retailer_review_summary: `TASK: Summarize reviews found on a specific retailer's site for this product, highlighting snippets relevant to this user's skin profile.
OUTPUT STRUCTURE:
1. Overview (1 sentence) — "On [Retailer], reviews mentioning [skin type/concern] ..." with a key finding
2. What reviewers are saying (1-2 sentences) — common themes from the keyword-matched review snippets
3. For your skin (1 sentence) — connect the reviewer sentiment to this user's specific concerns
CRITICAL RULES:
- These are keyword-matched review excerpts from a retailer website, NOT confirmed reviewer skin profiles.
- Say "reviews mentioning [term]" NOT "reviewers with [skin type]" — we do not know their actual skin type.
- Never imply that external reviewers have structured skin profile data.
- Only reference data provided in the evidence — never fabricate quotes or statistics.
- If keyword match count is provided, you may say "X of Y reviews mention [term]".
Keep total response to 3-4 sentences. Do not use markdown formatting.`,
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
  } else if (page.mode === 'explain_product') {
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
      `- Price: $${p.price}`,
    ].filter(Boolean).join('\n'));
    if (page.question) {
      sections.push(`USER QUESTION: "${page.question}"`);
    }
  } else if (page.mode === 'is_it_for_me') {
    const p = page.product;
    sections.push([
      'SCANNED PRODUCT:',
      `- Name: ${p.name}`,
      `- Brand: ${p.brand}`,
      `- Category: ${p.category}`,
      p.keyIngredients.length > 0 ? `- Key ingredients: ${p.keyIngredients.join(', ')}` : '',
      p.skinTypes.length > 0 ? `- Targets skin types: ${p.skinTypes.join(', ')}` : '',
      (p.concerns ?? []).length > 0 ? `- Targets concerns: ${(p.concerns ?? []).join(', ')}` : '',
      p.texture ? `- Texture: ${p.texture}` : '',
    ].filter(Boolean).join('\n'));
    if (page.scannedIngredients && page.scannedIngredients.length > 0) {
      const ingList = page.scannedIngredients.map(i =>
        `${i.name} (${i.safetyTier}${i.category ? `, ${i.category}` : ''})`
      ).join('; ');
      sections.push(`FULL INGREDIENT LIST FROM SCAN: ${ingList}`);
    }
    if (page.shelfProducts.length > 0) {
      const shelfLines = page.shelfProducts.map(sp =>
        `- ${sp.brand} ${sp.name} (${sp.category}) — ingredients: ${sp.keyIngredients.join(', ')}`
      );
      sections.push(['PRODUCTS ON USER SHELF:', ...shelfLines].join('\n'));
    }
    if (page.routineProducts.length > 0) {
      const routineLines = page.routineProducts.map(rp =>
        `- ${rp.name} (${rp.category}, ${rp.timeOfDay})`
      );
      sections.push(['PRODUCTS IN USER ROUTINES:', ...routineLines].join('\n'));
    }
    if (page.reviewStats) {
      const rs = page.reviewStats;
      sections.push([
        'REVIEW DATA FROM SIMILAR SKIN PROFILES:',
        `- ${rs.totalMatching} reviewers with similar skin`,
        `- Average rating: ${rs.avgRating.toFixed(1)}/5`,
        `- ${rs.positivePercent}% rated positively`,
        rs.commonPros.length > 0 ? `- Common positives: ${rs.commonPros.join(', ')}` : '',
        rs.commonCons.length > 0 ? `- Common concerns: ${rs.commonCons.join(', ')}` : '',
      ].filter(Boolean).join('\n'));
    }
    if (page.webReviewData && page.webReviewData.totalResults > 0) {
      const wd = page.webReviewData;
      sections.push([
        'WEB REVIEW DATA (from Google search):',
        `- ${wd.totalResults} review sources found`,
        wd.avgRating ? `- Average extracted rating: ${wd.avgRating.toFixed(1)}/5` : '',
        `- Sources: ${wd.sourceDomains.slice(0, 5).join(', ')}`,
        wd.topSnippets.length > 0 ? `- Key excerpts:\n${wd.topSnippets.slice(0, 3).map(s => `  "${s}"`).join('\n')}` : '',
      ].filter(Boolean).join('\n'));
    }
  } else if (page.mode === 'retailer_review_summary') {
    sections.push([
      'PRODUCT:',
      `- Name: ${page.productBrand} ${page.productName}`,
    ].join('\n'));
    sections.push([
      'RETAILER:',
      `- Name: ${page.retailerName}`,
      `- Domain: ${page.retailerDomain}`,
    ].join('\n'));
    if (page.keywordMatches.length > 0) {
      const kwLines = page.keywordMatches.map(km =>
        `  - "${km.term}": mentioned in ${km.count} review(s)`
      );
      sections.push(['KEYWORD MATCHES (from review text — NOT confirmed reviewer profiles):', ...kwLines].join('\n'));
    }
    if (page.reviews.length > 0) {
      const reviewLines = page.reviews.slice(0, 8).map((r, i) =>
        `  ${i + 1}. [Score: ${r.relevanceScore}]${r.extractedRating ? ` Rating: ${r.extractedRating}/5` : ''} "${r.content.substring(0, 200)}${r.content.length > 200 ? '...' : ''}"`
      );
      sections.push(['KEYWORD-MATCHED REVIEW SNIPPETS:', ...reviewLines].join('\n'));
    }
  } else if (page.mode === 'find_alternatives') {
    sections.push([
      'SOURCE PRODUCT:',
      `- Name: ${page.sourceProduct.name}`,
      `- Brand: ${page.sourceProduct.brand}`,
      `- Category: ${page.sourceProduct.category}`,
      `- Key ingredients: ${page.sourceProduct.keyIngredients.join(', ')}`,
      `- Concerns: ${(page.sourceProduct.concerns ?? []).join(', ')}`,
    ].join('\n'));
    page.alternatives.forEach((p, i) => {
      sections.push([
        `ALTERNATIVE ${i + 1}:`,
        `- Name: ${p.name}`,
        `- Brand: ${p.brand}`,
        `- Category: ${p.category}`,
        `- Key ingredients: ${p.keyIngredients.join(', ')}`,
        `- Concerns: ${(p.concerns ?? []).join(', ')}`,
      ].join('\n'));
    });
    if (page.overlapIngredients.length > 0) {
      sections.push(`SHARED INGREDIENTS: ${page.overlapIngredients.join(', ')}`);
    }
  } else if (page.mode === 'review_summary') {
    const p = page.product;
    sections.push([
      'PRODUCT:',
      `- Name: ${p.name}`,
      `- Brand: ${p.brand}`,
      `- Category: ${p.category}`,
    ].join('\n'));
    const reviewLines = page.reviews.slice(0, 10).map((r, i) =>
      `  ${i + 1}. Rating: ${r.rating}/5 | Skin: ${r.skinType} | Concerns: ${r.concerns.join(', ')} | Duration: ${r.usageDurationWeeks}wk${r.pros?.length ? ` | Pros: ${r.pros.join(', ')}` : ''}${r.cons?.length ? ` | Cons: ${r.cons.join(', ')}` : ''}`
    );
    sections.push(['REVIEWS:', ...reviewLines].join('\n'));
  } else if (page.mode === 'natural_discovery') {
    sections.push(`SEARCH QUERY: "${page.query}"`);
    if (page.scoredResults.length > 0) {
      const resultLines = page.scoredResults.slice(0, 10).map(sr =>
        `  - ${sr.product.name} (${sr.product.brand}) — score: ${sr.score} — reasons: ${sr.topReasons.join(', ')}`
      );
      sections.push(['RANKED RESULTS:', ...resultLines].join('\n'));
    }
  } else if (page.mode === 'rewrite_explanation') {
    sections.push(`TARGET LEVEL: ${page.targetLevel}`);
    sections.push(`ORIGINAL TEXT:\n${page.originalText}`);
    if (page.product) {
      sections.push([
        'PRODUCT CONTEXT:',
        `- Name: ${page.product.name}`,
        `- Key ingredients: ${page.product.keyIngredients.join(', ')}`,
      ].join('\n'));
    }
  } else if (page.mode === 'curated_recommendation') {
    sections.push([
      'SCANNED PRODUCT:',
      `- Name: ${page.scannedProduct.name}`,
      `- Brand: ${page.scannedProduct.brand}`,
      `- Category: ${page.scannedProduct.category}`,
      `- Key ingredients: ${page.scannedProduct.ingredients.slice(0, 10).join(', ')}`,
    ].join('\n'));
    page.compatibleProducts.forEach((p, i) => {
      sections.push([
        `COMPATIBLE PRODUCT ${i + 1}:`,
        `- ID: ${p.id}`,
        `- Name: ${p.name}`,
        `- Brand: ${p.brand}`,
        `- Category: ${p.category}`,
        `- Key ingredients: ${p.keyIngredients.join(', ')}`,
        `- Match reasons: ${p.matchReasons.join('; ')}`,
      ].join('\n'));
    });
  } else if (page.mode === 'curated_review_summary') {
    const p = page.product;
    sections.push([
      'PRODUCT:',
      `- Name: ${p.name}`,
      `- Brand: ${p.brand}`,
      `- Category: ${p.category}`,
    ].join('\n'));
    sections.push([
      'REVIEW MATCH STATS:',
      `- Total matching reviewers: ${page.matchStats.totalMatching}`,
      `- Average rating from matching reviewers: ${page.matchStats.avgRating.toFixed(1)}/5`,
      `- Positive experience rate: ${page.matchStats.positivePercent}%`,
    ].join('\n'));
    const reviewLines = page.reviews.slice(0, 10).map((r, i) =>
      `  ${i + 1}. Rating: ${r.rating}/5 | Skin: ${r.skinType} | Concerns: ${r.concerns.join(', ')} | Duration: ${r.usageDurationWeeks}wk${r.pros?.length ? ` | Pros: ${r.pros.join(', ')}` : ''}${r.cons?.length ? ` | Cons: ${r.cons.join(', ')}` : ''}`
    );
    sections.push(['MATCHING REVIEWS:', ...reviewLines].join('\n'));
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
      `- ${re.count} people with a similar skin profile`,
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

  if (evidence.reviewSummaryEvidence) {
    const rse = evidence.reviewSummaryEvidence;
    const sentParts = [
      `positive: ${rse.sentimentBreakdown.positive}`,
      `mixed: ${rse.sentimentBreakdown.mixed}`,
      `negative: ${rse.sentimentBreakdown.negative}`,
    ];
    sections.push([
      'REVIEW SUMMARY EVIDENCE:',
      `- Total reviews: ${rse.totalReviews}`,
      `- Average rating: ${rse.averageRating.toFixed(1)}/5`,
      `- Sentiment: ${sentParts.join(', ')}`,
      rse.topPros.length > 0 ? `- Top positives: ${rse.topPros.join('; ')}` : '',
      rse.topCons.length > 0 ? `- Top concerns: ${rse.topCons.join('; ')}` : '',
      `- Average usage: ${rse.averageUsageWeeks} weeks`,
      `- Skin types represented: ${Object.entries(rse.skinTypeDistribution).map(([k, v]) => `${k}(${v})`).join(', ')}`,
    ].filter(Boolean).join('\n'));
  }

  if (evidence.alternativesEvidence) {
    const ae = evidence.alternativesEvidence;
    sections.push([
      'ALTERNATIVES EVIDENCE:',
      `- Source product: ${ae.sourceProductName}`,
      ae.sharedIngredients.length > 0 ? `- Shared ingredients: ${ae.sharedIngredients.join(', ')}` : '',
      ae.sharedConcerns.length > 0 ? `- Shared concerns: ${ae.sharedConcerns.join(', ')}` : '',
      `- Same category: ${ae.categoryMatch ? 'yes' : 'no'}`,
    ].filter(Boolean).join('\n'));
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
    case 'explain_product': return 1024;
    case 'is_it_for_me': return 2048;
    case 'find_alternatives': return 1024;
    case 'review_summary': return 1024;
    case 'natural_discovery': return 768;
    case 'rewrite_explanation': return 1024;
    case 'guided_comparison': return 768;
    case 'guided_routine_build': return 768;
    case 'guided_routine_explain': return 512;
    case 'curated_recommendation': return 512;
    case 'curated_review_summary': return 384;
    case 'retailer_review_summary': return 256;
    default: return 1024;
  }
}

/**
 * Validate an AI response for prohibited language.
 * Returns issues found — empty array means response is safe.
 */
export function validateAIResponse(response: string, mode: AIMode): string[] {
  const issues: string[] = [];

  // Prohibited terms (synced with CLAUDE_PRODUCT.md Section 5)
  const prohibited = [
    'diagnose', 'cure', 'prescribe', 'medical advice', 'clinical result',
    'guaranteed to', 'proven to', 'will fix', 'we recommend this retailer',
  ];
  // "treat" as standalone is normal skincare language ("helps treat acne").
  // Only flag medical-diagnostic patterns like "treat your condition/disease".
  const medicalTreatPattern = /\btreat\s+(your\s+)?(condition|disease|illness|disorder)/i;
  for (const term of prohibited) {
    if (response.toLowerCase().includes(term)) {
      if (term === 'medical advice' && response.toLowerCase().includes('this is not medical advice')) {
        continue;
      }
      issues.push(`Contains prohibited term: "${term}"`);
    }
  }
  if (medicalTreatPattern.test(response)) {
    issues.push('Contains prohibited medical-diagnostic "treat" pattern');
  }

  // Length check per mode
  const maxChars: Partial<Record<AIMode, number>> = {
    product_detail: 600,
    ingredient_detail: 1500,
    routine_builder: 800,
    search: 400,
    comparison: 700,
    marketplace: 500,
    nutrition: 500,
    chat: 3000,
    survey_results: 800,
    explain_product: 800,
    is_it_for_me: 2000,
    find_alternatives: 700,
    review_summary: 700,
    natural_discovery: 500,
    rewrite_explanation: 1000,
    guided_comparison: 800,
    guided_routine_build: 1000,
    guided_routine_explain: 800,
    curated_recommendation: 2500,
    curated_review_summary: 1000,
    retailer_review_summary: 600,
  };

  const limit = maxChars[mode] ?? 1000;
  if (response.length > limit) {
    issues.push(`Response length ${response.length} exceeds limit of ${limit} for mode "${mode}"`);
  }

  return issues;
}
