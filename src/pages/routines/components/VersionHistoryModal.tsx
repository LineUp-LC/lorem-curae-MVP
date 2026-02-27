import { useState, useEffect } from 'react';
import { loadVersionsForRoutine, type RoutineVersion } from '../../../lib/utils/routineVersioning';
import { saveRoutineToSupabase, type SavedRoutine, type RoutineStep } from '../../../lib/utils/routineState';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRevert?: () => void;
  routineId: string;
  routineName: string;
}

export default function VersionHistoryModal({
  isOpen,
  onClose,
  onRevert,
  routineId,
  routineName,
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<RoutineVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [reverting, setReverting] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    loadVersionsForRoutine(routineId).then((v) => {
      setVersions(v);
      setLoading(false);
    });
  }, [isOpen, routineId]);

  const handleRevert = async (version: RoutineVersion) => {
    setReverting(version.id);
    const reverted: SavedRoutine = {
      id: routineId,
      name: version.name,
      timeOfDay: version.timeOfDay,
      steps: version.steps,
      stepCount: version.stepCount,
      createdAt: version.createdAt,
      updatedAt: new Date().toISOString(),
    };
    await saveRoutineToSupabase(reverted);
    setReverting(null);
    onRevert?.();
    onClose();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-deep/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Version History"
    >
      <div className="bg-cream rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-blush bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <i className="ri-history-line text-primary text-lg"></i>
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-deep">Version History</h2>
              <p className="text-xs text-warm-gray truncate max-w-[200px] sm:max-w-none">{routineName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-cream hover:bg-blush flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close version history"
          >
            <i className="ri-close-line text-xl text-warm-gray"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-cream">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <i className="ri-loader-4-line text-3xl text-primary animate-spin"></i>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-3">
                <i className="ri-history-line text-warm-gray/40 text-2xl"></i>
              </div>
              <p className="text-warm-gray text-sm">No version history yet</p>
              <p className="text-warm-gray/60 text-xs mt-1">Versions are created each time you save</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, idx) => (
                <div
                  key={version.id}
                  className={`bg-white rounded-xl p-4 border ${idx === 0 ? 'border-primary/30' : 'border-blush'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-deep">
                          v{version.versionNumber}
                        </span>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                            Current
                          </span>
                        )}
                        {version.label && (
                          <span className="px-2 py-0.5 bg-sage/10 text-sage-700 text-xs rounded-full">
                            {version.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-warm-gray mb-1">{formatDate(version.createdAt)}</p>
                      <div className="flex items-center gap-3 text-xs text-warm-gray/80">
                        <span><i className="ri-list-check mr-1"></i>{version.stepCount} steps</span>
                        <span className="capitalize"><i className="ri-time-line mr-1"></i>{version.timeOfDay}</span>
                      </div>
                      {version.changeSummary && (
                        <p className="text-xs text-warm-gray mt-2 italic">{version.changeSummary}</p>
                      )}
                    </div>
                    {idx > 0 && (
                      <button
                        onClick={() => handleRevert(version)}
                        disabled={reverting === version.id}
                        className="px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                      >
                        {reverting === version.id ? (
                          <><i className="ri-loader-4-line animate-spin mr-1"></i>Reverting</>
                        ) : (
                          <><i className="ri-arrow-go-back-line mr-1"></i>Revert</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blush bg-white">
          <p className="text-xs text-warm-gray flex items-center gap-1">
            <i className="ri-information-line"></i>
            Versions are created automatically when you save your routine
          </p>
        </div>
      </div>
    </div>
  );
}
