import { useMemo } from 'react';
import { getEffectiveSkinType, getEffectiveConcerns } from '../../../lib/utils/sessionState';

interface CustomCategory {
  id: string;
  name: string;
  description: string;
  whyGoodFit: string;
  icon: string;
  keywords: string[];
  skinTypes: string[];
  concerns: string[];
}

interface CustomStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: CustomCategory) => void;
}

const customCategories: CustomCategory[] = [
  {
    id: 'exfoliant',
    name: 'Exfoliant',
    description: 'Helps remove dead skin cells and improve texture through chemical or physical exfoliation.',
    whyGoodFit: 'Good fit if you want smoother, brighter skin or struggle with dullness and uneven texture.',
    icon: 'ri-sparkling-line',
    keywords: ['texture', 'dullness', 'brightness', 'smoothness', 'dead skin'],
    skinTypes: ['oily', 'combination', 'normal'],
    concerns: ['acne', 'texture', 'dullness', 'uneven skin tone', 'pores', 'blackheads', 'rough skin'],
  },
  {
    id: 'mask',
    name: 'Face Mask',
    description: 'Intensive treatment that delivers concentrated ingredients for deep nourishment or detox.',
    whyGoodFit: 'Good fit if you enjoy weekly pampering sessions or need targeted treatment boosts.',
    icon: 'ri-emotion-happy-line',
    keywords: ['nourishment', 'detox', 'treatment', 'intensive', 'pampering'],
    skinTypes: ['all', 'dry', 'oily', 'combination', 'normal', 'sensitive'],
    concerns: ['hydration', 'dryness', 'oiliness', 'pores', 'dullness', 'relaxation'],
  },
  {
    id: 'spot-treatment',
    name: 'Spot Treatment',
    description: 'Targeted formula designed to address specific blemishes, dark spots, or problem areas.',
    whyGoodFit: 'Good fit if you deal with occasional breakouts or hyperpigmentation.',
    icon: 'ri-focus-3-line',
    keywords: ['blemishes', 'dark spots', 'breakouts', 'hyperpigmentation', 'acne'],
    skinTypes: ['oily', 'combination', 'normal', 'acne-prone'],
    concerns: ['acne', 'breakouts', 'blemishes', 'dark spots', 'hyperpigmentation', 'scarring'],
  },
  {
    id: 'essence',
    name: 'Essence',
    description: 'Lightweight, hydrating liquid that preps skin for better absorption of following products.',
    whyGoodFit: 'Good fit if you want an extra hydration layer or follow a K-beauty routine.',
    icon: 'ri-drop-line',
    keywords: ['hydration', 'absorption', 'lightweight', 'prep', 'K-beauty'],
    skinTypes: ['dry', 'normal', 'combination', 'dehydrated'],
    concerns: ['hydration', 'dryness', 'dehydration', 'absorption', 'plumpness'],
  },
  {
    id: 'face-mist',
    name: 'Face Mist',
    description: 'Refreshing spray that hydrates, sets makeup, or provides a mid-day moisture boost.',
    whyGoodFit: 'Good fit if your skin feels dry throughout the day or you want a quick refresh.',
    icon: 'ri-contrast-drop-2-line',
    keywords: ['refresh', 'moisture', 'hydration', 'dry skin', 'makeup setting'],
    skinTypes: ['dry', 'normal', 'combination', 'dehydrated'],
    concerns: ['dryness', 'dehydration', 'dullness', 'tiredness', 'refresh'],
  },
  {
    id: 'facial-oil',
    name: 'Facial Oil',
    description: 'Nourishing oil blend that locks in moisture and provides essential fatty acids.',
    whyGoodFit: 'Good fit if you have dry or mature skin that craves extra nourishment.',
    icon: 'ri-flask-line',
    keywords: ['nourishing', 'moisture', 'dry skin', 'mature skin', 'fatty acids'],
    skinTypes: ['dry', 'mature', 'normal'],
    concerns: ['dryness', 'aging', 'fine lines', 'wrinkles', 'nourishment', 'barrier repair'],
  },
  {
    id: 'lip-treatment',
    name: 'Lip Treatment',
    description: 'Specialized care for lips to hydrate, repair, and protect the delicate lip area.',
    whyGoodFit: 'Good fit if you experience dry, chapped lips or want to maintain soft, healthy lips.',
    icon: 'ri-heart-line',
    keywords: ['lips', 'hydrate', 'repair', 'chapped', 'dry lips'],
    skinTypes: ['all', 'dry', 'normal', 'sensitive'],
    concerns: ['dryness', 'chapped lips', 'lip care'],
  },
  {
    id: 'neck-cream',
    name: 'Neck Cream',
    description: 'Targeted formula for the neck and decolletage area, addressing firmness and texture.',
    whyGoodFit: 'Good fit if you want to extend your skincare routine below the jawline.',
    icon: 'ri-user-line',
    keywords: ['neck', 'firmness', 'texture', 'decolletage', 'aging'],
    skinTypes: ['mature', 'normal', 'dry'],
    concerns: ['aging', 'fine lines', 'wrinkles', 'sagging', 'firmness'],
  },
  {
    id: 'sheet-mask',
    name: 'Sheet Mask',
    description: 'Single-use fabric mask soaked in serum for an intensive 15-20 minute treatment.',
    whyGoodFit: 'Good fit for pre-event prep or when your skin needs an instant hydration boost.',
    icon: 'ri-ghost-smile-line',
    keywords: ['hydration', 'intensive', 'treatment', 'instant', 'boost'],
    skinTypes: ['all', 'dry', 'normal', 'dehydrated'],
    concerns: ['hydration', 'dryness', 'dullness', 'special occasion', 'glow'],
  },
  {
    id: 'ampoule',
    name: 'Ampoule',
    description: 'Highly concentrated serum with potent active ingredients for intensive treatment.',
    whyGoodFit: 'Good fit if you want to address specific concerns with powerful, targeted formulas.',
    icon: 'ri-test-tube-line',
    keywords: ['concentrated', 'potent', 'intensive', 'targeted', 'active ingredients'],
    skinTypes: ['all', 'normal', 'combination'],
    concerns: ['aging', 'hyperpigmentation', 'dullness', 'fine lines', 'specific concerns'],
  },
];

// Helper to highlight matching keywords in text
function highlightKeywords(text: string, keywords: string[]): React.ReactNode {
  if (keywords.length === 0) return text;

  // Create a regex pattern for all keywords (case-insensitive)
  const pattern = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    const isMatch = keywords.some(k => k.toLowerCase() === part.toLowerCase());
    if (isMatch) {
      return (
        <span key={index} className="text-primary font-medium bg-primary/10 px-1 rounded">
          {part}
        </span>
      );
    }
    return part;
  });
}

export default function CustomStepModal({ isOpen, onClose, onSelectCategory }: CustomStepModalProps) {
  // Get user's skin profile
  const userSkinType = getEffectiveSkinType();
  const userConcerns = getEffectiveConcerns();

  // Calculate relevance and sort categories
  const sortedCategories = useMemo(() => {
    return customCategories
      .map(category => {
        let relevanceScore = 0;
        const matchedKeywords: string[] = [];

        // Check skin type match
        if (userSkinType) {
          const skinTypeLower = userSkinType.toLowerCase();
          if (category.skinTypes.includes('all') || category.skinTypes.some(st => st.toLowerCase() === skinTypeLower)) {
            relevanceScore += 2;
            matchedKeywords.push(userSkinType);
          }
        }

        // Check concerns match
        userConcerns.forEach(concern => {
          const concernLower = concern.toLowerCase();
          if (category.concerns.some(c => c.toLowerCase().includes(concernLower) || concernLower.includes(c.toLowerCase()))) {
            relevanceScore += 3;
            matchedKeywords.push(concern);
          }
          // Also check keywords
          if (category.keywords.some(k => k.toLowerCase().includes(concernLower) || concernLower.includes(k.toLowerCase()))) {
            relevanceScore += 1;
            if (!matchedKeywords.includes(concern)) {
              matchedKeywords.push(concern);
            }
          }
        });

        return {
          ...category,
          relevanceScore,
          matchedKeywords: [...new Set(matchedKeywords)], // Remove duplicates
          isRecommended: relevanceScore >= 3,
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [userSkinType, userConcerns]);

  if (!isOpen) return null;

  const hasProfile = userSkinType || userConcerns.length > 0;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-blush">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-deep">
              Add a Custom Step
            </h2>
            <p className="text-sm text-warm-gray mt-1">
              {hasProfile ? (
                <>Personalized for your <span className="text-primary font-medium">{userSkinType || 'skin'}</span> skin{userConcerns.length > 0 && <> &amp; concerns</>}</>
              ) : (
                'Choose a category for your custom step'
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream hover:bg-blush flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl text-warm-gray"></i>
          </button>
        </div>

        {/* User Profile Tags */}
        {hasProfile && (
          <div className="px-4 sm:px-6 pt-4 bg-cream/30">
            <div className="flex flex-wrap gap-2">
              {userSkinType && (
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {userSkinType} skin
                </span>
              )}
              {userConcerns.map(concern => (
                <span key={concern} className="px-3 py-1 bg-sage/20 text-sage text-xs font-medium rounded-full">
                  {concern}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Category Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sortedCategories.map(category => (
              <div
                key={category.id}
                className={`bg-white border rounded-xl p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer group flex flex-col ${
                  category.isRecommended ? 'border-primary/50 ring-1 ring-primary/20' : 'border-blush'
                }`}
                onClick={() => onSelectCategory(category)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    category.isRecommended ? 'bg-primary/20 group-hover:bg-primary/30' : 'bg-primary/10 group-hover:bg-primary/20'
                  }`}>
                    <i className={`${category.icon} text-xl text-primary`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-semibold text-deep text-lg">{category.name}</h3>
                      {category.isRecommended && (
                        <span className="px-2 py-0.5 bg-primary text-white text-xs font-medium rounded-full">
                          For you
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-warm-gray mb-3 leading-relaxed">
                  {highlightKeywords(category.description, category.matchedKeywords)}
                </p>
                <p className="text-xs text-sage italic mb-4">
                  {highlightKeywords(category.whyGoodFit, category.matchedKeywords)}
                </p>
                {category.matchedKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {category.matchedKeywords.slice(0, 3).map(keyword => (
                      <span key={keyword} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  className={`mt-auto w-full py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    category.isRecommended
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-cream hover:bg-primary hover:text-white text-deep'
                  }`}
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-blush bg-cream/30">
          <p className="text-xs text-warm-gray text-center">
            <i className="ri-information-line mr-1"></i>
            After selecting a category, you can browse products to add
          </p>
        </div>
      </div>
    </div>
  );
}
