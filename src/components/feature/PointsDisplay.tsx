import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase-browser';
import { getPointsAccount, CuraePointsAccount, getTierBenefits, getPointsToNextTier } from '../../lib/utils/curaePoints';

/**
 * PointsDisplay Component
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

const PointsDisplay = () => {
  const [pointsAccount, setPointsAccount] = useState<CuraePointsAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadPointsAccount();
  }, []);

  const loadPointsAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const account = await getPointsAccount(user.id);
      setPointsAccount(account);
    } catch (error) {
      console.error('Error loading points:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[#E8D4CC]/30 p-6">
        <div className="motion-safe:animate-pulse">
          <div className="h-4 bg-[#E8D4CC]/50 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-[#E8D4CC]/50 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!pointsAccount) {
    return null;
  }

  // Lorem Curae tier colors
  const tierColors = {
    Bronze: 'from-[#8B4D35] to-[#6B635A]',
    Silver: 'from-[#7A8B7A] to-[#6B635A]',
    Gold: 'from-[#C4704D] to-[#E8A888]',
    Platinum: 'from-[#2D2A26] to-[#6B635A]',
  };

  const tierIcons = {
    Bronze: 'ri-medal-line',
    Silver: 'ri-medal-2-line',
    Gold: 'ri-vip-crown-line',
    Platinum: 'ri-vip-diamond-line',
  };

  const pointsToNext = getPointsToNextTier(pointsAccount.tier, pointsAccount.lifetime_points);
  const tierBenefits = getTierBenefits(pointsAccount.tier);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8D4CC]/30 overflow-hidden" style={{ fontFamily: 'var(--lc-font-sans, "DM Sans", sans-serif)' }}>
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${tierColors[pointsAccount.tier]} p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className={`${tierIcons[pointsAccount.tier]} text-2xl`}></i>
            </div>
            <div>
              <p className="text-sm opacity-90">Your Tier</p>
              <p className="text-2xl font-bold" style={{ fontFamily: 'var(--lc-font-serif, "Cormorant Garamond", serif)' }}>{pointsAccount.tier}</p>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <i className={`ri-${showDetails ? 'arrow-up' : 'arrow-down'}-s-line text-2xl`}></i>
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">Curae Points Balance</span>
            <span className="text-3xl font-bold" style={{ fontFamily: 'var(--lc-font-serif, "Cormorant Garamond", serif)' }}>{pointsAccount.points_balance.toLocaleString()}</span>
          </div>
          
          {pointsAccount.tier !== 'Platinum' && (
            <>
              <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      ((pointsAccount.lifetime_points % 1000) / 1000) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs opacity-90 mt-1">
                {pointsToNext} points to next tier
              </p>
            </>
          )}
        </div>
      </div>

      {/* Details section */}
      {showDetails && (
        <div className="p-6 space-y-6 bg-[#FDF8F5]">
          <div>
            <h4 className="font-semibold text-[#2D2A26] mb-3" style={{ fontFamily: 'var(--lc-font-serif, "Cormorant Garamond", serif)' }}>Your Benefits</h4>
            <ul className="space-y-2">
              {tierBenefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-[#6B635A]">
                  <i className="ri-check-line text-[#7A8B7A] mt-0.5"></i>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-[#E8D4CC]/30 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6B635A]">Lifetime Points Earned</span>
              <span className="font-semibold text-[#2D2A26]">
                {pointsAccount.lifetime_points.toLocaleString()}
              </span>
            </div>
          </div>

          <a
            href="/account"
            className="block w-full text-center bg-[#C4704D] hover:bg-[#8B4D35] text-white py-3 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            View Full History
          </a>
        </div>
      )}
    </div>
  );
};

export default PointsDisplay;