/**
 * Guided Client — Thin API Wrappers for Guided Discovery Modes
 *
 * Each function: build deterministic context → requestAIInsight() → return
 * deterministic data + AI narration result.
 *
 * Guest users receive buildFallbackInsight() via the surfaceClient pipeline.
 */

import { requestAIInsight } from './surfaceClient';
import type { AIInsightResult } from './surfaceClient';
import {
  buildHelpMeChooseContext,
  buildRoutineAssistantContext,
  buildExplainRoutineContext,
  type HelpMeChooseInput,
  type HelpMeChooseResult,
  type DeterministicComparison,
  type BuildRoutineInput,
  type BuildRoutineResult,
  type ExplainRoutineInput,
  type ExplainRoutineResult,
  type RoutineStepAnalysis,
} from './guidedAssistant';
import type { RoutineBuilderResult, IngredientConflict } from './routineBuilder';

// ---------------------------------------------------------------------------
// "Help Me Choose" — product comparison
// ---------------------------------------------------------------------------

export interface HelpMeChooseResponse {
  comparison: DeterministicComparison;
  insight: AIInsightResult;
}

export async function helpMeChoose(
  input: HelpMeChooseInput,
  options?: { skipCache?: boolean },
): Promise<HelpMeChooseResponse> {
  const result: HelpMeChooseResult = buildHelpMeChooseContext(input);

  const insight = await requestAIInsight(result.context, {
    skipCache: options?.skipCache,
    question: 'Compare these products and recommend the best option based on the user profile and deterministic scores provided.',
  });

  return { comparison: result.comparison, insight };
}

// ---------------------------------------------------------------------------
// "Build Me a Routine"
// ---------------------------------------------------------------------------

export interface BuildMeARoutineResponse {
  routine: RoutineBuilderResult;
  conflicts: IngredientConflict[];
  insight: AIInsightResult;
}

export async function buildMeARoutine(
  input: BuildRoutineInput,
  options?: { skipCache?: boolean },
): Promise<BuildMeARoutineResponse> {
  const result: BuildRoutineResult = buildRoutineAssistantContext(input);

  const insight = await requestAIInsight(result.context, {
    skipCache: options?.skipCache,
    question: 'Explain this routine selection — why each product was chosen, note any conflicts, and provide usage tips.',
  });

  return {
    routine: result.routineResult,
    conflicts: result.conflicts,
    insight,
  };
}

// ---------------------------------------------------------------------------
// "Explain My Routine"
// ---------------------------------------------------------------------------

export interface ExplainMyRoutineResponse {
  analysis: RoutineStepAnalysis[];
  conflicts: IngredientConflict[];
  insight: AIInsightResult;
}

export async function explainMyRoutine(
  input: ExplainRoutineInput,
  options?: { skipCache?: boolean },
): Promise<ExplainMyRoutineResponse> {
  const result: ExplainRoutineResult = buildExplainRoutineContext(input);

  const insight = await requestAIInsight(result.context, {
    skipCache: options?.skipCache,
    question: 'Explain each step in this routine — what it does, why it is in this order, and any conflicts or adjustments to consider.',
  });

  return {
    analysis: result.stepAnalysis,
    conflicts: result.conflicts,
    insight,
  };
}
