/**
 * GuidedAssistantPanel — Shared UI panel for guided discovery modes.
 *
 * Modal overlay for the 3 guided assistant flows:
 * - "Help Me Choose" (product comparison)
 * - "Build Me a Routine" (routine builder)
 * - "Explain My Routine" (routine explainer)
 *
 * Data flow: follow-up questions → deterministic scoring → AI narration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NeuralBloomIcon from '../icons/NeuralBloomIcon';
import {
  createGuidedConversation,
  addTurn,
  updateAccumulatedContext,
  loadActiveConversation,
  completeConversation,
  type GuidedAssistantMode,
  type GuidedConversationState,
  type GuidedAccumulatedContext,
} from '../../lib/ai/conversationState';
import {
  generateFollowUpQuestion,
  type DeterministicComparison,
  type RoutineStepAnalysis,
} from '../../lib/ai/guidedAssistant';
import {
  helpMeChoose,
  buildMeARoutine,
  explainMyRoutine,
} from '../../lib/ai/guidedClient';
import type { AIInsightResult } from '../../lib/ai/surfaceClient';
import type { RoutineBuilderResult, IngredientConflict } from '../../lib/ai/routineBuilder';
import type { Product } from '../../types/product';
import {
  getEffectiveSkinType,
  getEffectiveConcerns,
  getEffectivePreferences,
} from '../../lib/utils/sessionState';
import { useEnvironmentContext } from '../../lib/environment/useEnvironmentContext';
import { highlightRelevantKeywords } from '../../lib/utils/highlightKeywords';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GuidedAssistantPanelProps {
  mode: GuidedAssistantMode;
  initialProductIds?: number[];
  initialProducts?: Product[];
  initialTiming?: 'am' | 'pm' | 'both';
  onClose: () => void;
  onNavigateToProduct?: (productId: number) => void;
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

type PanelPhase = 'asking' | 'loading' | 'results' | 'error';

interface ResultData {
  insight: AIInsightResult;
  comparison?: DeterministicComparison;
  routine?: RoutineBuilderResult;
  conflicts?: IngredientConflict[];
  stepAnalysis?: RoutineStepAnalysis[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GuidedAssistantPanel({
  mode,
  initialProductIds,
  initialProducts,
  initialTiming,
  onClose,
  onNavigateToProduct,
}: GuidedAssistantPanelProps) {
  const navigate = useNavigate();
  const environment = useEnvironmentContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Conversation state
  const [conversation, setConversation] = useState<GuidedConversationState>(() => {
    const existing = loadActiveConversation(mode);
    if (existing) return existing;
    const fresh = createGuidedConversation(mode);
    // Seed accumulated context from session state
    const skinType = getEffectiveSkinType();
    const concerns = getEffectiveConcerns();
    const patch: Partial<GuidedAccumulatedContext> = {};
    if (skinType) patch.skinType = skinType;
    if (concerns.length > 0) patch.concerns = concerns;
    if (initialProductIds) patch.selectedProductIds = initialProductIds;
    if (initialTiming) patch.routineTiming = initialTiming;
    return updateAccumulatedContext(fresh, patch);
  });

  const [phase, setPhase] = useState<PanelPhase>('asking');
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [freeTextInput, setFreeTextInput] = useState('');

  // Profile data for highlighting
  const hlProfile = {
    skinType: getEffectiveSkinType(),
    concerns: getEffectiveConcerns(),
    sensitivity: undefined as string | undefined,
    excludeNames: [] as string[],
  };

  // Scroll to bottom when conversation updates
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [conversation.turns, phase]);

  // Get follow-up question
  const followUp = generateFollowUpQuestion(mode, conversation);

  // Auto-execute when all required fields are populated
  useEffect(() => {
    if (!followUp && phase === 'asking' && conversation.turns.length === 0 && !resultData) {
      executeAssistant();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followUp]);

  // Handle follow-up option selection
  const handleOptionSelect = useCallback((option: string) => {
    // Map option to accumulated context
    const patch: Partial<GuidedAccumulatedContext> = {};

    if (mode === 'help_me_choose') {
      if (!conversation.accumulatedContext.skinType) {
        patch.skinType = option.toLowerCase();
      } else if (!conversation.accumulatedContext.concerns || conversation.accumulatedContext.concerns.length === 0) {
        patch.concerns = [option];
      }
    } else if (mode === 'build_routine') {
      if (!conversation.accumulatedContext.routineTiming) {
        const timingMap: Record<string, 'am' | 'pm' | 'both'> = {
          'Morning': 'am', 'Evening': 'pm', 'Both': 'both',
        };
        patch.routineTiming = timingMap[option] ?? 'am';
      } else if (!conversation.accumulatedContext.routineStyle) {
        const styleMap: Record<string, 'minimalist' | 'moderate' | 'advanced'> = {
          'Minimalist (3-4)': 'minimalist', 'Moderate (5-6)': 'moderate', 'Advanced (7+)': 'advanced',
        };
        patch.routineStyle = styleMap[option] ?? 'moderate';
      }
    } else if (mode === 'explain_routine') {
      if (!conversation.accumulatedContext.routineTiming) {
        patch.routineTiming = option === 'Morning' ? 'am' : 'pm';
      } else if (!conversation.accumulatedContext.tonePreference) {
        const toneMap: Record<string, 'simple' | 'detailed' | 'science'> = {
          'Simple': 'simple', 'Detailed': 'detailed', 'Science-level': 'science',
        };
        patch.tonePreference = toneMap[option] ?? 'simple';
      }
    }

    // Add user turn and update context
    let updated = addTurn(conversation, { role: 'user', content: option });
    updated = updateAccumulatedContext(updated, patch);
    setConversation(updated);

    // Check if we now have all required fields
    const nextFollowUp = generateFollowUpQuestion(mode, updated);
    if (!nextFollowUp) {
      executeAssistantWithState(updated);
    }
  }, [conversation, mode]);

  // Handle free-text submission
  const handleFreeTextSubmit = useCallback(() => {
    if (!freeTextInput.trim()) return;
    const updated = addTurn(conversation, { role: 'user', content: freeTextInput.trim() });
    setConversation(updated);
    setFreeTextInput('');
    // Re-execute with latest context
    executeAssistantWithState(updated);
  }, [conversation, freeTextInput]);

  // Execute the assistant
  const executeAssistant = useCallback(() => {
    executeAssistantWithState(conversation);
  }, [conversation]);

  const executeAssistantWithState = useCallback(async (state: GuidedConversationState) => {
    setPhase('loading');
    setErrorMessage('');

    const ctx = state.accumulatedContext;
    const userConcerns = ctx.concerns ?? getEffectiveConcerns();
    const userSkinType = ctx.skinType ?? getEffectiveSkinType();
    const userPreferences = getEffectivePreferences();
    const turns = state.turns;

    try {
      if (mode === 'help_me_choose') {
        const response = await helpMeChoose({
          productIds: ctx.selectedProductIds ?? initialProductIds ?? [],
          userConcerns,
          userSkinType: userSkinType ?? undefined,
          userPreferences,
          environment,
          conversationTurns: turns,
          accumulatedContext: ctx,
        });

        const insightText = response.insight.success
          ? (response.insight as { insight: string }).insight
          : 'Based on the comparison scores above, the highlighted product best matches your profile.';

        const updated = addTurn(state, {
          role: 'assistant',
          content: insightText,
          data: { comparison: response.comparison },
        });
        setConversation(updated);
        setResultData({ insight: response.insight, comparison: response.comparison });
        setPhase('results');
      } else if (mode === 'build_routine') {
        const response = await buildMeARoutine({
          timing: ctx.routineTiming ?? initialTiming ?? 'am',
          style: ctx.routineStyle ?? 'moderate',
          userConcerns,
          userSkinType: userSkinType ?? undefined,
          userPreferences,
          budget: ctx.budget,
          environment,
          conversationTurns: turns,
          accumulatedContext: ctx,
        });

        const insightText = response.insight.success
          ? (response.insight as { insight: string }).insight
          : 'Your routine has been built based on your preferences and skin profile.';

        const updated = addTurn(state, {
          role: 'assistant',
          content: insightText,
          data: { routine: response.routine, conflicts: response.conflicts },
        });
        setConversation(updated);
        setResultData({ insight: response.insight, routine: response.routine, conflicts: response.conflicts });
        setPhase('results');
      } else if (mode === 'explain_routine') {
        const response = await explainMyRoutine({
          products: initialProducts ?? [],
          timing: (ctx.routineTiming === 'both' ? 'am' : ctx.routineTiming) ?? 'am',
          toneLevel: ctx.tonePreference ?? 'simple',
          userSkinType: userSkinType ?? undefined,
          userConcerns,
          environment,
          conversationTurns: turns,
        });

        const insightText = response.insight.success
          ? (response.insight as { insight: string }).insight
          : 'Here is a step-by-step breakdown of your routine.';

        const updated = addTurn(state, {
          role: 'assistant',
          content: insightText,
          data: { stepAnalysis: response.analysis, conflicts: response.conflicts },
        });
        setConversation(updated);
        setResultData({ insight: response.insight, stepAnalysis: response.analysis, conflicts: response.conflicts });
        setPhase('results');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
      setPhase('error');
    }
  }, [mode, initialProductIds, initialProducts, initialTiming, environment]);

  // Start over
  const handleStartOver = useCallback(() => {
    completeConversation(conversation);
    const fresh = createGuidedConversation(mode);
    setConversation(fresh);
    setResultData(null);
    setPhase('asking');
    setErrorMessage('');
    setFreeTextInput('');
  }, [conversation, mode]);

  // Navigate to product
  const handleProductClick = useCallback((productId: number) => {
    if (onNavigateToProduct) {
      onNavigateToProduct(productId);
    } else {
      navigate(`/product-detail/${productId}`);
    }
    onClose();
  }, [navigate, onClose, onNavigateToProduct]);

  // Close via escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-blush px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-primary/10 rounded-full">
              <NeuralBloomIcon size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-deep">
                {getModeTitle(mode)}
              </h2>
              <p className="text-xs text-warm-gray">
                {getModeSubtitle(mode)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-warm-gray hover:text-deep hover:bg-cream rounded-full transition-all cursor-pointer"
            aria-label="Close"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Conversation thread */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Past turns */}
          {conversation.turns.map((turn, i) => (
            <div key={i} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  turn.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-cream/60 text-deep border border-blush/30 rounded-bl-md'
                }`}
              >
                {turn.role === 'assistant'
                  ? highlightRelevantKeywords(turn.content, hlProfile)
                  : turn.content}
              </div>
            </div>
          ))}

          {/* Loading state */}
          {phase === 'loading' && (
            <div className="flex justify-start">
              <div className="bg-cream/60 border border-blush/30 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-sm text-warm-gray">Analyzing...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {phase === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-error-warning-line text-red-500"></i>
                <span className="text-sm font-medium text-red-700">Something went wrong</span>
              </div>
              <p className="text-xs text-red-600 mb-3">{errorMessage}</p>
              <button
                onClick={executeAssistant}
                className="text-xs font-medium text-primary hover:text-dark transition-colors cursor-pointer"
              >
                Try again
              </button>
            </div>
          )}

          {/* Results: mode-specific rendering */}
          {phase === 'results' && resultData && (
            <div className="space-y-3">
              {/* Comparison results */}
              {mode === 'help_me_choose' && resultData.comparison && (
                <ComparisonResults
                  comparison={resultData.comparison}
                  onProductClick={handleProductClick}
                />
              )}

              {/* Routine build results */}
              {mode === 'build_routine' && resultData.routine && (
                <RoutineBuildResults
                  routine={resultData.routine}
                  conflicts={resultData.conflicts ?? []}
                  timing={conversation.accumulatedContext.routineTiming ?? 'am'}
                  onProductClick={handleProductClick}
                />
              )}

              {/* Routine explain results */}
              {mode === 'explain_routine' && resultData.stepAnalysis && (
                <RoutineExplainResults
                  steps={resultData.stepAnalysis}
                  conflicts={resultData.conflicts ?? []}
                  onProductClick={handleProductClick}
                />
              )}
            </div>
          )}

          {/* Follow-up question chips */}
          {phase === 'asking' && followUp && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-deep">{followUp.question}</p>
              {followUp.options && (
                <div className="flex flex-wrap gap-2">
                  {followUp.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(option)}
                      className="px-4 py-2 bg-cream/80 hover:bg-primary/10 border border-blush hover:border-primary/30 rounded-full text-sm text-deep font-medium transition-all cursor-pointer"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-blush px-5 py-3 rounded-b-2xl">
          {phase === 'results' ? (
            <div className="flex items-center justify-between">
              <button
                onClick={handleStartOver}
                className="text-sm text-warm-gray hover:text-deep transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <i className="ri-refresh-line"></i>
                Start over
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-dark transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : phase === 'asking' && !followUp ? (
            /* Free text input when no follow-up is pending */
            <form
              onSubmit={(e) => { e.preventDefault(); handleFreeTextSubmit(); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={freeTextInput}
                onChange={(e) => setFreeTextInput(e.target.value)}
                placeholder="Ask a follow-up..."
                className="flex-1 px-4 py-2.5 border border-blush rounded-full text-sm focus:border-primary focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!freeTextInput.trim()}
                className="w-9 h-9 flex items-center justify-center bg-primary text-white rounded-full hover:bg-dark transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <i className="ri-send-plane-fill text-sm"></i>
              </button>
            </form>
          ) : (
            <div className="text-center">
              <button
                onClick={handleStartOver}
                className="text-xs text-warm-gray hover:text-deep transition-colors cursor-pointer"
              >
                Start over
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mode-specific result sub-components
// ---------------------------------------------------------------------------

function ComparisonResults({
  comparison,
  onProductClick,
}: {
  comparison: DeterministicComparison;
  onProductClick: (id: number) => void;
}) {
  const { products, attributes, recommendation } = comparison;

  return (
    <div className="space-y-3">
      {/* Comparison table */}
      <div className="bg-cream/30 border border-blush/40 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-blush/30">
              <th className="text-left px-3 py-2 text-warm-gray font-medium"></th>
              {products.map((p) => (
                <th key={p.id} className="text-center px-2 py-2">
                  <button
                    onClick={() => onProductClick(p.id)}
                    className="text-primary font-semibold hover:underline cursor-pointer text-xs"
                  >
                    {p.name}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attributes.map((attr, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : ''}>
                <td className="px-3 py-2 text-warm-gray font-medium whitespace-nowrap">{attr.label}</td>
                {products.map((p) => (
                  <td key={p.id} className="text-center px-2 py-2 text-deep">
                    <span className={attr.winner === p.id ? 'font-semibold text-primary' : ''}>
                      {attr.values[p.id] ?? '-'}
                    </span>
                    {attr.winner === p.id && (
                      <i className="ri-check-line text-primary ml-1 text-[10px]"></i>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Winner badge */}
      {recommendation && (
        <div className="bg-light/20 border border-primary/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <i className="ri-award-line text-primary text-base"></i>
            <span className="text-xs font-semibold text-deep">Best match for your profile</span>
          </div>
          <button
            onClick={() => onProductClick(recommendation.productId)}
            className="text-sm font-semibold text-primary hover:underline cursor-pointer"
          >
            {products.find(p => p.id === recommendation.productId)?.name}
          </button>
          {recommendation.reasons.length > 0 && (
            <ul className="mt-1.5 space-y-0.5">
              {recommendation.reasons.map((r, i) => (
                <li key={i} className="text-xs text-warm-gray flex items-start gap-1.5">
                  <i className="ri-checkbox-circle-fill text-primary text-[10px] mt-0.5 flex-shrink-0"></i>
                  {r}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function RoutineBuildResults({
  routine,
  conflicts,
  timing,
  onProductClick,
}: {
  routine: RoutineBuilderResult;
  conflicts: IngredientConflict[];
  timing: 'am' | 'pm' | 'both';
  onProductClick: (id: number) => void;
}) {
  const activeRoutine = timing === 'pm' ? routine.pm : routine.am;
  const filledSteps = activeRoutine.steps.filter(s => s.product);

  return (
    <div className="space-y-3">
      {/* Step cards */}
      <div className="space-y-2">
        {filledSteps.map((step, i) => (
          <div key={i} className="bg-cream/30 border border-blush/40 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-warm-gray uppercase tracking-wide">
                  {step.category}
                </p>
                {step.product && (
                  <button
                    onClick={() => onProductClick(step.product!.productId)}
                    className="text-sm font-semibold text-deep hover:text-primary transition-colors cursor-pointer truncate block"
                  >
                    {step.product.name}
                  </button>
                )}
                {step.product && (
                  <p className="text-xs text-warm-gray">{step.product.brand}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-alert-line text-amber-600"></i>
            <span className="text-xs font-semibold text-amber-800">Ingredient conflicts</span>
          </div>
          <ul className="space-y-1.5">
            {conflicts.map((c, i) => (
              <li key={i} className="text-xs text-amber-700">
                <span className="font-medium">{c.ingredients.join(' + ')}</span>: {c.reason}
                {c.resolution && (
                  <span className="text-amber-600 block mt-0.5">{c.resolution}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RoutineExplainResults({
  steps,
  conflicts,
  onProductClick,
}: {
  steps: RoutineStepAnalysis[];
  conflicts: IngredientConflict[];
  onProductClick: (id: number) => void;
}) {
  return (
    <div className="space-y-3">
      {/* Step analysis */}
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.step} className="bg-cream/30 border border-blush/40 rounded-xl p-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">{step.step}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-warm-gray uppercase tracking-wide">
                  {step.role}
                </p>
                <button
                  onClick={() => onProductClick(step.product.id)}
                  className="text-sm font-semibold text-deep hover:text-primary transition-colors cursor-pointer truncate block"
                >
                  {step.product.name}
                </button>
                <p className="text-xs text-warm-gray mt-0.5">{step.keyBenefit}</p>
                {step.layeringNote && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <i className="ri-information-line text-[10px]"></i>
                    {step.layeringNote}
                  </p>
                )}
                {step.conflictNote && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <i className="ri-alert-line text-[10px]"></i>
                    {step.conflictNote}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Conflicts summary */}
      {conflicts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-alert-line text-amber-600"></i>
            <span className="text-xs font-semibold text-amber-800">Conflicts detected</span>
          </div>
          <ul className="space-y-1.5">
            {conflicts.map((c, i) => (
              <li key={i} className="text-xs text-amber-700">
                <span className="font-medium">{c.ingredients.join(' + ')}</span>: {c.reason}
                {c.resolution && (
                  <span className="text-amber-600 block mt-0.5">{c.resolution}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getModeTitle(mode: GuidedAssistantMode): string {
  switch (mode) {
    case 'help_me_choose': return 'Help Me Choose';
    case 'build_routine': return 'Build Me a Routine';
    case 'explain_routine': return 'Explain My Routine';
  }
}

function getModeSubtitle(mode: GuidedAssistantMode): string {
  switch (mode) {
    case 'help_me_choose': return 'Compare products for your skin';
    case 'build_routine': return 'Personalized routine builder';
    case 'explain_routine': return 'Understand each step';
  }
}
