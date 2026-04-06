/**
 * ScanProcessing — loading state while Claude Vision analyzes the product photo.
 */

import PersonalizingLoader from '../../../components/feature/PersonalizingLoader';

interface ScanProcessingProps {
  previewUrl: string;
  progress?: number;
  onComplete?: () => void;
}

export default function ScanProcessing({ previewUrl, progress, onComplete }: ScanProcessingProps) {
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
          <div className="absolute inset-0 bg-deep/20" />
        </div>
      ) : null}

      <div className="w-full max-w-xs">
        <PersonalizingLoader
          steps={['Identifying product...', 'Reading label...', 'Almost there...']}
          progress={progress}
          onComplete={onComplete}
        />
      </div>
    </div>
  );
}
