import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';

const BadgesPage = () => {
  // Default to 'locked' tab since no badges are earned yet
  const [activeTab, setActiveTab] = useState<'unlocked' | 'locked'>('locked');
  const [searchParams] = useSearchParams();
  const selectedBadgeId = searchParams.get('selected');
  const { user: authUser } = useAuth();

  // Determine if viewing another user's badges
  const viewingUserId = searchParams.get('user');
  const viewingUserName = searchParams.get('name');
  const isOwnBadges = !viewingUserId || viewingUserId === authUser?.id;

  useEffect(() => {
    if (selectedBadgeId) {
      setTimeout(() => {
        const element = document.getElementById(`badge-${selectedBadgeId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [selectedBadgeId]);

  // No badges earned yet - badge system coming soon
  const unlockedBadges: Array<{ id: number; name: string; description: string; icon: string; unlockedDate: string; rarity: string }> = [];

  // All available badges to earn
  const lockedBadges = [
    { id: 1, name: 'Early Adopter', description: 'Joined Lorem Curae in its first month', icon: 'ri-rocket-line', requirement: 'Join during launch period', rarity: 'Legendary' },
    { id: 2, name: 'Routine Master', description: 'Created 5 complete skincare routines', icon: 'ri-calendar-check-line', requirement: 'Create 5 routines', rarity: 'Epic' },
    { id: 3, name: 'Community Helper', description: 'Helped 10 community members with advice', icon: 'ri-heart-line', requirement: 'Help 10 community members', rarity: 'Rare' },
    { id: 4, name: 'Ingredient Expert', description: 'Learned about 50+ skincare ingredients', icon: 'ri-flask-fill', requirement: 'View 50 ingredient profiles', rarity: 'Epic' },
    { id: 5, name: 'Consistent Tracker', description: 'Logged skincare routine for 30 days straight', icon: 'ri-calendar-check-fill', requirement: 'Log routine for 30 consecutive days', rarity: 'Rare' },
    { id: 6, name: 'Product Reviewer', description: 'Wrote 10 detailed product reviews', icon: 'ri-edit-fill', requirement: 'Write 10 product reviews', rarity: 'Common' },
    { id: 7, name: 'Skin Transformation', description: 'Document a complete skin transformation journey', icon: 'ri-magic-fill', requirement: 'Upload before/after photos spanning 90 days', rarity: 'Legendary' },
    { id: 9, name: 'Science Enthusiast', description: 'Read and understand 100 ingredient profiles', icon: 'ri-microscope-line', requirement: 'View 100 different ingredient detail pages', rarity: 'Rare' },
    { id: 10, name: 'Year One', description: 'Be a member for one full year', icon: 'ri-cake-2-line', requirement: 'Maintain active membership for 365 days', rarity: 'Epic' }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return { bg: 'rgba(196, 112, 77, 0.15)', text: '#C4704D', border: 'rgba(196, 112, 77, 0.3)' };
      case 'Epic': return { bg: 'rgba(122, 139, 122, 0.15)', text: '#7A8B7A', border: 'rgba(122, 139, 122, 0.3)' };
      case 'Rare': return { bg: 'rgba(232, 168, 136, 0.15)', text: '#C4704D', border: 'rgba(232, 168, 136, 0.3)' };
      default: return { bg: 'rgba(107, 99, 90, 0.1)', text: '#6B635A', border: 'rgba(107, 99, 90, 0.2)' };
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF8F5' }}>
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-deep mb-2">
            {isOwnBadges ? 'Your Achievements' : `${viewingUserName}'s Badges`}
          </h1>
          <p className="text-sm text-warm-gray">
            {isOwnBadges ? 'Track your skincare journey milestones' : `See what ${viewingUserName} has earned`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center" style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(196, 112, 77, 0.1)' }}>
              <i className="ri-medal-line text-3xl" style={{ color: '#C4704D' }}></i>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#2D2A26' }}>{unlockedBadges.length}</p>
            <p className="text-sm" style={{ color: '#6B635A' }}>Badges Earned</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center" style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(122, 139, 122, 0.1)' }}>
              <i className="ri-trophy-line text-3xl" style={{ color: '#7A8B7A' }}></i>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#2D2A26' }}>{lockedBadges.length}</p>
            <p className="text-sm" style={{ color: '#6B635A' }}>Available to Earn</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center" style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(232, 168, 136, 0.15)' }}>
              <i className="ri-fire-line text-3xl" style={{ color: '#C4704D' }}></i>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#2D2A26' }}>—</p>
            <p className="text-sm" style={{ color: '#6B635A' }}>Day Streak</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('unlocked')}
            className="px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: activeTab === 'unlocked' ? '#C4704D' : 'white',
              color: activeTab === 'unlocked' ? 'white' : '#6B635A',
              border: activeTab === 'unlocked' ? 'none' : '1px solid rgba(232, 212, 204, 0.5)'
            }}
          >
            Unlocked ({unlockedBadges.length})
          </button>
          <button
            onClick={() => setActiveTab('locked')}
            className="px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: activeTab === 'locked' ? '#C4704D' : 'white',
              color: activeTab === 'locked' ? 'white' : '#6B635A',
              border: activeTab === 'locked' ? 'none' : '1px solid rgba(232, 212, 204, 0.5)'
            }}
          >
            Locked ({lockedBadges.length})
          </button>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'unlocked' ? (
            unlockedBadges.map((badge) => {
              const colors = getRarityColor(badge.rarity);
              const isSelected = selectedBadgeId === badge.id.toString();
              return (
                <div
                  key={badge.id}
                  id={`badge-${badge.id}`}
                  className="bg-white rounded-xl p-6 transition-all hover:shadow-lg"
                  style={{
                    border: isSelected ? `2px solid #C4704D` : '1px solid rgba(232, 212, 204, 0.3)',
                    boxShadow: isSelected ? '0 0 20px rgba(196, 112, 77, 0.2)' : 'none'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.bg }}>
                      <i className={`${badge.icon} text-3xl`} style={{ color: colors.text }}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold" style={{ color: '#2D2A26' }}>{badge.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: colors.bg, color: colors.text }}>
                          {badge.rarity}
                        </span>
                      </div>
                      <p className="text-sm mb-2" style={{ color: '#6B635A' }}>{badge.description}</p>
                      <p className="text-xs" style={{ color: '#9A938A' }}>
                        <i className="ri-calendar-line mr-1"></i>
                        Unlocked {badge.unlockedDate}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            lockedBadges.map((badge) => {
              const colors = getRarityColor(badge.rarity);
              return (
                <div
                  key={badge.id}
                  className="bg-white rounded-xl p-6 opacity-75"
                  style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F8F4F0' }}>
                      <i className={`${badge.icon} text-3xl`} style={{ color: '#9A938A' }}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold" style={{ color: '#6B635A' }}>{badge.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#F8F4F0', color: '#9A938A' }}>
                          {badge.rarity}
                        </span>
                      </div>
                      <p className="text-sm mb-2" style={{ color: '#9A938A' }}>{badge.description}</p>
                      <p className="text-xs" style={{ color: '#9A938A' }}>
                        <i className="ri-lock-line mr-1"></i>
                        {badge.requirement}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

    </div>
  );
};

export default BadgesPage;