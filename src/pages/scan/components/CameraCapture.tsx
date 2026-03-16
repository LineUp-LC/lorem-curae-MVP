/**
 * CameraCapture — product photo capture with mobile/desktop support.
 *
 * Mobile: native <input type="file" capture="environment"> for rear camera.
 * Desktop: live webcam via getUserMedia + shutter button.
 * Falls back to file upload if camera is denied or unavailable.
 */

import { useRef, useState, useEffect, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  disabled?: boolean;
}

const getIsMobile = () =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 0 && window.innerWidth < 768);

export default function CameraCapture({ onCapture, disabled }: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [mobile] = useState(getIsMobile);

  // Connect stream to video element when webcam activates
  useEffect(() => {
    if (webcamActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [webcamActive]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setWebcamActive(false);
  }, []);

  const startWebcam = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setWebcamError('Camera not supported in this browser');
      return;
    }
    try {
      let stream: MediaStream;
      try {
        // Try rear camera first (mobile/tablets)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
      } catch {
        // Fall back to any available camera (desktop webcams)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      }
      streamRef.current = stream;
      setWebcamActive(true);
      setWebcamError(null);
    } catch (err) {
      const msg =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access and try again.'
          : `Could not access camera${err instanceof Error ? ` (${err.name})` : ''}. Try uploading a photo instead.`;
      setWebcamError(msg);
    }
  }, []);

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

  // ── Desktop webcam active view ──────────────────────────────────────
  if (webcamActive) {
    return (
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-64 h-64 rounded-2xl overflow-hidden bg-deep/5 shadow-md">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Stop camera */}
          <button
            onClick={stopWebcam}
            className="w-10 h-10 rounded-full bg-cream border border-blush flex items-center justify-center text-warm-gray hover:bg-blush/30 transition-colors"
            aria-label="Stop camera"
          >
            <i className="ri-close-line text-lg" />
          </button>

          {/* Shutter */}
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

        <p className="text-xs text-warm-gray">Position the product label in frame</p>
      </div>
    );
  }

  // ── Default idle view (mobile + desktop) ────────────────────────────
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Camera illustration */}
      <div className="w-32 h-32 bg-cream rounded-full flex items-center justify-center">
        <i className="ri-camera-line text-5xl text-primary/60" />
      </div>

      <div className="text-center space-y-2 max-w-xs">
        <h2 className="text-lg font-serif font-semibold text-deep">Scan a Product</h2>
        <p className="text-sm text-warm-gray leading-relaxed">
          Take a photo of any skincare product label and we'll identify it for you
        </p>
      </div>

      {/* Webcam error message */}
      {webcamError && (
        <div className="bg-cream border border-blush rounded-xl px-4 py-3 max-w-xs text-center">
          <p className="text-xs text-warm-gray">{webcamError}</p>
        </div>
      )}

      {/* Take Photo — mobile: native file input, desktop: webcam trigger */}
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
          <i className="ri-camera-line text-lg" />
          Take Photo
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            disabled={disabled}
            className="sr-only"
            aria-label="Capture product photo"
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
          <i className="ri-camera-line text-lg" />
          Take Photo
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

      {/* Tips */}
      <div className="bg-cream/50 border border-blush/30 rounded-xl p-4 max-w-xs">
        <p className="text-xs font-medium text-deep mb-2">Tips for best results</p>
        <ul className="space-y-1">
          {[
            'Make sure the product label is clearly visible',
            'Use good lighting — avoid heavy shadows',
            'Include the brand name and product name',
          ].map((tip, i) => (
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
