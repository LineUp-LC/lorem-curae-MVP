/**
 * CameraCapture — file input for product photo capture.
 *
 * Uses native <input type="file" capture="environment"> for universal
 * mobile camera access with zero dependencies.
 * Desktop: opens file picker. Mobile: opens rear camera.
 */

import { useRef } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  disabled?: boolean;
}

export default function CameraCapture({ onCapture, disabled }: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
      // Reset input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Camera illustration */}
      <div className="w-32 h-32 bg-cream rounded-full flex items-center justify-center">
        <i className="ri-camera-line text-5xl text-primary/60" />
      </div>

      <div className="text-center space-y-2 max-w-xs">
        <h2 className="text-lg font-serif font-semibold text-deep">
          Scan a Product
        </h2>
        <p className="text-sm text-warm-gray leading-relaxed">
          Take a photo of any skincare product label and we'll identify it for you
        </p>
      </div>

      {/* Capture button */}
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
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          aria-label="Capture product photo"
        />
      </label>

      {/* Or upload from gallery */}
      <label className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-dark transition-colors cursor-pointer">
        <i className="ri-image-line" />
        Choose from gallery
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
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
