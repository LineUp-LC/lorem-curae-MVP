/**
 * Routine Completion State Management
 *
 * Tracks daily routine completions with localStorage persistence.
 * Automatically resets each day.
 */

import { useState, useEffect } from 'react';

interface RoutineCompletion {
  routineId: string;
  completedAt: string;
  date: string; // YYYY-MM-DD format
}

class RoutineCompletionStateManager {
  private listeners: Set<(completions: RoutineCompletion[]) => void> = new Set();
  private storageKey = 'routine_completions';

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Get all completions (filtered to today only)
  getCompletions(): RoutineCompletion[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      const all: RoutineCompletion[] = saved ? JSON.parse(saved) : [];
      // Filter to today's completions only
      const today = this.getTodayDate();
      return all.filter(c => c.date === today);
    } catch (e) {
      console.error('Failed to load routine completions:', e);
      return [];
    }
  }

  private saveCompletions(completions: RoutineCompletion[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(completions));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save routine completions:', e);
    }
  }

  // Check if a routine is completed today
  isCompletedToday(routineId: string): boolean {
    const completions = this.getCompletions();
    return completions.some(c => c.routineId === routineId);
  }

  // Mark a routine as done for today
  markAsDone(routineId: string): void {
    if (this.isCompletedToday(routineId)) return;

    const saved = localStorage.getItem(this.storageKey);
    const all: RoutineCompletion[] = saved ? JSON.parse(saved) : [];

    all.push({
      routineId,
      completedAt: new Date().toISOString(),
      date: this.getTodayDate(),
    });

    this.saveCompletions(all);
  }

  // Undo completion for today
  undoCompletion(routineId: string): void {
    const saved = localStorage.getItem(this.storageKey);
    const all: RoutineCompletion[] = saved ? JSON.parse(saved) : [];
    const today = this.getTodayDate();

    const filtered = all.filter(c => !(c.routineId === routineId && c.date === today));
    this.saveCompletions(filtered);
  }

  // Toggle completion
  toggleCompletion(routineId: string): boolean {
    if (this.isCompletedToday(routineId)) {
      this.undoCompletion(routineId);
      return false;
    } else {
      this.markAsDone(routineId);
      return true;
    }
  }

  // Get completion count for today
  getTodayCount(): number {
    return this.getCompletions().length;
  }

  // Subscribe to changes
  subscribe(listener: (completions: RoutineCompletion[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getCompletions());
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const completions = this.getCompletions();
    this.listeners.forEach(listener => listener(completions));
  }
}

// Singleton instance
export const routineCompletionState = new RoutineCompletionStateManager();

// React hook
export function useRoutineCompletion(routineId: string): {
  isCompletedToday: boolean;
  toggleCompletion: () => boolean;
} {
  const [isCompleted, setIsCompleted] = useState(() =>
    routineCompletionState.isCompletedToday(routineId)
  );

  useEffect(() => {
    const unsubscribe = routineCompletionState.subscribe(() => {
      setIsCompleted(routineCompletionState.isCompletedToday(routineId));
    });
    return unsubscribe;
  }, [routineId]);

  return {
    isCompletedToday: isCompleted,
    toggleCompletion: () => routineCompletionState.toggleCompletion(routineId),
  };
}
