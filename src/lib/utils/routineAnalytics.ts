import { supabase } from '../supabase-browser';

type RoutineAction =
  | 'routine_created'
  | 'routine_updated'
  | 'routine_deleted'
  | 'routine_viewed'
  | 'notes_opened'
  | 'progress_updated';

export async function logRoutineUsage(
  userId: string,
  routineId: string | null,
  action: RoutineAction
): Promise<void> {
  try {
    await supabase.from('routine_usage_events').insert({
      user_id: userId,
      routine_id: routineId,
      action,
    });
  } catch {
    // Silent fail — analytics should never block UI
  }
}

export interface UsageEvent {
  id: string;
  action: string;
  created_at: string;
}

export async function loadRoutineEvents(
  userId: string,
  routineId?: string
): Promise<UsageEvent[]> {
  try {
    let query = supabase
      .from('routine_usage_events')
      .select('id, action, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (routineId) {
      query = query.eq('routine_id', routineId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as UsageEvent[]) || [];
  } catch {
    return [];
  }
}
