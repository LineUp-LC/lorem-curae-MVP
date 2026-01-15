import { useEffect, useRef } from 'react';
import ConflictDetection from './ConflictDetection';

interface ConflictDetectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  conflictCount: number;
}

export default function ConflictDetectionPopup({
  isOpen,
  onClose,
  conflictCount,
}: ConflictDetectionPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus trap and ESC key handling
  useEffect(() => {
    if (!isOpen) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the popup
    const firstFocusable = popupRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && popupRef.current) {
        const focusableElements = popupRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      // Restore focus to the previously focused element
      previousActiveElement.current?.focus();
    };
  }, [isOpen, onClose]);

  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-deep/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflict-popup-title"
    >
      <div
        ref={popupRef}
        className="bg-cream rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-enter-scale"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blush bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <i className="ri-shield-check-line text-primary text-xl"></i>
            </div>
            <div>
              <h2 id="conflict-popup-title" className="font-serif text-xl font-bold text-deep">
                Ingredient Conflicts
              </h2>
              <p className="text-sm text-warm-gray">
                {conflictCount === 0
                  ? 'No conflicts detected'
                  : `${conflictCount} potential ${conflictCount === 1 ? 'conflict' : 'conflicts'} found`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-cream hover:bg-blush flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close conflict detection popup"
          >
            <i className="ri-close-line text-xl text-warm-gray"></i>
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-cream">
          <ConflictDetection />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blush bg-white">
          <div className="flex items-center justify-between">
            <p className="text-xs text-warm-gray flex items-center gap-1">
              <i className="ri-information-line"></i>
              Powered by dermatological research
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors text-sm font-medium cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
