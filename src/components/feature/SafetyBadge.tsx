/**
 * SafetyBadge Component
 *
 * Displays a safety warning label on product cards based on the user's
 * skin profile. Products are never hidden — only labelled.
 */

import { useState } from 'react';
import { SafetyResult } from '../../lib/utils/productSafety';

interface SafetyBadgeProps {
  result: SafetyResult;
  compact?: boolean;
}

export default function SafetyBadge({ result, compact = false }: SafetyBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (result.level === 'safe' || result.warnings.length === 0) return null;

  const isNotRecommended = result.level === 'not-recommended';
  const label = isNotRecommended
    ? 'Not Recommended for Your Skin Profile'
    : 'Use With Caution';

  if (compact) {
    return (
      <div className="relative">
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowTooltip(!showTooltip);
          }}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
            isNotRecommended
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          <i className={isNotRecommended ? 'ri-alert-fill' : 'ri-error-warning-line'}></i>
          <span className="hidden sm:inline">{isNotRecommended ? 'Not Recommended' : 'Caution'}</span>
        </button>
        {showTooltip && (
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-blush p-3 z-30">
            <p className={`text-xs font-semibold mb-1.5 ${isNotRecommended ? 'text-red-600' : 'text-amber-700'}`}>
              {label}
            </p>
            <ul className="space-y-1">
              {result.warnings.map((w, i) => (
                <li key={i} className="text-xs text-warm-gray leading-relaxed">
                  {w.detail}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs ${
        isNotRecommended
          ? 'bg-red-50 border border-red-200'
          : 'bg-amber-50 border border-amber-200'
      }`}
    >
      <i className={`mt-0.5 ${
        isNotRecommended ? 'ri-alert-fill text-red-500' : 'ri-error-warning-line text-amber-600'
      }`}></i>
      <div>
        <p className={`font-medium ${isNotRecommended ? 'text-red-600' : 'text-amber-700'}`}>
          {label}
        </p>
        {result.warnings.length <= 2 ? (
          result.warnings.map((w, i) => (
            <p key={i} className="text-warm-gray mt-0.5">{w.detail}</p>
          ))
        ) : (
          <p className="text-warm-gray mt-0.5">
            {result.warnings.length} potential concerns detected for your profile.
          </p>
        )}
      </div>
    </div>
  );
}
