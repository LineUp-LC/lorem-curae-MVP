/**
 * ScanHistory — horizontal scroll of past scan thumbnails.
 *
 * Displayed on the scan page when idle and history exists.
 * Tapping a history card restores the full result without re-scanning.
 */

import type { ScanHistoryEntry } from '../../../types/scan';
import { clearScanHistory } from '../../../lib/utils/scanHistory';

interface ScanHistoryProps {
  entries: ScanHistoryEntry[];
  onSelect: (entry: ScanHistoryEntry) => void;
  onClear: () => void;
}

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ScanHistory({ entries, onSelect, onClear }: ScanHistoryProps) {
  if (entries.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-deep flex items-center gap-1">
          <i className="ri-history-line text-primary/50" />
          Recent Scans
        </h3>
        <button
          onClick={() => {
            clearScanHistory();
            onClear();
          }}
          className="text-[10px] text-warm-gray/60 hover:text-warm-gray transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {entries.map(entry => (
          <button
            key={entry.id}
            onClick={() => onSelect(entry)}
            className="flex-shrink-0 group"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-blush shadow-sm group-hover:border-primary/40 transition-colors">
              <img
                src={entry.thumbnail}
                alt={entry.result.detectedProduct || 'Scanned product'}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[9px] text-warm-gray mt-0.5 text-center truncate w-16">
              {entry.result.match
                ? entry.result.detectedProduct || 'Match'
                : entry.result.detectedBrand || formatTimeAgo(entry.timestamp)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
