import { useState, useEffect, useCallback } from 'react';

/**
 * PersistenceDebugPanel
 *
 * Developer-only panel for viewing and managing localStorage persistence keys.
 * Only visible in development mode (import.meta.env.DEV).
 */

// All persistence keys used in the application, organized by category
const PERSISTENCE_KEYS: Record<string, string[]> = {
  'Session': [
    'lorem_curae_session',
  ],
  'Routines': [
    'routine_active_tab',
    'routine_builder_steps',
    'routine_builder_name',
    'routine_note_form_open',
    'routine_note_draft',
    'routine_builder_time_filter',
    'routineBuilderTutorialComplete',
  ],
  'Discovery': [
    'discover_filter_category',
    'discover_filter_skin_type',
    'discover_sort_by',
    'discover_filter_time_of_day',
    'discover_compare_bar_minimized',
  ],
  'Survey': [
    'survey_current_step',
    'survey_answers',
    'skinSurveyData',
  ],
  'AI Chat': [
    'ai_chat_input_draft',
    'ai_chat_insights_visible',
    'ai_chat_current_session',
  ],
  'Product Detail': [
    'product_detail_active_tab',
  ],
  'User Data': [
    'user_favorites',
    'recently_viewed_products',
    'savedProducts',
    'routines',
  ],
};

// Flatten all keys for quick access
const ALL_KEYS = Object.values(PERSISTENCE_KEYS).flat();

interface StorageEntry {
  key: string;
  value: string | null;
  parsed: unknown;
  size: number;
}

export default function PersistenceDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [entries, setEntries] = useState<StorageEntry[]>([]);
  const [filter, setFilter] = useState('');

  // Only render in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  const loadEntries = useCallback(() => {
    const loaded: StorageEntry[] = ALL_KEYS.map((key) => {
      const value = localStorage.getItem(key);
      let parsed: unknown = null;
      try {
        if (value) {
          parsed = JSON.parse(value);
        }
      } catch {
        parsed = value; // Not JSON, use raw value
      }
      return {
        key,
        value,
        parsed,
        size: value ? new Blob([value]).size : 0,
      };
    }).filter((entry) => entry.value !== null);

    setEntries(loaded);
  }, []);

  // Load entries when panel opens
  useEffect(() => {
    if (isOpen) {
      loadEntries();
    }
  }, [isOpen, loadEntries]);

  const toggleKeyExpanded = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const clearKey = (key: string) => {
    localStorage.removeItem(key);
    loadEntries();
  };

  const clearAllKeys = () => {
    ALL_KEYS.forEach((key) => localStorage.removeItem(key));
    loadEntries();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const totalSize = entries.reduce((acc, e) => acc + e.size, 0);

  const filteredEntries = filter
    ? entries.filter((e) => e.key.toLowerCase().includes(filter.toLowerCase()))
    : entries;

  // Find category for a key
  const getCategoryForKey = (key: string): string => {
    for (const [category, keys] of Object.entries(PERSISTENCE_KEYS)) {
      if (keys.includes(key)) return category;
    }
    return 'Other';
  };

  // Group entries by category
  const groupedEntries = filteredEntries.reduce<Record<string, StorageEntry[]>>(
    (acc, entry) => {
      const category = getCategoryForKey(entry.key);
      if (!acc[category]) acc[category] = [];
      acc[category].push(entry);
      return acc;
    },
    {}
  );

  return (
    <>
      {/* Toggle Button - Fixed position */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 left-4 z-[9999] w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          isOpen
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-800 text-white hover:bg-gray-700'
        }`}
        title="Persistence Debug Panel"
      >
        <i className={`${isOpen ? 'ri-close-line' : 'ri-database-2-line'} text-lg`}></i>
      </button>

      {/* Panel */}
      <div
        className={`fixed bottom-16 left-4 z-[9998] w-[420px] max-h-[70vh] bg-gray-900 text-gray-100 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-mono text-sm font-semibold flex items-center gap-2">
              <i className="ri-database-2-line text-primary"></i>
              Persistence Debug
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{entries.length} keys</span>
              <span className="text-gray-600">|</span>
              <span>{formatBytes(totalSize)}</span>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <i className="ri-search-line absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
              <input
                type="text"
                placeholder="Filter keys..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={loadEntries}
              className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
              title="Refresh"
            >
              <i className="ri-refresh-line text-sm"></i>
            </button>
            <button
              onClick={clearAllKeys}
              className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded transition-colors"
              title="Clear All"
            >
              <i className="ri-delete-bin-line text-sm"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(70vh-100px)] p-3 space-y-3">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <i className="ri-inbox-line text-3xl mb-2 block"></i>
              No persistence data found
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No keys match "{filter}"
            </div>
          ) : (
            Object.entries(groupedEntries).map(([category, categoryEntries]) => (
              <div key={category}>
                {/* Category Header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {category}
                  </span>
                  <div className="flex-1 h-px bg-gray-700"></div>
                  <span className="text-[10px] text-gray-600">
                    {categoryEntries.length}
                  </span>
                </div>

                {/* Keys in Category */}
                <div className="space-y-2">
                  {categoryEntries.map((entry) => {
                    const isExpanded = expandedKeys.has(entry.key);
                    const jsonString = JSON.stringify(entry.parsed, null, 2);
                    const isLargeValue = jsonString.length > 200;

                    return (
                      <div
                        key={entry.key}
                        className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
                      >
                        {/* Key Header */}
                        <div
                          className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-700/50 transition-colors"
                          onClick={() => toggleKeyExpanded(entry.key)}
                        >
                          <i
                            className={`ri-arrow-right-s-line text-gray-500 transition-transform duration-200 ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          ></i>
                          <span className="font-mono text-xs text-primary flex-1 truncate">
                            {entry.key}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {formatBytes(entry.size)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(jsonString);
                            }}
                            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
                            title="Copy value"
                          >
                            <i className="ri-file-copy-line text-xs"></i>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearKey(entry.key);
                            }}
                            className="p-1 hover:bg-red-600/20 rounded text-gray-400 hover:text-red-400 transition-colors"
                            title="Clear key"
                          >
                            <i className="ri-close-line text-xs"></i>
                          </button>
                        </div>

                        {/* Value Preview / Expanded */}
                        {isExpanded && (
                          <div className="px-3 pb-3 pt-1 border-t border-gray-700">
                            <pre className="text-[11px] text-gray-300 font-mono whitespace-pre-wrap break-all bg-gray-900 p-2 rounded max-h-48 overflow-y-auto">
                              {jsonString}
                            </pre>
                          </div>
                        )}

                        {/* Collapsed Preview */}
                        {!isExpanded && (
                          <div className="px-3 pb-2">
                            <p className="text-[11px] text-gray-500 font-mono truncate">
                              {isLargeValue
                                ? `${jsonString.slice(0, 80)}...`
                                : jsonString}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-4 py-2 border-t border-gray-700 text-[10px] text-gray-500 flex items-center justify-between">
          <span>DEV MODE ONLY</span>
          <span>localStorage persistence</span>
        </div>
      </div>
    </>
  );
}
