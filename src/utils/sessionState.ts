// Session-level state management for personalized prototype experience

interface SessionState {
  userId: string;
  sessionId: string;
  startTime: number;
  interactions: Interaction[];
  preferences: UserPreferences;
  context: SessionContext;
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
      },
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

  // Navigate to page
  navigateTo(page: string): void {
    if (!this.state.context.visitedPages.includes(page)) {
      this.state.context.visitedPages.push(page);
    }
    this.state.context.currentPage = page;
    this.trackInteraction('navigation', page);
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
  viewProduct(productId: string): void {
    if (!this.state.context.viewedProducts.includes(productId)) {
      this.state.context.viewedProducts.push(productId);
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
  };
}

// Import React for the hook
import React from 'react';
