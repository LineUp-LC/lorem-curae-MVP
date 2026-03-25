/**
 * Scan Page — Tabbed Vision (Identify → Explore on demand)
 *
 * Allows authenticated users to photograph a skincare product
 * and identify it via Claude Vision (fast identify mode).
 *
 * Deeper analysis (ingredients, compatible products, similar products)
 * is lazy-loaded via tabs inside ScanResultView.
 *
 * Guest users see a login CTA.
 *
 * States: idle → captured → processing → result/error
 */

import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import { scanProduct, scanByUpc, createScanThumbnail } from '../../lib/ai/scanClient';
import { resetSearchSession } from '../../lib/api/productSearch';
import type { ScanClientError } from '../../lib/ai/scanClient';
import { onAction } from '../../lib/utils/gamificationTriggers';
import { getScanHistory, addScanHistoryEntry, updateScanHistoryEntry } from '../../lib/utils/scanHistory';
import { getProductById } from '../../lib/data/products';
import type { ScanResult, ScanHistoryEntry } from '../../types/scan';
import type { Product } from '../../types/product';
import NeuralBloomIcon from '../../components/icons/NeuralBloomIcon';

// Eagerly loaded — needed immediately for idle/captured/processing states
import CameraCapture from './components/CameraCapture';
import ScanProcessing from './components/ScanProcessing';

// Lazy loaded — only needed after scan completes
const ScanResultView = lazy(() => import('./components/ScanResultView'));
const ScanHistory = lazy(() => import('./components/ScanHistory'));

// ---------------------------------------------------------------------------
// Page states
// ---------------------------------------------------------------------------

type ScanState =
  | { phase: 'idle' }
  | { phase: 'captured'; file: File; previewUrl: string }
  | { phase: 'processing'; previewUrl: string; file?: File }
  | { phase: 'result'; result: ScanResult; previewUrl: string; matchedProduct?: Product }
  | { phase: 'error'; error: string; previewUrl: string };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ScanPage() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [state, setState] = useState<ScanState>({ phase: 'idle' });
  const [capturedBase64, setCapturedBase64] = useState<string | undefined>();
  const [initialFullScan, setInitialFullScan] = useState<ScanResult | undefined>();
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const cancelledRef = useRef(false);

  // Warm up Edge Functions on mount (OPTIONS → warms container, no code execution)
  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    if (!url) return;
    Promise.allSettled([
      fetch(`${url}/functions/v1/product-search`, { method: 'OPTIONS' }),
      fetch(`${url}/functions/v1/ai-insight`, { method: 'OPTIONS' }),
    ]).catch(() => {});
  }, []);

  // Reset to idle on every navigation to /scan (location.key changes each visit)
  useEffect(() => {
    cancelledRef.current = false;
    setState({ phase: 'idle' });
    setCapturedBase64(undefined);
    setInitialFullScan(undefined);
    setCurrentHistoryId(null);
    setHistory(getScanHistory());

    return () => {
      cancelledRef.current = true;
    };
  }, [location.key, location.state]);

  const handleCapture = useCallback((file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setState({ phase: 'captured', file, previewUrl });
  }, []);

  const handleIdentify = useCallback(async () => {
    if (state.phase !== 'captured') return;

    // Reset Serper session counter for new scan
    resetSearchSession();

    const { file, previewUrl } = state;
    setState({ phase: 'processing', previewUrl, file });

    const response = await scanProduct(file);
    if (cancelledRef.current) return;

    if (!response.success) {
      const errResponse = response as ScanClientError;
      setState({ phase: 'error', error: errResponse.error, previewUrl });
      return;
    }

    const result = response.result;
    setCapturedBase64(response.imageBase64);
    let matchedProduct: Product | undefined;
    if (result.match && result.productId) {
      matchedProduct = getProductById(result.productId) ?? undefined;
    }

    // Gamification: award scan points for ANY successful identification (non-blocking)
    if (result.detectedProduct || result.detectedBrand) {
      onAction(user?.id, 'PRODUCT_SCAN').catch(() => {});
    }

    // Save to scan history (include imageBase64 for future full scan from history)
    try {
      const thumbnail = await createScanThumbnail(file);
      if (cancelledRef.current) return;
      const historyEntry = addScanHistoryEntry(result, thumbnail, response.imageBase64);
      setCurrentHistoryId(historyEntry.id);
      setInitialFullScan(undefined);
      setHistory(getScanHistory());
    } catch {
      // Thumbnail failure is non-critical
    }

    if (cancelledRef.current) return;
    setState({ phase: 'result', result, previewUrl, matchedProduct });
    window.scrollTo(0, 0);
  }, [state, user?.id]);

  const handleRetake = useCallback(() => {
    if (state.phase !== 'idle' && 'previewUrl' in state) {
      URL.revokeObjectURL(state.previewUrl);
    }
    setCapturedBase64(undefined);
    setInitialFullScan(undefined);
    setCurrentHistoryId(null);
    setState({ phase: 'idle' });
    window.scrollTo(0, 0);
  }, [state]);

  const handleScanAnother = useCallback(() => {
    if ('previewUrl' in state) {
      URL.revokeObjectURL(state.previewUrl);
    }
    setCapturedBase64(undefined);
    setInitialFullScan(undefined);
    setCurrentHistoryId(null);
    setState({ phase: 'idle' });
    window.scrollTo(0, 0);
  }, [state]);

  const handleFullScanComplete = useCallback((fullResult: ScanResult) => {
    if (currentHistoryId) {
      updateScanHistoryEntry(currentHistoryId, { fullScanResult: fullResult });
      setHistory(getScanHistory());
    } else {
      console.warn('[Scan] Full scan complete but no history entry ID — result not persisted to history');
    }
  }, [currentHistoryId]);

  const handleHistorySelect = useCallback((entry: ScanHistoryEntry) => {
    const result = entry.result;
    let matchedProduct: Product | undefined;
    if (result.match && result.productId) {
      matchedProduct = getProductById(result.productId) ?? undefined;
    }
    // Restore imageBase64 for full scan re-trigger + cached fullScanResult for instant tabs
    setCapturedBase64(entry.imageBase64);
    setInitialFullScan(entry.fullScanResult);
    setCurrentHistoryId(entry.id);
    // Use the thumbnail as the preview (it's a data URL, not a blob URL)
    setState({ phase: 'result', result, previewUrl: entry.thumbnail, matchedProduct });
    window.scrollTo(0, 0);
  }, []);

  const handleBarcodeDetected = useCallback(async (upc: string) => {
    resetSearchSession();
    setState({ phase: 'processing', previewUrl: '' });

    const response = await scanByUpc(upc);
    if (cancelledRef.current) return;

    if (!response.success) {
      const errResponse = response as ScanClientError;
      setState({ phase: 'error', error: errResponse.error, previewUrl: '' });
      return;
    }

    const result = response.result;
    let matchedProduct: Product | undefined;
    if (result.match && result.productId) {
      matchedProduct = getProductById(result.productId) ?? undefined;
    }

    // Award scan points for any identification or UPC scan
    if (result.detectedProduct || result.detectedBrand || result.upc) {
      onAction(user?.id, 'PRODUCT_SCAN').catch(() => {});
    }

    if (cancelledRef.current) return;
    setState({ phase: 'result', result, previewUrl: '', matchedProduct });
    window.scrollTo(0, 0);
  }, [user?.id]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Auth loading — only show spinner on cold start (no user yet), not on session refresh flicker
  if (authLoading && !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Guest CTA
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto">
            <NeuralBloomIcon size={24} className="text-primary" />
          </div>
          <h1 className="text-xl font-serif font-semibold text-deep">
            Product Scanner
          </h1>
          <p className="text-sm text-warm-gray leading-relaxed">
            Sign in to scan skincare products with AI-powered identification
          </p>
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-dark transition-colors"
          >
            Sign in to get started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        {/* Page header */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <NeuralBloomIcon size={14} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-semibold text-deep">
              Product Scanner
            </h1>
            <p className="text-xs text-warm-gray">
              Identify skincare products with AI
            </p>
          </div>
        </div>

        {/* Scan History — visible when idle */}
        {state.phase === 'idle' && history.length > 0 && (
          <Suspense fallback={null}>
            <ScanHistory
              entries={history}
              onSelect={handleHistorySelect}
              onClear={handleClearHistory}
            />
          </Suspense>
        )}

        {/* State-based content */}
        <div className="bg-white rounded-2xl border border-blush shadow-sm p-6">
          {/* Idle — show capture UI */}
          {state.phase === 'idle' && (
            <CameraCapture onCapture={handleCapture} onBarcodeDetected={handleBarcodeDetected} />
          )}

          {/* Captured — show preview with identify/retake */}
          {state.phase === 'captured' && (
            <div className="flex flex-col items-center gap-5">
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-md">
                <img
                  src={state.previewUrl}
                  alt="Captured product"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRetake}
                  className="px-5 py-2.5 text-sm font-medium text-warm-gray bg-cream border border-blush rounded-xl hover:bg-blush/30 transition-colors"
                >
                  Retake
                </button>
                <button
                  onClick={handleIdentify}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-dark transition-colors shadow-md"
                >
                  <i className="ri-search-eye-line mr-1.5" />
                  Identify Product
                </button>
              </div>
            </div>
          )}

          {/* Processing — loading state */}
          {state.phase === 'processing' && (
            <ScanProcessing previewUrl={state.previewUrl} />
          )}

          {/* Result — match or no match (lazy loaded) */}
          {state.phase === 'result' && (
            <Suspense fallback={<div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
              <ScanResultView
                result={state.result}
                previewUrl={state.previewUrl}
                matchedProduct={state.matchedProduct}
                imageBase64={capturedBase64}
                initialFullScanResult={initialFullScan}
                onScanAnother={handleScanAnother}
                onFullScanComplete={handleFullScanComplete}
              />
            </Suspense>
          )}

          {/* Error — retry */}
          {state.phase === 'error' && (
            <div className="flex flex-col items-center gap-5">
              <div className="w-14 h-14 bg-cream rounded-full flex items-center justify-center">
                <i className="ri-error-warning-line text-2xl text-warm-gray" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-serif font-semibold text-deep">
                  Scan Failed
                </h2>
                <p className="text-sm text-warm-gray">
                  {state.error}
                </p>
              </div>

              {/* Tips for retry */}
              <div className="bg-cream/50 border border-blush/30 rounded-xl p-4 max-w-xs">
                <p className="text-xs font-medium text-deep mb-2">Try again with</p>
                <ul className="space-y-1">
                  {[
                    'Better lighting',
                    'A clearer view of the product label',
                    'The brand name visible in the photo',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-warm-gray">
                      <i className="ri-lightbulb-line text-primary/50 mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleScanAnother}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-dark transition-colors"
                >
                  <i className="ri-camera-line mr-1.5" />
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
