import { useEffect, useState } from 'react';

/**
 * Toast Component
 *
 * Premium, lightweight toast notification following Lorem Curae design system.
 * Auto-dismisses after ~2.5 seconds.
 */

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast = ({ message, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in after mount
    const fadeInTimer = setTimeout(() => setIsVisible(true), 50);

    // Auto-dismiss after 2.5 seconds
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 2500);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(dismissTimer);
    };
  }, [onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        fixed top-4 right-4 z-50
        bg-deep text-cream
        rounded-md shadow-lg
        px-4 py-2
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
      style={{ fontFamily: 'var(--lc-font-sans, "DM Sans", sans-serif)' }}
    >
      <div className="flex items-center space-x-2">
        <i className="ri-heart-fill text-primary"></i>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
