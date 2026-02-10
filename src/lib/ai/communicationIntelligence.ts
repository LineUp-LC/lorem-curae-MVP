/**
 * Tone, Style & Communication Intelligence for Lorem Curae AI
 *
 * Manages how the AI communicates with users - adapting tone, style,
 * and explanations based on user preferences and emotional signals.
 */

// ============================================================================
// USER TONE DETECTION
// ============================================================================

/**
 * Detected user communication style
 */
export type UserTone =
  | 'casual'      // Relaxed, informal language
  | 'formal'      // Professional, polished language
  | 'confused'    // Uncertain, asking for clarification
  | 'excited'     // Enthusiastic, positive energy
  | 'frustrated'  // Annoyed, seeking solutions
  | 'anxious'     // Worried, needs reassurance
  | 'neutral';    // Standard, balanced communication

/**
 * Tone detection patterns
 */
const TONE_PATTERNS: Record<UserTone, RegExp[]> = {
  casual: [
    /\b(hey|hi|yo|sup|gonna|wanna|kinda|sorta|lol|haha|omg|tbh|ngl|idk)\b/i,
    /!{2,}/,  // Multiple exclamation marks
    /\b(awesome|cool|nice|great|love it)\b/i,
  ],
  formal: [
    /\b(please|kindly|would you|could you|I would appreciate|thank you for)\b/i,
    /\b(regarding|concerning|inquire|assistance|recommend)\b/i,
    /\b(I am|I have been|I would like)\b/i,
  ],
  confused: [
    /\b(confused|don't understand|what does|how does|not sure|lost|help me understand)\b/i,
    /\?{2,}/,  // Multiple question marks
    /\b(wait|huh|what\?|so basically|explain|clarify)\b/i,
  ],
  excited: [
    /!{1,}/,
    /\b(excited|can't wait|amazing|love|obsessed|finally|yay|so happy)\b/i,
    /\b(omg|wow|incredible|fantastic|perfect)\b/i,
  ],
  frustrated: [
    /\b(frustrated|annoyed|tired of|sick of|nothing works|waste|disappointed|ugh)\b/i,
    /\b(why doesn't|why won't|still|keeps|won't stop|never)\b/i,
    /\b(given up|hopeless|at a loss)\b/i,
  ],
  anxious: [
    /\b(worried|nervous|scared|afraid|anxious|concerned|freaking out)\b/i,
    /\b(is it normal|should I be worried|is this bad|will it|could it)\b/i,
    /\b(panic|stress|fear|alarmed)\b/i,
  ],
  neutral: [],  // Default fallback
};

/**
 * Detect user's communication tone from message
 */
export function detectUserTone(message: string): UserTone {
  const scores: Record<UserTone, number> = {
    casual: 0,
    formal: 0,
    confused: 0,
    excited: 0,
    frustrated: 0,
    anxious: 0,
    neutral: 0,
  };

  // Score each tone based on pattern matches
  for (const [tone, patterns] of Object.entries(TONE_PATTERNS) as [UserTone, RegExp[]][]) {
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        scores[tone] += 1;
      }
    }
  }

  // Find highest scoring tone
  let maxTone: UserTone = 'neutral';
  let maxScore = 0;

  for (const [tone, score] of Object.entries(scores) as [UserTone, number][]) {
    if (score > maxScore) {
      maxScore = score;
      maxTone = tone;
    }
  }

  return maxTone;
}

// ============================================================================
// RESPONSE TONE ADAPTATION
// ============================================================================

/**
 * AI response tone style
 */
export interface ResponseStyle {
  formality: 'casual' | 'balanced' | 'polished';
  enthusiasm: 'calm' | 'warm' | 'energetic';
  reassurance: 'minimal' | 'moderate' | 'high';
  complexity: 'simple' | 'balanced' | 'detailed';
}

/**
 * Get appropriate response style based on user tone
 */
export function getResponseStyle(userTone: UserTone): ResponseStyle {
  switch (userTone) {
    case 'casual':
      return {
        formality: 'casual',
        enthusiasm: 'warm',
        reassurance: 'minimal',
        complexity: 'simple',
      };

    case 'formal':
      return {
        formality: 'polished',
        enthusiasm: 'calm',
        reassurance: 'minimal',
        complexity: 'detailed',
      };

    case 'confused':
      return {
        formality: 'balanced',
        enthusiasm: 'warm',
        reassurance: 'moderate',
        complexity: 'simple',
      };

    case 'excited':
      return {
        formality: 'casual',
        enthusiasm: 'energetic',
        reassurance: 'minimal',
        complexity: 'balanced',
      };

    case 'frustrated':
      return {
        formality: 'balanced',
        enthusiasm: 'calm',
        reassurance: 'high',
        complexity: 'simple',
      };

    case 'anxious':
      return {
        formality: 'balanced',
        enthusiasm: 'warm',
        reassurance: 'high',
        complexity: 'simple',
      };

    case 'neutral':
    default:
      return {
        formality: 'balanced',
        enthusiasm: 'warm',
        reassurance: 'minimal',
        complexity: 'balanced',
      };
  }
}

// ============================================================================
// TONE ADAPTATION INSTRUCTIONS
// ============================================================================

/**
 * Generate tone adaptation instructions for the AI
 */
export function generateToneInstructions(userTone: UserTone): string {
  const style = getResponseStyle(userTone);
  const instructions: string[] = [];

  // Formality guidance
  switch (style.formality) {
    case 'casual':
      instructions.push('Use friendly, conversational language. Contractions are fine.');
      break;
    case 'polished':
      instructions.push('Use professional, polished language with clear structure.');
      break;
    case 'balanced':
      instructions.push('Use warm but professional language.');
      break;
  }

  // Enthusiasm guidance
  switch (style.enthusiasm) {
    case 'energetic':
      instructions.push('Match their positive energy while staying grounded.');
      break;
    case 'calm':
      instructions.push('Keep a steady, reassuring pace.');
      break;
    case 'warm':
      instructions.push('Be supportive and encouraging.');
      break;
  }

  // Reassurance guidance
  switch (style.reassurance) {
    case 'high':
      instructions.push('Provide extra validation and reassurance. Normalize their experience.');
      break;
    case 'moderate':
      instructions.push('Offer gentle reassurance where appropriate.');
      break;
    case 'minimal':
      // No additional instruction needed
      break;
  }

  // Complexity guidance
  switch (style.complexity) {
    case 'simple':
      instructions.push('Keep explanations simple and step-by-step. Avoid jargon.');
      break;
    case 'detailed':
      instructions.push('Provide thorough explanations with context.');
      break;
    case 'balanced':
      instructions.push('Balance clarity with helpful detail.');
      break;
  }

  // Tone-specific additions
  switch (userTone) {
    case 'frustrated':
      instructions.push('Acknowledge their frustration briefly, then focus on actionable solutions.');
      instructions.push('Stay calm and solution-oriented. Do not mirror negative emotions.');
      break;
    case 'anxious':
      instructions.push('Validate their concern, then provide clear, reassuring guidance.');
      instructions.push('Avoid alarming language. Focus on what they can do.');
      break;
    case 'confused':
      instructions.push('Break down complex concepts into digestible pieces.');
      instructions.push('Offer to clarify further if needed.');
      break;
    case 'excited':
      instructions.push('Share in their enthusiasm appropriately.');
      instructions.push('Channel energy toward helpful next steps.');
      break;
  }

  return instructions.join(' ');
}

// ============================================================================
// EXPLANATION FORMATTING
// ============================================================================

/**
 * Explanation complexity level
 */
export type ExplanationLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Format an explanation based on user's experience level
 */
export function formatExplanation(
  concept: string,
  details: string,
  level: ExplanationLevel
): string {
  switch (level) {
    case 'beginner':
      return `${concept} — ${details} Start simple and adjust as your skin responds.`;

    case 'intermediate':
      return `${concept}: ${details}`;

    case 'advanced':
      return `${concept}: ${details} You can adjust based on your routine and tolerance.`;

    default:
      return `${concept}: ${details}`;
  }
}

// ============================================================================
// EMPATHY RESPONSES
// ============================================================================

/**
 * Empathy response templates by concern type
 */
const EMPATHY_TEMPLATES: Record<string, string[]> = {
  frustration: [
    'That can be really frustrating.',
    'I understand—it takes time to find what works.',
    'Skincare is a process, and setbacks happen.',
  ],
  confusion: [
    'This can definitely feel overwhelming at first.',
    'There\'s a lot of information out there—let me simplify.',
    'It\'s completely normal to have questions about this.',
  ],
  anxiety: [
    'That\'s a common concern, and you\'re not alone.',
    'Let me help put your mind at ease.',
    'Many people experience this—here\'s what typically helps.',
  ],
  excitement: [
    'That\'s a great step forward.',
    'Sounds like you\'re on the right track.',
    'It\'s exciting when things start clicking.',
  ],
  disappointment: [
    'It can be discouraging when products don\'t work out.',
    'Finding the right routine takes some trial and adjustment.',
    'Let\'s see if we can find a better fit.',
  ],
};

/**
 * Get an empathy response for the given emotion
 */
export function getEmpathyResponse(emotion: keyof typeof EMPATHY_TEMPLATES): string {
  const templates = EMPATHY_TEMPLATES[emotion];
  if (!templates || templates.length === 0) {
    return '';
  }
  // Return first template (deterministic for testing)
  return templates[0];
}

/**
 * Generate a supportive opening based on user tone
 */
export function generateSupportiveOpening(userTone: UserTone): string {
  switch (userTone) {
    case 'frustrated':
      return getEmpathyResponse('frustration');
    case 'confused':
      return getEmpathyResponse('confusion');
    case 'anxious':
      return getEmpathyResponse('anxiety');
    case 'excited':
      return getEmpathyResponse('excitement');
    default:
      return '';
  }
}

// ============================================================================
// INSTRUCTION FORMATTING
// ============================================================================

/**
 * Instruction style options
 */
export interface InstructionOptions {
  includeFrequency?: boolean;
  includeSafetyNote?: boolean;
  includeAlternative?: boolean;
  experienceLevel?: ExplanationLevel;
}

/**
 * Format a skincare instruction with appropriate guidance
 */
export function formatInstruction(
  action: string,
  frequency?: string,
  safetyNote?: string,
  alternative?: string,
  options: InstructionOptions = {}
): string {
  const parts: string[] = [action];

  if (frequency && options.includeFrequency !== false) {
    parts.push(frequency);
  }

  if (safetyNote && options.includeSafetyNote !== false) {
    parts.push(safetyNote);
  }

  if (alternative && options.includeAlternative) {
    parts.push(`Alternatively, ${alternative.toLowerCase()}`);
  }

  return parts.join(' ');
}

// ============================================================================
// MEDICAL REDIRECT DETECTION
// ============================================================================

/**
 * Patterns that suggest user needs medical advice
 */
const MEDICAL_REDIRECT_PATTERNS = [
  /\b(diagnosed|diagnosis|prescription|prescribe|doctor said|dermatologist said)\b/i,
  /\b(infection|infected|allergic reaction|severe|emergency|bleeding)\b/i,
  /\b(eczema|psoriasis|rosacea|dermatitis|cyst|mole|lesion)\b/i,
  /\b(medication|drug interaction|antibiotic|steroid|accutane|tretinoin prescription)\b/i,
  /\b(should I see a doctor|is this serious|medical advice|professional help)\b/i,
];

/**
 * Check if message requires medical redirect
 */
export function requiresMedicalRedirect(message: string): boolean {
  return MEDICAL_REDIRECT_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Generate medical redirect message
 */
export function generateMedicalRedirect(concern: string): string {
  return `For ${concern}, I'd recommend consulting a dermatologist who can evaluate your specific situation. In the meantime, I can share general skincare guidance that may help.`;
}

// ============================================================================
// COMMUNICATION CONTEXT BUILDER
// ============================================================================

/**
 * Full communication context for AI response generation
 */
export interface CommunicationContext {
  userTone: UserTone;
  responseStyle: ResponseStyle;
  toneInstructions: string;
  supportiveOpening: string;
  needsMedicalRedirect: boolean;
  experienceLevel: ExplanationLevel;
}

/**
 * Build complete communication context from user message
 */
export function buildCommunicationContext(
  message: string,
  experienceLevel: ExplanationLevel = 'intermediate'
): CommunicationContext {
  const userTone = detectUserTone(message);
  const responseStyle = getResponseStyle(userTone);
  const toneInstructions = generateToneInstructions(userTone);
  const supportiveOpening = generateSupportiveOpening(userTone);
  const needsMedicalRedirect = requiresMedicalRedirect(message);

  return {
    userTone,
    responseStyle,
    toneInstructions,
    supportiveOpening,
    needsMedicalRedirect,
    experienceLevel,
  };
}

/**
 * Format communication context for system prompt injection
 */
export function formatCommunicationContextForPrompt(
  context: CommunicationContext
): string {
  const parts: string[] = [];

  parts.push(`## Detected User Tone: ${context.userTone}`);
  parts.push(`\n${context.toneInstructions}`);

  if (context.supportiveOpening) {
    parts.push(`\nConsider opening with empathy: "${context.supportiveOpening}"`);
  }

  if (context.needsMedicalRedirect) {
    parts.push('\n**Important:** This message may require a medical redirect. Suggest consulting a dermatologist while providing general skincare guidance only.');
  }

  const formalityMap = {
    casual: 'friendly and conversational',
    balanced: 'warm but professional',
    polished: 'professional and polished',
  };

  const enthusiasmMap = {
    calm: 'steady and reassuring',
    warm: 'supportive and encouraging',
    energetic: 'positive and engaging',
  };

  parts.push(`\nResponse style: ${formalityMap[context.responseStyle.formality]}, ${enthusiasmMap[context.responseStyle.enthusiasm]}.`);

  return parts.join('');
}

// ============================================================================
// CORE COMMUNICATION PRINCIPLES
// ============================================================================

/**
 * Core communication principles for reference
 */
export const COMMUNICATION_PRINCIPLES = {
  tone: [
    'Warm, supportive, and approachable',
    'Expert but not clinical',
    'Clear, concise, and easy to understand',
    'Non-judgmental and encouraging',
    'Confident but never absolute',
    'Skincare-focused and grounded in retrieved knowledge',
  ],
  avoid: [
    'Medical language or diagnoses',
    'Fear-based messaging',
    'Overly casual slang',
    'Robotic or overly formal tone',
    'Over-promising results',
    'Emotional dependency language',
  ],
  empathy: [
    'Validate feelings without over-personalizing',
    'Normalize experiences without minimizing',
    'Provide reassurance through action',
    'Offer clear next steps',
  ],
  safety: [
    'No medical claims',
    'No emotional counseling',
    'No diagnosing conditions',
    'No guaranteed results',
    'Redirect medical questions appropriately',
  ],
} as const;
