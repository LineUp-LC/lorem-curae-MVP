/**
 * Conversation State Manager for Guided Assistants
 *
 * Manages multi-turn conversation state for Phase 6 guided discovery flows:
 * - "Help Me Choose" (product comparison)
 * - "Build Me a Routine" (routine builder)
 * - "Explain My Routine" (routine explainer)
 *
 * All state is local-only (localStorage). Max 5 turn pairs per conversation.
 * 24-hour expiry on persisted conversations.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GuidedAssistantMode = 'help_me_choose' | 'build_routine' | 'explain_routine';

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  /** Deterministic data attached to assistant turns (scores, products, conflicts) */
  data?: Record<string, unknown>;
}

export interface GuidedAccumulatedContext {
  skinType?: string;
  concerns?: string[];
  budget?: 'budget' | 'mid' | 'premium';
  category?: string;
  selectedProductIds?: number[];
  routineTiming?: 'am' | 'pm' | 'both';
  routineStyle?: 'minimalist' | 'moderate' | 'advanced';
  tonePreference?: 'simple' | 'detailed' | 'science';
  followUpAnswers: Record<string, string>;
}

export interface GuidedConversationState {
  id: string;
  mode: GuidedAssistantMode;
  turns: ConversationTurn[];
  accumulatedContext: GuidedAccumulatedContext;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_TURN_PAIRS = 5;
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const STORAGE_PREFIX = 'guided-conv:';
const ACTIVE_PREFIX = 'guided-conv-active:';

// ---------------------------------------------------------------------------
// State CRUD
// ---------------------------------------------------------------------------

export function createGuidedConversation(mode: GuidedAssistantMode): GuidedConversationState {
  const now = new Date().toISOString();
  const state: GuidedConversationState = {
    id: `${mode}-${Date.now()}`,
    mode,
    turns: [],
    accumulatedContext: { followUpAnswers: {} },
    status: 'active',
    startedAt: now,
    updatedAt: now,
  };
  saveGuidedConversation(state);
  return state;
}

export function addTurn(
  state: GuidedConversationState,
  turn: Omit<ConversationTurn, 'timestamp'>,
): GuidedConversationState {
  const newTurn: ConversationTurn = {
    ...turn,
    timestamp: new Date().toISOString(),
  };

  const updated = { ...state, turns: [...state.turns, newTurn] };

  // Enforce max turn pairs — drop oldest pair when exceeded
  while (updated.turns.length > MAX_TURN_PAIRS * 2) {
    // Remove the first two entries (one user + one assistant pair)
    updated.turns = updated.turns.slice(2);
  }

  updated.updatedAt = new Date().toISOString();
  saveGuidedConversation(updated);
  return updated;
}

export function getRecentTurns(
  state: GuidedConversationState,
  count: number = MAX_TURN_PAIRS,
): ConversationTurn[] {
  const maxMessages = count * 2;
  return state.turns.slice(-maxMessages);
}

export function updateAccumulatedContext(
  state: GuidedConversationState,
  patch: Partial<GuidedAccumulatedContext>,
): GuidedConversationState {
  const updated: GuidedConversationState = {
    ...state,
    accumulatedContext: {
      ...state.accumulatedContext,
      ...patch,
      followUpAnswers: {
        ...state.accumulatedContext.followUpAnswers,
        ...(patch.followUpAnswers || {}),
      },
    },
    updatedAt: new Date().toISOString(),
  };
  saveGuidedConversation(updated);
  return updated;
}

export function completeConversation(state: GuidedConversationState): GuidedConversationState {
  const updated: GuidedConversationState = {
    ...state,
    status: 'completed',
    updatedAt: new Date().toISOString(),
  };
  saveGuidedConversation(updated);
  clearActiveConversation(state.mode);
  return updated;
}

export function abandonConversation(state: GuidedConversationState): GuidedConversationState {
  const updated: GuidedConversationState = {
    ...state,
    status: 'abandoned',
    updatedAt: new Date().toISOString(),
  };
  saveGuidedConversation(updated);
  return updated;
}

// ---------------------------------------------------------------------------
// localStorage Persistence
// ---------------------------------------------------------------------------

export function saveGuidedConversation(state: GuidedConversationState): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + state.id, JSON.stringify(state));
    if (state.status === 'active') {
      localStorage.setItem(ACTIVE_PREFIX + state.mode, state.id);
    }
  } catch {
    // localStorage full or unavailable — silent fail
  }
}

export function loadGuidedConversation(id: string): GuidedConversationState | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + id);
    if (!raw) return null;

    const state: GuidedConversationState = JSON.parse(raw);

    // Check expiry
    const age = Date.now() - new Date(state.updatedAt).getTime();
    if (age > EXPIRY_MS) {
      clearGuidedConversation(id);
      return null;
    }

    return state;
  } catch {
    return null;
  }
}

export function loadActiveConversation(mode: GuidedAssistantMode): GuidedConversationState | null {
  try {
    const id = localStorage.getItem(ACTIVE_PREFIX + mode);
    if (!id) return null;

    const state = loadGuidedConversation(id);
    if (!state || state.status !== 'active') {
      clearActiveConversation(mode);
      return null;
    }

    return state;
  } catch {
    return null;
  }
}

export function clearGuidedConversation(id: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + id);
    if (raw) {
      const state: GuidedConversationState = JSON.parse(raw);
      clearActiveConversation(state.mode);
    }
    localStorage.removeItem(STORAGE_PREFIX + id);
  } catch {
    // silent fail
  }
}

export function clearAllGuidedConversations(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(STORAGE_PREFIX) || key.startsWith(ACTIVE_PREFIX))) {
        keys.push(key);
      }
    }
    keys.forEach(key => localStorage.removeItem(key));
  } catch {
    // silent fail
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function clearActiveConversation(mode: GuidedAssistantMode): void {
  try {
    localStorage.removeItem(ACTIVE_PREFIX + mode);
  } catch {
    // silent fail
  }
}
