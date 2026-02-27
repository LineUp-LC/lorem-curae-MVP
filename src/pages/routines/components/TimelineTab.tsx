import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabase-browser';
import { loadVersionsForRoutine } from '../../../lib/utils/routineVersioning';
import { loadRoutineEvents } from '../../../lib/utils/routineAnalytics';
import { buildTimeline, type TimelineEvent } from '../../../lib/utils/routineTimeline';

interface TimelineTabProps {
  routineId?: string;
}

export default function TimelineTab({ routineId }: TimelineTabProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Load all three data sources in parallel
        const [versions, notes, usageEvents] = await Promise.all([
          routineId ? loadVersionsForRoutine(routineId) : Promise.resolve([]),
          loadNotes(user.id),
          loadRoutineEvents(user.id, routineId),
        ]);

        const timeline = buildTimeline({ versions, notes, events: usageEvents });
        setEvents(timeline);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [routineId]);

  // Group events by day
  const groupedEvents = useMemo(() => {
    const groups = new Map<string, TimelineEvent[]>();
    for (const event of events) {
      const day = new Date(event.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      if (!groups.has(day)) groups.set(day, []);
      groups.get(day)!.push(event);
    }
    return groups;
  }, [events]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <i className="ri-loader-4-line text-3xl text-primary animate-spin"></i>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-3">
          <i className="ri-timeline-view text-warm-gray/40 text-2xl"></i>
        </div>
        <p className="text-warm-gray text-sm">No activity yet</p>
        <p className="text-warm-gray/60 text-xs mt-1">
          Save routines and log notes to build your timeline
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Array.from(groupedEvents.entries()).map(([day, dayEvents]) => (
        <div key={day}>
          {/* Day header */}
          <p className="text-xs font-medium text-warm-gray/60 uppercase tracking-wide mb-3">
            {day}
          </p>

          {/* Events for this day */}
          <div className="relative pl-6 border-l-2 border-blush space-y-4">
            {dayEvents.map((event) => (
              <div key={event.id} className="relative">
                {/* Dot on the line */}
                <div
                  className={`absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2 border-cream ${
                    event.type === 'version'
                      ? 'bg-primary'
                      : event.type === 'note'
                      ? 'bg-sage'
                      : 'bg-warm-gray/40'
                  }`}
                ></div>

                {/* Event card */}
                <div className="bg-white rounded-lg border border-blush p-3">
                  <div className="flex items-start gap-2">
                    <i className={`${event.icon} text-sm mt-0.5 ${event.iconColor}`}></i>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-deep">{event.title}</p>
                      {event.description && (
                        <p className="text-xs text-warm-gray mt-0.5 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <p className="text-xs text-warm-gray/50 mt-1">
                        {new Date(event.timestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper to load notes from Supabase
async function loadNotes(userId: string) {
  try {
    const { data, error } = await supabase
      .from('routine_notes')
      .select('id, content, note_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}
