/**
 * Response Structuring & Output Formatting Intelligence for Lorem Curae AI
 *
 * Ensures all responses are clear, structured, scannable, and aligned
 * with Curae's communication style. Provides templates and formatters
 * for consistent presentation across all content types.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Content type that determines formatting template
 */
export type ContentType =
  | 'ingredient'
  | 'product'
  | 'concern'
  | 'routine'
  | 'comparison'
  | 'troubleshooting'
  | 'safety'
  | 'educational'
  | 'recommendation'
  | 'general';

/**
 * Section in a structured response
 */
export interface ResponseSection {
  heading?: string;
  content: string;
  isBulleted?: boolean;
  isNumbered?: boolean;
  items?: string[];
}

/**
 * Ingredient explanation structure
 */
export interface IngredientExplanation {
  name: string;
  whatItDoes: string;
  whyItFits?: string;
  compatibilityNotes?: string;
  howToUse?: string;
  safetyNotes?: string;
  link?: string;
}

/**
 * Product explanation structure
 */
export interface ProductExplanation {
  name: string;
  brand?: string;
  whatItIs: string;
  keyIngredients?: string[];
  whyItFits?: string;
  howToUse?: string;
  safetyNotes?: string;
  link?: string;
}

/**
 * Concern explanation structure
 */
export interface ConcernExplanation {
  name: string;
  definition: string;
  commonCauses?: string[];
  recommendedIngredients?: string[];
  recommendedCategories?: string[];
  routineGuidance?: string;
  link?: string;
}

/**
 * Routine step structure
 */
export interface RoutineStep {
  step: number;
  category: string;
  productName?: string;
  note?: string;
  link?: string;
}

/**
 * Routine structure
 */
export interface RoutineFormat {
  timing: 'am' | 'pm';
  steps: RoutineStep[];
  notes?: string[];
}

/**
 * Comparison item structure
 */
export interface ComparisonItem {
  name: string;
  strength?: string;
  texture?: string;
  purpose?: string;
  bestFor?: string;
  pros?: string[];
  cons?: string[];
}

/**
 * Troubleshooting structure
 */
export interface TroubleshootingFormat {
  issue: string;
  likelyCauses: string[];
  adjustments: string[];
  alternatives?: string[];
  links?: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Maximum line lengths for readability
 */
export const FORMAT_LIMITS = {
  paragraphLines: 4,
  bulletPointLength: 120,
  headingLength: 50,
  maxBulletsPerSection: 6,
  maxStepsInRoutine: 8,
} as const;

/**
 * Standard section headings
 */
export const SECTION_HEADINGS = {
  ingredient: {
    whatItDoes: 'What it does',
    whyItFits: 'Why it fits you',
    compatibility: 'Compatibility',
    howToUse: 'How to use',
    safetyNotes: 'Safety notes',
    learnMore: 'Learn more',
  },
  product: {
    whatItIs: 'What it is',
    keyIngredients: 'Key ingredients',
    whyItFits: 'Why it fits you',
    howToUse: 'How to use',
    safetyNotes: 'Safety notes',
    viewProduct: 'View product',
  },
  concern: {
    about: 'About',
    causes: 'Common causes',
    ingredients: 'Recommended ingredients',
    products: 'Recommended products',
    routine: 'Routine guidance',
    learnMore: 'Learn more',
  },
  routine: {
    am: 'AM Routine',
    pm: 'PM Routine',
    tips: 'Tips',
    notes: 'Notes',
  },
  troubleshooting: {
    issue: 'The issue',
    causes: 'Likely causes',
    adjustments: 'What to try',
    alternatives: 'Alternatives',
  },
} as const;

// ============================================================================
// CORE FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format a heading (bold)
 */
export function formatHeading(text: string): string {
  return `**${text}**`;
}

/**
 * Format a subheading
 */
export function formatSubheading(text: string): string {
  return `**${text}**`;
}

/**
 * Format a bullet list
 */
export function formatBulletList(items: string[]): string {
  return items.map(item => `- ${item}`).join('\n');
}

/**
 * Format a numbered list
 */
export function formatNumberedList(items: string[]): string {
  return items.map((item, i) => `${i + 1}. ${item}`).join('\n');
}

/**
 * Format an inline link
 */
export function formatInlineLink(label: string, url: string): string {
  return `[${label}](${url})`;
}

/**
 * Format bold text
 */
export function formatBold(text: string): string {
  return `**${text}**`;
}

/**
 * Format a key-value pair
 */
export function formatKeyValue(key: string, value: string): string {
  return `**${key}:** ${value}`;
}

/**
 * Format a short paragraph (ensures brevity)
 */
export function formatParagraph(text: string, maxSentences: number = 3): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, maxSentences).join(' ');
}

/**
 * Add spacing between sections
 */
export function addSectionSpacing(sections: string[]): string {
  return sections.filter(Boolean).join('\n\n');
}

// ============================================================================
// CONTENT-SPECIFIC FORMATTERS
// ============================================================================

/**
 * Format an ingredient explanation
 */
export function formatIngredientExplanation(data: IngredientExplanation): string {
  const sections: string[] = [];

  // What it does
  sections.push(`${formatHeading(SECTION_HEADINGS.ingredient.whatItDoes)}\n${data.whatItDoes}`);

  // Why it fits (if personalized)
  if (data.whyItFits) {
    sections.push(`${formatHeading(SECTION_HEADINGS.ingredient.whyItFits)}\n${data.whyItFits}`);
  }

  // Compatibility notes
  if (data.compatibilityNotes) {
    sections.push(`${formatHeading(SECTION_HEADINGS.ingredient.compatibility)}\n${data.compatibilityNotes}`);
  }

  // How to use
  if (data.howToUse) {
    sections.push(`${formatHeading(SECTION_HEADINGS.ingredient.howToUse)}\n${data.howToUse}`);
  }

  // Safety notes
  if (data.safetyNotes) {
    sections.push(`${formatHeading(SECTION_HEADINGS.ingredient.safetyNotes)}\n${data.safetyNotes}`);
  }

  // Link
  if (data.link) {
    sections.push(`${SECTION_HEADINGS.ingredient.learnMore}: ${formatInlineLink(data.name, data.link)}`);
  }

  return addSectionSpacing(sections);
}

/**
 * Format a product explanation
 */
export function formatProductExplanation(data: ProductExplanation): string {
  const sections: string[] = [];

  // Product title
  const title = data.brand ? `${data.brand} ${data.name}` : data.name;
  sections.push(formatHeading(title));

  // What it is
  sections.push(`${formatSubheading(SECTION_HEADINGS.product.whatItIs)}\n${data.whatItIs}`);

  // Key ingredients
  if (data.keyIngredients && data.keyIngredients.length > 0) {
    sections.push(`${formatSubheading(SECTION_HEADINGS.product.keyIngredients)}\n${formatBulletList(data.keyIngredients)}`);
  }

  // Why it fits
  if (data.whyItFits) {
    sections.push(`${formatSubheading(SECTION_HEADINGS.product.whyItFits)}\n${data.whyItFits}`);
  }

  // How to use
  if (data.howToUse) {
    sections.push(`${formatSubheading(SECTION_HEADINGS.product.howToUse)}\n${data.howToUse}`);
  }

  // Safety notes
  if (data.safetyNotes) {
    sections.push(`${formatSubheading(SECTION_HEADINGS.product.safetyNotes)}\n${data.safetyNotes}`);
  }

  // Link
  if (data.link) {
    sections.push(`${SECTION_HEADINGS.product.viewProduct}: ${formatInlineLink(title, data.link)}`);
  }

  return addSectionSpacing(sections);
}

/**
 * Format a concern explanation
 */
export function formatConcernExplanation(data: ConcernExplanation): string {
  const sections: string[] = [];

  // Definition
  sections.push(`${formatHeading(data.name)}\n${data.definition}`);

  // Common causes
  if (data.commonCauses && data.commonCauses.length > 0) {
    sections.push(`${formatSubheading(SECTION_HEADINGS.concern.causes)}\n${formatBulletList(data.commonCauses)}`);
  }

  // Recommended ingredients
  if (data.recommendedIngredients && data.recommendedIngredients.length > 0) {
    sections.push(`${formatSubheading(SECTION_HEADINGS.concern.ingredients)}\n${formatBulletList(data.recommendedIngredients)}`);
  }

  // Recommended categories
  if (data.recommendedCategories && data.recommendedCategories.length > 0) {
    sections.push(`${formatSubheading(SECTION_HEADINGS.concern.products)}\n${formatBulletList(data.recommendedCategories)}`);
  }

  // Routine guidance
  if (data.routineGuidance) {
    sections.push(`${formatSubheading(SECTION_HEADINGS.concern.routine)}\n${data.routineGuidance}`);
  }

  // Link
  if (data.link) {
    sections.push(`${SECTION_HEADINGS.concern.learnMore}: ${formatInlineLink(data.name, data.link)}`);
  }

  return addSectionSpacing(sections);
}

/**
 * Format a routine
 */
export function formatRoutine(routines: RoutineFormat[]): string {
  const sections: string[] = [];

  for (const routine of routines) {
    const heading = routine.timing === 'am'
      ? SECTION_HEADINGS.routine.am
      : SECTION_HEADINGS.routine.pm;

    const steps = routine.steps.map(step => {
      let stepText = `${step.category}`;
      if (step.productName) {
        stepText = `${step.category}: ${step.productName}`;
      }
      if (step.link) {
        stepText = `${step.category}: ${formatInlineLink(step.productName || step.category, step.link)}`;
      }
      if (step.note) {
        stepText += ` — ${step.note}`;
      }
      return stepText;
    });

    sections.push(`${formatHeading(heading)}\n${formatNumberedList(steps)}`);

    if (routine.notes && routine.notes.length > 0) {
      sections.push(`${formatSubheading(SECTION_HEADINGS.routine.notes)}\n${formatBulletList(routine.notes)}`);
    }
  }

  return addSectionSpacing(sections);
}

/**
 * Format a comparison
 */
export function formatComparison(
  items: ComparisonItem[],
  recommendation?: { item: string; reason: string }
): string {
  const sections: string[] = [];

  for (const item of items) {
    const bullets: string[] = [];

    if (item.strength) bullets.push(`Strength: ${item.strength}`);
    if (item.texture) bullets.push(`Texture: ${item.texture}`);
    if (item.purpose) bullets.push(`Purpose: ${item.purpose}`);
    if (item.bestFor) bullets.push(`Best for: ${item.bestFor}`);
    if (item.pros && item.pros.length > 0) bullets.push(`Pros: ${item.pros.join(', ')}`);
    if (item.cons && item.cons.length > 0) bullets.push(`Cons: ${item.cons.join(', ')}`);

    sections.push(`${formatHeading(item.name)}\n${formatBulletList(bullets)}`);
  }

  if (recommendation) {
    sections.push(`${formatHeading('Recommendation')}\n${formatBold(recommendation.item)} — ${recommendation.reason}`);
  }

  return addSectionSpacing(sections);
}

/**
 * Format troubleshooting response
 */
export function formatTroubleshooting(data: TroubleshootingFormat): string {
  const sections: string[] = [];

  // Issue
  sections.push(`${formatHeading(SECTION_HEADINGS.troubleshooting.issue)}\n${data.issue}`);

  // Likely causes
  if (data.likelyCauses.length > 0) {
    sections.push(`${formatHeading(SECTION_HEADINGS.troubleshooting.causes)}\n${formatBulletList(data.likelyCauses)}`);
  }

  // Adjustments
  if (data.adjustments.length > 0) {
    sections.push(`${formatHeading(SECTION_HEADINGS.troubleshooting.adjustments)}\n${formatNumberedList(data.adjustments)}`);
  }

  // Alternatives
  if (data.alternatives && data.alternatives.length > 0) {
    sections.push(`${formatHeading(SECTION_HEADINGS.troubleshooting.alternatives)}\n${formatBulletList(data.alternatives)}`);
  }

  return addSectionSpacing(sections);
}

/**
 * Format a safety note
 */
export function formatSafetyNote(warning: string, suggestion?: string): string {
  let note = `⚠️ ${warning}`;
  if (suggestion) {
    note += ` ${suggestion}`;
  }
  return note;
}

/**
 * Format a quick recommendation list
 */
export function formatRecommendationList(
  items: Array<{ name: string; reason: string; link?: string }>
): string {
  return items.map((item, i) => {
    const name = item.link ? formatInlineLink(item.name, item.link) : formatBold(item.name);
    return `${i + 1}. ${name} — ${item.reason}`;
  }).join('\n');
}

// ============================================================================
// RESPONSE STRUCTURE HELPERS
// ============================================================================

/**
 * Build a structured response from sections
 */
export function buildStructuredResponse(sections: ResponseSection[]): string {
  return sections.map(section => {
    let content = '';

    if (section.heading) {
      content += formatHeading(section.heading) + '\n';
    }

    if (section.items && section.items.length > 0) {
      if (section.isNumbered) {
        content += formatNumberedList(section.items);
      } else if (section.isBulleted) {
        content += formatBulletList(section.items);
      }
    } else {
      content += section.content;
    }

    return content;
  }).join('\n\n');
}

/**
 * Ensure response doesn't exceed reasonable length
 */
export function trimResponse(response: string, maxParagraphs: number = 6): string {
  const paragraphs = response.split('\n\n');
  if (paragraphs.length <= maxParagraphs) {
    return response;
  }
  return paragraphs.slice(0, maxParagraphs).join('\n\n') + '\n\n...';
}

/**
 * Add a closing call-to-action
 */
export function addClosingCTA(response: string, cta: string): string {
  return `${response}\n\n${cta}`;
}

/**
 * Format a simple answer with optional follow-up
 */
export function formatSimpleAnswer(answer: string, followUp?: string): string {
  if (followUp) {
    return `${answer}\n\n${followUp}`;
  }
  return answer;
}

// ============================================================================
// TEMPLATE DETECTION
// ============================================================================

/**
 * Detect which formatting template to use based on content type
 */
export function detectContentType(
  intent: string,
  hasProducts?: boolean,
  hasIngredients?: boolean,
  hasConcerns?: boolean,
  isRoutine?: boolean
): ContentType {
  if (isRoutine || intent.includes('routine')) {
    return 'routine';
  }
  if (intent.includes('compare') || intent.includes('vs') || intent.includes('versus')) {
    return 'comparison';
  }
  if (intent.includes('trouble') || intent.includes('problem') || intent.includes('issue') || intent.includes('not working')) {
    return 'troubleshooting';
  }
  if (intent.includes('safe') || intent.includes('conflict') || intent.includes('together')) {
    return 'safety';
  }
  if (hasIngredients && !hasProducts) {
    return 'ingredient';
  }
  if (hasProducts) {
    return 'product';
  }
  if (hasConcerns) {
    return 'concern';
  }
  if (intent.includes('learn') || intent.includes('explain') || intent.includes('how does')) {
    return 'educational';
  }
  if (intent.includes('recommend') || intent.includes('suggest') || intent.includes('find')) {
    return 'recommendation';
  }
  return 'general';
}

// ============================================================================
// FORMATTING CONTEXT FOR AI
// ============================================================================

/**
 * Generate formatting instructions for AI based on content type
 */
export function getFormattingInstructions(contentType: ContentType): string {
  switch (contentType) {
    case 'ingredient':
      return 'Format with sections: What it does, Why it fits you, How to use, Safety notes. Include ingredient page link.';

    case 'product':
      return 'Format with sections: What it is, Key ingredients, Why it fits you, How to use. Include product page link.';

    case 'concern':
      return 'Format with sections: Definition, Common causes, Recommended ingredients, Routine guidance. Include learn page link.';

    case 'routine':
      return 'Use AM/PM headings with numbered steps. Keep each step short. Include product links and safety notes.';

    case 'comparison':
      return 'Use bullet points for each item. Highlight differences in strength, texture, purpose. End with clear recommendation.';

    case 'troubleshooting':
      return 'Format with sections: The issue, Likely causes, What to try, Alternatives. Use numbered steps for solutions.';

    case 'safety':
      return 'Keep safety notes short and clear. Highlight conflicts. Suggest safer alternatives. Avoid medical language.';

    case 'educational':
      return 'Use clear headings. Keep paragraphs short. Use bullets for lists. Include relevant links.';

    case 'recommendation':
      return 'Use numbered list. Include product name, brief reason, and link for each recommendation.';

    default:
      return 'Use short paragraphs. Use bullets when listing. Bold key terms. Include relevant links at end.';
  }
}

// ============================================================================
// CONSTANTS EXPORT
// ============================================================================

/**
 * Response formatting principles
 */
export const FORMATTING_PRINCIPLES = {
  structure: [
    'Use clear headings or sections',
    'Keep paragraphs to 2-4 lines',
    'Use bullet points for lists',
    'Use numbered steps for routines',
    'Bold key concepts',
  ],
  clarity: [
    'No walls of text',
    'No overly long explanations',
    'No redundant restatements',
    'Scannable at a glance',
    'Actionable information first',
  ],
  consistency: [
    'Follow template for content type',
    'Use standard section headings',
    'Place links at end of sentences',
    'Maintain warm, expert tone',
    'Keep formatting predictable',
  ],
  integration: [
    'Match formatting to intent',
    'Include personalization in "Why it fits"',
    'Add safety notes when relevant',
    'Include navigation links',
    'Support multi-turn context',
  ],
} as const;
