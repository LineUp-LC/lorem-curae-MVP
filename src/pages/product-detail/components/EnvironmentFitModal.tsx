/**
 * EnvironmentFitModal
 *
 * Structured 4-section modal showing how a product fits the user's
 * current environment. Triggered by the "Learn more" link in the
 * Environment Fit section on the product detail page.
 */

import { useState } from 'react';
import type { SeasonalModalContent } from '../../../lib/utils/seasonalModalContent';
import type { ScoredReviewEntry } from '../../../lib/utils/environmentFit';
import { getTierBadgeInfo } from '../../../lib/utils/reviewSimilarity';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EnvironmentFitModalProps {
  content: SeasonalModalContent;
  reviews: ScoredReviewEntry[];
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ReviewCard({ entry }: { entry: ScoredReviewEntry }) {
  const badge = getTierBadgeInfo(entry.matchTier, entry.score);

  return (
    <div className="bg-white border border-blush/60 rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-2 mb-1.5">
        <img
          src={entry.review.userAvatar}
          alt={entry.review.userName}
          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/28?text=U'; }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-deep truncate">
              {entry.review.userName}
            </span>
            {entry.review.verified && (
              <i className="ri-shield-check-fill text-[10px] text-warm-gray-500" title="Verified buyer"></i>
            )}
            {badge && (
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 ${badge.color} text-[9px] font-medium rounded-full`}>
                <i className={`${badge.icon} text-[9px]`}></i>
                {badge.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => (
                <i
                  key={i}
                  className={`text-[10px] ${
                    i < entry.review.rating
                      ? 'ri-star-fill text-amber-500'
                      : 'ri-star-line text-amber-500'
                  }`}
                ></i>
              ))}
            </div>
            <span className="text-[10px] text-warm-gray">
              {entry.review.skinType} skin · {entry.review.usageDurationWeeks}w use
            </span>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-warm-gray leading-relaxed line-clamp-2">
        {entry.review.content}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function EnvironmentFitModal({
  content,
  reviews,
  onClose,
}: EnvironmentFitModalProps) {
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  const { header, productFit, keywordInsights, categoryPhrase, texturePhrase, disclaimer, personalized } = content;

  // Find insight text for selected keyword
  const selectedInsight = selectedKeyword
    ? keywordInsights.find(ki => ki.label === selectedKeyword)
    : null;

  // Filter reviews by selected keyword
  const filteredReviews = selectedKeyword
    ? reviews.filter(r => r.review.content.toLowerCase().includes(selectedKeyword.toLowerCase()))
    : reviews;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Section 1: Seasonal & Environmental Header ── */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full">
                <i className={`${header.icon} text-xl text-primary`}></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-deep">
                  {header.seasonLabel && header.locationLabel
                    ? `${header.seasonLabel} in ${header.locationLabel}`
                    : header.seasonLabel
                      ? header.seasonLabel
                      : header.locationLabel
                        ? header.locationLabel
                        : 'Your Environment'}
                </h3>
                <p className="text-xs text-warm-gray">{header.sourceNote}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center text-warm-gray hover:text-deep hover:bg-cream rounded-full transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          {/* Environmental factor badges */}
          {header.environmentalFactors.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {header.environmentalFactors.map((factor) => (
                <div
                  key={factor.label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cream/60 border border-blush/30 rounded-full"
                >
                  <i className={`${factor.icon} text-xs text-primary`}></i>
                  <span className="text-[11px] text-warm-gray">{factor.label}:</span>
                  <span className="text-[11px] font-medium text-deep">{factor.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Skin impact explanation */}
          {header.skinImpact && (
            <p className="text-xs text-warm-gray leading-relaxed">
              {header.skinImpact}
            </p>
          )}
        </div>

        <div className="border-t border-blush/30" />

        {/* ── Section 2: Why This Product Fits ── */}
        <div className="px-6 py-4">
          <h4 className="text-xs font-semibold text-deep uppercase tracking-wide mb-3">
            Why this product fits
          </h4>
          {productFit.narrative ? (() => {
            const bullets = productFit.narrative
              .split(/(?<=\.)\s+/)
              .map(s => s.trim())
              .filter(s => s.length > 0);
            return (
              <ul className="space-y-2">
                {bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <i className={`ri-checkbox-circle-fill text-xs mt-0.5 flex-shrink-0 ${
                      personalized ? 'text-primary' : 'text-warm-gray/40'
                    }`} />
                    <span className={`text-xs leading-relaxed ${
                      personalized ? 'text-deep' : 'text-warm-gray'
                    }`}>
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            );
          })() : (
            <p className="text-xs text-warm-gray italic">
              No specific product-environment interactions identified for current conditions.
            </p>
          )}
        </div>

        {/* ── Section 3: Review Insights (Filterable) ── */}
        {reviews.length > 0 && (
          <>
            <div className="border-t border-blush/30" />
            <div className="px-6 py-4">
              <h4 className="text-xs font-semibold text-deep uppercase tracking-wide mb-2">
                Review insights
              </h4>

              {/* Keyword filter chips */}
              {keywordInsights.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <button
                    onClick={() => setSelectedKeyword(null)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-full border transition-colors ${
                      selectedKeyword === null
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'bg-cream text-warm-gray border-blush/30 hover:border-blush'
                    }`}
                  >
                    All ({reviews.length})
                  </button>
                  {keywordInsights.map((ki) => (
                    <button
                      key={ki.label}
                      onClick={() => setSelectedKeyword(ki.label === selectedKeyword ? null : ki.label)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-full border transition-colors capitalize ${
                        selectedKeyword === ki.label
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-cream text-warm-gray border-blush/30 hover:border-blush'
                      }`}
                    >
                      {ki.label} ({ki.count})
                    </button>
                  ))}
                </div>
              )}

              {/* Insight text for selected keyword */}
              {selectedInsight && (
                <p className="text-xs text-warm-gray leading-relaxed mb-3 bg-cream/40 rounded-lg px-3 py-2">
                  {selectedInsight.insight}
                </p>
              )}

              {/* Review cards */}
              <div className="space-y-2">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((entry) => (
                    <ReviewCard key={entry.review.id} entry={entry} />
                  ))
                ) : (
                  <p className="text-xs text-warm-gray italic py-2">
                    No reviews match this filter.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Section 4: Additional Insights ── */}
        {(categoryPhrase || texturePhrase || disclaimer) && (
          <>
            <div className="border-t border-blush/30" />
            <div className="px-6 py-4">
              {(categoryPhrase || texturePhrase) && (
                <>
                  <h4 className="text-xs font-semibold text-deep uppercase tracking-wide mb-2">
                    Additional insights
                  </h4>
                  <div className="space-y-2 mb-3">
                    {categoryPhrase && (
                      <p className="text-xs text-warm-gray leading-relaxed">
                        {categoryPhrase.charAt(0).toUpperCase() + categoryPhrase.slice(1)}.
                      </p>
                    )}
                    {texturePhrase && (
                      <p className="text-xs text-warm-gray leading-relaxed">
                        {texturePhrase.charAt(0).toUpperCase() + texturePhrase.slice(1)}.
                      </p>
                    )}
                  </div>
                </>
              )}
              <p className="text-[10px] text-warm-gray/60 italic">
                {disclaimer}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
