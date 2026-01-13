// Session-level state management for personalized prototype experience
import React from 'react';

interface SessionState {
  userId: string;
  sessionId: string;
  startTime: number;
  interactions: Interaction[];
  preferences: UserPreferences;
  context: SessionContext;
  // New: temporary skin data for anonymous users
  tempSkinType?: string;
  tempConcerns?: string[];
  // New: authenticated user data
  user?: AuthenticatedUser;
}

interface AuthenticatedUser {
  id: string;
  email: string;
  full_name: string;
  skin_type?: string;
  concerns?: string[];
  preferences?: Record<string, any>;
  lifestyle?: Record<string, any>;
}

interface Interaction {
  timestamp: number;
  type: 'click' | 'input' | 'navigation' | 'selection' | 'completion';
  target: string;
  data?: any;
}

interface UserPreferences {
  skinType?: string;
  concerns?: string[];
  goals?: string[];
  sensitivities?: string[];
  routinePreference?: 'minimal' | 'moderate' | 'extensive';
  budgetRange?: 'budget' | 'mid' | 'luxury';
  aiTone?: 'friendly' | 'professional' | 'concise';
}

interface SessionContext {
  currentPage: string;
  visitedPages: string[];
  completedActions: string[];
  searchHistory: string[];
  viewedProducts: string[];
  savedItems: string[];
  quizProgress?: any;
  routineSteps?: any[];
  lastVisitedPage?: string;
  lastVisitedAt?: number;
}

class SessionStateManager {
  private state: SessionState;
  private listeners: Set<(state: SessionState) => void> = new Set();

  constructor() {
    this.state = this.loadState() || this.initializeState();
    this.startSession();
  }

  private initializeState(): SessionState {
    return {
      userId: this.generateId(),
      sessionId: this.generateId(),
      startTime: Date.now(),
      interactions: [],
      preferences: {},
      context: {
        currentPage: '/',
        visitedPages: [],
        completedActions: [],
        searchHistory: [],
        viewedProducts: [],
        savedItems: [],
        lastVisitedPage: undefined,
        lastVisitedAt: undefined,
      },
      tempSkinType: undefined,
      tempConcerns: undefined,
      user: undefined,
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadState(): SessionState | null {
    try {
      const saved = localStorage.getItem('session_state');
      if (saved) {
        const state = JSON.parse(saved);
        // Check if session is still valid (within 24 hours)
        if (Date.now() - state.startTime < 24 * 60 * 60 * 1000) {
          return state;
        }
      }
    } catch (e) {
      console.error('Failed to load session state:', e);
    }
    return null;
  }

  private saveState(): void {
    try {
      localStorage.setItem('session_state', JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save session state:', e);
    }
  }

  private startSession(): void {
    // Auto-save every 30 seconds
    setInterval(() => this.saveState(), 30000);
    
    // Save on page unload
    window.addEventListener('beforeunload', () => this.saveState());
  }

  // ========================================
  // Temporary skin data methods (anonymous users)
  // ========================================

  setTempSkinType(skinType: string): void {
    this.state.tempSkinType = skinType;
    this.notifyListeners();
    this.saveState();
  }

  setTempConcerns(concerns: string[]): void {
    this.state.tempConcerns = concerns;
    this.notifyListeners();
    this.saveState();
  }

  getTempSkinType(): string | undefined {
    return this.state.tempSkinType;
  }

  getTempConcerns(): string[] | undefined {
    return this.state.tempConcerns;
  }

  clearTempData(): void {
    this.state.tempSkinType = undefined;
    this.state.tempConcerns = undefined;
    this.notifyListeners();
    this.saveState();
  }

  // ========================================
  // Authenticated user methods
  // ========================================

  setUser(user: AuthenticatedUser): void {
    this.state.user = user;
    this.notifyListeners();
    this.saveState();
  }

  getUser(): AuthenticatedUser | undefined {
    return this.state.user;
  }

  clearUser(): void {
    this.state.user = undefined;
    this.notifyListeners();
    this.saveState();
  }

  // Track user interactions
  trackInteraction(type: Interaction['type'], target: string, data?: any): void {
    this.state.interactions.push({
      timestamp: Date.now(),
      type,
      target,
      data,
    });

    // Keep only last 100 interactions
    if (this.state.interactions.length > 100) {
      this.state.interactions = this.state.interactions.slice(-100);
    }

    this.notifyListeners();
    this.saveState();
  }

  // Update user preferences
  updatePreferences(updates: Partial<UserPreferences>): void {
    this.state.preferences = { ...this.state.preferences, ...updates };
    this.notifyListeners();
    this.saveState();
  }

  // Update session context
  updateContext(updates: Partial<SessionContext>): void {
    this.state.context = { ...this.state.context, ...updates };
    this.notifyListeners();
    this.saveState();
  }

  // Pages that should not be restored (auth, onboarding, password gate)
  private excludedPages = [
    '/auth/login',
    '/auth/signup',
    '/auth/callback',
    '/auth/reset-password',
    '/skin-survey',
    '/onboarding',
    '/password',
  ];

  // Navigate to page and track for restoration
  navigateTo(page: string): void {
    if (!this.state.context.visitedPages.includes(page)) {
      this.state.context.visitedPages.push(page);
    }
    this.state.context.currentPage = page;

    // Track last visited page for restoration (exclude auth/onboarding pages)
    const shouldTrack = !this.excludedPages.some(excluded =>
      page.startsWith(excluded)
    );
    if (shouldTrack && page !== '/') {
      this.state.context.lastVisitedPage = page;
      this.state.context.lastVisitedAt = Date.now();
    }

    this.trackInteraction('navigation', page);
  }

  // Get last visited page for restoration
  getLastVisitedPage(): string | undefined {
    const { lastVisitedPage, lastVisitedAt } = this.state.context;

    // Only restore if visited within last 24 hours
    if (lastVisitedPage && lastVisitedAt) {
      const hoursSinceVisit = (Date.now() - lastVisitedAt) / (1000 * 60 * 60);
      if (hoursSinceVisit < 24) {
        return lastVisitedPage;
      }
    }
    return undefined;
  }

  // Clear last visited page (after successful restoration)
  clearLastVisitedPage(): void {
    this.state.context.lastVisitedPage = undefined;
    this.state.context.lastVisitedAt = undefined;
    this.saveState();
  }

  // Mark action as completed
  completeAction(action: string): void {
    if (!this.state.context.completedActions.includes(action)) {
      this.state.context.completedActions.push(action);
      this.trackInteraction('completion', action);
    }
  }

  // Add to search history
  addSearch(query: string): void {
    this.state.context.searchHistory.unshift(query);
    this.state.context.searchHistory = this.state.context.searchHistory.slice(0, 20);
    this.trackInteraction('input', 'search', { query });
  }

  // Track product views
  viewProduct(productId: number): void {
    const productIdStr = productId.toString();
    if (!this.state.context.viewedProducts.includes(productIdStr)) {
      this.state.context.viewedProducts.push(productIdStr);
    }
    this.trackInteraction('click', 'product', { productId });
  }

  // Save items
  saveItem(itemId: string, type: string): void {
    const key = `${type}:${itemId}`;
    if (!this.state.context.savedItems.includes(key)) {
      this.state.context.savedItems.push(key);
      this.trackInteraction('click', 'save', { itemId, type });
    }
  }

  // Get user behavior patterns
  getBehaviorPatterns(): {
    engagementLevel: 'low' | 'medium' | 'high';
    primaryInterests: string[];
    preferredFeatures: string[];
    sessionDuration: number;
    interactionFrequency: number;
  } {
    const duration = Date.now() - this.state.startTime;
    const interactionCount = this.state.interactions.length;
    const frequency = interactionCount / (duration / 60000); // per minute

    // Determine engagement level
    let engagementLevel: 'low' | 'medium' | 'high' = 'low';
    if (frequency > 5 || this.state.context.visitedPages.length > 10) {
      engagementLevel = 'high';
    } else if (frequency > 2 || this.state.context.visitedPages.length > 5) {
      engagementLevel = 'medium';
    }

    // Extract primary interests from interactions
    const interestMap: Record<string, number> = {};
    this.state.interactions.forEach(interaction => {
      if (interaction.target) {
        interestMap[interaction.target] = (interestMap[interaction.target] || 0) + 1;
      }
    });

    const primaryInterests = Object.entries(interestMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([key]) => key);

    // Identify preferred features
    const featureMap: Record<string, number> = {};
    this.state.context.visitedPages.forEach(page => {
      const feature = page.split('/')[1] || 'home';
      featureMap[feature] = (featureMap[feature] || 0) + 1;
    });

    const preferredFeatures = Object.entries(featureMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([key]) => key);

    return {
      engagementLevel,
      primaryInterests,
      preferredFeatures,
      sessionDuration: duration,
      interactionFrequency: frequency,
    };
  }

  // Get personalization context for AI
  getPersonalizationContext(): any {
    const patterns = this.getBehaviorPatterns();
    return {
      preferences: this.state.preferences,
      patterns,
      recentInteractions: this.state.interactions.slice(-10),
      context: this.state.context,
    };
  }

  // Subscribe to state changes
  subscribe(listener: (state: SessionState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Get current state
  getState(): SessionState {
    return { ...this.state };
  }

  // Reset session
  reset(): void {
    this.state = this.initializeState();
    this.saveState();
    this.notifyListeners();
  }
}

// Singleton instance
export const sessionState = new SessionStateManager();

// ========================================
// Unified getters for skin personalization
// Priority: user.skin_type > tempSkinType > undefined
// ========================================

export function getEffectiveSkinType(): string | undefined {
  const user = sessionState.getUser();
  if (user?.skin_type) {
    return user.skin_type;
  }
  return sessionState.getTempSkinType();
}

export function getEffectiveConcerns(): string[] {
  const user = sessionState.getUser();
  if (user?.concerns && user.concerns.length > 0) {
    return user.concerns;
  }
  return sessionState.getTempConcerns() || [];
}

// React hook for using session state
export function useSessionState() {
  const [state, setState] = React.useState(sessionState.getState());

  React.useEffect(() => {
    return sessionState.subscribe(setState);
  }, []);

  return {
    state,
    trackInteraction: sessionState.trackInteraction.bind(sessionState),
    updatePreferences: sessionState.updatePreferences.bind(sessionState),
    updateContext: sessionState.updateContext.bind(sessionState),
    navigateTo: sessionState.navigateTo.bind(sessionState),
    completeAction: sessionState.completeAction.bind(sessionState),
    addSearch: sessionState.addSearch.bind(sessionState),
    viewProduct: sessionState.viewProduct.bind(sessionState),
    saveItem: sessionState.saveItem.bind(sessionState),
    getBehaviorPatterns: sessionState.getBehaviorPatterns.bind(sessionState),
    getPersonalizationContext: sessionState.getPersonalizationContext.bind(sessionState),
    // New methods
    setTempSkinType: sessionState.setTempSkinType.bind(sessionState),
    setTempConcerns: sessionState.setTempConcerns.bind(sessionState),
    clearTempData: sessionState.clearTempData.bind(sessionState),
    setUser: sessionState.setUser.bind(sessionState),
    clearUser: sessionState.clearUser.bind(sessionState),
    getLastVisitedPage: sessionState.getLastVisitedPage.bind(sessionState),
    clearLastVisitedPage: sessionState.clearLastVisitedPage.bind(sessionState),
  };
}