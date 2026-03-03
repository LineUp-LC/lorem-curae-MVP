import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hydrateRoutines, deleteRoutineFromSupabase, saveRoutineToSupabase, getLocalRoutines, saveLocalRoutines, SavedRoutine } from '../../lib/utils/routineState';
import NotesSection from '../routines/components/NotesSection';
import { useAuth } from '../../lib/auth/AuthContext';
import { logRoutineUsage } from '../../lib/utils/routineAnalytics';
import VersionHistoryModal from '../routines/components/VersionHistoryModal';
import TimelineTab from '../routines/components/TimelineTab';
import RoutineListTutorial from './components/RoutineListTutorial';

interface Routine {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  stepCount: number;
  completionRate: number;
  thumbnail?: string;
  timeOfDay?: 'morning' | 'evening' | 'both';
}

// Education flow content
const educationSteps = [
  {
    title: "Understanding AM Routines",
    icon: "ri-sun-line",
    content: "Your morning routine is all about preparing your skin for the day ahead. It focuses on protection, hydration, and creating a smooth base before you're exposed to sunlight, pollution, and daily stressors.",
    tip: "The key is to end with SPF - this protects all the work you've done!"
  },
  {
    title: "Understanding PM Routines",
    icon: "ri-moon-line",
    content: "Your evening routine is all about repair, renewal, and deeper treatment. Nighttime is when your skin shifts into recovery mode, making it the ideal time to use richer products and stronger actives.",
    tip: "Nighttime is when your skin does most of its repair work!"
  },
  {
    title: "The Importance of Order",
    icon: "ri-sort-asc",
    content: "Skincare products are applied from thinnest to thickest so each layer can absorb properly. Lighter, water-based formulas sink in quickly, while heavier creams and oils sit on top to seal everything in. Applying them out of order can block absorption or reduce effectiveness.",
    tip: "Think of it like building layers - each one should be able to penetrate the previous layer."
  },
];

export default function RoutinesListPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRoutines = async () => {
    try {
      const savedRoutines = await hydrateRoutines();
      const mappedRoutines: Routine[] = savedRoutines.map(r => {
        const stepsWithProducts = r.steps ? r.steps.filter(s => s.product).length : 0;
        const totalSteps = r.steps ? r.steps.length : r.stepCount;
        const completionRate = totalSteps > 0 ? Math.round((stepsWithProducts / totalSteps) * 100) : 0;
        return {
          id: r.id,
          name: r.name,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          stepCount: r.stepCount,
          completionRate,
          thumbnail: r.thumbnail,
          timeOfDay: r.timeOfDay,
        };
      });
      setRoutines(mappedRoutines);
    } catch (e) {
      console.error('[RoutinesList] Failed to load routines:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Hydrate routines from Supabase/localStorage once auth is settled
  useEffect(() => {
    if (authLoading) return;
    loadRoutines();
  }, [authLoading]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [shareRoutineId, setShareRoutineId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [kebabMenuId, setKebabMenuId] = useState<string | null>(null);
  const [versionHistoryRoutineId, setVersionHistoryRoutineId] = useState<string | null>(null);
  const [showListTutorial, setShowListTutorial] = useState(() => {
    return !localStorage.getItem('routineListTutorialComplete');
  });

  // Close kebab menu on outside click
  useEffect(() => {
    if (!kebabMenuId) return;
    const handleClick = () => setKebabMenuId(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [kebabMenuId]);

  // Routine builder education flow state
  const [showIntroPopup, setShowIntroPopup] = useState(false);
  const [showFamiliarityPopup, setShowFamiliarityPopup] = useState(false);
  const [showEducationFlow, setShowEducationFlow] = useState(false);
  const [educationStep, setEducationStep] = useState(0);
  const [showSystemExplanation, setShowSystemExplanation] = useState(false);
  const [hasSeenRoutineIntro] = useState(() => {
    return localStorage.getItem('hasSeenRoutineIntro') === 'true';
  });
  const [userConcerns, setUserConcerns] = useState<string[]>(() => {
    const saved = localStorage.getItem('skinSurveyData');
    if (saved) {
      try {
        return JSON.parse(saved).concerns || [];
      } catch { return []; }
    }
    return [];
  });

  const handleEditName = (routine: Routine) => {
    setEditingId(routine.id);
    setEditingName(routine.name);
  };

  const handleSaveName = async (id: string) => {
    // Update React state immediately (optimistic)
    setRoutines(prev =>
      prev.map(r =>
        r.id === id ? { ...r, name: editingName } : r
      )
    );
    setEditingId(null);

    // Persist to localStorage + Supabase
    const local = getLocalRoutines();
    const routine = local.find(r => r.id === id);
    if (routine) {
      const updated: SavedRoutine = { ...routine, name: editingName, updatedAt: new Date().toISOString() };
      const updatedLocal = local.map(r => r.id === id ? updated : r);
      saveLocalRoutines(updatedLocal);
      await saveRoutineToSupabase(updated);
      if (user) logRoutineUsage(user.id, id, 'routine_updated');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDeleteRoutine = async (id: string) => {
    setDeleting(true);
    // Optimistic UI update
    setRoutines(prev => prev.filter(r => r.id !== id));
    setDeleteConfirmId(null);

    const success = await deleteRoutineFromSupabase(id);
    if (!success) {
      // Revert on failure - reload routines
      const reloaded = await hydrateRoutines();
      setRoutines(reloaded.map(r => {
        const stepsWithProducts = r.steps ? r.steps.filter(s => s.product).length : 0;
        const totalSteps = r.steps ? r.steps.length : r.stepCount;
        const completionRate = totalSteps > 0 ? Math.round((stepsWithProducts / totalSteps) * 100) : 0;
        return {
          id: r.id,
          name: r.name,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          stepCount: r.stepCount,
          completionRate,
          thumbnail: r.thumbnail,
          timeOfDay: r.timeOfDay,
        };
      }));
    }
    setDeleting(false);
    if (user) logRoutineUsage(user.id, id, 'routine_deleted');
  };

  const handleShareRoutine = async (routineId: string) => {
    setShareRoutineId(routineId);
    
    // Simulate screenshot capture
    setTimeout(() => {
      const shareUrl = `${window.location.origin}/routines/${routineId}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'My Skincare Routine',
          text: 'Check out my skincare routine!',
          url: shareUrl,
        }).catch(() => {
          // Fallback to copy link
          navigator.clipboard.writeText(shareUrl).catch(() => {
            console.error('Failed to copy link to clipboard');
          });
          alert('Link copied to clipboard!');
        });
      } else {
        navigator.clipboard.writeText(shareUrl).catch(() => {
          console.error('Failed to copy link to clipboard');
        });
        alert('Link copied to clipboard!');
      }
      
      setShareRoutineId(null);
    }, 500);
  };

  const handleCreateRoutine = () => {
    // Skip popup if user has already seen it
    if (hasSeenRoutineIntro) {
      navigate('/routines');
      return;
    }
    setShowFamiliarityPopup(true);
  };

  const handleFamiliarityResponse = (isFamiliar: boolean) => {
    setShowFamiliarityPopup(false);
    if (isFamiliar) {
      setShowSystemExplanation(true);
    } else {
      setShowIntroPopup(true);
    }
    // Mark as seen after first interaction
    localStorage.setItem('hasSeenRoutineIntro', 'true');
  };

  const handleIntroResponse = (wantsEducation: boolean) => {
    setShowIntroPopup(false);
    if (wantsEducation) {
      setShowEducationFlow(true);
      setEducationStep(0);
    } else {
      navigate('/routines');
    }
  };

  const handleNextEducationStep = () => {
    if (educationStep < educationSteps.length - 1) {
      setEducationStep(educationStep + 1);
    } else {
      setShowEducationFlow(false);
      navigate('/routines');
    }
  };

  const handleSkipEducation = () => {
    setShowEducationFlow(false);
    navigate('/routines');
  };

  const handleStartBuilding = () => {
    setShowSystemExplanation(false);
    navigate('/routines');
  };

  const [notesRoutineId, setNotesRoutineId] = useState<string | null>(null);
  const [notesModalTab, setNotesModalTab] = useState<'notes' | 'timeline'>('notes');

  const handleViewNotes = (id: string) => {
    setNotesRoutineId(id);
    setNotesModalTab('notes');
    if (user) logRoutineUsage(user.id, id, 'notes_opened');
  };

  const handleEditRoutine = (id: string) => {
    navigate(`/routines?id=${id}`);
  };

  const getStepLabel = (id: string, stepCount: number, timeOfDay?: string) => {
    if (timeOfDay === 'both') {
      const saved = getLocalRoutines().find(r => r.id === id);
      if (saved?.steps) {
        const am = saved.steps.filter(s => s.timeOfDay === 'morning').length;
        const pm = saved.steps.filter(s => s.timeOfDay === 'evening').length;
        if (am > 0 && pm > 0) return `${am} AM \u00B7 ${pm} PM steps`;
      }
    }
    return `${stepCount} steps`;
  };

  return (
    <div className="min-h-screen bg-cream">
      
      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          {/* CHANGED: mb-12 -> mb-8 sm:mb-12 */}
          <div className="text-center mb-6 sm:mb-8">
            {/* Updated: consistent with design system */}
            <h1 className="text-3xl sm:text-4xl font-serif text-deep mb-2">
              My Skincare Routines
            </h1>
            {/* CHANGED: text-lg -> text-base sm:text-lg, added px-4 */}
            <p className="text-lg text-warm-gray max-w-2xl mx-auto">
              Manage all your personalized skincare routines in one place
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <i className="ri-loader-4-line text-4xl text-primary animate-spin mb-4 block"></i>
                <p className="text-warm-gray">Loading your routines...</p>
              </div>
            </div>
          )}

          {/* Routines Grid */}
          {/* CHANGED: grid md:grid-cols-2 lg:grid-cols-3 gap-6 -> grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 */}
          {!isLoading && (
          <>
          {routines.length === 0 && (
            <div className="text-center mb-6">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-warm-gray/60 mb-1">
                No Routines Yet
              </h3>
              <p className="text-sm text-warm-gray/80 max-w-md mx-auto">
                Start building your first skincare routine with our guided template
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Create New Routine Card */}
            {/* CHANGED: rounded-2xl -> rounded-xl sm:rounded-2xl, p-8 -> p-6 sm:p-8, min-h-[400px] -> min-h-[300px] sm:min-h-[400px] */}
            <div
              data-tutorial="build-routine"
              onClick={handleCreateRoutine}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border-2 border-dashed border-blush hover:border-primary p-5 sm:p-6 flex flex-col items-center justify-center min-h-[200px] sm:min-h-[240px] cursor-pointer transition-all group"
            >
              {/* CHANGED: w-20 h-20 -> w-16 h-16 sm:w-20 sm:h-20, mb-4 -> mb-3 sm:mb-4 */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-2 sm:mb-3 transition-colors">
                <i className="ri-add-line text-2xl sm:text-3xl text-deep"></i>
              </div>
              {/* CHANGED: text-2xl -> text-xl sm:text-2xl, added text-center */}
              <h3 className="font-serif text-lg sm:text-xl font-bold text-deep mb-1 text-center">
                Build Your Routine
              </h3>
              <p className="text-warm-gray text-center text-sm">
                Create a new personalized skincare routine with our guided template
              </p>
            </div>

            {/* Existing Routines */}
            {routines.map((routine) => (
              <div
                key={routine.id}
                /* CHANGED: rounded-2xl -> rounded-xl sm:rounded-2xl */
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Thumbnail */}
                {/* CHANGED: h-48 -> h-40 sm:h-48 */}
                <div className="relative h-28 sm:h-36 overflow-hidden bg-cream">
                  {routine.thumbnail ? (
                    <img
                      src={routine.thumbnail}
                      alt={routine.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-light/30">
                      <i className={`text-3xl text-primary/40 ${
                        routine.timeOfDay === 'morning' ? 'ri-sun-line' :
                        routine.timeOfDay === 'evening' ? 'ri-moon-line' :
                        'ri-calendar-line'
                      }`}></i>
                    </div>
                  )}
                  {/* 3-dot Kebab Menu */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setKebabMenuId(kebabMenuId === routine.id ? null : routine.id);
                      }}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                      title="More options"
                    >
                      <i className="ri-more-2-fill text-deep"></i>
                    </button>

                    {kebabMenuId === routine.id && (
                      <div className="absolute top-full right-0 mt-1.5 bg-white rounded-xl shadow-lg border border-blush overflow-hidden min-w-[160px] z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareRoutine(routine.id);
                            setKebabMenuId(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-deep hover:bg-cream/60 transition-colors flex items-center gap-2.5 cursor-pointer"
                        >
                          <i className="ri-share-line"></i>
                          Share Routine
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(routine.id);
                            setKebabMenuId(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50/60 transition-colors flex items-center gap-2.5 cursor-pointer"
                        >
                          <i className="ri-delete-bin-line"></i>
                          Delete Routine
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Completion Badge */}
                  <div className="absolute bottom-3 left-3">
                    {routine.completionRate === 100 ? (
                      <div className="px-2 sm:px-3 py-1 bg-sage/90 rounded-full text-xs font-medium text-white flex items-center gap-1">
                        <i className="ri-check-line"></i>
                        Completed
                      </div>
                    ) : (
                      <div className="px-2 sm:px-3 py-1 bg-white/90 rounded-full text-xs font-medium text-deep">
                        {routine.completionRate}% Complete
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                {/* CHANGED: p-6 -> p-4 sm:p-6 */}
                <div className="p-3 sm:p-4">
                  {/* Editable Name */}
                  {editingId === routine.id ? (
                    <div className="mb-4">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        /* CHANGED: text-xl -> text-lg sm:text-xl */
                        className="w-full px-3 py-1.5 border border-primary rounded-lg font-serif text-base sm:text-lg font-bold text-deep focus:outline-none focus:ring-2 focus:ring-primary/20"
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSaveName(routine.id)}
                          /* CHANGED: px-4 -> px-3 sm:px-4 */
                          className="flex-1 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          /* CHANGED: px-4 -> px-3 sm:px-4 */
                          className="flex-1 px-3 sm:px-4 py-2 bg-blush text-warm-gray rounded-lg hover:bg-blush transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* CHANGED: mb-4 -> mb-3 sm:mb-4 */
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      {/* CHANGED: text-2xl -> text-xl sm:text-2xl, added line-clamp-1 */}
                      <h3 className="font-serif text-base sm:text-lg font-bold text-deep flex-1 line-clamp-1">
                        {routine.name}
                      </h3>
                      {/* ADDED: flex-shrink-0 to prevent button from shrinking */}
                      <button
                        onClick={() => handleEditName(routine)}
                        className="w-8 h-8 rounded-lg hover:bg-cream flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                        title="Edit Name"
                      >
                        <i className="ri-pencil-line text-deep"></i>
                      </button>
                    </div>
                  )}

                  {/* Stats */}
                  {/* CHANGED: gap-4 mb-4 text-sm -> gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 text-xs text-warm-gray">
                    <div className="flex items-center gap-1">
                      <i className="ri-list-check text-deep"></i>
                      <span>{getStepLabel(routine.id, routine.stepCount, routine.timeOfDay)}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {/* CHANGED: mb-4 -> mb-3 sm:mb-4 */}
                  <div className="mb-2 sm:mb-3">
                    <div className="h-2 bg-blush rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          routine.completionRate === 100 ? 'bg-sage' : 'bg-primary'
                        }`}
                        style={{ width: `${routine.completionRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditRoutine(routine.id)}
                      className="flex-1 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-pencil-line mr-1 sm:mr-2"></i>
                      Edit
                    </button>
                    <button
                      onClick={() => handleViewNotes(routine.id)}
                      className="flex-1 px-3 sm:px-4 py-2 bg-sage/10 text-sage-700 border border-sage/30 rounded-lg hover:bg-sage/20 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer"
                      title="Notes & Progress"
                    >
                      <i className="ri-file-text-line mr-1 sm:mr-2"></i>
                      Notes
                    </button>
                    <button
                      onClick={() => setVersionHistoryRoutineId(routine.id)}
                      className="px-3 sm:px-4 py-2 bg-warm-gray/10 text-warm-gray border border-warm-gray/20 rounded-lg hover:bg-warm-gray/20 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer"
                      title="Version History"
                    >
                      <i className="ri-history-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
          )}
        </div>
      </main>

      {/* Phase 1: Familiarity Popup */}
      {showFamiliarityPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-light/30 flex items-center justify-center mx-auto mb-6">
                <i className="ri-hand-heart-line text-primary text-4xl"></i>
              </div>
              <h3 className="text-2xl font-serif font-bold text-deep mb-3">
                Let's Build Your Perfect Routine
              </h3>
              <p className="text-warm-gray">
                Our Routine Builder helps you create a personalized skincare regimen with guided steps, product recommendations, and ingredient conflict detection.
              </p>
            </div>

            <div className="bg-cream/50 border border-blush rounded-xl p-4 mb-6">
              <p className="text-sm text-deep font-medium mb-1">Quick question:</p>
              <p className="text-warm-gray text-sm">Are you familiar with building skincare routines (cleansers, serums, moisturizers, etc.)?</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleFamiliarityResponse(true)}
                className="flex-1 px-6 py-4 bg-primary text-white rounded-xl hover:bg-dark transition-colors font-medium cursor-pointer"
              >
                Yes, I know the basics
              </button>
              <button
                onClick={() => handleFamiliarityResponse(false)}
                className="flex-1 px-6 py-4 border-2 border-primary text-deep rounded-xl hover:bg-cream transition-colors font-medium cursor-pointer"
              >
                No, I'm new to this
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 1.5: Introduction for New Users */}
      {showIntroPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-light/30 flex items-center justify-center mx-auto mb-4">
                <i className="ri-hand-heart-line text-primary text-3xl"></i>
              </div>
              <h3 className="text-2xl font-serif font-bold text-deep mb-3">
                No worries — we've got you covered!
              </h3>
              <p className="text-warm-gray">
                Building a skincare routine doesn't have to be overwhelming. We'll walk you through the essentials so you feel confident every step of the way.
              </p>
            </div>

            {/* What you'll learn */}
            <div className="bg-cream/50 border border-blush rounded-xl p-5 mb-6">
              <p className="text-sm font-semibold text-deep mb-3">In just 2 minutes, you'll learn:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-warm-gray">
                  <i className="ri-check-line text-primary mt-0.5"></i>
                  <span>The difference between AM and PM routines</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-warm-gray">
                  <i className="ri-check-line text-primary mt-0.5"></i>
                  <span>Why product order matters</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-warm-gray">
                  <i className="ri-check-line text-primary mt-0.5"></i>
                  <span>Pro tips personalized to your skin concerns</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleIntroResponse(true)}
                className="w-full px-6 py-4 bg-primary text-white rounded-xl hover:bg-dark transition-colors font-medium cursor-pointer"
              >
                <i className="ri-graduation-cap-line mr-2"></i>
                Show me how it works
              </button>
              <button
                onClick={() => handleIntroResponse(false)}
                className="w-full px-6 py-3 text-warm-gray hover:text-deep hover:bg-cream rounded-xl transition-colors text-sm cursor-pointer"
              >
                Skip for now — I'll explore on my own
              </button>
            </div>

            <p className="text-xs text-warm-gray/70 text-center mt-4">
              You can always revisit these tips from the Help menu
            </p>
          </div>
        </div>
      )}

      {/* Phase 2: Education Flow (for users not familiar) */}
      {showEducationFlow && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {educationSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    idx <= educationStep ? 'bg-primary' : 'bg-blush'
                  }`}
                />
              ))}
            </div>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-light/30 flex items-center justify-center mx-auto mb-4">
                <i className={`${educationSteps[educationStep].icon} text-primary text-3xl`}></i>
              </div>
              <h3 className="text-xl font-bold text-deep mb-3">
                {educationSteps[educationStep].title}
              </h3>
              <p className="text-warm-gray mb-4">
                {educationSteps[educationStep].content}
              </p>
              
              {/* Personalized tip based on user concerns */}
              {userConcerns.length > 0 && (
                <div className="bg-light/20 border border-blush rounded-lg p-4 mt-4">
                  <p className="text-sm text-primary-700">
                    <i className="ri-lightbulb-flash-line mr-2"></i>
                    <strong>Personalized for you:</strong> This step is especially beneficial for your concern: <span className="font-semibold">{userConcerns[0]}</span>
                  </p>
                </div>
              )}
              
              <div className="bg-primary-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-primary-700 italic">
                  💡 {educationSteps[educationStep].tip}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSkipEducation}
                className="px-4 py-3 text-warm-gray hover:text-deep hover:bg-cream rounded-xl transition-colors text-sm cursor-pointer"
              >
                Skip to builder
              </button>
              <button
                onClick={handleNextEducationStep}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-dark transition-colors font-medium cursor-pointer"
              >
                {educationStep < educationSteps.length - 1 ? 'Next' : 'Start Building'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: System Explanation (for familiar users) */}
      {showSystemExplanation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-light/30 flex items-center justify-center mx-auto mb-6">
              <i className="ri-checkbox-circle-line text-primary text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-deep mb-4">
              Here's how the regimen system works
            </h3>
            <div className="text-left space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <i className="ri-drag-move-line text-primary text-xl mt-0.5"></i>
                <p className="text-warm-gray text-sm">Drag and drop steps to reorder your routine</p>
              </div>
              <div className="flex items-start gap-3">
                <i className="ri-add-circle-line text-primary text-xl mt-0.5"></i>
                <p className="text-warm-gray text-sm">Add products from your saved list or browse new ones</p>
              </div>
              <div className="flex items-start gap-3">
                <i className="ri-alert-line text-primary text-xl mt-0.5"></i>
                <p className="text-warm-gray text-sm">Our conflict detection warns about ingredient interactions</p>
              </div>
              <div className="flex items-start gap-3">
                <i className="ri-calendar-check-line text-primary text-xl mt-0.5"></i>
                <p className="text-warm-gray text-sm">Track your progress with daily check-ins and notes</p>
              </div>
            </div>
            <button
              onClick={handleStartBuilding}
              className="w-full px-6 py-4 bg-primary text-white rounded-xl hover:bg-dark transition-colors font-medium cursor-pointer"
            >
              Start Building
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <i className="ri-delete-bin-line text-red-500 text-2xl"></i>
              </div>
              <h3 className="font-serif text-lg font-semibold text-deep mb-2">Delete Routine</h3>
              <p className="text-sm text-warm-gray">
                Are you sure you want to delete this routine? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-blush text-warm-gray rounded-lg text-sm font-medium hover:bg-cream transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRoutine(deleteConfirmId)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
              >
                {deleting ? (
                  <><i className="ri-loader-4-line animate-spin mr-2"></i>Deleting...</>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {versionHistoryRoutineId && (
        <VersionHistoryModal
          isOpen={true}
          onClose={() => setVersionHistoryRoutineId(null)}
          onRevert={loadRoutines}
          routineId={versionHistoryRoutineId}
          routineName={routines.find(r => r.id === versionHistoryRoutineId)?.name || 'Routine'}
        />
      )}

      {/* Notes & Progress Modal */}
      {notesRoutineId && (
        <div
          className="fixed inset-0 bg-deep/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setNotesRoutineId(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Routine Notes & Progress"
        >
          <div className="bg-cream rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-blush bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sage/10 flex items-center justify-center">
                  <i className="ri-file-text-line text-sage text-lg"></i>
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-deep">
                    Notes & Progress
                  </h2>
                  <p className="text-xs text-warm-gray">
                    Track observations and assess your skin's progress
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNotesRoutineId(null)}
                className="w-9 h-9 rounded-full bg-cream hover:bg-blush flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close notes panel"
              >
                <i className="ri-close-line text-xl text-warm-gray"></i>
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-blush bg-white px-5">
              <button
                onClick={() => setNotesModalTab('notes')}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  notesModalTab === 'notes'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-warm-gray hover:text-deep'
                }`}
              >
                <i className="ri-file-text-line mr-1.5"></i>
                Notes
              </button>
              <button
                onClick={() => setNotesModalTab('timeline')}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  notesModalTab === 'timeline'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-warm-gray hover:text-deep'
                }`}
              >
                <i className="ri-timeline-view mr-1.5"></i>
                Timeline
              </button>
            </div>

            {/* Content - scrollable */}
            <div className="flex-1 overflow-y-auto p-6 bg-cream">
              {notesModalTab === 'notes' ? (
                <NotesSection autoOpenAssessment={false} />
              ) : (
                <TimelineTab routineId={notesRoutineId ?? undefined} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* First-Time Tutorial */}
      {showListTutorial && (
        <RoutineListTutorial onComplete={() => setShowListTutorial(false)} />
      )}

    </div>
  );
}