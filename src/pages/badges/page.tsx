
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

const BadgesPage = () => {
  const [activeTab, setActiveTab] = useState<'unlocked' | 'locked'>('unlocked');
  const [searchParams] = useSearchParams();
  const selectedBadgeId = searchParams.get('selected');

  useEffect(() => {
    if (selectedBadgeId) {
      // Scroll to the selected badge
      setTimeout(() => {
        const element = document.getElementById(`badge-${selectedBadgeId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [selectedBadgeId]);

  const unlockedBadges = [
    {
      id: 1,
      name: 'Early Adopter',
      description: 'Joined Lorem Curae in its first month',
      icon: 'ri-rocket-line',
      unlockedDate: 'January 15, 2025',
      rarity: 'Legendary'
    },
    {
      id: 2,
      name: 'Routine Master',
      description: 'Created 5 complete skincare routines',
      icon: 'ri-calendar-check-line',
      unlockedDate: 'January 20, 2025',
      rarity: 'Epic'
    },
    {
      id: 3,
      name: 'Community Helper',
      description: 'Helped 10 community members with advice',
      icon: 'ri-heart-line',
      unlockedDate: 'January 22, 2025',
      rarity: 'Rare'
    },
    {
      id: 4,
      name: 'Ingredient Expert',
      description: 'Learned about 50+ skincare ingredients',
      icon: 'ri-flask-fill',
      unlockedDate: 'January 25, 2025',
      rarity: 'Epic'
    },
    {
      id: 5,
      name: 'Consistent Tracker',
      description: 'Logged skincare routine for 30 days straight',
      icon: 'ri-calendar-check-fill',
      unlockedDate: 'February 1, 2025',
      rarity: 'Rare'
    },
    {
      id: 6,
      name: 'Product Reviewer',
      description: 'Wrote 10 detailed product reviews',
      icon: 'ri-edit-fill',
      unlockedDate: 'February 3, 2025',
      rarity: 'Common'
    }
  ];

  const lockedBadges = [
    {
      id: 7,
      name: 'Skin Transformation',
      description: 'Document a complete skin transformation journey',
      icon: 'ri-magic-fill',
      requirement: 'Upload before/after photos spanning 90 days',
      rarity: 'Legendary'
    },
    {
      id: 8,
      name: 'Marketplace Maven',
      description: 'Purchase 20 products from the marketplace',
      icon: 'ri-shopping-bag-fill',
      requirement: '5/20 products purchased',
      rarity: 'Epic'
    },
    {
      id: 9,
      name: 'Service Seeker',
      description: 'Book and complete 5 skincare services',
      icon: 'ri-spa-fill',
      requirement: '2/5 services completed',
      rarity: 'Rare'
    },
    {
      id: 10,
      name: 'Knowledge Sharer',
      description: 'Create 5 educational posts in the community',
      icon: 'ri-lightbulb-fill',
      requirement: '1/5 posts created',
      rarity: 'Rare'
    },
    {
      id: 11,
      name: 'Streak Champion',
      description: 'Maintain a 100-day routine tracking streak',
      icon: 'ri-fire-fill',
      requirement: '30/100 days completed',
      rarity: 'Legendary'
    },
    {
      id: 12,
      name: 'Referral Star',
      description: 'Invite 10 friends to join Lorem Curae',
      icon: 'ri-user-add-fill',
      requirement: '3/10 friends joined',
      rarity: 'Epic'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'text-gray-700 bg-gray-100';
      case 'Epic': return 'text-gray-600 bg-gray-50';
      case 'Rare': return 'text-gray-500 bg-gray-50';
      default: return 'text-gray-400 bg-gray-50';
    }
  };

  const isSelected = (badgeId: number) => {
    return selectedBadgeId === badgeId.toString();
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Achievements</h1>
          <p className="text-lg text-gray-600 mb-8">
            Earn badges by completing challenges and milestones on your skincare journey
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{unlockedBadges.length}</div>
              <div className="text-sm text-gray-600">Unlocked</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-400">{lockedBadges.length}</div>
              <div className="text-sm text-gray-600">Locked</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">
                {Math.round((unlockedBadges.length / (unlockedBadges.length + lockedBadges.length)) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex bg-white rounded-full p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('unlocked')}
              className={`px-8 py-3 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'unlocked'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unlocked ({unlockedBadges.length})
            </button>
            <button
              onClick={() => setActiveTab('locked')}
              className={`px-8 py-3 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'locked'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Locked ({lockedBadges.length})
            </button>
          </div>
        </div>

        {/* Unlocked Badges */}
        {activeTab === 'unlocked' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unlockedBadges.map((badge) => (
              <div
                key={badge.id}
                id={`badge-${badge.id}`}
                className={`bg-white rounded-xl p-6 hover:shadow-lg transition-all border ${
                  isSelected(badge.id)
                    ? 'border-sage-500 shadow-lg ring-2 ring-sage-200'
                    : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 flex items-center justify-center rounded-xl ${
                    isSelected(badge.id) ? 'bg-sage-100' : 'bg-gray-100'
                  }`}>
                    <i className={`${badge.icon} text-2xl ${
                      isSelected(badge.id) ? 'text-sage-700' : 'text-gray-700'
                    }`}></i>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                    {badge.rarity}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{badge.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <i className="ri-calendar-line mr-1"></i>
                  Unlocked {badge.unlockedDate}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Locked Badges */}
        {activeTab === 'locked' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lockedBadges.map((badge) => (
              <div
                key={badge.id}
                id={`badge-${badge.id}`}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-all opacity-75 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gray-200 relative">
                    <i className={`${badge.icon} text-2xl text-gray-400`}></i>
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-xl">
                      <i className="ri-lock-fill text-white text-lg"></i>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                    {badge.rarity}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{badge.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
                <div className="flex items-center text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  <i className="ri-flag-line mr-2"></i>
                  {badge.requirement}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BadgesPage;
