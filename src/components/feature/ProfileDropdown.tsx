import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NeuralBloomIcon from '../icons/NeuralBloomIcon';

/**
 * ProfileDropdown Component
 * 
 * Color Scheme (Lorem Curae):
 * - Primary: #C4704D (coral)
 * - Light: #E8A888 (light coral)
 * - Dark: #8B4D35 (dark coral)
 * - Cream: #FDF8F5 (background)
 * - Deep: #2D2A26 (text)
 * - Sage: #7A8B7A (accents)
 * - Warm Gray: #6B635A (body text)
 */

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
        color: 'bg-[#FDF8F5] border-2 border-[#E8A888]',
        iconColor: 'text-[#C4704D]',
        description: 'Joined Lorem Curae in the first month of launch'
      },
      { 
        id: 2, 
        name: 'Routine Master', 
        icon: 'ri-calendar-check-line', 
        color: 'bg-[#FDF8F5] border-2 border-[#7A8B7A]/30',
        iconColor: 'text-[#7A8B7A]',
        description: 'Completed 30 consecutive days of routine tracking'
      },
      { 
        id: 3, 
        name: 'Community Helper', 
        icon: 'ri-heart-line', 
        color: 'bg-[#FDF8F5] border-2 border-[#C4704D]/30',
        iconColor: 'text-[#C4704D]',
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
      <style>{`
        .lc-dropdown {
          font-family: var(--lc-font-sans, 'DM Sans', sans-serif);
        }
        .lc-dropdown-link:hover .lc-dropdown-icon {
          background: rgba(196, 112, 77, 0.1);
          color: #C4704D;
        }
        .lc-dropdown-link:hover .lc-dropdown-arrow {
          color: #C4704D;
          transform: translateX(2px);
        }
      `}</style>
      <div 
        className="fixed inset-0 z-40 motion-safe:animate-enter-fade" 
        onClick={onClose}
      />
      {/* Mobile: Full-width bottom sheet | Desktop: Positioned dropdown */}
      <div className="lc-dropdown fixed sm:absolute right-0 left-0 sm:left-auto bottom-0 sm:bottom-auto sm:top-full sm:mt-2 w-full sm:w-64 bg-white rounded-t-xl sm:rounded-xl shadow-xl border border-[#E8D4CC]/50 z-50 max-h-[85vh] sm:max-h-none overflow-y-auto sm:overflow-visible motion-safe:animate-enter-up sm:motion-safe:animate-enter-scale origin-top-right will-change-transform">
        {/* Profile Header */}
        <div className="p-4 border-b border-[#E8D4CC]/30 overflow-visible bg-gradient-to-b from-[#FDF8F5] to-white">
          <div className="flex items-center space-x-3 mb-3">
            <Link 
              to="/profile/edit"
              className="relative group cursor-pointer"
              onClick={onClose}
            >
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#FDF8F5] ring-2 ring-[#E8A888]/30">
                <img 
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-[#2D2A26]/40 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                <i className="ri-camera-line text-white text-xs"></i>
              </div>
            </Link>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#2D2A26] text-sm truncate">{user.name}</h3>
              <p className="text-xs text-[#6B635A] truncate">{user.email}</p>
              <p className="text-[10px] text-[#6B635A]/70 mt-0.5">{user.memberSince}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="mb-3 overflow-visible">
            <p className="text-[10px] text-[#6B635A] mb-1.5 uppercase tracking-wider font-medium">Badges</p>
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
                    <div className="bg-[#2D2A26] text-white text-[10px] rounded-lg px-2 py-1.5 shadow-xl max-w-[160px] whitespace-normal">
                      <p className="font-semibold mb-0.5">{badge.name}</p>
                      <p className="text-[#E8D4CC]">{badge.description}</p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-[#2D2A26]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E8D4CC]/30">
            <div className="text-center">
              <p className="text-sm font-semibold text-[#2D2A26]">{user.completedRoutines}/{user.maxRoutines}</p>
              <p className="text-[10px] text-[#6B635A]">Routines</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#7A8B7A]">{user.badges.length}</p>
              <p className="text-[10px] text-[#6B635A]">Badges</p>
            </div>
            <Link 
              to="/skin-survey-account"
              className="px-2.5 py-1 bg-[#C4704D] text-white text-[10px] font-medium rounded-md hover:bg-[#8B4D35] transition-colors cursor-pointer"
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
            className="lc-dropdown-link flex items-center px-4 py-2 hover:bg-[#FDF8F5] transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <div className="lc-dropdown-icon w-7 h-7 flex items-center justify-center bg-[#FDF8F5] text-[#6B635A] rounded-md transition-colors">
              <i className="ri-user-line text-sm"></i>
            </div>
            <div className="ml-2.5 flex-1">
              <p className="text-xs font-medium text-[#2D2A26]">Account</p>
              <p className="text-[10px] text-[#6B635A]">Profile & settings</p>
            </div>
            <i className="lc-dropdown-arrow ri-arrow-right-s-line text-[#6B635A]/50 text-xs transition-all"></i>
          </Link>

          <Link
            to="/my-skin"
            className="lc-dropdown-link flex items-center px-4 py-2 hover:bg-[#FDF8F5] transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <div className="lc-dropdown-icon w-7 h-7 flex items-center justify-center bg-[#FDF8F5] text-[#6B635A] rounded-md transition-colors">
              <i className="ri-heart-pulse-line text-sm"></i>
            </div>
            <div className="ml-2.5 flex-1">
              <p className="text-xs font-medium text-[#2D2A26]">My Skin</p>
              <p className="text-[10px] text-[#6B635A]">Profile & progress</p>
            </div>
            <i className="lc-dropdown-arrow ri-arrow-right-s-line text-[#6B635A]/50 text-xs transition-all"></i>
          </Link>

          <Link
            to="/routines-list"
            className="lc-dropdown-link flex items-center px-4 py-2 hover:bg-[#FDF8F5] transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <div className="lc-dropdown-icon w-7 h-7 flex items-center justify-center bg-[#FDF8F5] text-[#6B635A] rounded-md transition-colors">
              <i className="ri-calendar-line text-sm"></i>
            </div>
            <div className="ml-2.5 flex-1">
              <p className="text-xs font-medium text-[#2D2A26]">Routines</p>
              <p className="text-[10px] text-[#6B635A]">Routine tracking</p>
            </div>
            <i className="lc-dropdown-arrow ri-arrow-right-s-line text-[#6B635A]/50 text-xs transition-all"></i>
          </Link>

          <Link
            to="/nutrition"
            className="lc-dropdown-link flex items-center px-4 py-2 hover:bg-[#FDF8F5] transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <div className="lc-dropdown-icon w-7 h-7 flex items-center justify-center bg-[#FDF8F5] text-[#6B635A] rounded-md transition-colors">
              <i className="ri-apple-line text-sm"></i>
            </div>
            <div className="ml-2.5 flex-1">
              <p className="text-xs font-medium text-[#2D2A26]">Nutrition</p>
              <p className="text-[10px] text-[#6B635A]">Diet & wellness</p>
            </div>
            <i className="lc-dropdown-arrow ri-arrow-right-s-line text-[#6B635A]/50 text-xs transition-all"></i>
          </Link>

          <Link
            to="/ai-chat"
            className="lc-dropdown-link flex items-center px-4 py-2 hover:bg-[#FDF8F5] transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <div className="lc-dropdown-icon w-7 h-7 flex items-center justify-center bg-[#FDF8F5] text-[#6B635A] rounded-md transition-colors">
              <NeuralBloomIcon size={14} />
            </div>
            <div className="ml-2.5 flex-1">
              <p className="text-xs font-medium text-[#2D2A26]">Curae AI</p>
              <p className="text-[10px] text-[#6B635A]">AI assistant</p>
            </div>
            <i className="lc-dropdown-arrow ri-arrow-right-s-line text-[#6B635A]/50 text-xs transition-all"></i>
          </Link>

          <Link
            to="/subscription"
            className="lc-dropdown-link flex items-center px-4 py-2 hover:bg-[#FDF8F5] transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <div className="lc-dropdown-icon w-7 h-7 flex items-center justify-center bg-[#FDF8F5] text-[#6B635A] rounded-md transition-colors">
              <i className="ri-vip-crown-line text-sm"></i>
            </div>
            <div className="ml-2.5 flex-1">
              <p className="text-xs font-medium text-[#2D2A26]">Plan</p>
              <p className="text-[10px] text-[#6B635A]">Subscription</p>
            </div>
            <i className="lc-dropdown-arrow ri-arrow-right-s-line text-[#6B635A]/50 text-xs transition-all"></i>
          </Link>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#E8D4CC]/30 py-1">
          <Link
            to="/settings"
            className="flex items-center px-4 py-2 hover:bg-[#FDF8F5] transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <i className="ri-settings-3-line text-[#6B635A] text-sm group-hover:text-[#C4704D] transition-colors"></i>
            <span className="ml-2.5 text-xs text-[#6B635A] group-hover:text-[#2D2A26] transition-colors">Settings</span>
          </Link>
          
          <button
            className="w-full flex items-center px-4 py-2 hover:bg-[#C4704D]/5 transition-colors cursor-pointer text-[#8B4D35] group"
            onClick={handleSignOut}
          >
            <i className="ri-logout-box-line text-sm"></i>
            <span className="ml-2.5 text-xs">Sign Out</span>
          </button>
        </div>

      </div>
    </>
  );
};

export default ProfileDropdown;