import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { fetchScanConfidenceStats } from '@/lib/data/supabaseScanConfidence';
import type { BrandConfidence, ScanConfidenceStats } from '@/types/scanConfidence';

const INPUT_CLASS = 'w-full px-4 py-3 rounded-lg border border-blush-300 bg-white text-deep focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm';
const LABEL_CLASS = 'block text-sm font-medium text-deep mb-1.5';

const BRAND_CONFIDENCE_CLASSES: Record<string, string> = {
  high: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-red-100 text-red-700',
};

function brandConfidenceClass(level: BrandConfidence): string {
  return (level && BRAND_CONFIDENCE_CLASSES[level]) ?? 'bg-gray-100 text-gray-500';
}

function StatCard({ label, value, sublabel, muted }: { label: string; value: string; sublabel?: string; muted?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-blush-200 p-5">
      <p className="text-sm text-warm-gray mb-1">{label}</p>
      <p className={`text-3xl font-serif font-semibold ${muted ? 'text-warm-gray' : 'text-deep'}`}>{value}</p>
      {sublabel && <p className="text-xs text-warm-gray mt-1">{sublabel}</p>}
    </div>
  );
}

function toYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function AdminScanConfidencePage() {
  const { user } = useAuth();

  const [fromDate, setFromDate] = useState(() => toYMD(new Date(Date.now() - 30 * 86400000)));
  const [toDate, setToDate] = useState(() => toYMD(new Date()));
  const [stats, setStats] = useState<ScanConfidenceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Inclusive of the whole `toDate` day — RPC uses created_at < p_to.
  const fromISO = new Date(`${fromDate}T00:00:00`).toISOString();
  const toISO = new Date(new Date(`${toDate}T00:00:00`).getTime() + 86400000).toISOString();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchScanConfidenceStats(fromISO, toISO).then(data => {
      if (cancelled) return;
      if (!data) setError(true);
      setStats(data);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [fromISO, toISO]);

  const total = stats?.total_vision ?? 0;
  const waryRate = total > 0 ? `${Math.round((stats!.wary / total) * 100)}%` : '—';

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-blush-200 h-16 flex items-center px-6 sticky top-0 z-40">
        <Link to="/" className="font-serif text-xl font-semibold text-deep">Lorem Curae</Link>
        <span className="ml-3 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Admin</span>
        <div className="ml-auto flex items-center gap-4">
          <Link to="/admin/products" className="text-sm text-warm-gray hover:text-deep transition-colors">Products</Link>
          <Link to="/" className="text-sm text-warm-gray hover:text-deep transition-colors">
            <i className="ri-arrow-left-line mr-1" />Back to Site
          </Link>
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-600">
              {user?.email?.charAt(0).toUpperCase() ?? 'A'}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-semibold text-deep">Scan Confidence</h1>
          <p className="text-sm text-warm-gray mt-1">
            How often the scanner is wary on label (Vision) scans. Barcode scans are excluded.
          </p>
        </div>

        {/* Date range */}
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div>
            <label className={LABEL_CLASS} htmlFor="from-date">From</label>
            <input
              id="from-date"
              type="date"
              value={fromDate}
              max={toDate}
              onChange={e => setFromDate(e.target.value)}
              className={`${INPUT_CLASS} sm:w-48`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="to-date">To</label>
            <input
              id="to-date"
              type="date"
              value={toDate}
              min={fromDate}
              max={toYMD(new Date())}
              onChange={e => setToDate(e.target.value)}
              className={`${INPUT_CLASS} sm:w-48`}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-warm-gray">Loading scan confidence…</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-cream-50 rounded-xl border border-blush-100">
            <i className="ri-error-warning-line text-4xl text-warm-gray mb-2 block" />
            <p className="text-warm-gray">Could not load scan confidence data. Try again later.</p>
          </div>
        ) : (
          <>
            {/* Number cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard
                label="Wary rate"
                value={waryRate}
                sublabel={total > 0 ? `${stats!.wary} of ${total} Vision scans` : 'No Vision scans yet'}
              />
              <StatCard label="High confidence" value={String(stats?.high ?? 0)} />
              <StatCard label="Medium confidence" value={String(stats?.medium ?? 0)} />
              <StatCard label="Low confidence" value={String(stats?.low ?? 0)} />
              <StatCard label="Unknown" value={String(stats?.unknown ?? 0)} muted />
            </div>

            {/* Recent outcomes */}
            <h2 className="font-serif text-lg font-semibold text-deep mb-3">Recent Vision scans</h2>
            <div className="bg-white rounded-xl border border-blush-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blush-200 bg-cream-50">
                      <th className="text-left px-4 py-3 font-medium text-warm-gray">When</th>
                      <th className="text-left px-4 py-3 font-medium text-warm-gray">Source</th>
                      <th className="text-left px-4 py-3 font-medium text-warm-gray">Brand confidence</th>
                      <th className="text-left px-4 py-3 font-medium text-warm-gray">Overall confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.recent.length ?? 0) === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-warm-gray">
                        No Vision scans in this range yet.
                      </td></tr>
                    ) : stats!.recent.map((row, i) => (
                      <tr key={`${row.created_at}-${i}`} className={`border-b border-blush-100 hover:bg-cream-50 transition-colors ${i === stats!.recent.length - 1 ? 'border-b-0' : ''}`}>
                        <td className="px-4 py-3 text-warm-gray whitespace-nowrap">
                          {new Date(row.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-warm-gray">Vision</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${brandConfidenceClass(row.brand_confidence)}`}>
                            {row.brand_confidence ?? 'unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-warm-gray capitalize">
                          {row.overall_confidence ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
