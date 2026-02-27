/**
 * Routine State Management
 *
 * Provides Supabase sync for saved routine definitions.
 * Keeps routine builder drafts and daily completions local-only.
 */

import { supabase } from '../supabase-browser';

// -----------------------------
// Types
// -----------------------------

export interface RoutineProduct {
  id: string;
  name: string;
  brand: string;
  image: string;
  category: string;
  purchasedFrom?: string;
  purchaseDate?: string;
  expirationDate?: string;
  source?: 'discovery' | 'marketplace';
}

export interface RoutineStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  timeOfDay: 'morning' | 'evening';
  product?: RoutineProduct;
  recommended: boolean;
}

export interface SavedRoutine {
  id: string;
  name: string;
  description?: string;
  timeOfDay: 'morning' | 'evening' | 'both';
  steps: RoutineStep[];
  stepCount: number;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

// Database row type for user_routines table
export interface UserRoutineRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  time_of_day: 'morning' | 'evening' | 'both';
  steps: RoutineStep[];
  step_count: number;
  thumbnail_url: string | null;
  tags: string[];
  frequency: string | null;
  is_active: boolean;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

// Convert database row to local SavedRoutine
function rowToSavedRoutine(row: UserRoutineRow): SavedRoutine {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    timeOfDay: row.time_of_day,
    steps: row.steps,
    stepCount: row.step_count,
    thumbnail: row.thumbnail_url || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert local SavedRoutine to database row (without user_id, step_count)
function savedRoutineToRow(routine: SavedRoutine): Omit<UserRoutineRow, 'user_id' | 'step_count'> {
  return {
    id: routine.id,
    name: routine.name,
    description: routine.description || null,
    time_of_day: routine.timeOfDay,
    steps: routine.steps,
    thumbnail_url: routine.thumbnail || null,
    tags: [],
    frequency: null,
    is_active: true,
    is_template: false,
    created_at: routine.createdAt,
    updated_at: routine.updatedAt,
  };
}

// -----------------------------
// Local Storage Operations
// -----------------------------

const ROUTINES_KEY = 'routines';

export function getLocalRoutines(): SavedRoutine[] {
  try {
    const saved = localStorage.getItem(ROUTINES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('[RoutineState] Error reading local routines:', e);
    return [];
  }
}

export function saveLocalRoutines(routines: SavedRoutine[]): void {
  try {
    localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
  } catch (e) {
    console.error('[RoutineState] Error saving local routines:', e);
  }
}

// -----------------------------
// Supabase Sync Operations
// -----------------------------

export async function loadRoutinesFromSupabase(): Promise<SavedRoutine[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_routines')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[RoutineState] Error loading routines:', error);
      return [];
    }

    const serverRoutines = (data || []).map(rowToSavedRoutine);
    return serverRoutines;
  } catch (e) {
    console.error('[RoutineState] Error loading routines from Supabase:', e);
    return [];
  }
}

export async function syncRoutinesToSupabase(routines: SavedRoutine[]): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Upsert all routines
    const rows = routines.map(r => ({
      ...savedRoutineToRow(r),
      user_id: user.id,
    }));

    const { error } = await supabase
      .from('user_routines')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('[RoutineState] Supabase sync error:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('[RoutineState] Error syncing routines:', e);
    return false;
  }
}

export async function saveRoutineToSupabase(routine: SavedRoutine): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Save locally only for guests
      const local = getLocalRoutines();
      const existingIndex = local.findIndex(r => r.id === routine.id);
      if (existingIndex >= 0) {
        local[existingIndex] = routine;
      } else {
        local.push(routine);
      }
      saveLocalRoutines(local);
      return true;
    }

    // Direct upsert to user_routines table
    const row = {
      ...savedRoutineToRow(routine),
      user_id: user.id,
    };

    const { error } = await supabase
      .from('user_routines')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('[RoutineState] Error saving routine:', error);
      return false;
    }

    // Update local storage for offline access
    const local = getLocalRoutines();
    const existingIndex = local.findIndex(r => r.id === routine.id);
    if (existingIndex >= 0) {
      local[existingIndex] = routine;
    } else {
      local.push(routine);
    }
    saveLocalRoutines(local);

    return true;
  } catch (e) {
    console.error('[RoutineState] Error saving routine:', e);
    return false;
  }
}

export async function deleteRoutineFromSupabase(routineId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Remove from local storage
    const local = getLocalRoutines();
    const filtered = local.filter(r => r.id !== routineId);
    saveLocalRoutines(filtered);

    if (!user) return true; // Guest - local delete only

    // Delete from user_routines table
    const { error } = await supabase
      .from('user_routines')
      .delete()
      .eq('id', routineId)
      .eq('user_id', user.id);

    if (error) {
      console.error('[RoutineState] Error deleting routine:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('[RoutineState] Error deleting routine:', e);
    return false;
  }
}

// -----------------------------
// Merge Operations
// -----------------------------

export function mergeRoutines(local: SavedRoutine[], server: SavedRoutine[]): SavedRoutine[] {
  const merged = new Map<string, SavedRoutine>();

  // Add server routines first (server wins for conflicts)
  server.forEach(r => merged.set(r.id, r));

  // Add local routines that don't exist on server
  local.forEach(r => {
    if (!merged.has(r.id)) {
      merged.set(r.id, r);
    }
  });

  return Array.from(merged.values());
}

// -----------------------------
// Hydration (for app load)
// -----------------------------

export async function hydrateRoutines(): Promise<SavedRoutine[]> {
  const local = getLocalRoutines();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return local;
    }

    const server = await loadRoutinesFromSupabase();
    const merged = mergeRoutines(local, server);

    // Update both local and server with merged result
    saveLocalRoutines(merged);

    // If local had routines not on server, sync them up
    if (local.length > 0 && server.length === 0) {
      await syncRoutinesToSupabase(merged);
    }

    return merged;
  } catch (e) {
    console.error('[RoutineState] Error hydrating routines:', e);
    return local;
  }
}

// -----------------------------
// Routine Count (for AuthContext)
// -----------------------------

export async function getRoutineCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('user_routines')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('[RoutineState] Error getting routine count:', error);
      return 0;
    }

    return count || 0;
  } catch (e) {
    console.error('[RoutineState] Error getting routine count:', e);
    return 0;
  }
}
