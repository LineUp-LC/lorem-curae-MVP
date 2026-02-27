import { supabase } from '../supabase-browser';
import type { SavedRoutine, RoutineStep } from './routineState';

// -----------------------------
// Types
// -----------------------------

export interface RoutineVersion {
  id: string;
  routineId: string;
  versionNumber: number;
  label?: string;
  steps: RoutineStep[];
  stepCount: number;
  name: string;
  timeOfDay: 'morning' | 'evening' | 'both';
  changeSummary?: string;
  createdAt: string;
}

interface RoutineVersionRow {
  id: string;
  user_id: string;
  routine_id: string;
  version_number: number;
  label: string | null;
  steps: RoutineStep[];
  step_count: number;
  name: string;
  time_of_day: 'morning' | 'evening' | 'both';
  change_summary: string | null;
  created_at: string;
}

function rowToVersion(row: RoutineVersionRow): RoutineVersion {
  return {
    id: row.id,
    routineId: row.routine_id,
    versionNumber: row.version_number,
    label: row.label || undefined,
    steps: row.steps,
    stepCount: row.step_count,
    name: row.name,
    timeOfDay: row.time_of_day,
    changeSummary: row.change_summary || undefined,
    createdAt: row.created_at,
  };
}

// -----------------------------
// Functions
// -----------------------------

export async function getLatestVersionNumber(routineId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('routine_versions')
      .select('version_number')
      .eq('routine_id', routineId)
      .order('version_number', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return 0;
    return data[0].version_number;
  } catch {
    return 0;
  }
}

export async function createVersionSnapshot(
  routineId: string,
  routine: SavedRoutine,
  label?: string,
  changeSummary?: string
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const nextVersion = (await getLatestVersionNumber(routineId)) + 1;

    const { error } = await supabase.from('routine_versions').insert({
      user_id: user.id,
      routine_id: routineId,
      version_number: nextVersion,
      label: label || null,
      steps: routine.steps,
      name: routine.name,
      time_of_day: routine.timeOfDay,
      change_summary: changeSummary || null,
    });

    if (error) return false;
    return true;
  } catch {
    // Silent fail — versioning should never block saving
    return false;
  }
}

export async function loadVersionsForRoutine(routineId: string): Promise<RoutineVersion[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('routine_versions')
      .select('*')
      .eq('routine_id', routineId)
      .eq('user_id', user.id)
      .order('version_number', { ascending: false });

    if (error || !data) return [];
    return data.map(rowToVersion);
  } catch {
    return [];
  }
}

export function diffVersionSteps(
  older: RoutineStep[],
  newer: RoutineStep[]
): string {
  const oldProducts = older.filter(s => s.product).map(s => s.product!.name);
  const newProducts = newer.filter(s => s.product).map(s => s.product!.name);

  const added = newProducts.filter(p => !oldProducts.includes(p));
  const removed = oldProducts.filter(p => !newProducts.includes(p));

  const parts: string[] = [];
  if (added.length > 0) parts.push(`Added ${added.join(', ')}`);
  if (removed.length > 0) parts.push(`Removed ${removed.join(', ')}`);
  if (newer.length !== older.length && parts.length === 0) {
    parts.push(`Steps changed from ${older.length} to ${newer.length}`);
  }

  return parts.length > 0 ? parts.join('. ') : 'Routine updated';
}
