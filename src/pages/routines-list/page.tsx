
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
    <div className="min-h-screen bg-gradient-to-b from-[#F8F6F3] to-white">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-['Cormorant_Garamond'] text-5xl font-bold text-[#2C5F4F] mb-4">
              My Skincare Routines
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage all your personalized skincare routines in one place
            </p>
          </div>

          {/* Routines Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Routine Card */}
            <div
              onClick={handleCreateRoutine}
              className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-300 hover:border-[#2C5F4F] p-8 flex flex-col items-center justify-center min-h-[400px] cursor-pointer transition-all group"
            >
              <div className="w-20 h-20 rounded-full bg-[#2C5F4F]/10 group-hover:bg-[#2C5F4F]/20 flex items-center justify-center mb-4 transition-colors">
                <i className="ri-add-line text-4xl text-[#2C5F4F]"></i>
              </div>
              <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#2C5F4F] mb-2">
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
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={routine.thumbnail}
                    alt={routine.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => handleShareRoutine(routine.id)}
                      className="w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                      title="Share Routine"
                    >
                      {shareRoutineId === routine.id ? (
                        <i className="ri-loader-4-line text-[#2C5F4F] animate-spin"></i>
                      ) : (
                        <i className="ri-share-line text-[#2C5F4F]"></i>
                      )}
                    </button>
                  </div>
                  
                  {/* Completion Badge */}
                  <div className="absolute bottom-3 left-3">
                    <div className="px-3 py-1 bg-white/90 rounded-full text-xs font-medium text-[#2C5F4F]">
                      {routine.completionRate}% Complete
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Editable Name */}
                  {editingId === routine.id ? (
                    <div className="mb-4">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full px-3 py-2 border border-[#2C5F4F] rounded-lg font-['Cormorant_Garamond'] text-xl font-bold text-[#2C5F4F] focus:outline-none focus:ring-2 focus:ring-[#2C5F4F]/20"
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSaveName(routine.id)}
                          className="flex-1 px-4 py-2 bg-[#2C5F4F] text-white rounded-lg hover:bg-[#234839] transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#2C5F4F] flex-1">
                        {routine.name}
                      </h3>
                      <button
                        onClick={() => handleEditName(routine)}
                        className="w-8 h-8 rounded-lg hover:bg-[#F8F6F3] flex items-center justify-center transition-colors cursor-pointer"
                        title="Edit Name"
                      >
                        <i className="ri-pencil-line text-[#2C5F4F]"></i>
                      </button>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <i className="ri-list-check text-[#2C5F4F]"></i>
                      <span>{routine.stepCount} steps</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <i className="ri-time-line text-[#2C5F4F]"></i>
                      <span>Updated {routine.lastModified.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2C5F4F] transition-all duration-300"
                        style={{ width: `${routine.completionRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleViewRoutine(routine.id)}
                    className="w-full px-6 py-3 bg-[#2C5F4F] text-white rounded-lg hover:bg-[#234839] transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                  >
                    View & Edit Routine
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {routines.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <i className="ri-file-list-3-line text-gray-400 text-5xl"></i>
              </div>
              <h3 className="font-['Cormorant_Garamond'] text-3xl font-bold text-gray-400 mb-3">
                No Routines Yet
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Start building your first skincare routine with our guided template
              </p>
              <button
                onClick={handleCreateRoutine}
                className="px-8 py-4 bg-[#2C5F4F] text-white rounded-lg hover:bg-[#234839] transition-colors font-medium whitespace-nowrap cursor-pointer"
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
