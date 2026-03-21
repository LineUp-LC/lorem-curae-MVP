/**
 * Scan Page — Full Vision (Scan → Discover → Understand → Build)
 *
 * Allows authenticated users to photograph a skincare product
 * and identify it via Claude Vision. Includes:
 * - Full ingredient parsing with safety badges
 * - Compatible product discovery with AI WHY tags
 * - Profile-filtered reviews with AI summary
 * - Shelf, routine, and scan history integration
 *
 * Guest users see a login CTA.
 *
 * States: idle → captured → processing → result/error
 */

import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import { scanProduct, scanByUpc, createScanThumbnail } from '../../lib/ai/scanClient';
import type { ScanClientError } from '../../lib/ai/scanClient';
import { onAction } from '../../lib/utils/gamificationTriggers';
import { getScanHistory, addScanHistoryEntry } from '../../lib/utils/scanHistory';
import { productData } from '../../mocks/products';
import type { ScanResult, ScanHistoryEntry } from '../../types/scan';
import type { Product } from '../../types/product';
import NeuralBloomIcon from '../../components/icons/NeuralBloomIcon';
import CameraCapture from './components/CameraCapture';
import ScanProcessing from './components/ScanProcessing';
import ScanResultView from './components/ScanResultView';
import ScanHistory from './components/ScanHistory';
import PostScanDiscovery from './components/PostScanDiscovery';

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
  const [state, setState] = useState<ScanState>({ phase: 'idle' });
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);

  // Load scan history on mount
  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  const handleCapture = useCallback((file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setState({ phase: 'captured', file, previewUrl });
  }, []);

  const handleIdentify = useCallback(async () => {
    if (state.phase !== 'captured') return;

    const { file, previewUrl } = state;
    setState({ phase: 'processing', previewUrl, file });

    const response = await scanProduct(file);

    if (!response.success) {
      const errResponse = response as ScanClientError;
      setState({ phase: 'error', error: errResponse.error, previewUrl });
      return;
    }

    const result = response.result;
    let matchedProduct: Product | undefined;
    if (result.match && result.productId) {
      matchedProduct = productData.find(p => p.id === result.productId);
      // Gamification: award scan points (non-blocking)
      onAction(user?.id, 'PRODUCT_SCAN').catch(() => {});
    }

    // Save to scan history
    try {
      const thumbnail = await createScanThumbnail(file);
      addScanHistoryEntry(result, thumbnail);
      setHistory(getScanHistory());
    } catch {
      // Thumbnail failure is non-critical
    }

    setState({ phase: 'result', result, previewUrl, matchedProduct });
  }, [state, user?.id]);

  const handleRetake = useCallback(() => {
    if (state.phase !== 'idle' && 'previewUrl' in state) {
      URL.revokeObjectURL(state.previewUrl);
    }
    setState({ phase: 'idle' });
  }, [state]);

  const handleScanAnother = useCallback(() => {
    if ('previewUrl' in state) {
      URL.revokeObjectURL(state.previewUrl);
    }
    setState({ phase: 'idle' });
  }, [state]);

  const handleHistorySelect = useCallback((entry: ScanHistoryEntry) => {
    const result = entry.result;
    let matchedProduct: Product | undefined;
    if (result.match && result.productId) {
      matchedProduct = productData.find(p => p.id === result.productId);
    }
    // Use the thumbnail as the preview (it's a data URL, not a blob URL)
    setState({ phase: 'result', result, previewUrl: entry.thumbnail, matchedProduct });
  }, []);

  const handleBarcodeDetected = useCallback(async (upc: string) => {
    setState({ phase: 'processing', previewUrl: '' });

    const response = await scanByUpc(upc);

    if (!response.success) {
      const errResponse = response as ScanClientError;
      setState({ phase: 'error', error: errResponse.error, previewUrl: '' });
      return;
    }

    const result = response.result;
    let matchedProduct: Product | undefined;
    if (result.match && result.productId) {
      matchedProduct = productData.find(p => p.id === result.productId);
      onAction(user?.id, 'PRODUCT_SCAN').catch(() => {});
    }

    setState({ phase: 'result', result, previewUrl: '', matchedProduct });
  }, [user?.id]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Auth loading
  if (authLoading) {
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
          <ScanHistory
            entries={history}
            onSelect={handleHistorySelect}
            onClear={handleClearHistory}
          />
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

          {/* Result — match or no match */}
          {state.phase === 'result' && (
            <ScanResultView
              result={state.result}
              previewUrl={state.previewUrl}
              matchedProduct={state.matchedProduct}
              onScanAnother={handleScanAnother}
            />
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

        {/* Post-scan discovery — below the main card */}
        {state.phase === 'result' && (
          <PostScanDiscovery
            scanResult={state.result}
            matchedProduct={state.matchedProduct}
          />
        )}
      </div>
    </div>
  );
}
