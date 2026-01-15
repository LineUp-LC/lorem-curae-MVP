/**
 * Routine Progress State Management
 *
 * Tracks user's last position in routine building for resume functionality.
 * Follows the existing observable pattern.
 */

import { useState, useEffect } from 'react';

interface RoutineProgress {
  lastStepIndex: number;
  lastTimeFilter: 'morning' | 'evening';
  lastInteractedAt: string;
  hasUnfinishedSession: boolean;
}

const DEFAULT_PROGRESS: RoutineProgress = {
  lastStepIndex: 0,
  lastTimeFilter: 'morning',
  lastInteractedAt: '',
  hasUnfinishedSession: false,
};

class RoutineProgressStateManager {
  private listeners: Set<(progress: RoutineProgress) => void> = new Set();
  private storageKey = 'routine_builder_progress';

  getProgress(): RoutineProgress {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? { ...DEFAULT_PROGRESS, ...JSON.parse(saved) } : DEFAULT_PROGRESS;
    } catch (e) {
      console.error('Failed to load routine progress:', e);
      return DEFAULT_PROGRESS;
    }
  }

  private saveProgress(progress: RoutineProgress): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(progress));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save routine progress:', e);
    }
  }

  // Update last interacted step
  setLastStep(stepIndex: number, timeFilter: 'morning' | 'evening'): void {
    const progress = this.getProgress();
    this.saveProgress({
      ...progress,
      lastStepIndex: stepIndex,
      lastTimeFilter: timeFilter,
      lastInteractedAt: new Date().toISOString(),
      hasUnfinishedSession: true,
    });
  }

  // Mark session as complete (routine saved)
  markSessionComplete(): void {
    const progress = this.getProgress();
    this.saveProgress({
      ...progress,
      hasUnfinishedSession: false,
    });
  }

  // Clear progress (start fresh)
  clearProgress(): void {
    this.saveProgress(DEFAULT_PROGRESS);
  }

  // Check if there's an unfinished session
  hasUnfinishedSession(): boolean {
    return this.getProgress().hasUnfinishedSession;
  }

  subscribe(listener: (progress: RoutineProgress) => void): () => void {
    this.listeners.add(listener);
    listener(this.getProgress());
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const progress = this.getProgress();
    this.listeners.forEach(listener => listener(progress));
  }
}

// Singleton instance
export const routineProgressState = new RoutineProgressStateManager();

// React hook
export function useRoutineProgress(): {
  progress: RoutineProgress;
  setLastStep: (stepIndex: number, timeFilter: 'morning' | 'evening') => void;
  markSessionComplete: () => void;
  clearProgress: () => void;
  hasUnfinishedSession: boolean;
} {
  const [progress, setProgress] = useState<RoutineProgress>(
    routineProgressState.getProgress()
  );

  useEffect(() => {
    return routineProgressState.subscribe(setProgress);
  }, []);

  return {
    progress,
    setLastStep: routineProgressState.setLastStep.bind(routineProgressState),
    markSessionComplete: routineProgressState.markSessionComplete.bind(routineProgressState),
    clearProgress: routineProgressState.clearProgress.bind(routineProgressState),
    hasUnfinishedSession: progress.hasUnfinishedSession,
  };
}
