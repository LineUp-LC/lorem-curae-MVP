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
    navigate('/routines');
  };

  const handleViewRoutine = (id: string) => {
    navigate(`/routines?id=${id}`);
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      {/* CHANGED: pt-24 -> pt-20 sm:pt-24, pb-16 -> pb-12 sm:pb-16 */}
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          {/* CHANGED: mb-12 -> mb-8 sm:mb-12 */}
          <div className="text-center mb-8 sm:mb-12">
            {/* Updated: consistent with design system */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-forest-900 mb-4">
              My Skincare Routines
            </h1>
            {/* CHANGED: text-lg -> text-base sm:text-lg, added px-4 */}
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border-2 border-dashed border-gray-300 hover:border-forest-800 p-6 sm:p-8 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] cursor-pointer transition-all group"
            >
              {/* CHANGED: w-20 h-20 -> w-16 h-16 sm:w-20 sm:h-20, mb-4 -> mb-3 sm:mb-4 */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-forest-800/10 group-hover:bg-forest-800/20 flex items-center justify-center mb-3 sm:mb-4 transition-colors">
                {/* CHANGED: text-4xl -> text-3xl sm:text-4xl */}
                <i className="ri-add-line text-3xl sm:text-4xl text-forest-800"></i>
              </div>
              {/* CHANGED: text-2xl -> text-xl sm:text-2xl, added text-center */}
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-forest-800 mb-2 text-center">
                Build Your Routine
              </h3>
              <p className="text-gray-600 text-center text-sm">
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
                <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-100">
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
                        <i className="ri-loader-4-line text-forest-800 animate-spin"></i>
                      ) : (
                        <i className="ri-share-line text-forest-800"></i>
                      )}
                    </button>
                  </div>
                  
                  {/* Completion Badge */}
                  <div className="absolute bottom-3 left-3">
                    {/* CHANGED: px-3 -> px-2 sm:px-3 */}
                    <div className="px-2 sm:px-3 py-1 bg-white/90 rounded-full text-xs font-medium text-forest-800">
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
                        className="w-full px-3 py-2 border border-forest-800 rounded-lg font-serif text-lg sm:text-xl font-bold text-forest-800 focus:outline-none focus:ring-2 focus:ring-forest-800/20"
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSaveName(routine.id)}
                          /* CHANGED: px-4 -> px-3 sm:px-4 */
                          className="flex-1 px-3 sm:px-4 py-2 bg-forest-800 text-white rounded-lg hover:bg-forest-900 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          /* CHANGED: px-4 -> px-3 sm:px-4 */
                          className="flex-1 px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* CHANGED: mb-4 -> mb-3 sm:mb-4 */
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      {/* CHANGED: text-2xl -> text-xl sm:text-2xl, added line-clamp-1 */}
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-forest-800 flex-1 line-clamp-1">
                        {routine.name}
                      </h3>
                      {/* ADDED: flex-shrink-0 to prevent button from shrinking */}
                      <button
                        onClick={() => handleEditName(routine)}
                        className="w-8 h-8 rounded-lg hover:bg-cream-100 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                        title="Edit Name"
                      >
                        <i className="ri-pencil-line text-forest-800"></i>
                      </button>
                    </div>
                  )}

                  {/* Stats */}
                  {/* CHANGED: gap-4 mb-4 text-sm -> gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm */}
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <i className="ri-list-check text-forest-800"></i>
                      <span>{routine.stepCount} steps</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <i className="ri-time-line text-forest-800"></i>
                      {/* CHANGED: Shortened "Updated" label for mobile */}
                      <span>{routine.lastModified.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {/* CHANGED: mb-4 -> mb-3 sm:mb-4 */}
                  <div className="mb-3 sm:mb-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-forest-800 transition-all duration-300"
                        style={{ width: `${routine.completionRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {/* CHANGED: px-6 py-3 -> px-4 sm:px-6 py-2.5 sm:py-3 */}
                  <button
                    onClick={() => handleViewRoutine(routine.id)}
                    className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-forest-800 text-white rounded-lg hover:bg-forest-900 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                  >
                    View & Edit Routine
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {routines.length === 0 && (
            /* CHANGED: py-16 -> py-12 sm:py-16 */
            <div className="text-center py-12 sm:py-16">
              {/* CHANGED: w-24 h-24 mb-6 -> w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6 */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                {/* CHANGED: text-5xl -> text-4xl sm:text-5xl */}
                <i className="ri-file-list-3-line text-gray-400 text-4xl sm:text-5xl"></i>
              </div>
              {/* CHANGED: text-3xl mb-3 -> text-2xl sm:text-3xl mb-2 sm:mb-3 */}
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-gray-400 mb-2 sm:mb-3">
                No Routines Yet
              </h3>
              {/* CHANGED: mb-8 -> mb-6 sm:mb-8, added text-sm sm:text-base and px-4 */}
              <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                Start building your first skincare routine with our guided template
              </p>
              {/* CHANGED: px-8 py-4 -> px-6 sm:px-8 py-3 sm:py-4 */}
              <button
                onClick={handleCreateRoutine}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-forest-800 text-white rounded-lg hover:bg-forest-900 transition-colors font-medium whitespace-nowrap cursor-pointer"
              >
                <i className="ri-add-line mr-2"></i>
                Create Your First Routine
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}