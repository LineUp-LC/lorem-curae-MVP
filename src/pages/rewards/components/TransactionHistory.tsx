import type { PointsTransaction } from '@/lib/utils/curaePoints';

interface TransactionHistoryProps {
  transactions: PointsTransaction[];
}

const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  return (
    <div className="bg-white rounded-xl border border-blush/30 p-5">
      <h3 className="font-serif font-semibold text-deep text-sm mb-4">Recent Activity</h3>

      {transactions.length === 0 ? (
        <div className="text-center py-6">
          <i className="ri-history-line text-2xl text-warm-gray/30 mb-2"></i>
          <p className="text-xs text-warm-gray">No activity yet</p>
          <p className="text-[10px] text-warm-gray/60 mt-1">Start exploring to earn points</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.slice(0, 10).map((tx) => {
            const isPositive = tx.points_amount > 0;
            return (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-blush/15 last:border-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isPositive ? 'bg-sage/10' : 'bg-primary/10'
                  }`}>
                    <i className={`${isPositive ? 'ri-add-line text-sage' : 'ri-subtract-line text-primary'} text-sm`}></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-deep truncate">{tx.description}</p>
                    <p className="text-[10px] text-warm-gray/60">
                      {new Date(tx.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-semibold flex-shrink-0 ml-2 ${
                  isPositive ? 'text-sage' : 'text-primary'
                }`}>
                  {isPositive ? '+' : ''}{tx.points_amount}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
