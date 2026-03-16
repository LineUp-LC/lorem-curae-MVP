import type { CuraePointsAccount } from '@/lib/utils/curaePoints';
import { getPointsToNextTier, TIER_THRESHOLDS } from '@/lib/utils/curaePoints';

interface TierProgressProps {
  account: CuraePointsAccount;
}

const TIER_ORDER = ['Bronze', 'Silver', 'Gold', 'Platinum'] as const;

const TierProgress = ({ account }: TierProgressProps) => {
  const pointsToNext = getPointsToNextTier(account.tier, account.lifetime_points);
  const isMaxTier = account.tier === 'Platinum';
  const currentIdx = TIER_ORDER.indexOf(account.tier as typeof TIER_ORDER[number]);
  const nextTier = isMaxTier ? null : TIER_ORDER[currentIdx + 1];

  // Calculate progress percentage toward next tier
  const currentThreshold = TIER_THRESHOLDS[account.tier as keyof typeof TIER_THRESHOLDS] || 0;
  const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier as keyof typeof TIER_THRESHOLDS] : currentThreshold;
  const range = nextThreshold - currentThreshold;
  const progress = range > 0 ? Math.min(((account.lifetime_points - currentThreshold) / range) * 100, 100) : 100;

  return (
    <div className="bg-white rounded-xl border border-blush/30 p-5">
      <h3 className="font-serif font-semibold text-deep text-sm mb-4">Tier Progress</h3>

      {isMaxTier ? (
        <div className="text-center py-4">
          <i className="ri-vip-diamond-line text-3xl text-primary mb-2"></i>
          <p className="text-sm text-warm-gray">You've reached the highest tier</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-warm-gray mb-2">
            <span>{account.tier}</span>
            <span>{nextTier}</span>
          </div>
          <div className="w-full bg-blush/30 rounded-full h-2.5 mb-3">
            <div
              className="bg-primary rounded-full h-2.5 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-warm-gray text-center">
            {pointsToNext.toLocaleString()} points to {nextTier}
          </p>
        </>
      )}

      {/* Tier milestones */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-blush/30">
        {TIER_ORDER.map((tier, idx) => {
          const isAchieved = idx <= currentIdx;
          return (
            <div key={tier} className="text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 ${
                isAchieved ? 'bg-primary/10 text-primary' : 'bg-blush/20 text-warm-gray/40'
              }`}>
                <i className={`${isAchieved ? 'ri-check-line' : 'ri-lock-line'} text-sm`}></i>
              </div>
              <p className={`text-[10px] ${isAchieved ? 'text-deep font-medium' : 'text-warm-gray/50'}`}>{tier}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TierProgress;
