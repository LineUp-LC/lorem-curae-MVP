import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CompatibilityResult } from '../../../lib/ai/ingredientIntelligence';

export interface LiveConflict {
  pair: [string, string];
  result: CompatibilityResult;
}

interface Conflict {
  id: string;
  severity: 'high' | 'medium' | 'low';
  products: string[];
  issue: string;
  explanation: string;
  recommendation: string;
}

function mapLiveConflicts(live: LiveConflict[]): Conflict[] {
  return live.map((c, i) => ({
    id: `live-${i}`,
    severity: c.result.level === 'avoid' ? 'high' : c.result.level === 'caution' ? 'medium' : 'low',
    products: [c.pair[0], c.pair[1]],
    issue: `${c.pair[0]} + ${c.pair[1]} conflict`,
    explanation: c.result.reason,
    recommendation: c.result.resolution || 'Consider using these products at different times of day.',
  }));
}

interface ConflictDetectionProps {
  liveConflicts?: LiveConflict[];
}

export default function ConflictDetection({ liveConflicts = [] }: ConflictDetectionProps) {
  const navigate = useNavigate();
  const [expandedConflict, setExpandedConflict] = useState<string | null>(null);
  const detectedConflicts = mapLiveConflicts(liveConflicts);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-primary-100 text-primary-700 border-primary-200';
      case 'medium':
        return 'bg-blush-100 text-warm-gray-700 border-blush-300';
      case 'low':
        return 'bg-sage-100 text-sage-700 border-sage-200';
      default:
        return 'bg-cream-200 text-warm-gray border-blush';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'ri-error-warning-line';
      case 'medium':
        return 'ri-alert-line';
      case 'low':
        return 'ri-information-line';
      default:
        return 'ri-information-line';
    }
  };

  if (detectedConflicts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-checkbox-circle-line text-sage text-4xl"></i>
          </div>
          <h3 className="font-serif text-2xl font-bold text-deep mb-2">
            No Conflicts Detected
          </h3>
          <p className="text-warm-gray">
            Your routine looks great! All products are compatible with each other.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <i className="ri-shield-check-line text-primary text-xl"></i>
          </div>
          <h2 className="font-serif text-3xl font-bold text-deep">
            Conflict Detection
          </h2>
        </div>
        <p className="text-warm-gray text-sm ml-13">
          We've identified {detectedConflicts.length} potential {detectedConflicts.length === 1 ? 'conflict' : 'conflicts'} in your routine
        </p>

        {/* Severity Legend */}
        <div className="mt-4 p-4 bg-cream/50 border border-blush rounded-xl">
          <p className="text-xs font-medium text-deep mb-3 uppercase tracking-wide">Understanding Severity Levels</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-2">
              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0">
                HIGH
              </span>
              <p className="text-xs text-warm-gray leading-relaxed">
                Stop using together — may cause irritation
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="px-2 py-0.5 bg-blush-100 text-warm-gray-700 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0">
                MEDIUM
              </span>
              <p className="text-xs text-warm-gray leading-relaxed">
                Adjust timing or order — effectiveness may be reduced
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="px-2 py-0.5 bg-sage-100 text-sage-700 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0">
                LOW
              </span>
              <p className="text-xs text-warm-gray leading-relaxed">
                Monitor for reactions — generally safe
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conflicts List */}
      <div className="space-y-4">
        {detectedConflicts.map((conflict) => (
          <div
            key={conflict.id}
            className={`border-2 rounded-xl overflow-hidden transition-all ${
              expandedConflict === conflict.id ? 'border-deep' : 'border-blush'
            }`}
          >
            {/* Conflict Header */}
            <button
              onClick={() => setExpandedConflict(expandedConflict === conflict.id ? null : conflict.id)}
              className="w-full p-6 cursor-pointer hover:bg-cream transition-colors text-left"
              aria-expanded={expandedConflict === conflict.id}
              aria-controls={`conflict-details-${conflict.id}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-2 whitespace-nowrap cursor-help ${getSeverityColor(conflict.severity)}`}
                  title={conflict.severity === 'high'
                    ? 'Stop using these products together immediately'
                    : conflict.severity === 'medium'
                    ? 'Consider adjusting your routine timing'
                    : 'Monitor for reactions, generally safe'}
                >
                  <i className={getSeverityIcon(conflict.severity)}></i>
                  {conflict.severity.toUpperCase()} PRIORITY
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-bold text-deep mb-2">
                    {conflict.issue}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {conflict.products.map((product, idx) => (
                      <span key={idx} className="px-3 py-1 bg-cream-200 text-deep-600 text-sm rounded-full font-medium">
                        {product}
                      </span>
                    ))}
                  </div>
                  <p className="text-warm-gray text-sm">
                    {conflict.explanation.substring(0, 150)}...
                  </p>
                </div>
                <span className="text-deep hover:text-deep-900 transition-colors" aria-hidden="true">
                  <i className={`text-2xl transition-transform duration-200 ${expandedConflict === conflict.id ? 'ri-arrow-up-s-line rotate-0' : 'ri-arrow-down-s-line'}`}></i>
                </span>
              </div>
            </button>

            {/* Expanded Details */}
            {expandedConflict === conflict.id && (
              <div 
                id={`conflict-details-${conflict.id}`}
                className="border-t border-blush bg-cream p-6 motion-safe:animate-slide-down"
              >
                {/* Full Explanation */}
                <div className="mb-6">
                  <h4 className="font-medium text-deep mb-2 flex items-center gap-2">
                    <i className="ri-information-line"></i>
                    Why This Matters
                  </h4>
                  <p className="text-warm-gray-700 text-sm leading-relaxed">
                    {conflict.explanation}
                  </p>
                </div>

                {/* Recommendation */}
                <div className="mb-6 p-4 bg-white rounded-lg border border-deep/20">
                  <h4 className="font-medium text-deep mb-2 flex items-center gap-2">
                    <i className="ri-lightbulb-line"></i>
                    Our Recommendation
                  </h4>
                  <p className="text-warm-gray-700 text-sm leading-relaxed">
                    {conflict.recommendation}
                  </p>
                </div>

                {/* Resolution suggestion */}
                {conflict.recommendation && (
                  <div className="p-4 bg-sage/10 rounded-lg border border-sage/20">
                    <h4 className="font-medium text-deep mb-2 flex items-center gap-2">
                      <i className="ri-swap-line text-sage"></i>
                      How to Resolve
                    </h4>
                    <p className="text-warm-gray-700 text-sm leading-relaxed">
                      {conflict.recommendation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Educational Footer */}
      <div className="mt-8 p-6 bg-gradient-to-r from-[#2C5F4F]/5 to-[#E8956C]/5 rounded-xl border border-deep/10">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <i className="ri-book-open-line text-deep text-xl"></i>
          </div>
          <div>
            <h4 className="font-medium text-deep mb-2">Learn More About Ingredient Interactions</h4>
            <p className="text-sm text-warm-gray mb-3">
              Understanding how ingredients work together helps you build a more effective routine. Our conflict detection uses dermatological research to keep your skin safe and healthy.
            </p>
            <button
              onClick={() => navigate('/ingredients')}
              className="text-sm text-deep hover:underline font-medium cursor-pointer whitespace-nowrap"
            >
              Explore Ingredient Library →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}