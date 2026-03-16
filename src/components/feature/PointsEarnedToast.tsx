import { useEffect, useState } from 'react';

interface PointsEarnedToastProps {
  points: number;
  description: string;
  badgeName?: string;
  onClose: () => void;
}

const PointsEarnedToast = ({ points, description, badgeName, onClose }: PointsEarnedToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 50);
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onClose]);

  return (
    <div
      className={`fixed top-20 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white rounded-xl shadow-xl border border-blush/50 p-4 min-w-[280px] max-w-[340px]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-dark rounded-full flex items-center justify-center flex-shrink-0">
            <i className={`${badgeName ? 'ri-award-line' : 'ri-coin-line'} text-white text-lg`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <h4 className="font-serif font-semibold text-deep text-sm">
                {badgeName ? `Badge Unlocked` : `+${points} Curae Points`}
              </h4>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="text-warm-gray/40 hover:text-primary transition-colors cursor-pointer ml-2"
              >
                <i className="ri-close-line text-base"></i>
              </button>
            </div>
            <p className="text-xs text-warm-gray">{badgeName || description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsEarnedToast;
