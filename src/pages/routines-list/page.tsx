import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import html2canvas from 'html2canvas';

interface Routine {
  id: string;
  name: string;
  createdAt: Date;
  lastModified: Date;
  stepCount: number;
  completionRate: number;
  thumbnail?: string;
}

// Education flow content
const educationSteps = [
  {
    title: "Understanding AM Routines",
    icon: "ri-sun-line",
    content: "Your morning routine focuses on protection and hydration. Start with a gentle cleanser to remove overnight oil buildup, followed by serums that target your specific concerns.",
    tip: "The key is to end with SPF - this protects all the work you've done!"
  },
  {
    title: "Understanding PM Routines",
    icon: "ri-moon-line",
    content: "Evening routines are about repair and treatment. Double cleansing removes makeup and sunscreen, then you apply active ingredients that work while you sleep.",
    tip: "Nighttime is when your skin does most of its repair work!"
  },
  {
    title: "The Importance of Order",
    icon: "ri-sort-asc",
    content: "Products are applied from thinnest to thickest consistency. Water-based serums first, then oils, then creams. This ensures proper absorption.",
    tip: "Think of it like building layers - each one should be able to penetrate the previous layer."
  },
  {
    title: "Why Order Matters",
    icon: "ri-lightbulb-line",
    content: "Applying products in the wrong order can reduce their effectiveness. Heavy creams before serums create a barrier that prevents absorption.",
    tip: "Wait 30-60 seconds between steps for optimal absorption."
  }
];

const mockRoutines: Routine[] = [
  {
    id: '1',
    name: 'Morning Glow Routine',
    createdAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-20'),
    stepCount: 6,
    completionRate: 100,
    thumbnail: 'https://readdy.ai/api/search-image?query=minimalist%20skincare%20products%20arranged%20in%20morning%20routine%20order%20on%20white%20marble%20surface%20with%20natural%20sunlight%20soft%20shadows%20clean%20aesthetic%20product%20photography&width=400&height=300&seq=routine-thumb-1&orientation=landscape',
  },
  {
    id: '2',
    name: 'Evening Repair Routine',
    createdAt: new Date('2024-01-05'),
    lastModified: new Date('2024-01-18'),
    stepCount: 7,
    completionRate: 85,
    thumbnail: 'https://readdy.ai/api/search-image?query=elegant%20nighttime%20skincare%20products%20with%20moon%20and%20stars%20aesthetic%20dark%20moody%20lighting%20luxury%20skincare%20photography%20clean%20minimal%20background&width=400&height=300&seq=routine-thumb-2&orientation=landscape',
  },
  {
    id: '3',
    name: 'Weekend Deep Treatment',
    createdAt: new Date('2024-01-10'),
    lastModified: new Date('2024-01-15'),
    stepCount: 5,
    completionRate: 60,
    thumbnail: 'https://readdy.ai/api/search-image?query=spa-like%20skincare%20treatment%20products%20with%20face%20masks%20and%20serums%20on%20clean%20white%20surface%20with%20green%20plants%20relaxing%20aesthetic%20product%20photography&width=400&height=300&seq=routine-thumb-3&orientation=landscape',
  },
];

export default function RoutinesListPage() {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState<Routine[]>(mockRoutines);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [shareRoutineId, setShareRoutineId] = useState<string | null>(null);
  
  // Routine builder education flow state
  const [showIntroPopup, setShowIntroPopup] = useState(false);
  const [showFamiliarityPopup, setShowFamiliarityPopup] = useState(false);
  const [showEducationFlow, setShowEducationFlow] = useState(false);
  const [educationStep, setEducationStep] = useState(0);
  const [showSystemExplanation, setShowSystemExplanation] = useState(false);
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

  const handleSaveName = (id: string) => {
    setRoutines(prev =>
      prev.map(r =>
        r.id === id ? { ...r, name: editingName, lastModified: new Date() } : r
      )
    );
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
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
    setShowFamiliarityPopup(true);
  };

  const handleFamiliarityResponse = (isFamiliar: boolean) => {
    setShowFamiliarityPopup(false);
    if (isFamiliar) {
      setShowSystemExplanation(true);
    } else {
      setShowIntroPopup(true);
    }
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

  const handleViewNotes = (id: string) => {
    navigate(`/routines?id=${id}&tab=notes`);
  };

  const handleEditRoutine = (id: string) => {
    navigate(`/routines?id=${id}&tab=routine`);
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      {/* CHANGED: pt-24 -> pt-20 sm:pt-24, pb-16 -> pb-12 sm:pb-16 */}
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          {/* CHANGED: mb-12 -> mb-8 sm:mb-12 */}
          <div className="text-center mb-8 sm:mb-12">
            {/* Updated: consistent with design system */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-deep mb-4">
              My Skincare Routines
            </h1>
            {/* CHANGED: text-lg -> text-base sm:text-lg, added px-4 */}
            <p className="text-lg text-warm-gray max-w-2xl mx-auto">
              Manage all your personalized skincare routines in one place
            </p>
          </div>

          {/* Routines Grid */}
          {/* CHANGED: grid md:grid-cols-2 lg:grid-cols-3 gap-6 -> grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Create New Routine Card */}
            {/* CHANGED: rounded-2xl -> rounded-xl sm:rounded-2xl, p-8 -> p-6 sm:p-8, min-h-[400px] -> min-h-[300px] sm:min-h-[400px] */}
            <div
              onClick={handleCreateRoutine}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border-2 border-dashed border-blush hover:border-primary p-6 sm:p-8 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] cursor-pointer transition-all group"
            >
              {/* CHANGED: w-20 h-20 -> w-16 h-16 sm:w-20 sm:h-20, mb-4 -> mb-3 sm:mb-4 */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-3 sm:mb-4 transition-colors">
                {/* CHANGED: text-4xl -> text-3xl sm:text-4xl */}
                <i className="ri-add-line text-3xl sm:text-4xl text-deep"></i>
              </div>
              {/* CHANGED: text-2xl -> text-xl sm:text-2xl, added text-center */}
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-deep mb-2 text-center">
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
                <div className="relative h-40 sm:h-48 overflow-hidden bg-cream">
                  <img
                    src={routine.thumbnail}
                    alt={routine.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => handleShareRoutine(routine.id)}
                      /* CHANGED: w-10 h-10 -> w-9 h-9 sm:w-10 sm:h-10 */
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                      title="Share Routine"
                    >
                      {shareRoutineId === routine.id ? (
                        <i className="ri-loader-4-line text-deep animate-spin"></i>
                      ) : (
                        <i className="ri-share-line text-deep"></i>
                      )}
                    </button>
                  </div>
                  
                  {/* Completion Badge */}
                  <div className="absolute bottom-3 left-3">
                    {/* CHANGED: px-3 -> px-2 sm:px-3 */}
                    <div className="px-2 sm:px-3 py-1 bg-white/90 rounded-full text-xs font-medium text-deep">
                      {routine.completionRate}% Complete
                    </div>
                  </div>
                </div>

                {/* Content */}
                {/* CHANGED: p-6 -> p-4 sm:p-6 */}
                <div className="p-4 sm:p-6">
                  {/* Editable Name */}
                  {editingId === routine.id ? (
                    <div className="mb-4">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        /* CHANGED: text-xl -> text-lg sm:text-xl */
                        className="w-full px-3 py-2 border border-primary rounded-lg font-serif text-lg sm:text-xl font-bold text-deep focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-deep flex-1 line-clamp-1">
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
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-warm-gray">
                    <div className="flex items-center gap-1">
                      <i className="ri-list-check text-deep"></i>
                      <span>{routine.stepCount} steps</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <i className="ri-time-line text-deep"></i>
                      {/* CHANGED: Shortened "Updated" label for mobile */}
                      <span>{routine.lastModified.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {/* CHANGED: mb-4 -> mb-3 sm:mb-4 */}
                  <div className="mb-3 sm:mb-4">
                    <div className="h-2 bg-blush rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${routine.completionRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons: View Notes and Edit Routine */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewNotes(routine.id)}
                      className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-primary text-white rounded-lg hover:bg-dark transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-file-text-line mr-1 sm:mr-2"></i>
                      View Notes
                    </button>
                    <button
                      onClick={() => handleEditRoutine(routine.id)}
                      className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-primary text-primary rounded-lg hover:bg-cream transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-pencil-line mr-1 sm:mr-2"></i>
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {routines.length === 0 && (
            /* CHANGED: py-16 -> py-12 sm:py-16 */
            <div className="text-center py-12 sm:py-16">
              {/* CHANGED: w-24 h-24 mb-6 -> w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6 */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-cream flex items-center justify-center mx-auto mb-4 sm:mb-6">
                {/* CHANGED: text-5xl -> text-4xl sm:text-5xl */}
                <i className="ri-file-list-3-line text-warm-gray/60 text-4xl sm:text-5xl"></i>
              </div>
              {/* CHANGED: text-3xl mb-3 -> text-2xl sm:text-3xl mb-2 sm:mb-3 */}
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-warm-gray/60 mb-2 sm:mb-3">
                No Routines Yet
              </h3>
              {/* CHANGED: mb-8 -> mb-6 sm:mb-8, added text-sm sm:text-base and px-4 */}
              <p className="text-sm sm:text-base text-warm-gray/80 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                Start building your first skincare routine with our guided template
              </p>
              {/* CHANGED: px-8 py-4 -> px-6 sm:px-8 py-3 sm:py-4 */}
              <button
                onClick={handleCreateRoutine}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-lg hover:bg-dark transition-colors font-medium whitespace-nowrap cursor-pointer"
              >
                <i className="ri-add-line mr-2"></i>
                Create Your First Routine
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Phase 1: Familiarity Popup */}
      {showFamiliarityPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-light/30 flex items-center justify-center mx-auto mb-6">
                <i className="ri-sparkle-line text-primary text-4xl"></i>
              </div>
              <h3 className="text-2xl font-serif font-bold text-deep mb-3">
                Let's Build Your Perfect Routine
              </h3>
              <p className="text-warm-gray">
                Our Routine Builder helps you create a personalized skincare regimen with expert-guided steps, product recommendations, and ingredient conflict detection.
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
                  <span>Why product order matters for absorption</span>
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

      <Footer />
    </div>
  );
}