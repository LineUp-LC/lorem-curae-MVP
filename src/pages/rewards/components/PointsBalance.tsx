import type { CuraePointsAccount } from '@/lib/utils/curaePoints';
import { getTierBenefits } from '@/lib/utils/curaePoints';

const TIER_COLORS: Record<string, string> = {
  Bronze: 'from-dark to-warm-gray',
  Silver: 'from-sage to-warm-gray',
  Gold: 'from-primary to-light',
  Platinum: 'from-deep to-warm-gray',
};

const TIER_ICONS: Record<string, string> = {
  Bronze: 'ri-medal-line',
  Silver: 'ri-medal-2-line',
  Gold: 'ri-vip-crown-line',
  Platinum: 'ri-vip-diamond-line',
};

interface PointsBalanceProps {
  account: CuraePointsAccount;
}

const PointsBalance = ({ account }: PointsBalanceProps) => {
  const benefits = getTierBenefits(account.tier);

  return (
    <div className="bg-white rounded-xl border border-blush/30 overflow-hidden">
      <div className={`bg-gradient-to-r ${TIER_COLORS[account.tier] || TIER_COLORS.Bronze} p-6 text-white`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <i className={`${TIER_ICONS[account.tier] || TIER_ICONS.Bronze} text-2xl`}></i>
          </div>
          <div>
            <p className="text-sm opacity-90">Your Tier</p>
            <p className="text-2xl font-bold font-serif">{account.tier}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm opacity-90">Curae Points</span>
          <span className="text-3xl font-bold font-serif">{account.points_balance.toLocaleString()}</span>
        </div>
      </div>

      <div className="p-5 bg-cream">
        <h4 className="font-serif font-semibold text-deep mb-3 text-sm">Your Benefits</h4>
        <ul className="space-y-1.5">
          {benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-warm-gray">
              <i className="ri-check-line text-sage mt-0.5 flex-shrink-0"></i>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-blush/30 mt-4 pt-3 flex items-center justify-between text-xs">
          <span className="text-warm-gray">Lifetime Points</span>
          <span className="font-semibold text-deep">{account.lifetime_points.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PointsBalance;
