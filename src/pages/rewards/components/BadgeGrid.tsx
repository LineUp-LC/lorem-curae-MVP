import { getBadgeDefinitions } from '@/lib/utils/badgeEngine';
import type { Badge, BadgeRarity } from '@/types/gamification';

const RARITY_COLORS: Record<BadgeRarity, { bg: string; text: string }> = {
  Legendary: { bg: 'bg-primary/15', text: 'text-primary' },
  Epic: { bg: 'bg-sage/15', text: 'text-sage' },
  Rare: { bg: 'bg-light/20', text: 'text-primary' },
  Common: { bg: 'bg-warm-gray/10', text: 'text-warm-gray' },
};

interface BadgeGridProps {
  userBadges: Badge[];
}

const BadgeGrid = ({ userBadges }: BadgeGridProps) => {
  const allBadges = getBadgeDefinitions();
  const unlockedIds = new Set(userBadges.map(b => b.badge_id));

  const unlocked = allBadges.filter(b => unlockedIds.has(b.id));
  const locked = allBadges.filter(b => !unlockedIds.has(b.id));

  return (
    <div className="bg-white rounded-xl border border-blush/30 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif font-semibold text-deep text-sm">Badges</h3>
        <span className="text-xs text-warm-gray">{unlocked.length}/{allBadges.length} earned</span>
      </div>

      {/* Unlocked badges */}
      {unlocked.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider text-warm-gray/70 mb-2">Earned</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {unlocked.map(badge => {
              const userBadge = userBadges.find(b => b.badge_id === badge.id);
              const colors = RARITY_COLORS[badge.rarity];
              return (
                <div key={badge.id} className="text-center group" title={badge.description}>
                  <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-1.5 ${colors.bg}`}>
                    <i className={`${badge.icon} text-2xl ${colors.text}`}></i>
                  </div>
                  <p className="text-[10px] font-medium text-deep leading-tight">{badge.name}</p>
                  {userBadge && (
                    <p className="text-[9px] text-warm-gray/60 mt-0.5">
                      {new Date(userBadge.unlocked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked badges */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-warm-gray/70 mb-2">Locked</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {locked.map(badge => (
            <div key={badge.id} className="text-center opacity-50" title={badge.requirement}>
              <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-1.5 bg-blush/10">
                <i className={`${badge.icon} text-2xl text-warm-gray/40`}></i>
              </div>
              <p className="text-[10px] font-medium text-warm-gray leading-tight">{badge.name}</p>
              <p className="text-[9px] text-warm-gray/40 mt-0.5">
                <i className="ri-lock-line mr-0.5"></i>Locked
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BadgeGrid;
