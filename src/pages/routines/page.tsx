import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import RoutineBuilder from './components/RoutineBuilder';
import { sessionState } from '../../lib/utils/sessionState';
import { onAction } from '../../lib/utils/gamificationTriggers';
import RoutineTutorial from './components/RoutineTutorial';
import { useLocalStorageState } from '../../lib/utils/useLocalStorageState';
import { saveRoutineToSupabase, getLocalRoutines, saveLocalRoutines, hydrateRoutines, SavedRoutine } from '../../lib/utils/routineState';
import { useAuth } from '../../lib/auth/AuthContext';
import { logRoutineUsage } from '../../lib/utils/routineAnalytics';
import { createVersionSnapshot } from '../../lib/utils/routineVersioning';
import { useSavedProducts } from '../../lib/utils/favoritesState';

export default function RoutinesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Persisted state for continuity between sessions
  const [routineSteps, setRoutineSteps] = useLocalStorageState<any[]>(
    'routine_builder_steps',
    []
  );
  const [routineName, setRoutineName] = useLocalStorageState<string>(
    'routine_builder_name',
    'My Skincare Routine'
  );

  const { savedProducts, removeSavedProduct } = useSavedProducts();
  const [isEditingName, setIsEditingName] = useState(false);
  const [showBrowsePopup, setShowBrowsePopup] = useState(false);
  const [showSavedProductsPopup, setShowSavedProductsPopup] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Check if tutorial should show on first visit
  useEffect(() => {
    const tutorialComplete = localStorage.getItem('routineBuilderTutorialComplete');
    if (!tutorialComplete) {
      setShowTutorial(true);
    }
  }, [searchParams]);

  useEffect(() => {
    sessionState.navigateTo('/routines');

    // Load routine name from URL params or localStorage
    const routineId = searchParams.get('id');

    if (routineId) {
      hydrateRoutines().then((savedRoutines) => {
        const routine = savedRoutines.find((r) => r.id === routineId);
        if (routine) {
          setRoutineName(routine.name);
          if (routine.steps && routine.steps.length > 0) {
            setRoutineSteps(routine.steps);
          }
        }
      });
    }

  }, [searchParams]);

  const handleSaveRoutineName = () => {
    setIsEditingName(false);
    // Save to localStorage
    const routineId = searchParams.get('id');
    if (routineId) {
      const savedRoutines = getLocalRoutines();
      const updatedRoutines = savedRoutines.map((r) =>
        r.id === routineId ? { ...r, name: routineName } : r
      );
      saveLocalRoutines(updatedRoutines);
    }
    sessionState.trackInteraction('click', 'save-routine-name', { name: routineName });
  };

  const handleRemoveSavedProduct = (productId: number) => {
    removeSavedProduct(productId);
  };

  const handleAddStep = (step: any) => {
    const newSteps = [...routineSteps, { ...step, id: Date.now().toString() }];
    setRoutineSteps(newSteps);
    
    // Update session context with routine
    sessionState.updateContext({ routineSteps: newSteps });
    sessionState.trackInteraction('click', 'add-routine-step', { step: step.type });
  };

  const handleRemoveStep = (stepId: string) => {
    const newSteps = routineSteps.filter(s => s.id !== stepId);
    setRoutineSteps(newSteps);
    
    sessionState.updateContext({ routineSteps: newSteps });
    sessionState.trackInteraction('click', 'remove-routine-step', { stepId });
  };

  const handleReorderSteps = (newOrder: any[]) => {
    setRoutineSteps(newOrder);
    sessionState.updateContext({ routineSteps: newOrder });
    sessionState.trackInteraction('click', 'reorder-routine-steps');
  };

  const handleSaveRoutine = async (data: { morningSteps: any[], eveningSteps: any[] }) => {
    const { morningSteps, eveningSteps } = data;
    const allSteps = [...morningSteps, ...eveningSteps];
    if (allSteps.length === 0) return;

    const now = new Date().toISOString();
    const hasMorning = morningSteps.length > 0;
    const hasEvening = eveningSteps.length > 0;
    const timeOfDay: 'morning' | 'evening' | 'both' =
      hasMorning && hasEvening ? 'both' : hasMorning ? 'morning' : 'evening';

    // Reuse existing ID when editing, otherwise generate one new UUID
    const existingId = searchParams.get('id');
    const routineId = existingId || crypto.randomUUID();

    const routine: SavedRoutine = {
      id: routineId,
      name: routineName,
      description: `Skincare routine`,
      timeOfDay,
      steps: allSteps.map((step, index) => ({
        id: step.id,
        stepNumber: index + 1,
        title: step.title,
        description: step.description,
        timeOfDay: step.timeOfDay,
        product: step.product,
        recommended: step.recommended || false,
      })),
      stepCount: allSteps.length,
      createdAt: existingId
        ? (getLocalRoutines().find(r => r.id === existingId)?.createdAt || now)
        : now,
      updatedAt: now,
    };

    const saved = await saveRoutineToSupabase(routine);
    if (saved) {
      await createVersionSnapshot(routine.id, routine);
    }

    sessionState.completeAction('save-routine');
    sessionState.trackInteraction('click', 'save-routine', {
      morningSteps: morningSteps.length,
      eveningSteps: eveningSteps.length,
    });
    if (user) {
      logRoutineUsage(user.id, routine.id, existingId ? 'routine_updated' : 'routine_created');
      // Gamification: award routine creation points (non-blocking)
      if (!existingId) {
        onAction(user.id, 'ROUTINE_CREATED', {
          totalRoutines: getLocalRoutines().length,
        }).catch(() => {});
      }
    }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back to Routines */}
          <div className="flex justify-start mb-4">
            <button
              onClick={() => navigate('/routines-list')}
              className="flex items-center gap-2 text-warm-gray hover:text-deep transition-colors cursor-pointer text-sm"
            >
              <i className="ri-arrow-left-line"></i>
              Back to Routines
            </button>
          </div>

          {/* Header - Shows routine name only */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    className="text-4xl lg:text-6xl font-serif text-deep-900 bg-transparent border-b-2 border-deep focus:outline-none text-center"
                    autoFocus
                    onBlur={handleSaveRoutineName}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRoutineName()}
                  />
                </div>
              ) : (
                <h1 
                  className="text-4xl lg:text-6xl font-serif text-deep-900 cursor-pointer hover:text-taupe-700 transition-colors flex items-center gap-3"
                  onClick={() => setIsEditingName(true)}
                >
                  {routineName}
                  <button className="text-gray-400 hover:text-deep transition-colors">
                    <i className="ri-pencil-line text-2xl"></i>
                  </button>
                </h1>
              )}
            </div>
          </div>

          {/* View Saved Products CTA (Task 11) */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setShowSavedProductsPopup(true)}
              className="px-4 py-2 bg-taupe-100 text-taupe-700 rounded-full text-sm font-medium hover:bg-taupe-200 transition-colors cursor-pointer flex items-center gap-2"
            >
              <i className="ri-bookmark-line"></i>
              View Saved Products ({savedProducts.length})
            </button>
          </div>

          {/* Content */}
          <RoutineBuilder
            steps={routineSteps}
            onAddStep={handleAddStep}
            onRemoveStep={handleRemoveStep}
            onReorderSteps={handleReorderSteps}
            onSave={handleSaveRoutine}
            onBrowseClick={() => setShowBrowsePopup(true)}
          />
        </div>
      </main>

      {/* Browse Popup (Task 7) */}
      {showBrowsePopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowBrowsePopup(false)}
              className="absolute top-4 right-4 text-warm-gray/60 hover:text-warm-gray transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-taupe-100 flex items-center justify-center mx-auto mb-4">
                <i className="ri-search-line text-taupe text-3xl"></i>
              </div>
              <h3 className="text-2xl font-serif font-bold text-deep mb-2">Browse Products</h3>
              <p className="text-warm-gray text-sm">Find products to add to your routine</p>
            </div>

            <div className="space-y-3">
              <Link
                to="/marketplace"
                className="w-full px-6 py-4 bg-primary text-white rounded-xl hover:bg-dark transition-colors text-left flex items-center gap-4 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <i className="ri-shopping-bag-3-line text-2xl"></i>
                </div>
                <div>
                  <p className="font-semibold">Browse Marketplace</p>
                  <p className="text-sm text-cream-100">Shop curated products and services</p>
                </div>
                <i className="ri-arrow-right-line text-xl ml-auto"></i>
              </Link>

              <Link
                to="/discover"
                className="w-full px-6 py-4 bg-white border-2 border-primary text-primary rounded-xl hover:bg-cream transition-colors text-left flex items-center gap-4 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <i className="ri-compass-discover-line text-2xl text-primary"></i>
                </div>
                <div>
                  <p className="font-semibold">Browse Discovery</p>
                  <p className="text-sm text-warm-gray">Explore personalized recommendations</p>
                </div>
                <i className="ri-arrow-right-line text-xl ml-auto"></i>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Saved Products Popup (Task 11) */}
      {showSavedProductsPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden relative">
            <div className="p-6 border-b border-blush flex items-center justify-between">
              <h3 className="text-xl font-bold text-deep">Saved Products</h3>
              <button
                onClick={() => setShowSavedProductsPopup(false)}
                className="text-warm-gray/60 hover:text-warm-gray transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {savedProducts.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-bookmark-line text-4xl text-warm-gray/40 mb-3"></i>
                  <p className="text-warm-gray">No saved products yet</p>
                  <Link to="/discover" className="text-taupe hover:underline text-sm mt-2 inline-block">
                    Browse products to save
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedProducts.map((product: any) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 bg-cream-50 rounded-xl">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-warm-gray/80">{product.brand}</p>
                        <p className="font-medium text-deep truncate">{product.name}</p>
                        <p className="text-sm text-taupe">{product.priceRange}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/product-detail?id=${product.id}`}
                          className="p-2 text-deep hover:bg-deep/10 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <i className="ri-eye-line"></i>
                        </Link>
                        <button
                          onClick={() => handleRemoveSavedProduct(product.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* First-Time Tutorial */}
      {showTutorial && (
        <RoutineTutorial onComplete={() => {
          setShowTutorial(false);
        }} />
      )}

    </div>
  );
}