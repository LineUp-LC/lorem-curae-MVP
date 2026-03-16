import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { getPointsAccount, getTransactionHistory } from '@/lib/utils/curaePoints';
import { getUserBadges } from '@/lib/utils/badgeEngine';
import { computeStreaks, getAllCompletionHistory } from '@/lib/utils/routineStreaks';
import { getLocalRoutines } from '@/lib/utils/routineState';
import type { CuraePointsAccount, PointsTransaction } from '@/lib/utils/curaePoints';
import type { Badge } from '@/types/gamification';
import type { ProductStreak } from '@/lib/utils/routineStreaks';
import PointsBalance from './components/PointsBalance';
import TierProgress from './components/TierProgress';
import BadgeGrid from './components/BadgeGrid';
import StreakDisplay from './components/StreakDisplay';
import TransactionHistory from './components/TransactionHistory';

const RewardsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [account, setAccount] = useState<CuraePointsAccount | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [streaks, setStreaks] = useState<ProductStreak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const [acct, bdg, txns] = await Promise.all([
          getPointsAccount(user.id),
          getUserBadges(user.id),
          getTransactionHistory(user.id, 20),
        ]);

        if (cancelled) return;

        setAccount(acct);
        setBadges(bdg);
        setTransactions(txns);

        // Streaks from localStorage (no async needed)
        const routines = getLocalRoutines();
        const history = getAllCompletionHistory();
        setStreaks(computeStreaks(routines, history));
      } catch (error) {
        console.error('Error loading rewards data:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [user?.id, authLoading]);

  // Guest CTA
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-cream">
        <main className="max-w-2xl mx-auto px-4 pt-32 pb-16 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-gift-line text-3xl text-primary"></i>
          </div>
          <h1 className="font-serif text-2xl font-bold text-deep mb-3">Curae Rewards</h1>
          <p className="text-sm text-warm-gray mb-8 max-w-md mx-auto">
            Earn points for exploring products, building routines, and engaging with your skincare journey. Create an account to start earning.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/auth/signup"
              className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-dark transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/auth/login"
              className="px-6 py-2.5 border border-blush text-deep text-sm font-medium rounded-xl hover:bg-cream transition-colors"
            >
              Sign In
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <main className="max-w-4xl mx-auto px-4 pt-28 pb-16">
          <div className="motion-safe:animate-pulse space-y-4">
            <div className="h-48 bg-blush/20 rounded-xl"></div>
            <div className="h-32 bg-blush/20 rounded-xl"></div>
            <div className="h-64 bg-blush/20 rounded-xl"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-deep mb-1">Rewards</h1>
          <p className="text-sm text-warm-gray">Track your progress and earn rewards for your skincare journey</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column: Points + Tier */}
          <div className="lg:col-span-1 space-y-5">
            {account && <PointsBalance account={account} />}
            {account && <TierProgress account={account} />}
          </div>

          {/* Right column: Badges, Streaks, Activity */}
          <div className="lg:col-span-2 space-y-5">
            <BadgeGrid userBadges={badges} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <StreakDisplay streaks={streaks} />
              <TransactionHistory transactions={transactions} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RewardsPage;
