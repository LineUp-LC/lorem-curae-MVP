/**
 * ScanProcessing — loading state while Claude Vision analyzes the product photo.
 */

interface ScanProcessingProps {
  previewUrl: string;
}

export default function ScanProcessing({ previewUrl }: ScanProcessingProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Photo preview with scanning overlay (hidden for barcode scans) */}
      {previewUrl ? (
        <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-md">
          <img
            src={previewUrl}
            alt="Product being scanned"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-deep/20 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      ) : (
        <div className="w-20 h-20 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-deep">Analyzing product...</p>
        <p className="text-xs text-warm-gray">
          Reading label and identifying ingredients
        </p>
      </div>

      {/* Pulse skeleton */}
      <div className="w-full max-w-xs space-y-2 animate-pulse">
        <div className="h-3 bg-blush/20 rounded w-full" />
        <div className="h-3 bg-blush/20 rounded w-4/5" />
        <div className="h-3 bg-blush/20 rounded w-3/5" />
      </div>
    </div>
  );
}
