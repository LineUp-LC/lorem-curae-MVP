import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  hydrateRoutines,
  saveRoutineToSupabase,
  SavedRoutine,
} from '../../lib/utils/routineState';
import { createVersionSnapshot } from '../../lib/utils/routineVersioning';

interface RoutinePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    brand: string;
    image?: string;
    category?: string;
  };
}

export default function RoutinePickerModal({
  isOpen,
  onClose,
  product,
}: RoutinePickerModalProps) {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState<SavedRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setConfirmation(null);
      setDuplicateWarning(null);
      hydrateRoutines().then((loaded) => {
        setRoutines(loaded);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectRoutine = async (routine: SavedRoutine) => {
    // Check for duplicate
    const alreadyInRoutine = routine.steps.some(
      (step) => step.product && Number(step.product.id) === product.id
    );
    if (alreadyInRoutine) {
      setDuplicateWarning(routine.name);
      setTimeout(() => setDuplicateWarning(null), 3000);
      return;
    }

    setAdding(routine.id);

    const newStep = {
      id: Date.now().toString(),
      stepNumber: routine.steps.length + 1,
      title: product.category || 'Product',
      description: product.name,
      timeOfDay: routine.timeOfDay === 'both' ? ('morning' as const) : routine.timeOfDay,
      product: {
        id: String(product.id),
        name: product.name,
        brand: product.brand,
        image: product.image || '',
        category: product.category || '',
      },
      recommended: false,
    };

    const updatedRoutine: SavedRoutine = {
      ...routine,
      steps: [...routine.steps, newStep],
      stepCount: routine.steps.length + 1,
      updatedAt: new Date().toISOString(),
    };

    await saveRoutineToSupabase(updatedRoutine);
    await createVersionSnapshot(
      routine.id,
      updatedRoutine,
      undefined,
      `Added ${product.name}`
    );

    setAdding(null);
    setConfirmation(routine.name);
    setTimeout(() => {
      setConfirmation(null);
      onClose();
    }, 1500);
  };

  const timeLabel = (tod: 'morning' | 'evening' | 'both') =>
    tod === 'morning' ? 'AM' : tod === 'evening' ? 'PM' : 'AM & PM';

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-blush flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-deep">Add to Routine</h3>
            <p className="text-xs text-warm-gray mt-0.5 truncate max-w-[250px]">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-warm-gray/60 hover:text-warm-gray transition-colors cursor-pointer p-1"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[55vh]">
          {/* Confirmation */}
          {confirmation && (
            <div className="mb-4 p-3 bg-sage/10 border border-sage/20 rounded-xl flex items-center gap-2 text-sm text-sage">
              <i className="ri-check-line text-lg"></i>
              Added to {confirmation}
            </div>
          )}

          {/* Duplicate warning */}
          {duplicateWarning && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-2 text-sm text-yellow-700">
              <i className="ri-error-warning-line text-lg"></i>
              {product.name} is already in {duplicateWarning}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-warm-gray">Loading routines...</p>
            </div>
          ) : routines.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center mx-auto mb-4">
                <i className="ri-calendar-line text-2xl text-warm-gray/50"></i>
              </div>
              <p className="text-sm text-warm-gray mb-4">No routines yet</p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/routines');
                }}
                className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-dark transition-colors cursor-pointer"
              >
                Create Your First Routine
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {routines.map((routine) => (
                <button
                  key={routine.id}
                  onClick={() => handleSelectRoutine(routine)}
                  disabled={adding === routine.id}
                  className="w-full p-3 rounded-xl border border-blush hover:border-primary/40 hover:bg-cream/50 transition-colors cursor-pointer text-left flex items-center gap-3 disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center flex-shrink-0">
                    <i
                      className={`text-lg text-primary/60 ${
                        routine.timeOfDay === 'morning'
                          ? 'ri-sun-line'
                          : routine.timeOfDay === 'evening'
                            ? 'ri-moon-line'
                            : 'ri-time-line'
                      }`}
                    ></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-deep truncate">{routine.name}</p>
                    <p className="text-xs text-warm-gray">
                      {timeLabel(routine.timeOfDay)} · {routine.stepCount} step{routine.stepCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {adding === routine.id ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  ) : (
                    <i className="ri-add-line text-lg text-warm-gray/40 flex-shrink-0"></i>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer — create new option when routines exist */}
        {!loading && routines.length > 0 && (
          <div className="p-4 border-t border-blush">
            <button
              onClick={() => {
                onClose();
                navigate('/routines');
              }}
              className="w-full text-center text-sm text-primary font-medium hover:text-dark transition-colors cursor-pointer py-1"
            >
              <i className="ri-add-circle-line mr-1"></i>
              Create New Routine
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
