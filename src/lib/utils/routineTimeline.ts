import type { RoutineVersion } from './routineVersioning';

// -----------------------------
// Types
// -----------------------------

export interface TimelineEvent {
  id: string;
  type: 'version' | 'note' | 'event';
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  timestamp: string;
}

interface NoteRecord {
  id: string;
  content: string;
  note_type?: string;
  created_at: string;
}

interface UsageEventRecord {
  id: string;
  action: string;
  created_at: string;
}

// -----------------------------
// Builder
// -----------------------------

const actionLabels: Record<string, string> = {
  routine_created: 'Routine created',
  routine_updated: 'Routine updated',
  routine_deleted: 'Routine deleted',
  notes_opened: 'Notes opened',
  progress_updated: 'Progress updated',
  routine_viewed: 'Routine viewed',
};

const actionIcons: Record<string, string> = {
  routine_created: 'ri-add-circle-line',
  routine_updated: 'ri-edit-line',
  routine_deleted: 'ri-delete-bin-line',
  notes_opened: 'ri-file-text-line',
  progress_updated: 'ri-bar-chart-line',
  routine_viewed: 'ri-eye-line',
};

export function buildTimeline({
  versions = [],
  notes = [],
  events = [],
}: {
  versions?: RoutineVersion[];
  notes?: NoteRecord[];
  events?: UsageEventRecord[];
}): TimelineEvent[] {
  const timeline: TimelineEvent[] = [];

  // Add version events
  for (const v of versions) {
    timeline.push({
      id: `v-${v.id}`,
      type: 'version',
      icon: 'ri-history-line',
      iconColor: 'text-primary',
      title: `Version ${v.versionNumber}${v.label ? ` — ${v.label}` : ''}`,
      description: v.changeSummary || `${v.stepCount} steps · ${v.timeOfDay}`,
      timestamp: v.createdAt,
    });
  }

  // Add note events
  for (const n of notes) {
    const noteType = n.note_type || 'observation';
    const typeLabel = noteType.charAt(0).toUpperCase() + noteType.slice(1);
    timeline.push({
      id: `n-${n.id}`,
      type: 'note',
      icon: 'ri-sticky-note-line',
      iconColor: 'text-sage',
      title: `${typeLabel} logged`,
      description: n.content.length > 80 ? n.content.slice(0, 80) + '...' : n.content,
      timestamp: n.created_at,
    });
  }

  // Add usage events
  for (const e of events) {
    timeline.push({
      id: `e-${e.id}`,
      type: 'event',
      icon: actionIcons[e.action] || 'ri-flashlight-line',
      iconColor: 'text-warm-gray',
      title: actionLabels[e.action] || e.action,
      description: '',
      timestamp: e.created_at,
    });
  }

  // Sort newest first
  timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return timeline.slice(0, 50);
}
