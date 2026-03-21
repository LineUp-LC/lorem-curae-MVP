/**
 * CameraCapture — product photo capture + barcode scanning.
 *
 * Photo mode:
 *   Mobile: native <input type="file" capture="environment"> for rear camera.
 *   Desktop: live webcam via getUserMedia + shutter button.
 *   Falls back to file upload if camera is denied or unavailable.
 *
 * Barcode mode (BarcodeDetector API — Chrome 83+):
 *   Desktop: live webcam with continuous frame scanning.
 *   Mobile: file input → detect barcode from image.
 *   Unsupported browsers show an error message.
 */

import { useRef, useState, useEffect, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onBarcodeDetected?: (upc: string) => void;
  disabled?: boolean;
}

const getIsMobile = () =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 0 && window.innerWidth < 768);

const hasBarcodeDetector = () => 'BarcodeDetector' in window;

export default function CameraCapture({ onCapture, onBarcodeDetected, disabled }: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLoopRef = useRef<number | null>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [mobile] = useState(getIsMobile);
  const [mode, setMode] = useState<'photo' | 'barcode'>('photo');
  const [barcodeScanning, setBarcodeScanning] = useState(false);
  const [barcodeNotFound, setBarcodeNotFound] = useState(false);

  // Ref callback — wires stream to video element immediately on mount (Fix 3)
  const videoRefCallback = useCallback((videoEl: HTMLVideoElement | null) => {
    if (videoEl && streamRef.current) {
      videoEl.srcObject = streamRef.current;
      videoEl.play().catch(() => {});
    }
    (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = videoEl;
  }, []);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mode === 'barcode') {
      detectBarcodeFromFile(file);
    } else {
      onCapture(file);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const stopWebcam = useCallback(() => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setWebcamActive(false);
    setBarcodeScanning(false);
  }, []);

  const startWebcam = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setWebcamError('Camera not supported in this browser');
      return;
    }

    setWebcamError(null);
    setBarcodeNotFound(false);

    // Ensure any previous stream is fully released
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      await new Promise(r => setTimeout(r, 300));
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
      } catch (innerErr) {
        if (
          innerErr instanceof DOMException &&
          (innerErr.name === 'OverconstrainedError' || innerErr.name === 'NotFoundError')
        ) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } else {
          throw innerErr;
        }
      }
      streamRef.current = stream;
      setWebcamActive(true);
      setWebcamError(null);
    } catch (err) {
      const msg =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access and try again.'
          : err instanceof DOMException && err.name === 'AbortError'
            ? 'Camera was interrupted. Please try again.'
            : `Could not access camera${err instanceof Error ? ` (${err.name})` : ''}. Try uploading a photo instead.`;
      setWebcamError(msg);
    }
  }, []);

  // Barcode scanning loop — runs when webcam is active in barcode mode
  useEffect(() => {
    if (!webcamActive || mode !== 'barcode' || !videoRef.current) return;
    if (!hasBarcodeDetector()) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detector = new (window as any).BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'],
    });

    setBarcodeScanning(true);
    setBarcodeNotFound(false);
    let active = true;

    const scan = async () => {
      if (!active || !videoRef.current) return;

      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0 && active) {
          active = false;
          setBarcodeScanning(false);
          const upc = barcodes[0].rawValue;
          stopWebcam();
          onBarcodeDetected?.(upc);
          return;
        }
      } catch {
        // Detection failed on this frame — continue
      }

      if (active) {
        scanLoopRef.current = requestAnimationFrame(scan);
      }
    };

    // Start scanning after brief delay for video to stabilize
    const startDelay = setTimeout(() => scan(), 300);

    // 5-second timeout
    scanTimeoutRef.current = setTimeout(() => {
      if (active) {
        active = false;
        setBarcodeScanning(false);
        setBarcodeNotFound(true);
      }
    }, 5000);

    return () => {
      active = false;
      clearTimeout(startDelay);
      if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };
  }, [webcamActive, mode, stopWebcam, onBarcodeDetected]);

  // Detect barcode from a file (mobile barcode mode)
  const detectBarcodeFromFile = useCallback(async (file: File) => {
    if (!hasBarcodeDetector()) {
      setWebcamError('Barcode scanning is not supported in this browser. Try Chrome.');
      return;
    }

    try {
      const img = await createImageBitmap(file);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detector = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'],
      });
      const barcodes = await detector.detect(img);

      if (barcodes.length > 0) {
        onBarcodeDetected?.(barcodes[0].rawValue);
      } else {
        setWebcamError('No barcode found in image. Try photo mode instead.');
      }
    } catch {
      setWebcamError('Failed to scan barcode from image.');
    }
  }, [onBarcodeDetected]);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      blob => {
        if (blob) {
          const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
          stopWebcam();
          onCapture(file);
        }
      },
      'image/jpeg',
      0.9,
    );
  }, [onCapture, stopWebcam]);

  const handleModeSwitch = useCallback((newMode: 'photo' | 'barcode') => {
    if (newMode === mode) return;

    if (newMode === 'barcode' && !hasBarcodeDetector()) {
      setWebcamError('Barcode scanning is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    // Stop any active webcam/scanning when switching
    if (webcamActive) stopWebcam();
    setWebcamError(null);
    setBarcodeNotFound(false);
    setMode(newMode);
  }, [mode, webcamActive, stopWebcam]);

  // ── Desktop webcam active view ──────────────────────────────────────
  if (webcamActive) {
    return (
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-64 h-64 rounded-2xl overflow-hidden bg-deep/5 shadow-md">
          <video
            ref={videoRefCallback}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            onLoadedMetadata={() => {
              const v = videoRef.current;
              if (v && (v.videoWidth === 0 || v.videoHeight === 0)) {
                console.warn('[Camera] Video dimensions 0x0, restarting stream');
                stopWebcam();
                setTimeout(startWebcam, 500);
              }
            }}
          />

          {/* Barcode scanning overlay */}
          {mode === 'barcode' && barcodeScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-24 border-2 border-primary/60 rounded-lg animate-pulse" />
            </div>
          )}
        </div>

        {/* Barcode scanning status */}
        {mode === 'barcode' && barcodeScanning && (
          <p className="text-xs text-primary animate-pulse">Scanning for barcode...</p>
        )}

        {/* Barcode not found — offer fallback */}
        {mode === 'barcode' && barcodeNotFound && (
          <div className="text-center space-y-2">
            <p className="text-xs text-warm-gray">No barcode detected. Try photo mode instead.</p>
            <button
              onClick={() => handleModeSwitch('photo')}
              className="text-xs text-primary hover:text-dark transition-colors underline"
            >
              Switch to Photo mode
            </button>
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Stop camera */}
          <button
            onClick={stopWebcam}
            className="w-10 h-10 rounded-full bg-cream border border-blush flex items-center justify-center text-warm-gray hover:bg-blush/30 transition-colors"
            aria-label="Stop camera"
          >
            <i className="ri-close-line text-lg" />
          </button>

          {/* Shutter — photo mode only */}
          {mode === 'photo' && (
            <button
              onClick={captureFrame}
              disabled={disabled}
              className={`
                w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center
                transition-all
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
              `}
              aria-label="Capture photo"
            >
              <div className="w-12 h-12 rounded-full bg-primary" />
            </button>
          )}

          {/* Retry scan — barcode mode when timed out */}
          {mode === 'barcode' && barcodeNotFound && (
            <button
              onClick={() => {
                setBarcodeNotFound(false);
                setBarcodeScanning(true);
                // Restart detection by toggling webcam
                stopWebcam();
                setTimeout(startWebcam, 300);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-dark transition-colors"
            >
              Retry
            </button>
          )}

          {/* Gallery fallback */}
          <label className="w-10 h-10 rounded-full bg-cream border border-blush flex items-center justify-center text-warm-gray hover:bg-blush/30 transition-colors cursor-pointer">
            <i className="ri-image-line text-lg" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={disabled}
              className="sr-only"
              aria-label="Upload photo from files"
            />
          </label>
        </div>

        <p className="text-xs text-warm-gray">
          {mode === 'photo'
            ? 'Position the product label in frame'
            : 'Hold the barcode steady in frame'}
        </p>
      </div>
    );
  }

  // ── Default idle view (mobile + desktop) ────────────────────────────
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Camera illustration */}
      <div className="w-32 h-32 bg-cream rounded-full flex items-center justify-center">
        <i className={`${mode === 'barcode' ? 'ri-barcode-line' : 'ri-camera-line'} text-5xl text-primary/60`} />
      </div>

      <div className="text-center space-y-2 max-w-xs">
        <h2 className="text-lg font-serif font-semibold text-deep">
          {mode === 'barcode' ? 'Scan a Barcode' : 'Scan a Product'}
        </h2>
        <p className="text-sm text-warm-gray leading-relaxed">
          {mode === 'barcode'
            ? 'Scan a product barcode (UPC/EAN) to look it up in our catalog'
            : 'Take a photo of any skincare product label and we\'ll identify it for you'}
        </p>
      </div>

      {/* Webcam/barcode error message */}
      {webcamError && (
        <div className="bg-cream border border-blush rounded-xl px-4 py-3 max-w-xs text-center">
          <p className="text-xs text-warm-gray">{webcamError}</p>
        </div>
      )}

      {/* Main action button — mobile: file input, desktop: webcam trigger */}
      {mobile ? (
        <label
          className={`
            inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm
            transition-all cursor-pointer
            ${disabled
              ? 'bg-blush text-warm-gray cursor-not-allowed'
              : 'bg-primary text-white hover:bg-dark active:scale-[0.98] shadow-md hover:shadow-lg'
            }
          `}
        >
          <i className={`${mode === 'barcode' ? 'ri-barcode-line' : 'ri-camera-line'} text-lg`} />
          {mode === 'barcode' ? 'Scan Barcode' : 'Take Photo'}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            disabled={disabled}
            className="sr-only"
            aria-label={mode === 'barcode' ? 'Capture barcode image' : 'Capture product photo'}
          />
        </label>
      ) : (
        <button
          onClick={startWebcam}
          disabled={disabled}
          className={`
            inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm
            transition-all
            ${disabled
              ? 'bg-blush text-warm-gray cursor-not-allowed'
              : 'bg-primary text-white hover:bg-dark active:scale-[0.98] shadow-md hover:shadow-lg'
            }
          `}
        >
          <i className={`${mode === 'barcode' ? 'ri-barcode-line' : 'ri-camera-line'} text-lg`} />
          {mode === 'barcode' ? 'Start Scanner' : 'Take Photo'}
        </button>
      )}

      {/* Gallery fallback */}
      <label className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-dark transition-colors cursor-pointer">
        <i className="ri-image-line" />
        Choose from gallery
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
          className="sr-only"
          aria-label="Upload product photo from gallery"
        />
      </label>

      {/* Mode toggle */}
      <div className="flex items-center gap-1 bg-cream border border-blush rounded-lg p-0.5 max-w-[200px]">
        <button
          onClick={() => handleModeSwitch('photo')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            mode === 'photo'
              ? 'bg-primary text-white'
              : 'text-warm-gray hover:text-deep'
          }`}
        >
          <i className="ri-camera-line text-sm" />
          Photo
        </button>
        <button
          onClick={() => handleModeSwitch('barcode')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
            mode === 'barcode'
              ? 'bg-primary text-white'
              : 'text-warm-gray hover:text-deep'
          }`}
        >
          <i className="ri-barcode-line text-sm" />
          Barcode
        </button>
      </div>

      {/* Tips */}
      <div className="bg-cream/50 border border-blush/30 rounded-xl p-4 max-w-xs">
        <p className="text-xs font-medium text-deep mb-2">
          {mode === 'barcode' ? 'Barcode scanning tips' : 'Tips for best results'}
        </p>
        <ul className="space-y-1">
          {(mode === 'barcode'
            ? [
                'Position the barcode clearly in the center',
                'Use good lighting — avoid glare on the barcode',
                'Works with UPC and EAN barcodes',
              ]
            : [
                'Make sure the product label is clearly visible',
                'Use good lighting — avoid heavy shadows',
                'Include the brand name and product name',
              ]
          ).map((tip, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-warm-gray">
              <i className="ri-checkbox-circle-line text-primary/50 mt-0.5 flex-shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
