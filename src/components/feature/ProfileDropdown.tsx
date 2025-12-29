import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDropdown = ({ isOpen, onClose }: ProfileDropdownProps) => {
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const user = {
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20portrait%20of%20confident%20young%20woman%20with%20clear%20glowing%20skin%20natural%20makeup%20soft%20lighting%20studio%20photography%20beauty%20portrait%20minimalist%20clean%20background&width=200&height=200&seq=user-profile-avatar&orientation=squarish',
    memberSince: 'Member since March 2024',
    completedRoutines: 5,
    maxRoutines: 5,
    badges: [
      { 
        id: 1, 
        name: 'Early Adopter', 
        icon: 'ri-rocket-line', 
        color: 'bg-white border-2 border-purple-200',
        iconColor: 'text-purple-600',
        description: 'Joined Lorem Curae in the first month of launch'
      },
      { 
        id: 2, 
        name: 'Routine Master', 
        icon: 'ri-calendar-check-line', 
        color: 'bg-white border-2 border-sage-200',
        iconColor: 'text-sage-600',
        description: 'Completed 30 consecutive days of routine tracking'
      },
      { 
        id: 3, 
        name: 'Community Helper', 
        icon: 'ri-heart-line', 
        color: 'bg-white border-2 border-coral-200',
        iconColor: 'text-coral-600',
        description: 'Helped 10+ community members with skincare advice'
      },
    ]
  };

  const handleSignOut = () => {
    onClose();
    navigate('/auth/login');
  };

  const handleBadgeClick = (badgeId: number) => {
    onClose();
    navigate(`/badges?selected=${badgeId}`);
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40 motion-safe:animate-enter-fade" 
        onClick={onClose}
      />
      {/* Mobile: Full-width bottom sheet | Desktop: Positioned dropdown */}
      <div className="fixed sm:absolute right-0 left-0 sm:left-auto bottom-0 sm:bottom-auto sm:top-full sm:mt-2 w-full sm:w-64 bg-white rounded-t-xl sm:rounded-xl shadow-xl border border-gray-100 z-50 max-h-[85vh] sm:max-h-none overflow-y-auto sm:overflow-visible motion-safe:animate-enter-up sm:motion-safe:animate-enter-scale origin-top-right will-change-transform">
        {/* Profile Header */}
        <div className="p-4 border-b border-gray-50 overflow-visible">
          <div className="flex items-center space-x-3 mb-3">
            <Link 
              to="/profile/edit"
              className="relative group cursor-pointer"
              onClick={onClose}
            >
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                <i className="ri-camera-line text-white text-xs"></i>
              </div>
            </Link>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{user.name}</h3>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{user.memberSince}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="mb-3 overflow-visible">
            <p className="text-[10px] text-gray-500 mb-1.5">Badges</p>
            <div className="flex items-center gap-1.5 overflow-visible">
              {user.badges.map((badge) => (
                <div
                  key={badge.id}
                  onClick={() => handleBadgeClick(badge.id)}
                  className={`relative w-8 h-8 flex items-center justify-center rounded-md ${badge.color} group cursor-pointer hover:scale-110 transition-transform overflow-visible`}
                  title={badge.name}
                >
                  <i className={`${badge.icon} text-sm ${badge.iconColor}`}></i>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[9999] w-max hidden sm:block">
                    <div className="bg-gray-900 text-white text-[10px] rounded-lg px-2 py-1.5 shadow-xl max-w-[160px] whitespace-normal">
                      <p className="font-semibold mb-0.5">{badge.name}</p>
                      <p className="text-gray-300">{badge.description}</p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <div className="text-center">
              <p className="text-sm font-semibold text-forest-900">{user.completedRoutines}/{user.maxRoutines}</p>
              <p className="text-[10px] text-gray-500">Routines</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-sage-600">{user.badges.length}</p>
              <p className="text-[10px] text-gray-500">Badges</p>
            </div>
            <Link 
              to="/skin-survey-account"
              className="px-2.5 py-1 bg-sage-600 text-white text-[10px] font-medium rounded-md hover:bg-sage-700 transition-colors cursor-pointer"
              onClick={onClose}
            >
              Retake Quiz
            </Link>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="py-1">
          <Link
            to="/account"
            className="flex items-center px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <div className="w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-600 rounded-md group-hover:bg-gray-200 transition-colors">
              <i className="ri-user-line text-sm"></i>
            </div>
            <div className="ml-2.5 flex-1">
              <p className="text-xs font-medium text-gray-900">Account</p>
              <p className="text-[10px] text-gray-500">Profile & settings</p>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400 text-xs group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all"></i>
          </Link>

          <Link
            to="/my-skin"
            className="flex items-center px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <div className="w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-600 rounded-md group-hover:bg-gray-200 transition-colors">
              <i className="ri-heart-pulse-line text-sm"></i>
            </div>
            <div className="ml-2.5 flex-1">
              <p className="text-xs font-medium text-gray-900">My Skin</p>
              <p className="text-[10px] text-gray-500">Profile & progress</p>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400 text-xs group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all"></i>
          </Link>

          <Link
            to="/routines-list"
            className="flex items-center px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <div className="w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-600 rounded-md group-hover:bg-gray-200 transition-colors">
              <i className="ri-calendar-line text-sm"></i>
            </div>
            <div className="ml-2.5 flex-1">
              <p className="text-xs font-medium text-gray-900">Routines</p>
              <p className="text-[10px] text-gray-500">Routine tracking</p>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400 text-xs group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all"></i>
          </Link>

          <Link
            to="/nutrition"
            className="flex items-center px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <div className="w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-600 rounded-md group-hover:bg-gray-200 transition-colors">
              <i className="ri-apple-line text-sm"></i>
            </div>
            <div className="ml-2.5 flex-1">
              <p className="text-xs font-medium text-gray-900">Nutrition</p>
              <p className="text-[10px] text-gray-500">Diet & wellness</p>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400 text-xs group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all"></i>
          </Link>

          <Link
            to="/ai-chat"
            className="flex items-center px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <div className="w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-600 rounded-md group-hover:bg-gray-200 transition-colors">
              <i className="ri-sparkling-2-fill text-sm"></i>
            </div>
            <div className="ml-2.5 flex-1">
              <p className="text-xs font-medium text-gray-900">Curae AI</p>
              <p className="text-[10px] text-gray-500">AI assistant</p>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400 text-xs group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all"></i>
          </Link>

          <Link
            to="/subscription"
            className="flex items-center px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <div className="w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-600 rounded-md group-hover:bg-gray-200 transition-colors">
              <i className="ri-vip-crown-line text-sm"></i>
            </div>
            <div className="ml-2.5 flex-1">
              <p className="text-xs font-medium text-gray-900">Plan</p>
              <p className="text-[10px] text-gray-500">Subscription</p>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400 text-xs group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all"></i>
          </Link>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-50 py-1">
          <Link
            to="/settings"
            className="flex items-center px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <i className="ri-settings-3-line text-gray-500 text-sm group-hover:text-gray-700"></i>
            <span className="ml-2.5 text-xs text-gray-700 group-hover:text-gray-900">Settings</span>
          </Link>
          
          <button
            className="w-full flex items-center px-4 py-2 hover:bg-red-50 transition-colors cursor-pointer text-red-600 group"
            onClick={handleSignOut}
          >
            <i className="ri-logout-box-line text-sm"></i>
            <span className="ml-2.5 text-xs">Sign Out</span>
          </button>
        </div>

        {/* Curae AI Branding */}
        <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sage-500 to-sage-600 flex items-center justify-center">
              <i className="ri-sparkling-2-fill text-white text-xs"></i>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-700">Logo by Curae AI</p>
              <p className="text-[9px] text-gray-500">Your personalized skincare assistant</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileDropdown;