import { useEffect, useState } from 'react';

/**
 * PointsEarnedNotification Component
 * 
 * Color Scheme (Lorem Curae):
 * - Primary: #C4704D (coral)
 * - Light: #E8A888 (light coral)
 * - Dark: #8B4D35 (dark coral)
 * - Cream: #FDF8F5 (background)
 * - Deep: #2D2A26 (text)
 * - Sage: #7A8B7A (accents)
 * - Warm Gray: #6B635A (body text)
 */

interface PointsEarnedNotificationProps {
  points: number;
  description: string;
  onClose: () => void;
}

const PointsEarnedNotification = ({ points, description, onClose }: PointsEarnedNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in
    setTimeout(() => setIsVisible(true), 100);

    // Auto close after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-24 right-6 z-50 transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ fontFamily: 'var(--lc-font-sans, "DM Sans", sans-serif)' }}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-[#E8D4CC]/50 p-4 min-w-[300px]">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#C4704D] to-[#8B4D35] rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-coin-line text-white text-xl"></i>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-[#2D2A26]" style={{ fontFamily: 'var(--lc-font-serif, "Cormorant Garamond", serif)' }}>+{points} Curae Points</h4>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="text-[#6B635A]/50 hover:text-[#C4704D] cursor-pointer transition-colors"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <p className="text-sm text-[#6B635A]">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsEarnedNotification;