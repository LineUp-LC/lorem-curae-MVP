/**
 * Skincare Knowledge Base for Lorem Curae AI
 *
 * Provides structured skincare knowledge including ingredients,
 * educational content, FAQ, routine rules, and product metadata.
 * All AI responses must be grounded in this knowledge base.
 */

import { generateEmbedding, cosineSimilarity } from './embeddings';

// ============================================================================
// Types
// ============================================================================

/**
 * Knowledge chunk types
 */
export type KnowledgeType =
  | 'ingredient'
  | 'educational'
  | 'faq'
  | 'routine'
  | 'product'
  | 'concern'
  | 'category';

/**
 * Base knowledge chunk
 */
export interface KnowledgeChunk {
  id: string;
  type: KnowledgeType;
  title: string;
  content: string;
  metadata: {
    topic?: string;
    relatedConcerns?: string[];
    relatedIngredients?: string[];
    relatedCategories?: string[];
    url?: string;
    keywords?: string[];
  };
  vector?: number[];
}

/**
 * Ingredient knowledge
 */
export interface IngredientKnowledge {
  name: string;
  aliases: string[];
  category: 'active' | 'hydrator' | 'antioxidant' | 'exfoliant' | 'sunscreen' | 'soothing' | 'barrier';
  benefits: string[];
  usageGuidelines: string;
  compatibility: {
    worksWellWith: string[];
    avoidWith: string[];
  };
  contraindications: string[];
  concentrationRange: {
    min: number;
    max: number;
    unit: string;
    optimal?: string;
  };
  safetyNotes: string[];
  skinTypes: string[];
  concerns: string[];
}

/**
 * Routine step rule
 */
export interface RoutineRule {
  step: number;
  category: string;
  timing: 'AM' | 'PM' | 'both';
  required: boolean;
  notes: string;
  conflictsWith?: string[];
  layerAfter?: string[];
  layerBefore?: string[];
}

/**
 * FAQ entry
 */
export interface FAQEntry {
  question: string;
  answer: string;
  category: 'shipping' | 'returns' | 'products' | 'account' | 'safety' | 'general';
  keywords: string[];
}

/**
 * Knowledge retrieval result
 */
export interface KnowledgeResult {
  chunk: KnowledgeChunk;
  similarity: number;
  relevance: 'high' | 'medium' | 'low';
}

// ============================================================================
// Ingredient Encyclopedia
// ============================================================================

export const INGREDIENT_ENCYCLOPEDIA: Record<string, IngredientKnowledge> = {
  'niacinamide': {
    name: 'Niacinamide',
    aliases: ['Vitamin B3', 'Nicotinamide'],
    category: 'active',
    benefits: [
      'Reduces appearance of pores',
      'Controls excess oil production',
      'Strengthens skin barrier',
      'Evens skin tone',
      'Reduces redness and blotchiness',
      'Minimizes fine lines',
    ],
    usageGuidelines: 'Can be used morning and evening. Apply after water-based serums but before heavier creams. Start with lower concentrations (2-5%) if new to the ingredient.',
    compatibility: {
      worksWellWith: ['Hyaluronic acid', 'Ceramides', 'Peptides', 'Zinc', 'Salicylic acid'],
      avoidWith: ['Vitamin C (in same routine - can reduce efficacy)'],
    },
    contraindications: ['Rarely causes irritation', 'May cause flushing at high concentrations in some individuals'],
    concentrationRange: { min: 2, max: 10, unit: '%', optimal: '5%' },
    safetyNotes: ['Generally well-tolerated', 'Safe during pregnancy', 'Safe for sensitive skin at lower concentrations'],
    skinTypes: ['oily', 'combination', 'normal', 'dry', 'sensitive'],
    concerns: ['pores', 'oiliness', 'uneven tone', 'redness', 'aging'],
  },
  'retinol': {
    name: 'Retinol',
    aliases: ['Vitamin A', 'Retinoid'],
    category: 'active',
    benefits: [
      'Accelerates cell turnover',
      'Reduces fine lines and wrinkles',
      'Improves skin texture',
      'Fades dark spots',
      'Unclogs pores',
      'Stimulates collagen production',
    ],
    usageGuidelines: 'Use only at night. Start with 2-3 times per week and gradually increase. Always use sunscreen during the day. Apply to dry skin after cleansing.',
    compatibility: {
      worksWellWith: ['Hyaluronic acid', 'Ceramides', 'Peptides', 'Niacinamide'],
      avoidWith: ['Vitamin C', 'AHAs', 'BHAs', 'Benzoyl peroxide'],
    },
    contraindications: ['Not recommended during pregnancy or breastfeeding', 'May cause purging initially', 'Can increase sun sensitivity'],
    concentrationRange: { min: 0.01, max: 1, unit: '%', optimal: '0.3-0.5%' },
    safetyNotes: ['Start low and slow', 'Expect adjustment period', 'Must use SPF daily', 'Not for sensitive or compromised skin initially'],
    skinTypes: ['normal', 'oily', 'combination'],
    concerns: ['aging', 'wrinkles', 'fine lines', 'texture', 'dark spots', 'acne'],
  },
  'vitamin-c': {
    name: 'Vitamin C',
    aliases: ['L-Ascorbic Acid', 'Ascorbyl Glucoside', 'Sodium Ascorbyl Phosphate'],
    category: 'antioxidant',
    benefits: [
      'Brightens skin',
      'Fades dark spots',
      'Protects against environmental damage',
      'Boosts collagen synthesis',
      'Reduces inflammation',
      'Enhances sunscreen protection',
    ],
    usageGuidelines: 'Best used in the morning under sunscreen. Apply to clean, dry skin. Store in a cool, dark place. Replace if product turns brown.',
    compatibility: {
      worksWellWith: ['Vitamin E', 'Ferulic acid', 'Hyaluronic acid'],
      avoidWith: ['Niacinamide (in same routine)', 'Retinol', 'AHAs/BHAs'],
    },
    contraindications: ['May cause tingling on sensitive skin', 'Can oxidize and become ineffective'],
    concentrationRange: { min: 5, max: 20, unit: '%', optimal: '10-15%' },
    safetyNotes: ['Stable forms are gentler', 'L-Ascorbic Acid is most potent but least stable', 'Start with lower concentrations'],
    skinTypes: ['normal', 'oily', 'combination', 'dry'],
    concerns: ['dullness', 'dark spots', 'hyperpigmentation', 'aging', 'uneven tone'],
  },
  'hyaluronic-acid': {
    name: 'Hyaluronic Acid',
    aliases: ['HA', 'Sodium Hyaluronate'],
    category: 'hydrator',
    benefits: [
      'Intense hydration',
      'Plumps skin',
      'Reduces fine lines from dehydration',
      'Improves skin elasticity',
      'Non-comedogenic',
    ],
    usageGuidelines: 'Apply to damp skin for best results. Can be used morning and evening. Layer under moisturizer to seal in hydration.',
    compatibility: {
      worksWellWith: ['Almost all ingredients', 'Vitamin C', 'Retinol', 'Niacinamide', 'Peptides'],
      avoidWith: [],
    },
    contraindications: ['May draw moisture from skin in very dry climates if not sealed with moisturizer'],
    concentrationRange: { min: 0.1, max: 2, unit: '%', optimal: '1%' },
    safetyNotes: ['Very safe for all skin types', 'Safe during pregnancy', 'Multi-weight HA provides best results'],
    skinTypes: ['dry', 'normal', 'oily', 'combination', 'sensitive'],
    concerns: ['dryness', 'dehydration', 'fine lines', 'dullness'],
  },
  'salicylic-acid': {
    name: 'Salicylic Acid',
    aliases: ['BHA', 'Beta Hydroxy Acid'],
    category: 'exfoliant',
    benefits: [
      'Unclogs pores',
      'Reduces blackheads and whiteheads',
      'Anti-inflammatory',
      'Controls oil',
      'Smooths texture',
    ],
    usageGuidelines: 'Start 2-3 times per week. Can be used morning or evening. Follow with hydrating products. Avoid over-exfoliation.',
    compatibility: {
      worksWellWith: ['Niacinamide', 'Hyaluronic acid', 'Ceramides'],
      avoidWith: ['Other exfoliants (AHAs)', 'Retinol (same routine)', 'Vitamin C'],
    },
    contraindications: ['Aspirin allergy', 'Very sensitive skin', 'Compromised skin barrier'],
    concentrationRange: { min: 0.5, max: 2, unit: '%', optimal: '2%' },
    safetyNotes: ['Avoid during pregnancy (consult doctor)', 'Can cause dryness', 'Use SPF'],
    skinTypes: ['oily', 'combination', 'acne-prone'],
    concerns: ['acne', 'blackheads', 'clogged pores', 'oiliness', 'texture'],
  },
  'ceramides': {
    name: 'Ceramides',
    aliases: ['Ceramide NP', 'Ceramide AP', 'Ceramide EOP'],
    category: 'barrier',
    benefits: [
      'Restores skin barrier',
      'Locks in moisture',
      'Protects against environmental damage',
      'Soothes irritation',
      'Reduces sensitivity',
    ],
    usageGuidelines: 'Can be used morning and evening. Works well in moisturizers and serums. Beneficial after using actives.',
    compatibility: {
      worksWellWith: ['All ingredients', 'Especially beneficial with retinol and exfoliants'],
      avoidWith: [],
    },
    contraindications: [],
    concentrationRange: { min: 0.1, max: 3, unit: '%', optimal: '1-3%' },
    safetyNotes: ['Extremely safe', 'Perfect for sensitive skin', 'Safe during pregnancy'],
    skinTypes: ['all', 'especially sensitive', 'dry', 'compromised'],
    concerns: ['sensitivity', 'dryness', 'barrier damage', 'eczema', 'irritation'],
  },
  'glycolic-acid': {
    name: 'Glycolic Acid',
    aliases: ['AHA', 'Alpha Hydroxy Acid'],
    category: 'exfoliant',
    benefits: [
      'Exfoliates dead skin cells',
      'Brightens complexion',
      'Smooths texture',
      'Reduces hyperpigmentation',
      'Stimulates collagen',
    ],
    usageGuidelines: 'Start 1-2 times per week. Use in evening. Always use SPF the next day. Avoid if skin is irritated.',
    compatibility: {
      worksWellWith: ['Hyaluronic acid', 'Niacinamide (different routines)'],
      avoidWith: ['Retinol', 'Vitamin C', 'Other exfoliants', 'BHAs'],
    },
    contraindications: ['Very sensitive skin', 'Sunburned skin', 'Active breakouts (inflamed)'],
    concentrationRange: { min: 5, max: 30, unit: '%', optimal: '5-10% for daily use' },
    safetyNotes: ['Increases sun sensitivity', 'Start with lower concentrations', 'Avoid over-exfoliation'],
    skinTypes: ['normal', 'oily', 'combination'],
    concerns: ['dullness', 'texture', 'dark spots', 'aging', 'uneven tone'],
  },
  'azelaic-acid': {
    name: 'Azelaic Acid',
    aliases: [],
    category: 'active',
    benefits: [
      'Treats acne',
      'Reduces rosacea symptoms',
      'Fades hyperpigmentation',
      'Anti-inflammatory',
      'Antibacterial',
      'Gentle exfoliation',
    ],
    usageGuidelines: 'Can be used morning and evening. Apply after water-based serums. Generally well-tolerated from first use.',
    compatibility: {
      worksWellWith: ['Most ingredients', 'Niacinamide', 'Hyaluronic acid', 'Retinol'],
      avoidWith: [],
    },
    contraindications: [],
    concentrationRange: { min: 10, max: 20, unit: '%', optimal: '15-20%' },
    safetyNotes: ['Safe during pregnancy', 'Gentle enough for sensitive skin', 'May cause mild tingling initially'],
    skinTypes: ['all', 'especially sensitive', 'rosacea-prone'],
    concerns: ['acne', 'rosacea', 'dark spots', 'hyperpigmentation', 'redness'],
  },
  'peptides': {
    name: 'Peptides',
    aliases: ['Matrixyl', 'Argireline', 'Copper Peptides'],
    category: 'active',
    benefits: [
      'Stimulates collagen production',
      'Reduces wrinkles',
      'Improves firmness',
      'Supports skin barrier',
      'Hydrating properties',
    ],
    usageGuidelines: 'Can be used morning and evening. Layer under moisturizer. Consistent use needed for results.',
    compatibility: {
      worksWellWith: ['Hyaluronic acid', 'Niacinamide', 'Ceramides', 'Vitamin C'],
      avoidWith: ['Direct acids (AHAs/BHAs) can break down peptides'],
    },
    contraindications: [],
    concentrationRange: { min: 1, max: 10, unit: '%', optimal: 'varies by peptide type' },
    safetyNotes: ['Very safe', 'No irritation concerns', 'Safe during pregnancy'],
    skinTypes: ['all'],
    concerns: ['aging', 'wrinkles', 'loss of firmness', 'fine lines'],
  },
  'centella-asiatica': {
    name: 'Centella Asiatica',
    aliases: ['Cica', 'Tiger Grass', 'Gotu Kola', 'Madecassoside'],
    category: 'soothing',
    benefits: [
      'Soothes irritation',
      'Reduces redness',
      'Promotes healing',
      'Strengthens barrier',
      'Anti-inflammatory',
      'Antioxidant protection',
    ],
    usageGuidelines: 'Can be used anytime. Excellent for post-procedure care. Layer freely with other products.',
    compatibility: {
      worksWellWith: ['All ingredients'],
      avoidWith: [],
    },
    contraindications: [],
    concentrationRange: { min: 0.1, max: 5, unit: '%', optimal: '1-2%' },
    safetyNotes: ['Extremely gentle', 'Perfect for sensitive and reactive skin', 'Safe during pregnancy'],
    skinTypes: ['all', 'especially sensitive', 'reactive'],
    concerns: ['sensitivity', 'redness', 'irritation', 'barrier damage', 'acne scarring'],
  },
};

// ============================================================================
// Routine Rules
// ============================================================================

export const ROUTINE_RULES: RoutineRule[] = [
  // Morning Routine
  { step: 1, category: 'cleanser', timing: 'both', required: true, notes: 'Gentle cleanser in AM, can double cleanse in PM if wearing makeup/SPF', layerBefore: ['toner', 'serum', 'moisturizer', 'sunscreen'] },
  { step: 2, category: 'toner', timing: 'both', required: false, notes: 'Optional, helps prep skin for serums', layerAfter: ['cleanser'], layerBefore: ['serum', 'moisturizer'] },
  { step: 3, category: 'serum', timing: 'both', required: false, notes: 'Apply thinnest to thickest consistency. Water-based before oil-based.', layerAfter: ['cleanser', 'toner'], layerBefore: ['moisturizer', 'oil', 'sunscreen'] },
  { step: 4, category: 'eye-cream', timing: 'both', required: false, notes: 'Apply before or after moisturizer', layerAfter: ['serum'], layerBefore: ['sunscreen'] },
  { step: 5, category: 'moisturizer', timing: 'both', required: true, notes: 'Seals in previous products, provides hydration', layerAfter: ['serum', 'eye-cream'], layerBefore: ['oil', 'sunscreen'] },
  { step: 6, category: 'oil', timing: 'both', required: false, notes: 'Face oils go last before SPF (AM) or as final step (PM)', layerAfter: ['moisturizer'], layerBefore: ['sunscreen'] },
  { step: 7, category: 'sunscreen', timing: 'AM', required: true, notes: 'Always last step in morning routine. Apply generously.', layerAfter: ['moisturizer', 'oil'] },

  // PM Specific
  { step: 3, category: 'treatment', timing: 'PM', required: false, notes: 'Active treatments like retinol. Apply to dry skin.', layerAfter: ['cleanser', 'toner'], layerBefore: ['moisturizer'], conflictsWith: ['exfoliant'] },
  { step: 3, category: 'exfoliant', timing: 'PM', required: false, notes: 'Chemical exfoliants 2-3x per week max', layerAfter: ['cleanser'], layerBefore: ['serum', 'moisturizer'], conflictsWith: ['treatment', 'retinol'] },
];

export const ROUTINE_CONFLICTS: Array<{ ingredients: string[]; reason: string }> = [
  { ingredients: ['retinol', 'vitamin c'], reason: 'Can cause irritation when used together. Use Vitamin C in AM, Retinol in PM.' },
  { ingredients: ['retinol', 'aha'], reason: 'Both are potent. Alternate nights or use on different days.' },
  { ingredients: ['retinol', 'bha'], reason: 'Both are potent. Alternate nights or use on different days.' },
  { ingredients: ['aha', 'bha'], reason: 'Over-exfoliation risk. Use on alternate days.' },
  { ingredients: ['vitamin c', 'aha'], reason: 'pH conflicts can reduce efficacy. Use in separate routines.' },
  { ingredients: ['vitamin c', 'bha'], reason: 'pH conflicts. Use in separate routines.' },
  { ingredients: ['benzoyl peroxide', 'retinol'], reason: 'Benzoyl peroxide can deactivate retinol.' },
  { ingredients: ['benzoyl peroxide', 'vitamin c'], reason: 'Benzoyl peroxide can oxidize Vitamin C.' },
];

export const LAYERING_ORDER = [
  'cleanser',
  'toner',
  'essence',
  'serum (water-based)',
  'serum (oil-based)',
  'eye cream',
  'moisturizer',
  'face oil',
  'sunscreen (AM only)',
];

// ============================================================================
// FAQ Content
// ============================================================================

export const FAQ_CONTENT: FAQEntry[] = [
  // Shipping
  { question: 'How long does shipping take?', answer: 'Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business day delivery.', category: 'shipping', keywords: ['shipping', 'delivery', 'how long'] },
  { question: 'Do you ship internationally?', answer: 'Currently, we ship within the United States only. International shipping is coming soon.', category: 'shipping', keywords: ['international', 'worldwide', 'outside us'] },
  { question: 'How can I track my order?', answer: 'Once your order ships, you will receive a tracking number via email. You can also view tracking in your account dashboard.', category: 'shipping', keywords: ['track', 'tracking', 'where is my order'] },

  // Returns
  { question: 'What is your return policy?', answer: 'We accept returns within 30 days of purchase for unopened products. Opened products can be returned within 14 days if you experience an adverse reaction.', category: 'returns', keywords: ['return', 'refund', 'policy'] },
  { question: 'How do I initiate a return?', answer: 'Contact our support team or visit your account dashboard to start a return. We will provide a prepaid shipping label.', category: 'returns', keywords: ['return', 'send back', 'initiate'] },
  { question: 'When will I receive my refund?', answer: 'Refunds are processed within 5-7 business days after we receive the returned item.', category: 'returns', keywords: ['refund', 'money back', 'when'] },

  // Products
  { question: 'Are your products cruelty-free?', answer: 'We only feature brands that are certified cruelty-free. We do not sell products tested on animals.', category: 'products', keywords: ['cruelty-free', 'animal testing', 'vegan'] },
  { question: 'Are products safe during pregnancy?', answer: 'Some ingredients like retinoids should be avoided during pregnancy. Always check with your healthcare provider. Products safe for pregnancy are labeled in our catalog.', category: 'safety', keywords: ['pregnancy', 'pregnant', 'safe', 'expecting'] },
  { question: 'How do I know if a product is right for my skin?', answer: 'Complete our skin survey to get personalized recommendations. Our AI assistant can also help you find products that match your skin type and concerns.', category: 'products', keywords: ['right for me', 'skin type', 'match'] },

  // Account
  { question: 'How do I reset my password?', answer: 'Click "Forgot Password" on the login page. You will receive an email with instructions to reset your password.', category: 'account', keywords: ['password', 'reset', 'forgot', 'login'] },
  { question: 'How do I update my skin profile?', answer: 'Go to your account settings and retake the skin survey, or visit the Skin Survey page to update your profile.', category: 'account', keywords: ['update', 'profile', 'skin survey', 'change'] },

  // Safety
  { question: 'What should I do if I have a reaction?', answer: 'Discontinue use immediately. If the reaction is severe, consult a healthcare professional. You may be eligible for a return under our adverse reaction policy.', category: 'safety', keywords: ['reaction', 'allergy', 'irritation', 'rash'] },
  { question: 'How should I patch test?', answer: 'Apply a small amount of product to a discreet area (inner arm or behind ear). Wait 24-48 hours. If no reaction occurs, the product is likely safe for you to use.', category: 'safety', keywords: ['patch test', 'test', 'try'] },
];

// ============================================================================
// Educational Content
// ============================================================================

export const EDUCATIONAL_CONTENT: KnowledgeChunk[] = [
  {
    id: 'edu-skin-barrier',
    type: 'educational',
    title: 'Understanding Your Skin Barrier',
    content: 'The skin barrier (stratum corneum) is the outermost layer of your skin. It protects against environmental damage, prevents water loss, and keeps irritants out. Signs of a damaged barrier include dryness, sensitivity, redness, and increased breakouts. To repair your barrier: simplify your routine, avoid harsh ingredients, use ceramides and hyaluronic acid, and be patient—it takes 2-4 weeks to heal.',
    metadata: {
      topic: 'skin barrier',
      relatedConcerns: ['sensitivity', 'dryness', 'irritation', 'redness'],
      relatedIngredients: ['ceramides', 'hyaluronic acid', 'niacinamide', 'squalane'],
      url: '/learn/skin-barrier',
    },
  },
  {
    id: 'edu-layering',
    type: 'educational',
    title: 'How to Layer Skincare Products',
    content: 'The general rule is thin to thick: apply products from thinnest to thickest consistency. Water-based products go before oil-based ones. A typical order: cleanser, toner, essence, serum (water-based), serum (oil-based), eye cream, moisturizer, face oil, and sunscreen (AM only). Wait 30-60 seconds between layers for better absorption.',
    metadata: {
      topic: 'layering',
      relatedCategories: ['serum', 'moisturizer', 'toner'],
      url: '/learn/layering',
    },
  },
  {
    id: 'edu-retinol-guide',
    type: 'educational',
    title: 'Complete Guide to Retinol',
    content: 'Retinol is a vitamin A derivative that accelerates cell turnover. Start with a low concentration (0.25-0.3%) 2-3 times per week. Apply to dry skin after cleansing. Expect purging for 4-6 weeks. Always use SPF during the day. Avoid during pregnancy. Pair with hydrating ingredients like hyaluronic acid and ceramides to minimize irritation.',
    metadata: {
      topic: 'retinol',
      relatedConcerns: ['aging', 'wrinkles', 'acne', 'texture'],
      relatedIngredients: ['retinol', 'hyaluronic acid', 'ceramides'],
      url: '/learn/retinol',
    },
  },
  {
    id: 'edu-acne-guide',
    type: 'educational',
    title: 'Understanding and Treating Acne',
    content: 'Acne forms when pores become clogged with oil and dead skin cells. Key ingredients for acne: salicylic acid (unclogs pores), benzoyl peroxide (kills bacteria), niacinamide (controls oil), azelaic acid (anti-inflammatory). Avoid: over-cleansing, touching face, harsh scrubs. See a dermatologist for persistent or severe acne.',
    metadata: {
      topic: 'acne',
      relatedConcerns: ['acne', 'breakouts', 'oiliness', 'pores'],
      relatedIngredients: ['salicylic acid', 'benzoyl peroxide', 'niacinamide', 'azelaic acid'],
      url: '/learn/acne',
    },
  },
  {
    id: 'edu-hyperpigmentation',
    type: 'educational',
    title: 'Treating Hyperpigmentation and Dark Spots',
    content: 'Hyperpigmentation is caused by excess melanin production from sun damage, acne, or hormones. Effective ingredients: Vitamin C, niacinamide, alpha arbutin, azelaic acid, retinol, tranexamic acid. Always use SPF 30+ as sun exposure worsens dark spots. Be patient—fading takes 3-6 months of consistent treatment.',
    metadata: {
      topic: 'hyperpigmentation',
      relatedConcerns: ['dark spots', 'hyperpigmentation', 'uneven tone', 'melasma'],
      relatedIngredients: ['vitamin c', 'niacinamide', 'azelaic acid', 'retinol'],
      url: '/learn/hyperpigmentation',
    },
  },
  {
    id: 'edu-sensitive-skin',
    type: 'educational',
    title: 'Caring for Sensitive Skin',
    content: 'Sensitive skin reacts easily to products, environment, or stress. Signs: redness, stinging, dryness, breakouts. Tips: use fragrance-free products, patch test everything, introduce one product at a time, avoid alcohol and harsh surfactants, focus on barrier repair. Soothing ingredients: centella asiatica, aloe vera, oat extract, ceramides.',
    metadata: {
      topic: 'sensitive skin',
      relatedConcerns: ['sensitivity', 'redness', 'irritation'],
      relatedIngredients: ['centella asiatica', 'ceramides', 'aloe vera', 'oat extract'],
      url: '/learn/sensitive-skin',
    },
  },
  {
    id: 'edu-sunscreen-guide',
    type: 'educational',
    title: 'The Complete Sunscreen Guide',
    content: 'Sunscreen is the most important anti-aging product. Use SPF 30+ daily, even indoors and on cloudy days. Apply 2 finger lengths for face. Reapply every 2 hours when outdoors. Chemical sunscreens absorb UV; mineral sunscreens (zinc oxide, titanium dioxide) reflect UV. Both are effective when used correctly.',
    metadata: {
      topic: 'sunscreen',
      relatedConcerns: ['aging', 'dark spots', 'sun damage'],
      relatedIngredients: ['zinc oxide', 'titanium dioxide'],
      relatedCategories: ['sunscreen'],
      url: '/learn/sunscreen',
    },
  },
];

// ============================================================================
// Knowledge Vector Store
// ============================================================================

const KNOWLEDGE_STORE_KEY = 'lorem_curae_knowledge_store';

interface KnowledgeStoreState {
  chunks: KnowledgeChunk[];
  lastUpdated: string;
  version: string;
}

class KnowledgeVectorStore {
  private chunks: Map<string, KnowledgeChunk> = new Map();
  private initialized: boolean = false;

  /**
   * Initialize the knowledge store
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load from localStorage if available
    try {
      const stored = localStorage.getItem(KNOWLEDGE_STORE_KEY);
      if (stored) {
        const state: KnowledgeStoreState = JSON.parse(stored);
        state.chunks.forEach((chunk) => {
          this.chunks.set(chunk.id, chunk);
        });
      }
    } catch (error) {
      console.warn('[KnowledgeStore] Failed to load from localStorage:', error);
    }

    // Ingest built-in knowledge if empty
    if (this.chunks.size === 0) {
      await this.ingestBuiltInKnowledge();
    }

    this.initialized = true;
  }

  /**
   * Ingest all built-in knowledge
   */
  private async ingestBuiltInKnowledge(): Promise<void> {
    // Ingest ingredients
    for (const [key, ingredient] of Object.entries(INGREDIENT_ENCYCLOPEDIA)) {
      const content = `
        ${ingredient.name} (${ingredient.aliases.join(', ')})
        Category: ${ingredient.category}
        Benefits: ${ingredient.benefits.join('. ')}
        Usage: ${ingredient.usageGuidelines}
        Works well with: ${ingredient.compatibility.worksWellWith.join(', ')}
        Avoid with: ${ingredient.compatibility.avoidWith.join(', ') || 'None'}
        Concentration: ${ingredient.concentrationRange.min}-${ingredient.concentrationRange.max}${ingredient.concentrationRange.unit}
        Safety: ${ingredient.safetyNotes.join('. ')}
      `.trim();

      const chunk: KnowledgeChunk = {
        id: `ingredient-${key}`,
        type: 'ingredient',
        title: ingredient.name,
        content,
        metadata: {
          topic: ingredient.name.toLowerCase(),
          relatedConcerns: ingredient.concerns,
          relatedIngredients: [ingredient.name.toLowerCase(), ...ingredient.aliases.map(a => a.toLowerCase())],
          keywords: [...ingredient.benefits, ...ingredient.concerns, ingredient.category],
          url: '/ingredients',
        },
        vector: generateEmbedding(content),
      };
      this.chunks.set(chunk.id, chunk);
    }

    // Ingest educational content
    for (const edu of EDUCATIONAL_CONTENT) {
      const chunk: KnowledgeChunk = {
        ...edu,
        vector: generateEmbedding(`${edu.title} ${edu.content}`),
      };
      this.chunks.set(chunk.id, chunk);
    }

    // Ingest FAQ
    for (let i = 0; i < FAQ_CONTENT.length; i++) {
      const faq = FAQ_CONTENT[i];
      const content = `Question: ${faq.question} Answer: ${faq.answer}`;
      const chunk: KnowledgeChunk = {
        id: `faq-${i}`,
        type: 'faq',
        title: faq.question,
        content,
        metadata: {
          topic: faq.category,
          keywords: faq.keywords,
          url: '/faq',
        },
        vector: generateEmbedding(content),
      };
      this.chunks.set(chunk.id, chunk);
    }

    // Ingest routine rules
    const routineContent = ROUTINE_RULES.map(
      (r) => `Step ${r.step}: ${r.category} (${r.timing}). ${r.notes}`
    ).join(' ');
    const routineChunk: KnowledgeChunk = {
      id: 'routine-rules',
      type: 'routine',
      title: 'Skincare Routine Order',
      content: routineContent,
      metadata: {
        topic: 'routine',
        relatedCategories: ROUTINE_RULES.map((r) => r.category),
        url: '/routines',
      },
      vector: generateEmbedding(routineContent),
    };
    this.chunks.set(routineChunk.id, routineChunk);

    // Ingest conflict rules
    const conflictContent = ROUTINE_CONFLICTS.map(
      (c) => `${c.ingredients.join(' and ')}: ${c.reason}`
    ).join(' ');
    const conflictChunk: KnowledgeChunk = {
      id: 'ingredient-conflicts',
      type: 'routine',
      title: 'Ingredient Conflicts and Layering',
      content: conflictContent,
      metadata: {
        topic: 'conflicts',
        relatedIngredients: ROUTINE_CONFLICTS.flatMap((c) => c.ingredients),
        url: '/routines',
      },
      vector: generateEmbedding(conflictContent),
    };
    this.chunks.set(conflictChunk.id, conflictChunk);

    // Persist
    this.persist();
  }

  /**
   * Persist to localStorage
   */
  private persist(): void {
    try {
      const state: KnowledgeStoreState = {
        chunks: Array.from(this.chunks.values()),
        lastUpdated: new Date().toISOString(),
        version: '1.0',
      };
      localStorage.setItem(KNOWLEDGE_STORE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('[KnowledgeStore] Failed to persist:', error);
    }
  }

  /**
   * Search for relevant knowledge
   */
  async search(
    query: string,
    options: {
      types?: KnowledgeType[];
      limit?: number;
      minSimilarity?: number;
    } = {}
  ): Promise<KnowledgeResult[]> {
    await this.initialize();

    const { types, limit = 5, minSimilarity = 0.1 } = options;
    const queryVector = generateEmbedding(query);

    const results: KnowledgeResult[] = [];

    this.chunks.forEach((chunk) => {
      // Type filter
      if (types && !types.includes(chunk.type)) return;

      // Calculate similarity
      const similarity = chunk.vector
        ? cosineSimilarity(queryVector, chunk.vector)
        : 0;

      if (similarity >= minSimilarity) {
        results.push({
          chunk,
          similarity,
          relevance: similarity > 0.5 ? 'high' : similarity > 0.3 ? 'medium' : 'low',
        });
      }
    });

    // Sort by similarity
    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, limit);
  }

  /**
   * Get ingredient knowledge by name
   */
  getIngredient(name: string): IngredientKnowledge | null {
    const key = name.toLowerCase().replace(/\s+/g, '-');
    return INGREDIENT_ENCYCLOPEDIA[key] || null;
  }

  /**
   * Get routine rules
   */
  getRoutineRules(timing?: 'AM' | 'PM'): RoutineRule[] {
    if (timing) {
      return ROUTINE_RULES.filter((r) => r.timing === timing || r.timing === 'both');
    }
    return ROUTINE_RULES;
  }

  /**
   * Check for ingredient conflicts
   */
  checkConflicts(ingredients: string[]): Array<{ ingredients: string[]; reason: string }> {
    const lowerIngredients = ingredients.map((i) => i.toLowerCase());
    return ROUTINE_CONFLICTS.filter((conflict) =>
      conflict.ingredients.every((ci) =>
        lowerIngredients.some((li) => li.includes(ci) || ci.includes(li))
      )
    );
  }

  /**
   * Get FAQ by category
   */
  getFAQ(category?: FAQEntry['category']): FAQEntry[] {
    if (category) {
      return FAQ_CONTENT.filter((f) => f.category === category);
    }
    return FAQ_CONTENT;
  }
}

// Singleton export
export const knowledgeStore = new KnowledgeVectorStore();

// ============================================================================
// Retrieval Functions
// ============================================================================

/**
 * Initialize knowledge base
 */
export async function initializeKnowledgeBase(): Promise<void> {
  await knowledgeStore.initialize();
}

/**
 * Retrieve relevant knowledge for a query
 */
export async function retrieveKnowledge(
  query: string,
  options?: {
    types?: KnowledgeType[];
    limit?: number;
  }
): Promise<KnowledgeResult[]> {
  return knowledgeStore.search(query, options);
}

/**
 * Get ingredient information
 */
export function getIngredientInfo(ingredient: string): IngredientKnowledge | null {
  return knowledgeStore.getIngredient(ingredient);
}

/**
 * Format knowledge for AI response
 */
export function formatKnowledgeForAI(results: KnowledgeResult[]): string {
  if (results.length === 0) {
    return '';
  }

  return results
    .map((r) => `[${r.chunk.type.toUpperCase()}] ${r.chunk.title}: ${r.chunk.content}`)
    .join('\n\n');
}

/**
 * Get routine guidance
 */
export function getRoutineGuidance(timing: 'AM' | 'PM'): string {
  const rules = knowledgeStore.getRoutineRules(timing);
  const steps = rules
    .sort((a, b) => a.step - b.step)
    .map((r) => `${r.step}. ${r.category}: ${r.notes}`)
    .join('\n');

  return `${timing} Routine Order:\n${steps}`;
}

/**
 * Check ingredient compatibility
 */
export function checkIngredientCompatibility(
  ingredients: string[]
): { compatible: boolean; conflicts: Array<{ ingredients: string[]; reason: string }> } {
  const conflicts = knowledgeStore.checkConflicts(ingredients);
  return {
    compatible: conflicts.length === 0,
    conflicts,
  };
}
