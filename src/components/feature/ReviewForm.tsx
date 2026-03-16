/**
 * ReviewForm — Create or edit a product review.
 *
 * Auto-populates skin_type and skin_concerns from the user's profile.
 * Supports star rating, title, content, would-recommend, usage duration,
 * pros/cons chips, and loading/error states.
 */

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getEffectiveSkinType, getEffectiveConcerns } from '@/lib/utils/sessionState';
import { submitReview } from '@/lib/data/reviews';
import { onAction } from '@/lib/utils/gamificationTriggers';
import type { ProductReview, ProductReviewInput } from '@/types/review';
import { USAGE_DURATION_OPTIONS } from '@/types/review';

interface ReviewFormProps {
  productId: number;
  existingReview?: ProductReview;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export default function ReviewForm({
  productId,
  existingReview,
  onSubmitSuccess,
  onCancel,
}: ReviewFormProps) {
  const { user } = useAuth();
  const isEditing = !!existingReview;

  // Form state — pre-fill from existingReview if editing
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title ?? '');
  const [content, setContent] = useState(existingReview?.content ?? '');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(
    existingReview?.would_recommend ?? null,
  );
  const [usageDurationWeeks, setUsageDurationWeeks] = useState<number | null>(
    existingReview?.usage_duration_weeks ?? null,
  );
  const [pros, setPros] = useState<string[]>(existingReview?.pros ?? []);
  const [cons, setCons] = useState<string[]>(existingReview?.cons ?? []);
  const [prosInput, setProsInput] = useState('');
  const [consInput, setConsInput] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  const addChip = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    inputSetter: React.Dispatch<React.SetStateAction<string>>,
    current: string[],
  ) => {
    const trimmed = value.trim();
    if (trimmed && !current.includes(trimmed) && current.length < 5) {
      setter([...current, trimmed]);
    }
    inputSetter('');
  };

  const removeChip = (
    idx: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    current: string[],
  ) => {
    setter(current.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validation
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (content.trim().length < 20) {
      setError('Review must be at least 20 characters.');
      contentRef.current?.focus();
      return;
    }

    setError(null);
    setSubmitting(true);

    const skinType = getEffectiveSkinType() || null;
    const skinConcerns = getEffectiveConcerns();

    const reviewInput: ProductReviewInput = {
      user_id: user.id,
      product_id: productId,
      rating,
      title: title.trim() || null,
      content: content.trim(),
      skin_type: skinType,
      skin_concerns: skinConcerns,
      pros,
      cons,
      would_recommend: wouldRecommend,
      usage_duration_weeks: usageDurationWeeks,
    };

    const result = await submitReview(reviewInput);

    if (!result) {
      setError('Failed to submit review. Please try again.');
      setSubmitting(false);
      return;
    }

    // Fire gamification trigger (non-blocking)
    if (!isEditing) {
      onAction(user.id, 'PRODUCT_REVIEW', {}).catch(() => {});
    }

    setSubmitting(false);
    onSubmitSuccess();
  };

  return (
    <div className="bg-cream/30 border border-blush/40 rounded-xl p-5">
      <h3 className="text-base font-serif font-semibold text-deep mb-4">
        {isEditing ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      {/* Star Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-deep mb-2">
          Rating <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 cursor-pointer transition-transform hover:scale-110"
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              <i
                className={`text-2xl ${
                  star <= (hoverRating || rating)
                    ? 'ri-star-fill text-amber-500'
                    : 'ri-star-line text-amber-300'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-xs text-warm-gray ml-2">
              {rating}/5
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-deep mb-1">
          Title <span className="text-warm-gray/50 text-xs">(optional)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 100))}
          placeholder="Sum up your experience"
          className="w-full px-3 py-2.5 text-sm text-deep bg-white border border-blush/50 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-warm-gray/40"
        />
        <p className="text-[10px] text-warm-gray/50 mt-0.5 text-right">
          {title.length}/100
        </p>
      </div>

      {/* Content */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-deep mb-1">
          Your review <span className="text-red-400">*</span>
        </label>
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 2000))}
          placeholder="Share your honest experience — what worked, what didn't, and how it felt on your skin."
          rows={4}
          className="w-full px-3 py-2.5 text-sm text-deep bg-white border border-blush/50 rounded-lg focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-warm-gray/40"
        />
        <p
          className={`text-[10px] mt-0.5 text-right ${
            content.trim().length < 20 && content.trim().length > 0
              ? 'text-red-400'
              : 'text-warm-gray/50'
          }`}
        >
          {content.length}/2000{' '}
          {content.trim().length > 0 && content.trim().length < 20 && '(min 20)'}
        </p>
      </div>

      {/* Would Recommend */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-deep mb-2">
          Would you recommend this product?{' '}
          <span className="text-warm-gray/50 text-xs">(optional)</span>
        </label>
        <div className="flex gap-2">
          {[
            { value: true, label: 'Yes', icon: 'ri-thumb-up-line' },
            { value: false, label: 'No', icon: 'ri-thumb-down-line' },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() =>
                setWouldRecommend(wouldRecommend === opt.value ? null : opt.value)
              }
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                wouldRecommend === opt.value
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-white border-blush/50 text-warm-gray hover:border-blush'
              }`}
            >
              <i className={opt.icon} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Usage Duration */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-deep mb-1">
          How long have you used this product?{' '}
          <span className="text-warm-gray/50 text-xs">(optional)</span>
        </label>
        <select
          value={usageDurationWeeks ?? ''}
          onChange={(e) =>
            setUsageDurationWeeks(
              e.target.value ? Number(e.target.value) : null,
            )
          }
          className="w-full px-3 py-2.5 text-sm text-deep bg-white border border-blush/50 rounded-lg focus:outline-none focus:border-primary transition-colors"
        >
          <option value="">Select duration</option>
          {USAGE_DURATION_OPTIONS.map((opt) => (
            <option key={opt.weeks} value={opt.weeks}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Pros */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-deep mb-1">
          Pros{' '}
          <span className="text-warm-gray/50 text-xs">(optional, up to 5)</span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {pros.map((pro, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-sage/10 text-sage border border-sage/20 rounded-full"
            >
              {pro}
              <button
                type="button"
                onClick={() => removeChip(i, setPros, pros)}
                className="cursor-pointer hover:text-deep"
                aria-label={`Remove ${pro}`}
              >
                <i className="ri-close-line text-[10px]" />
              </button>
            </span>
          ))}
        </div>
        {pros.length < 5 && (
          <input
            type="text"
            value={prosInput}
            onChange={(e) => setProsInput(e.target.value)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ',') && prosInput.trim()) {
                e.preventDefault();
                addChip(prosInput, setPros, setProsInput, pros);
              }
            }}
            onBlur={() => {
              if (prosInput.trim()) addChip(prosInput, setPros, setProsInput, pros);
            }}
            placeholder="Type and press Enter"
            className="w-full px-3 py-2 text-sm text-deep bg-white border border-blush/50 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-warm-gray/40"
          />
        )}
      </div>

      {/* Cons */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-deep mb-1">
          Cons{' '}
          <span className="text-warm-gray/50 text-xs">(optional, up to 5)</span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {cons.map((con, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full"
            >
              {con}
              <button
                type="button"
                onClick={() => removeChip(i, setCons, cons)}
                className="cursor-pointer hover:text-deep"
                aria-label={`Remove ${con}`}
              >
                <i className="ri-close-line text-[10px]" />
              </button>
            </span>
          ))}
        </div>
        {cons.length < 5 && (
          <input
            type="text"
            value={consInput}
            onChange={(e) => setConsInput(e.target.value)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ',') && consInput.trim()) {
                e.preventDefault();
                addChip(consInput, setCons, setConsInput, cons);
              }
            }}
            onBlur={() => {
              if (consInput.trim())
                addChip(consInput, setCons, setConsInput, cons);
            }}
            placeholder="Type and press Enter"
            className="w-full px-3 py-2 text-sm text-deep bg-white border border-blush/50 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-warm-gray/40"
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <i className="ri-error-warning-line" />
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-3 border-t border-blush/30">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            submitting
              ? 'bg-primary/50 text-white cursor-not-allowed'
              : 'bg-primary hover:bg-dark text-white'
          }`}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <i className="ri-loader-4-line animate-spin" />
              Submitting...
            </span>
          ) : isEditing ? (
            'Update Review'
          ) : (
            'Submit Review'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2.5 text-sm text-warm-gray hover:text-deep transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
