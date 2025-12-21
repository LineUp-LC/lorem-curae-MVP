import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDropdown = ({ isOpen, onClose }: ProfileDropdownProps) => {
  const navigate = useNavigate();

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
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-visible">
        {/* Profile Header */}
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              to="/profile/edit"
              className="relative group cursor-pointer"
              onClick={onClose}
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
                <img 
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                <i className="ri-camera-line text-white text-sm"></i>
              </div>
            </Link>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base truncate">{user.name}</h3>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              <p className="text-xs text-gray-400 mt-1">{user.memberSince}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Badges</p>
            <div className="flex items-center gap-2">
              {user.badges.map((badge) => (
                <div
                  key={badge.id}
                  onClick={() => handleBadgeClick(badge.id)}
                  className={`relative w-10 h-10 flex items-center justify-center rounded-lg ${badge.color} group cursor-pointer hover:scale-110 transition-transform`}
                  title={badge.name}
                >
                  <i className={`${badge.icon} text-lg ${badge.iconColor}`}></i>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] w-max">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-[200px]">
                      <p className="font-semibold mb-1">{badge.name}</p>
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
          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
            <div className="text-center">
              <p className="text-lg font-semibold text-forest-900">{user.completedRoutines}/{user.maxRoutines}</p>
              <p className="text-xs text-gray-500">Routines</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-sage-600">{user.badges.length}</p>
              <p className="text-xs text-gray-500">Badges</p>
            </div>
            <Link 
              to="/skin-survey-account"
              className="px-3 py-1.5 bg-sage-600 text-white text-xs font-medium rounded-lg hover:bg-sage-700 transition-colors cursor-pointer"
              onClick={onClose}
            >
              Retake Quiz
            </Link>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="py-2">
          <Link
            to="/account"
            className="flex items-center px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <div className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg group-hover:bg-gray-200 transition-colors">
              <i className="ri-user-line text-base"></i>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">Account</p>
              <p className="text-xs text-gray-500">Profile & account settings</p>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400 text-sm group-hover:text-gray-600"></i>
          </Link>

          <Link
            to="/my-skin"
            className="flex items-center px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <div className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg group-hover:bg-gray-200 transition-colors">
              <i className="ri-heart-pulse-line text-base"></i>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">My Skin</p>
              <p className="text-xs text-gray-500">Profile & progress tracking</p>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400 text-sm group-hover:text-gray-600"></i>
          </Link>

          <Link
            to="/routines"
            className="flex items-center px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <div className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg group-hover:bg-gray-200 transition-colors">
              <i className="ri-calendar-line text-base"></i>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">Routines</p>
              <p className="text-xs text-gray-500">Routine tracking & progress</p>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400 text-sm group-hover:text-gray-600"></i>
          </Link>

          <Link
            to="/nutrition"
            className="flex items-center px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <div className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg group-hover:bg-gray-200 transition-colors">
              <i className="ri-apple-line text-base"></i>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">Nutrition</p>
              <p className="text-xs text-gray-500">Diet & wellness tracking</p>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400 text-sm group-hover:text-gray-600"></i>
          </Link>

          <Link
            to="/ai-chat"
            className="flex items-center px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <div className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg group-hover:bg-gray-200 transition-colors">
              <i className="ri-robot-2-line text-base"></i>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">Curae AI</p>
              <p className="text-xs text-gray-500">AI skincare assistant</p>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400 text-sm group-hover:text-gray-600"></i>
          </Link>

          <Link
            to="/subscription"
            className="flex items-center px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <div className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg group-hover:bg-gray-200 transition-colors">
              <i className="ri-vip-crown-line text-base"></i>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">Plan</p>
              <p className="text-xs text-gray-500">Subscription & billing</p>
            </div>
            <i className="ri-arrow-right-s-line text-gray-400 text-sm group-hover:text-gray-600"></i>
          </Link>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-50 py-2">
          <Link
            to="/settings"
            className="flex items-center px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
            onClick={onClose}
          >
            <i className="ri-settings-3-line text-gray-500 text-base group-hover:text-gray-700"></i>
            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">Settings</span>
          </Link>
          
          <button
            className="w-full flex items-center px-6 py-3 hover:bg-red-50 transition-colors cursor-pointer text-red-600 group"
            onClick={handleSignOut}
          >
            <i className="ri-logout-box-line text-base"></i>
            <span className="ml-3 text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileDropdown;
