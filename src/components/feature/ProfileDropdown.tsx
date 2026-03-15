// Phase 1: Deferred links removed (profile/customize, my-skin, nutrition, subscription, badges)
// See Notion "Deferred Work Tracker" to restore when trigger conditions are met

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { useUserLocation } from '@/lib/utils/locationState';
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
  const { user, profile, routineCount, signOut } = useAuth();
  const { displayString: userLocationDisplay, hasLocation } = useUserLocation();

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

  // User display data (when logged in)
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const memberSince = profile?.created_at
    ? `Member since ${new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    : '';

  // Subscription tier (only show badge for paid tiers)
  const subscriptionTier = profile?.subscription_tier || 'free';
  const isPaidSubscriber = subscriptionTier === 'plus' || subscriptionTier === 'premium';

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate('/auth/login');
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

        {/* Guest State - Not Logged In */}
        {!user && (
          <div className="p-5 border-b border-[#E8D4CC]/30 bg-gradient-to-b from-[#FDF8F5] to-white">
            <div className="flex flex-col items-center text-center">
              {/* Placeholder Avatar */}
              <div className="w-14 h-14 rounded-full bg-[#E8D4CC]/30 flex items-center justify-center mb-3">
                <i className="ri-user-line text-2xl text-[#6B635A]/60"></i>
              </div>

              {/* Guest Heading */}
              <h3 className="font-serif text-base font-semibold text-[#2D2A26] mb-1">
                You're browsing as a guest
              </h3>
              <p className="text-xs text-[#6B635A] mb-4">
                Create an account to save your progress
              </p>

              {/* CTAs */}
              <div className="w-full space-y-2">
                <Link
                  to="/auth/signup"
                  className="block w-full py-2.5 bg-[#C4704D] text-white text-sm font-medium rounded-xl text-center hover:bg-[#8B4D35] transition-colors"
                  onClick={onClose}
                >
                  Create Account
                </Link>
                <Link
                  to="/auth/login"
                  className="block w-full py-2.5 border border-[#E8D4CC] text-[#2D2A26] text-sm font-medium rounded-xl text-center hover:bg-[#FDF8F5] transition-colors"
                  onClick={onClose}
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Logged In State - Profile Header */}
        {user && (
          <div className="p-4 border-b border-[#E8D4CC]/30 overflow-visible bg-gradient-to-b from-[#FDF8F5] to-white">
            <div className="flex items-center space-x-3 mb-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#FDF8F5] ring-2 ring-[#E8A888]/30">
                  {(profile?.preferences as any)?.avatar_url ? (
                    <img
                      src={(profile?.preferences as any).avatar_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#E8D4CC]/30">
                      <i className="ri-user-line text-lg text-[#6B635A]/60"></i>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-[#2D2A26] text-sm truncate">{displayName}</h3>
                  {isPaidSubscriber && (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide ${
                      subscriptionTier === 'premium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-[#E8A888]/20 text-[#8B4D35]'
                    }`}>
                      {subscriptionTier === 'premium' ? 'Premium' : 'Plus'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B635A] truncate">{displayEmail}</p>
                {memberSince && <p className="text-[10px] text-[#6B635A]/70 mt-0.5">{memberSince}</p>}
                {hasLocation ? (
                  <p className="text-[9px] text-[#6B635A]/60 mt-0.5 flex items-center gap-0.5">
                    <i className="ri-map-pin-line text-[#7A8B7A] text-[8px]"></i>
                    {userLocationDisplay}
                  </p>
                ) : (
                  <Link
                    to="/settings?tab=location"
                    className="text-[9px] text-[#C4704D]/70 mt-0.5 flex items-center gap-0.5 hover:text-[#8B4D35] transition-colors"
                    onClick={onClose}
                  >
                    <i className="ri-map-pin-line text-[8px]"></i>
                    Add location
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E8D4CC]/30">
              <div className="text-center">
                <p className="text-sm font-semibold text-[#2D2A26]">{routineCount > 0 ? routineCount : '—'}</p>
                <p className="text-[10px] text-[#6B635A]">Routines</p>
              </div>
              <Link
                to="/skin-survey-account"
                className="px-2.5 py-1 bg-[#C4704D] text-white text-[10px] font-medium rounded-md hover:bg-[#8B4D35] transition-colors cursor-pointer"
                onClick={onClose}
              >
                Retake Survey
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Links - Only show when logged in */}
        {user && (
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

          </div>
        )}

        {/* Bottom Section - Only show when logged in */}
        {user && (
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
        )}

      </div>
    </>
  );
};

export default ProfileDropdown;