/**
 * EnvironmentFitModal
 *
 * Structured 4-section modal showing how a product fits the user's
 * current environment. Triggered by the "Learn more" link in the
 * Environment Fit section on the product detail page.
 */

import { useState, useEffect } from 'react';
import type { SeasonalModalContent, UserProfileForModal } from '../../../lib/utils/seasonalModalContent';
import { buildProductFitContext, formatProductFitPrompt } from '../../../lib/utils/seasonalModalContent';
import type { EnvironmentContext } from '../../../lib/environment/context';
import type { Product } from '../../../types/product';
import { requestAIInsight } from '../../../lib/ai/surfaceClient';
import { buildAIContext } from '../../../lib/ai/surfaceContext';
import { useAuth } from '../../../lib/auth/AuthContext';
import { getProductConcernVariations } from '../../../lib/utils/matching';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EnvironmentFitModalProps {
  content: SeasonalModalContent;
  season?: string | null;
  env: EnvironmentContext;
  onClose: () => void;
  onSaveSeasonalNotes?: (current: string, other: string) => void;
  userSkinType?: string;
  /** Product data for AI-assisted product fit generation */
  product?: Product;
  /** Reviewer evidence for AI context */
  reviewerEvidence?: { count: number; sentiment: string; detail?: string } | null;
  /** User profile for AI context */
  userProfile?: UserProfileForModal;
}

// ---------------------------------------------------------------------------
// Highlight helper — wraps key phrases in styled spans for scannability
// ---------------------------------------------------------------------------

/** Skin behavior keywords eligible for Tier 2 highlighting. */
const BEHAVIOR_WORDS = [
  // Multi-word (longest first for matching priority)
  'oilier T-zone', 'T-zone', 'drier areas', 'dry patches', 'rough patches',
  'drier patches', 'more clogged', 'more shine', 'more comfortable',
  'excess oil', 'loses moisture', 'reacts faster', 'mostly balanced',
  'holds up well', 'adjusts well', 'bounces back',
  // Single-word negative / attention-worthy
  'tightness', 'flaking', 'redness', 'irritation', 'stinging',
  'discomfort', 'uncomfortable', 'unsettled', 'dehydrate',
  'clogged', 'shinier', 'tighter', 'drier', 'heavy',
  'uneven', 'rough', 'tight', 'oily', 'shine',
  // Single-word positive / reassuring
  'balanced', 'comfortable', 'calmer', 'soothing', 'hydrated',
  // Anatomical
  'pores', 'cheeks',
];

/** Condition keywords eligible for Tier 2 highlighting in skin impact text. */
const CONDITION_WORDS = [
  'strong sun', 'less intense sun', 'humid weather', 'dry air',
  'oil and sweat', 'dark spots', 'uneven tone', 'cold air',
  'heat', 'sunscreen', 'wind',
  'tight', 'rough', 'oily', 'congested', 'dry',
  'moisture', 'irritated', 'uncomfortable', 'hydrated',
];

const TIER1_CLASS = 'font-semibold text-primary-700';
const TIER2_CLASS = 'font-medium text-primary-700';

/**
 * Wraps matching phrases in styled <span> elements.
 *
 * `priorityPhrases` get Tier 1 styling (brand accent).
 * All other `phrases` get Tier 2 styling (subtle emphasis).
 * Matches longest phrases first; caps at `maxHighlights` per text block.
 */
function highlightPhrases(
  text: string,
  phrases: string[],
  priorityPhrases: string[] = [],
  maxHighlights = 8,
): React.ReactNode {
  const all = [...new Set([...priorityPhrases, ...phrases])].filter(Boolean);
  if (all.length === 0 || !text) return text;

  // Sort longest-first so "oilier T-zone" matches before "T-zone"
  const sorted = all.sort((a, b) => b.length - a.length);
  const escaped = sorted.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');

  const prioritySet = new Set(priorityPhrases.map(p => p.toLowerCase()));
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let highlightCount = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (highlightCount >= maxHighlights) break;
    if (match.index > lastIndex) {
      segments.push(text.slice(lastIndex, match.index));
    }
    const cls = prioritySet.has(match[0].toLowerCase()) ? TIER1_CLASS : TIER2_CLASS;
    segments.push(
      <span key={`hl-${match.index}`} className={cls}>{match[0]}</span>,
    );
    lastIndex = match.index + match[0].length;
    highlightCount++;
  }

  if (lastIndex < text.length) {
    segments.push(text.slice(lastIndex));
  }

  return segments.length > 0 ? <>{segments}</> : text;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function EnvironmentFitModal({
  content,
  season,
  env,
  onClose,
  onSaveSeasonalNotes,
  userSkinType,
  product,
  reviewerEvidence,
  userProfile,
}: EnvironmentFitModalProps) {
  const { user } = useAuth();
  const isGuest = !user;

  // AI-assisted product fit — shows rule-based instantly, replaces with AI on success
  const [aiNarrative, setAiNarrative] = useState<string | null>(null);

  useEffect(() => {
    if (!product) return;

    let cancelled = false;
    (async () => {
      try {
        const fitContext = buildProductFitContext(product, env, userProfile, reviewerEvidence);
        const question = formatProductFitPrompt(fitContext);
        const aiContext = buildAIContext({
          page: { mode: 'product_detail', product },
          environment: env,
        });
        const result = await requestAIInsight(aiContext, { question });
        if (!cancelled && result.success) {
          setAiNarrative(result.insight);
        }
      } catch {
        // Silently fall back to rule-based narrative
      }
    })();

    return () => { cancelled = true; };
  }, [product?.id, env.season, env.uvBand, userSkinType]);

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  // Pre-populate from localStorage if notes exist for this season
  const [feedbackText, setFeedbackText] = useState(() => {
    if (!season) return '';
    try {
      const stored = localStorage.getItem('seasonal_skin_notes');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed[season]?.current || '';
      }
    } catch { /* ignore */ }
    return '';
  });
  const [otherSeasonsText, setOtherSeasonsText] = useState(() => {
    if (!season) return '';
    try {
      const stored = localStorage.getItem('seasonal_skin_notes');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed[season]?.other || '';
      }
    } catch { /* ignore */ }
    return '';
  });

  const handleSaveFeedback = () => {
    if (!season) return;
    onSaveSeasonalNotes?.(feedbackText.trim(), otherSeasonsText.trim());
    setFeedbackSaved(true);
    setTimeout(() => {
      setShowFeedback(false);
      setFeedbackSaved(false);
    }, 1500);
  };

  const { header, skinTypeImpact, productFit, categoryPhrase, texturePhrase, disclaimer, personalized } = content;

  // Highlight keyword assembly — built from user context
  const skinTypeLabel = userSkinType
    ? userSkinType.charAt(0).toUpperCase() + userSkinType.slice(1).toLowerCase() + ' skin'
    : null;
  const seasonLabel = season
    ? season.charAt(0).toUpperCase() + season.slice(1).toLowerCase()
    : null;

  // User concern phrases — expand through synonym map so related terms highlight too
  // e.g., "Uneven Skin Tone" → ["dark spots", "brightening", "discoloration", ...]
  const userConcernPhrases = [
    ...new Set(
      (userProfile?.concerns || []).flatMap(c => getProductConcernVariations(c))
    ),
  ];

  // Lifestyle phrases — map labels to keywords that appear in generated text
  const LIFESTYLE_KEYWORDS: Record<string, string[]> = {
    'screen time heavy': ['screen time', 'skin fatigue'],
    'high stress levels': ['stress', 'reactive'],
    'frequent travel': ['travel', 'changing conditions'],
    'frequently wears makeup': ['makeup', 'layer well'],
    'active lifestyle': ['active lifestyle', 'movement'],
    'outdoor work environment': ['outdoors', 'working outdoors'],
    'indoor work environment': ['indoor', 'recirculated air'],
    'sun exposure daily': ['sun exposure', 'daily sun'],
  };
  const lifestylePhrases = (userProfile?.lifestyle || []).flatMap(
    l => LIFESTYLE_KEYWORDS[l.toLowerCase()] || [l.toLowerCase()],
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Section 1: Seasonal & Environmental Header ── */}
        <div id="section-env-header" className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full">
                <i className={`${header.icon} text-xl text-primary`}></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-deep">
                  {header.seasonLabel && header.locationLabel
                    ? `${header.seasonLabel} in ${header.locationLabel}`
                    : header.seasonLabel
                      ? header.seasonLabel
                      : header.locationLabel
                        ? header.locationLabel
                        : 'Your Environment'}
                </h3>
                <p className="text-xs text-warm-gray">{header.sourceNote}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center text-warm-gray hover:text-deep hover:bg-cream rounded-full transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          {/* Environmental factor badges */}
          {header.environmentalFactors.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {header.environmentalFactors.map((factor) => (
                <div
                  key={factor.label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cream/60 border border-blush/30 rounded-full"
                >
                  <i className={`${factor.icon} text-xs text-primary`}></i>
                  <span className="text-[11px] text-warm-gray">{factor.label}:</span>
                  <span className="text-[11px] font-medium text-deep">{factor.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Skin impact explanation */}
          {header.skinImpact && (
            <p className="text-xs text-warm-gray leading-relaxed">
              {highlightPhrases(header.skinImpact, CONDITION_WORDS, [...userConcernPhrases, ...lifestylePhrases])}
            </p>
          )}
        </div>

        {/* ── Section 1b: Your Skin in This Season ── */}
        {skinTypeImpact && (
          <>
            <div className="border-t border-blush/30" />
            <div id="section-skin-type" className="px-6 py-4">
              <h4 className="text-xs font-semibold text-deep uppercase tracking-wide mb-2">
                {skinTypeLabel && seasonLabel
                  ? `${skinTypeLabel} in ${seasonLabel}`
                  : skinTypeLabel
                    ? skinTypeLabel
                    : seasonLabel
                      ? `Your skin in ${seasonLabel}`
                      : 'Your skin in this season'}
              </h4>
              <p className="text-xs text-warm-gray leading-relaxed">
                {skinTypeImpact.skinTypeLabel ? (
                  <>
                    <span className="font-semibold text-primary-700">{skinTypeImpact.skinTypeLabel}: </span>
                    {highlightPhrases(
                      skinTypeImpact.text,
                      [...(seasonLabel ? [seasonLabel] : []), ...BEHAVIOR_WORDS],
                      [...userConcernPhrases, ...lifestylePhrases],
                    )}
                  </>
                ) : highlightPhrases(
                  skinTypeImpact.text,
                  [...(seasonLabel ? [seasonLabel] : []), ...BEHAVIOR_WORDS],
                  [...(skinTypeLabel ? [skinTypeLabel] : []), ...userConcernPhrases, ...lifestylePhrases],
                )}
              </p>

              {/* Feedback trigger */}
              {!showFeedback && (
                <button
                  onClick={() => setShowFeedback(true)}
                  className="mt-2 text-[11px] text-warm-gray/60 hover:text-primary transition-colors underline underline-offset-2 cursor-pointer"
                >
                  Not quite right?
                </button>
              )}

              {/* Inline feedback expander */}
              {showFeedback && (
                <div className="mt-3 p-3 bg-cream/40 rounded-xl border border-blush/30 space-y-3">
                  <h5 className="text-xs font-semibold text-deep">
                    Help us get it right
                  </h5>

                  <div>
                    <label htmlFor="seasonal-feedback-current" className="block text-[11px] text-warm-gray mb-1">
                      How does your skin usually feel in this weather?
                    </label>
                    <textarea
                      id="seasonal-feedback-current"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value.slice(0, 200))}
                      placeholder="e.g., My skin gets oily in winter even though it's usually dry"
                      rows={2}
                      className="w-full text-xs text-deep bg-white border border-blush/50 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-primary transition-colors placeholder:text-warm-gray/40"
                    />
                    <span className="block text-[10px] text-warm-gray/40 text-right mt-0.5">
                      {feedbackText.length}/200
                    </span>
                  </div>

                  <div>
                    <label htmlFor="seasonal-feedback-other" className="block text-[11px] text-warm-gray mb-1">
                      Does it behave differently in other seasons?
                      <span className="text-warm-gray/40 ml-1">(optional)</span>
                    </label>
                    <textarea
                      id="seasonal-feedback-other"
                      value={otherSeasonsText}
                      onChange={(e) => setOtherSeasonsText(e.target.value.slice(0, 200))}
                      placeholder="e.g., In summer my skin feels balanced"
                      rows={2}
                      className="w-full text-xs text-deep bg-white border border-blush/50 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-primary transition-colors placeholder:text-warm-gray/40"
                    />
                    <span className="block text-[10px] text-warm-gray/40 text-right mt-0.5">
                      {otherSeasonsText.length}/200
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-warm-gray/50 italic max-w-[200px]">
                      This helps personalize your experience. Never share medical information.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowFeedback(false)}
                        className="px-3 py-1.5 text-[11px] text-warm-gray hover:text-deep transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      {feedbackSaved ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-primary">
                          <i className="ri-check-line"></i> Saved
                        </span>
                      ) : (
                        <button
                          onClick={handleSaveFeedback}
                          disabled={feedbackText.trim().length === 0}
                          className={`px-3 py-1.5 text-[11px] font-medium rounded-full transition-all ${
                            feedbackText.trim().length > 0
                              ? 'bg-primary text-white hover:bg-dark cursor-pointer'
                              : 'bg-gray-200 text-warm-gray/60 cursor-not-allowed'
                          }`}
                        >
                          Save
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Section 2: Why This Product Fits ── */}
        <div className="border-t border-blush/30" />
        <div id="section-product-fit" className="px-6 py-4">
          <h4 className="text-xs font-semibold text-deep uppercase tracking-wide mb-3">
            Why this product fits
          </h4>
          {(() => {
            // Use AI narrative when available, otherwise fall back to rule-based
            const narrativeText = aiNarrative || productFit.narrative;
            if (!narrativeText) {
              return (
                <p className="text-xs text-warm-gray italic">
                  No specific product-environment interactions identified for current conditions.
                </p>
              );
            }

            const bullets = narrativeText
              .split(/(?<=\.)\s+/)
              .map(s => s.trim())
              .filter(s => s.length > 0);

            // Priority phrases (Tier 1): skin type, season, location, user concerns, lifestyle
            const fitPriority: string[] = [
              ...(skinTypeLabel ? [skinTypeLabel] : []),
              ...(seasonLabel ? [seasonLabel] : []),
              ...userConcernPhrases,
              ...lifestylePhrases,
            ];
            const loc = env.source !== 'mock' && env.location?.city
              ? [env.location.city, env.location.region].filter(Boolean).join(', ')
              : null;
            if (loc) fitPriority.push(loc);

            // Secondary phrases (Tier 2): referenced ingredients + behavior/condition words
            const fitSecondary: string[] = [
              ...productFit.referencedIngredients,
              ...BEHAVIOR_WORDS,
            ];

            return (
              <ul className="space-y-2">
                {bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <i className={`ri-checkbox-circle-fill text-xs mt-0.5 flex-shrink-0 ${
                      personalized ? 'text-primary' : 'text-warm-gray/40'
                    }`} />
                    <span className={`text-xs leading-relaxed ${
                      personalized ? 'text-deep' : 'text-warm-gray'
                    }`}>
                      {highlightPhrases(bullet, fitSecondary, fitPriority)}
                    </span>
                  </li>
                ))}
              </ul>
            );
          })()}

          {/* Guest nudge — rule-based indicator + sign-in prompt */}
          {isGuest && !aiNarrative && (
            <p className="text-[10px] text-warm-gray/50 mt-3 flex items-center gap-1">
              <i className="ri-information-line text-[10px]" />
              Based on general guidance.
              <button
                onClick={onClose}
                className="text-primary hover:text-dark transition-colors underline underline-offset-2 cursor-pointer"
              >
                Sign in
              </button>
              {' '}for personalized AI insights.
            </p>
          )}
        </div>

        {/* ── Section 4: Additional Insights ── */}
        {(categoryPhrase || texturePhrase || disclaimer) && (
          <>
            <div className="border-t border-blush/30" />
            <div id="section-insights" className="px-6 py-4">
              {(categoryPhrase || texturePhrase) && (
                <>
                  <h4 className="text-xs font-semibold text-deep uppercase tracking-wide mb-2">
                    Additional insights
                  </h4>
                  <div className="space-y-2 mb-3">
                    {categoryPhrase && (
                      <p className="text-xs text-warm-gray leading-relaxed">
                        {categoryPhrase.charAt(0).toUpperCase() + categoryPhrase.slice(1)}.
                      </p>
                    )}
                    {texturePhrase && (
                      <p className="text-xs text-warm-gray leading-relaxed">
                        {texturePhrase.charAt(0).toUpperCase() + texturePhrase.slice(1)}.
                      </p>
                    )}
                  </div>
                </>
              )}
              <p className="text-[10px] text-warm-gray/60 italic">
                {disclaimer}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
