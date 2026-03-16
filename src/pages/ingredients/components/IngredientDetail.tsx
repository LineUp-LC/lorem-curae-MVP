import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase-browser';
import Dropdown from '../../../components/ui/Dropdown';
import { getPersonalizedIngredientProducts } from '../../../lib/utils/ingredientProducts';
import ExplainWhyDropdown from '../../../components/shared/ExplainWhyDropdown';
import AIInsightBlock from '../../../components/feature/AIInsightBlock';
import { buildAIContext } from '../../../lib/ai/surfaceContext';
import { useEnvironmentContext } from '../../../lib/environment/useEnvironmentContext';
import { useAuth } from '../../../lib/auth/AuthContext';
import { getEffectiveSkinType, getEffectiveConcerns } from '../../../lib/utils/sessionState';

interface IngredientDetailProps {
  ingredientId: string;
  onBack: () => void;
}

interface Review {
  id: number;
  author: string;
  skinType: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
  concerns?: string[];
  fitzpatrickType?: string;
}

// Fractional star component
const StarRating = ({ rating, size = 'text-lg', showNumeric = false, onClick }: {
  rating: number;
  size?: string;
  showNumeric?: boolean;
  onClick?: () => void;
}) => {
  const fullStars = Math.floor(rating);
  const fractionalPart = rating - fullStars;
  const emptyStars = 5 - fullStars - (fractionalPart > 0 ? 1 : 0);

  return (
    <div
      className={`flex items-center gap-1.5 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className={`ri-star-fill ${size} text-amber-400`}></i>
        ))}
        {/* Fractional star */}
        {fractionalPart > 0 && (
          <div className="relative">
            <i className={`ri-star-fill ${size} text-blush`}></i>
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fractionalPart * 100}%` }}
            >
              <i className={`ri-star-fill ${size} text-amber-400`}></i>
            </div>
          </div>
        )}
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className={`ri-star-fill ${size} text-blush`}></i>
        ))}
      </div>
      {showNumeric && (
        <span className={`font-semibold text-deep ml-1 ${size}`}>{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

const IngredientDetail = ({ ingredientId, onBack }: IngredientDetailProps) => {
  const { env } = useEnvironmentContext();
  const { user: authUser, profile } = useAuth();
  const isGuest = !authUser;
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showSimilarProfileReviews, setShowSimilarProfileReviews] = useState(false);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<number>>(new Set());
  const [animatingReview, setAnimatingReview] = useState<number | null>(null);
  const [reportedReviews, setReportedReviews] = useState<Set<number>>(new Set());
  const [showReportConfirm, setShowReportConfirm] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState<number | null>(null);
  const [showAllProductsModal, setShowAllProductsModal] = useState(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDetails, setReportDetails] = useState<string>('');
  const reviewsRef = useRef<HTMLDivElement>(null);

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleHelpfulClick = (reviewId: number) => {
    if (helpfulReviews.has(reviewId)) {
      // Remove from helpful
      setHelpfulReviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    } else {
      // Add to helpful with animation
      setAnimatingReview(reviewId);
      setHelpfulReviews(prev => new Set(prev).add(reviewId));
      setTimeout(() => setAnimatingReview(null), 300);
    }
  };

  const getHelpfulCount = (reviewId: number, originalCount: number) => {
    return originalCount + (helpfulReviews.has(reviewId) ? 1 : 0);
  };

  const handleReportReview = (reviewId: number) => {
    setShowReportModal(reviewId);
    setShowReportConfirm(null);
  };

  const handleSubmitReport = () => {
    if (showReportModal && reportReason) {
      setReportedReviews(prev => new Set(prev).add(showReportModal));
      setShowReportModal(null);
      setReportReason('');
      setReportDetails('');
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = () => {
    const savedSurvey = localStorage.getItem('skinSurveyData');
    if (savedSurvey) {
      const surveyData = JSON.parse(savedSurvey);
      setUserProfile({
        skinType: surveyData.skinTypes?.[0] || surveyData.skinType?.[0] || '',
        concerns: surveyData.concerns || [],
        fitzpatrickType: surveyData.fitzpatrickType?.[0] || '',
      });
    }
  };

  // Ingredient detail data registry — keyed by slug (ingredientId)
  const ingredientDetailData: Record<string, {
    name: string; scientificName: string; rating: number; reviews: number;
    safetyRating: string; safetyExplanation: string; icon: string; color: string; bgColor: string;
    description: string; benefits: string[]; howToUse: string; concentration: string;
    skinTypes: string[]; concerns: string[];
    myths: { myth: string; truth: string }[];
  }> = {
    'hyaluronic-acid': {
      name: 'Hyaluronic Acid',
      scientificName: 'Sodium Hyaluronate',
      rating: 4.8,
      reviews: 1243,
      safetyRating: 'Excellent',
      safetyExplanation: 'Hyaluronic acid is naturally produced by the body and is non-irritating at standard concentrations. It has no known toxicity, is non-comedogenic, and is safe for all skin types including sensitive and pregnancy-safe routines.',
      icon: 'ri-drop-line',
      color: 'text-primary',
      bgColor: 'bg-light/20',
      description: 'Hyaluronic acid is a naturally occurring substance in the skin that has the remarkable ability to attract and hold vast amounts of moisture. It works as a humectant, drawing water from the environment and deeper layers of skin to hydrate the surface.',
      benefits: [
        'Provides intense hydration to all skin types',
        'Plumps skin and reduces appearance of fine lines',
        'Improves skin texture and elasticity',
        'Supports skin barrier function',
        'Non-comedogenic and suitable for sensitive skin',
      ],
      howToUse: 'Apply to damp skin after cleansing and before moisturizer. Use morning and evening for best results. Can be layered with other serums.',
      concentration: '0.5% - 2% is most effective',
      skinTypes: ['All Skin Types', 'Dry', 'Dehydrated', 'Sensitive', 'Mature'],
      concerns: ['Dehydration', 'Fine Lines', 'Dullness', 'Texture'],
      myths: [
        { myth: 'Hyaluronic acid dries out your skin', truth: 'When used correctly on damp skin, HA is incredibly hydrating. The myth comes from using it in very dry environments without proper moisturizer on top.' },
        { myth: 'Higher molecular weight is always better', truth: 'Different molecular weights serve different purposes. Low molecular weight penetrates deeper, while high molecular weight provides surface hydration. A combination is ideal.' },
      ],
    },
    'niacinamide': {
      name: 'Niacinamide',
      scientificName: 'Vitamin B3',
      rating: 4.9,
      reviews: 2156,
      safetyRating: 'Excellent',
      safetyExplanation: 'Niacinamide is one of the most well-tolerated active ingredients in skincare. It is non-irritating at concentrations up to 10%, compatible with nearly all other actives, and safe for sensitive, acne-prone, and pregnancy-safe routines.',
      icon: 'ri-star-line',
      color: 'text-primary',
      bgColor: 'bg-light/20',
      description: 'Niacinamide is a versatile form of vitamin B3 that strengthens the skin barrier, regulates oil production, and visibly minimizes pores. It is one of the most well-researched and well-tolerated active ingredients in skincare.',
      benefits: [
        'Visibly minimizes enlarged pores',
        'Regulates sebum production without drying',
        'Improves uneven skin tone and hyperpigmentation',
        'Strengthens the skin barrier against irritants',
        'Reduces redness and blotchiness',
      ],
      howToUse: 'Apply after cleansing and toning. Works well in the morning and evening. Compatible with most active ingredients.',
      concentration: '2% - 10% depending on skin tolerance',
      skinTypes: ['All Skin Types', 'Oily', 'Combination', 'Sensitive', 'Acne-Prone'],
      concerns: ['Large Pores', 'Uneven Tone', 'Oiliness', 'Redness'],
      myths: [
        { myth: 'You cannot use niacinamide with vitamin C', truth: 'This is outdated. Modern formulations are stable together. They complement each other — niacinamide soothes while vitamin C brightens.' },
        { myth: 'Niacinamide causes flushing', truth: 'Flushing is extremely rare at concentrations below 10%. Start with 5% and increase if tolerated.' },
      ],
    },
    'retinol': {
      name: 'Retinol',
      scientificName: 'Vitamin A',
      rating: 4.7,
      reviews: 1876,
      safetyRating: 'Moderate',
      safetyExplanation: 'Retinol can cause irritation, dryness, and peeling — especially at higher concentrations or for first-time users. It is not recommended during pregnancy. Sun sensitivity increases with use, requiring daily sunscreen.',
      icon: 'ri-flashlight-line',
      color: 'text-primary',
      bgColor: 'bg-light/20',
      description: 'Retinol is the gold standard in anti-aging skincare. A derivative of vitamin A, it accelerates cell turnover, stimulates collagen production, and smooths fine lines and wrinkles over consistent use.',
      benefits: [
        'Reduces the appearance of fine lines and wrinkles',
        'Accelerates cell turnover for fresher skin',
        'Stimulates collagen and elastin production',
        'Fades dark spots and post-inflammatory hyperpigmentation',
        'Improves overall skin texture and smoothness',
      ],
      howToUse: 'Apply a pea-sized amount to clean, dry skin at night. Start with 2-3 times per week and gradually increase. Always follow with sunscreen in the morning.',
      concentration: '0.01% - 1% depending on experience level',
      skinTypes: ['Normal', 'Combination', 'Oily', 'Mature'],
      concerns: ['Wrinkles', 'Fine Lines', 'Texture', 'Dark Spots', 'Aging'],
      myths: [
        { myth: 'Retinol thins the skin', truth: 'Retinol actually thickens the dermis over time by stimulating collagen production. Initial sensitivity is temporary as skin adjusts.' },
        { myth: 'You should not use retinol in the summer', truth: 'Retinol can be used year-round. The key is consistent daily sunscreen use, which is important regardless of retinol.' },
      ],
    },
    'vitamin-c': {
      name: 'Vitamin C',
      scientificName: 'Ascorbic Acid',
      rating: 4.6,
      reviews: 1654,
      safetyRating: 'Excellent',
      safetyExplanation: 'Vitamin C is safe for most skin types at concentrations up to 20%. Some users with very sensitive skin may experience mild tingling. It is antioxidant and photoprotective, making it a low-risk active ingredient.',
      icon: 'ri-sun-line',
      color: 'text-primary',
      bgColor: 'bg-light/20',
      description: 'Vitamin C is a potent antioxidant that neutralizes free radicals, brightens the complexion, and supports collagen synthesis. It provides photoprotection when used alongside sunscreen.',
      benefits: [
        'Brightens dull, uneven complexion',
        'Protects against environmental and UV damage',
        'Supports collagen synthesis for firmer skin',
        'Fades hyperpigmentation and dark spots',
        'Enhances sunscreen effectiveness when layered underneath',
      ],
      howToUse: 'Apply in the morning after cleansing, before moisturizer and sunscreen. Store in a cool, dark place to prevent oxidation.',
      concentration: '10% - 20% L-Ascorbic Acid for optimal efficacy',
      skinTypes: ['All Skin Types', 'Normal', 'Dry', 'Combination', 'Mature'],
      concerns: ['Dullness', 'Dark Spots', 'Sun Damage', 'Uneven Tone'],
      myths: [
        { myth: 'Vitamin C makes your skin more sensitive to the sun', truth: 'Vitamin C is actually photoprotective. It does not increase sun sensitivity — it helps defend against UV damage.' },
        { myth: 'All vitamin C serums are the same', truth: 'Form, concentration, pH, and packaging all affect efficacy. L-Ascorbic Acid at pH 2.5-3.5 is the most studied and effective form.' },
      ],
    },
    'ceramides': {
      name: 'Ceramides',
      scientificName: 'Ceramide Complex',
      rating: 4.8,
      reviews: 987,
      safetyRating: 'Excellent',
      safetyExplanation: 'Ceramides are naturally present in the skin and are among the safest skincare ingredients. They have no known irritation potential, are non-comedogenic, and are suitable for all skin types including eczema-prone and compromised barriers.',
      icon: 'ri-shield-line',
      color: 'text-primary',
      bgColor: 'bg-light/20',
      description: 'Ceramides are lipids naturally found in the skin that make up over 50% of the skin barrier. They lock in moisture, protect against environmental aggressors, and prevent transepidermal water loss.',
      benefits: [
        'Restores and strengthens the skin barrier',
        'Prevents transepidermal water loss',
        'Soothes dry, irritated, and eczema-prone skin',
        'Protects against environmental stressors',
        'Compatible with all other active ingredients',
      ],
      howToUse: 'Apply as part of your moisturizing step, morning and evening. Pairs well with hyaluronic acid for layered hydration.',
      concentration: 'Effective at a wide range; look for ceramide 1, 3, and 6-II',
      skinTypes: ['All Skin Types', 'Dry', 'Sensitive', 'Eczema-Prone', 'Mature'],
      concerns: ['Barrier Damage', 'Dryness', 'Sensitivity', 'Irritation'],
      myths: [
        { myth: 'Ceramides are only for dry skin', truth: 'Every skin type benefits from ceramides. Oily and acne-prone skin also has a barrier that needs support.' },
        { myth: 'Plant-derived ceramides are less effective', truth: 'Synthetic and plant-derived ceramides are structurally identical to human ceramides and equally effective at barrier repair.' },
      ],
    },
    'peptides': {
      name: 'Peptides',
      scientificName: 'Amino Acid Chains',
      rating: 4.7,
      reviews: 1123,
      safetyRating: 'Excellent',
      safetyExplanation: 'Peptides are naturally occurring amino acid chains with an excellent safety profile. They are non-irritating, non-sensitizing, and well-tolerated by all skin types including sensitive and reactive skin.',
      icon: 'ri-links-line',
      color: 'text-primary',
      bgColor: 'bg-light/20',
      description: 'Peptides are short chains of amino acids that act as signaling molecules in the skin. They communicate with cells to produce more collagen, elastin, and other structural proteins that keep skin firm and youthful.',
      benefits: [
        'Signals skin to produce more collagen',
        'Improves skin firmness and elasticity',
        'Reduces the appearance of fine lines',
        'Supports wound healing and skin repair',
        'Well-tolerated by sensitive skin types',
      ],
      howToUse: 'Apply after cleansing and toning. Peptides work well both morning and evening. Avoid using with direct acids at the same time as low pH can break peptide bonds.',
      concentration: 'Varies by peptide type; follow product instructions',
      skinTypes: ['All Skin Types', 'Mature', 'Normal', 'Sensitive'],
      concerns: ['Aging', 'Loss of Firmness', 'Fine Lines', 'Sagging'],
      myths: [
        { myth: 'Peptides replace retinol', truth: 'Peptides and retinol work through different mechanisms. Peptides signal collagen production while retinol accelerates cell turnover. They complement each other.' },
        { myth: 'Peptides work immediately', truth: 'Peptides require consistent use over 8-12 weeks to show visible results, as they work at the cellular level.' },
      ],
    },
    'centella-asiatica': {
      name: 'Centella Asiatica',
      scientificName: 'Cica / Tiger Grass',
      rating: 4.9,
      reviews: 1432,
      safetyRating: 'Excellent',
      safetyExplanation: 'Centella Asiatica has been used safely for centuries in traditional medicine. It is anti-inflammatory, non-irritating, and suitable for the most sensitive skin types including rosacea-prone and post-procedure skin.',
      icon: 'ri-leaf-line',
      color: 'text-primary',
      bgColor: 'bg-light/20',
      description: 'Centella Asiatica, also known as Cica or Tiger Grass, is a botanical extract celebrated for its calming, healing, and anti-inflammatory properties. It has been used in traditional medicine for centuries and is now a cornerstone of sensitive skin care.',
      benefits: [
        'Soothes inflammation and calms irritated skin',
        'Accelerates wound healing and skin recovery',
        'Strengthens the skin barrier',
        'Reduces redness from rosacea and sensitivity',
        'Provides antioxidant protection',
      ],
      howToUse: 'Apply morning and evening after cleansing. Ideal as a calming layer before moisturizer. Safe to use with all other active ingredients.',
      concentration: 'Effective from 0.1% extract; higher concentrations in dedicated cica products',
      skinTypes: ['All Skin Types', 'Sensitive', 'Irritated', 'Redness-Prone', 'Acne-Prone'],
      concerns: ['Sensitivity', 'Redness', 'Irritation', 'Barrier Damage', 'Post-Procedure Recovery'],
      myths: [
        { myth: 'Cica is only for sensitive skin', truth: 'While centella excels for sensitive skin, its antioxidant and barrier-strengthening benefits are valuable for all skin types.' },
        { myth: 'Centella and cica are different ingredients', truth: 'Cica is simply a nickname for Centella Asiatica. They refer to the same botanical extract.' },
      ],
    },
    'salicylic-acid': {
      name: 'Salicylic Acid',
      scientificName: 'Beta Hydroxy Acid (BHA)',
      rating: 4.5,
      reviews: 1765,
      safetyRating: 'Moderate',
      safetyExplanation: 'Salicylic acid can cause dryness and peeling at higher concentrations. It is generally not recommended during pregnancy. At standard concentrations (0.5-2%), it is well-tolerated by most skin types but requires moisturizer to prevent over-drying.',
      icon: 'ri-contrast-drop-2-line',
      color: 'text-primary',
      bgColor: 'bg-light/20',
      description: 'Salicylic acid is a beta hydroxy acid (BHA) that is oil-soluble, allowing it to penetrate deep into pores to dissolve congestion, reduce breakouts, and refine skin texture. It is the gold standard for acne-prone skin.',
      benefits: [
        'Penetrates and unclogs pores from within',
        'Reduces blackheads, whiteheads, and breakouts',
        'Exfoliates dead skin cells on the surface',
        'Calms inflammation associated with acne',
        'Refines skin texture and reduces post-acne marks',
      ],
      howToUse: 'Apply to clean skin, focusing on congested areas. Start with every other evening and increase frequency as tolerated. Follow with moisturizer.',
      concentration: '0.5% - 2% for daily use; higher concentrations for professional treatments',
      skinTypes: ['Oily', 'Combination', 'Acne-Prone', 'Normal'],
      concerns: ['Acne', 'Blackheads', 'Large Pores', 'Oiliness', 'Texture'],
      myths: [
        { myth: 'Salicylic acid dries out your skin', truth: 'At appropriate concentrations with proper moisturizing, BHA actually helps normalize oil production without excessive dryness.' },
        { myth: 'You cannot use BHA and AHA together', truth: 'They can be used together, but introduce them separately first. BHA works inside pores while AHA works on the surface — they complement each other.' },
      ],
    },
    'glycolic-acid': {
      name: 'Glycolic Acid',
      scientificName: 'Alpha Hydroxy Acid (AHA)',
      rating: 4.6,
      reviews: 1543,
      safetyRating: 'Moderate',
      safetyExplanation: 'Glycolic acid increases sun sensitivity and can cause irritation, redness, or peeling — especially at concentrations above 10%. It is not recommended for very sensitive skin without gradual introduction. Daily sunscreen is essential during use.',
      icon: 'ri-contrast-line',
      color: 'text-primary',
      bgColor: 'bg-light/20',
      description: 'Glycolic acid is an alpha hydroxy acid (AHA) derived from sugarcane. It has the smallest molecular size of all AHAs, allowing it to penetrate effectively and exfoliate dead skin cells to reveal brighter, smoother skin underneath.',
      benefits: [
        'Exfoliates dead skin cells for a brighter complexion',
        'Stimulates collagen production over time',
        'Fades hyperpigmentation and dark spots',
        'Smooths rough or uneven skin texture',
        'Improves the efficacy of other skincare products',
      ],
      howToUse: 'Apply in the evening after cleansing. Start with lower concentrations 2-3 times per week. Always use sunscreen daily as AHAs increase sun sensitivity.',
      concentration: '5% - 10% for at-home use; 20% - 70% for professional peels',
      skinTypes: ['Normal', 'Combination', 'Oily', 'Mature', 'Sun-Damaged'],
      concerns: ['Dullness', 'Texture', 'Hyperpigmentation', 'Fine Lines'],
      myths: [
        { myth: 'Glycolic acid is too harsh for daily use', truth: 'Low concentrations (5-7%) in well-formulated products can be used daily by most skin types after building tolerance.' },
        { myth: 'AHAs and retinol should never be combined', truth: 'They can be alternated on different nights or used together at lower concentrations. The key is gradual introduction and monitoring your skin.' },
      ],
    },
  };

  const ingredient = ingredientDetailData[ingredientId];

  // Unknown ingredient slug — show not-found state
  if (!ingredient) {
    return (
      <div className="min-h-screen py-8 px-6 lg:px-12 bg-cream">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-warm-gray hover:text-primary mb-6 transition-colors cursor-pointer text-sm"
          >
            <i className="ri-arrow-left-line text-lg"></i>
            <span className="font-medium">Back to Library</span>
          </button>
          <div className="text-center py-16">
            <i className="ri-flask-line text-6xl text-blush mb-4"></i>
            <h2 className="font-serif text-2xl text-deep mb-2">Ingredient Not Found</h2>
            <p className="text-warm-gray">We don't have data for this ingredient yet. Browse the library to explore available ingredients.</p>
          </div>
        </div>
      </div>
    );
  }

  const navigate = useNavigate();
  const matchedProducts = getPersonalizedIngredientProducts(
    ingredientId,
    userProfile?.skinType,
    userProfile?.concerns,
  );
  const priceRange = matchedProducts.length > 0
    ? { min: Math.min(...matchedProducts.map(p => p.price)), max: Math.max(...matchedProducts.map(p => p.price)) }
    : null;

  // Build AI context for ingredient insight
  const aiContext = useMemo(() => {
    if (!ingredient) return null;
    return buildAIContext('ingredient_detail', {
      page: {
        mode: 'ingredient_detail',
        ingredient: {
          name: ingredient.name,
          aliases: [ingredient.scientificName],
          category: 'active',
          benefits: ingredient.benefits,
          usageGuidelines: ingredient.howToUse,
          compatibility: { worksWellWith: [], avoidWith: [] },
          contraindications: [],
          concentrationRange: { min: 0, max: 100, unit: '%', optimal: ingredient.concentration },
          safetyNotes: [ingredient.safetyExplanation],
          skinTypes: ingredient.skinTypes,
          concerns: ingredient.concerns,
        },
        relatedProducts: matchedProducts,
      },
      environment: env,
    });
  }, [ingredientId, ingredient?.name, env?.season, env?.uvBand, authUser?.id, userProfile?.skinType, profile?.skin_type]);

  const hasProfile = !!userProfile?.skinType || !!profile?.skin_type;

  // Ingredient-specific community reviews keyed by slug
  const ingredientReviewData: Record<string, Review[]> = {
    'hyaluronic-acid': [
      { id: 1, author: 'Emma L.', skinType: 'Dry', concerns: ['Dehydration', 'Fine Lines'], fitzpatrickType: 'II', rating: 5, date: '2 weeks ago', comment: 'My dehydrated skin improved noticeably within days. Plumper, more bouncy texture. Now a staple in my routine.', helpful: 234 },
      { id: 2, author: 'Priya K.', skinType: 'Sensitive', concerns: ['Dehydration', 'Redness'], fitzpatrickType: 'V', rating: 4, date: '3 weeks ago', comment: 'Very gentle and effective. No irritation at all. Just remember to apply on damp skin for best results.', helpful: 156 },
      { id: 3, author: 'Sarah M.', skinType: 'Dry', concerns: ['Fine Lines', 'Dehydration'], fitzpatrickType: 'III', rating: 5, date: '1 week ago', comment: 'I use it twice daily and my skin has never felt more hydrated. Layers well under moisturizer.', helpful: 98 },
    ],
    'niacinamide': [
      { id: 10, author: 'Marcus T.', skinType: 'Combination', concerns: ['Large Pores', 'Oiliness'], fitzpatrickType: 'IV', rating: 5, date: '1 month ago', comment: 'My pores look visibly smaller after three weeks. Oil production is more balanced without drying out my cheeks.', helpful: 189 },
      { id: 11, author: 'Aaliyah M.', skinType: 'Oily', concerns: ['Uneven Tone', 'Large Pores'], fitzpatrickType: 'V', rating: 5, date: '1 week ago', comment: 'Helped even out my skin tone and control oil. No irritation even at 10%. Pairs well with everything in my routine.', helpful: 287 },
      { id: 12, author: 'Sofia R.', skinType: 'Sensitive', concerns: ['Redness', 'Sensitivity'], fitzpatrickType: 'II', rating: 4, date: '2 weeks ago', comment: 'Calmed the redness around my nose and cheeks. Very soothing and gentle enough for my reactive skin.', helpful: 145 },
    ],
    'retinol': [
      { id: 20, author: 'Kenji T.', skinType: 'Combination', concerns: ['Fine Lines', 'Texture'], fitzpatrickType: 'III', rating: 5, date: '3 days ago', comment: 'Fine lines around my eyes are less noticeable after two months. Started slow with twice a week and built up.', helpful: 198 },
      { id: 21, author: 'Laura B.', skinType: 'Normal', concerns: ['Wrinkles', 'Dark Spots'], fitzpatrickType: 'II', rating: 4, date: '2 weeks ago', comment: 'Effective but took patience. Initial peeling subsided after three weeks. Skin texture is much smoother now.', helpful: 167 },
      { id: 22, author: 'David K.', skinType: 'Oily', concerns: ['Texture', 'Acne'], fitzpatrickType: 'IV', rating: 4, date: '1 month ago', comment: 'Good for texture improvement. Had some dryness at first but buffering with moisturizer helped. Sunscreen is a must.', helpful: 134 },
    ],
    'vitamin-c': [
      { id: 30, author: 'Jasmine W.', skinType: 'Combination', concerns: ['Dark Spots', 'Dullness'], fitzpatrickType: 'IV', rating: 5, date: '5 days ago', comment: 'My dark spots faded noticeably after three weeks. Complexion looks brighter and more even overall.', helpful: 312 },
      { id: 31, author: 'Emma L.', skinType: 'Dry', concerns: ['Dullness', 'Sun Damage'], fitzpatrickType: 'II', rating: 4, date: '2 weeks ago', comment: 'Adds a nice glow to my morning routine. Slight tingling on first use but it settled quickly. Store it in the fridge.', helpful: 178 },
      { id: 32, author: 'Priya K.', skinType: 'Sensitive', concerns: ['Uneven Tone', 'Redness'], fitzpatrickType: 'V', rating: 4, date: '3 weeks ago', comment: 'Started with a lower concentration and worked up. Helped brighten my overall complexion without irritation.', helpful: 156 },
    ],
    'ceramides': [
      { id: 40, author: 'Sofia R.', skinType: 'Dry', concerns: ['Barrier Damage', 'Sensitivity'], fitzpatrickType: 'II', rating: 5, date: '2 weeks ago', comment: 'My damaged barrier recovered so much faster once I added ceramides. Dryness and flaking are gone.', helpful: 245 },
      { id: 41, author: 'Marcus T.', skinType: 'Combination', concerns: ['Dehydration', 'Sensitivity'], fitzpatrickType: 'IV', rating: 5, date: '1 month ago', comment: 'Great for maintaining hydration without feeling heavy. My skin feels more resilient and less reactive.', helpful: 189 },
      { id: 42, author: 'Sarah M.', skinType: 'Sensitive', concerns: ['Irritation', 'Dryness'], fitzpatrickType: 'III', rating: 5, date: '1 week ago', comment: 'The gentlest ingredient I have used. Repaired my moisture barrier after over-exfoliating. Cannot imagine my routine without it.', helpful: 134 },
    ],
    'peptides': [
      { id: 50, author: 'Laura B.', skinType: 'Mature', concerns: ['Loss of Firmness', 'Fine Lines'], fitzpatrickType: 'II', rating: 5, date: '2 weeks ago', comment: 'After about 8 weeks I noticed my skin felt firmer, especially around the jawline. Very gentle with no irritation.', helpful: 201 },
      { id: 51, author: 'Kenji T.', skinType: 'Combination', concerns: ['Fine Lines', 'Sagging'], fitzpatrickType: 'III', rating: 4, date: '1 month ago', comment: 'Subtle but real improvement. Works best as a long-term addition. I layer it under my moisturizer at night.', helpful: 145 },
      { id: 52, author: 'Priya K.', skinType: 'Sensitive', concerns: ['Fine Lines', 'Sensitivity'], fitzpatrickType: 'V', rating: 5, date: '3 weeks ago', comment: 'Gentle enough for my sensitive skin and I can see a difference in my forehead lines. Patient use is key.', helpful: 123 },
    ],
    'centella-asiatica': [
      { id: 60, author: 'Sofia R.', skinType: 'Sensitive', concerns: ['Redness', 'Irritation'], fitzpatrickType: 'II', rating: 5, date: '1 week ago', comment: 'A lifesaver for my rosacea-prone skin. Redness calmed within days. I use it morning and night with no issues.', helpful: 278 },
      { id: 61, author: 'Aaliyah M.', skinType: 'Oily', concerns: ['Acne', 'Redness'], fitzpatrickType: 'V', rating: 5, date: '2 weeks ago', comment: 'Calmed my post-breakout redness and helped my skin heal faster. Lightweight and non-greasy.', helpful: 198 },
      { id: 62, author: 'Emma L.', skinType: 'Dry', concerns: ['Sensitivity', 'Barrier Damage'], fitzpatrickType: 'II', rating: 4, date: '3 weeks ago', comment: 'Very soothing after my retinol nights. Helps calm any irritation and supports my moisture barrier.', helpful: 156 },
    ],
    'salicylic-acid': [
      { id: 70, author: 'Aaliyah M.', skinType: 'Oily', concerns: ['Acne', 'Large Pores', 'Oiliness'], fitzpatrickType: 'V', rating: 5, date: '1 week ago', comment: 'My breakouts have decreased significantly. Pores look cleaner and less congested. I use it every other evening.', helpful: 287 },
      { id: 71, author: 'Marcus T.', skinType: 'Combination', concerns: ['Blackheads', 'Texture'], fitzpatrickType: 'IV', rating: 4, date: '1 month ago', comment: 'Works well for my T-zone congestion. Blackheads around my nose cleared up. Just make sure to moisturize after.', helpful: 167 },
      { id: 72, author: 'David K.', skinType: 'Oily', concerns: ['Acne', 'Oiliness'], fitzpatrickType: 'IV', rating: 4, date: '2 weeks ago', comment: 'Good at controlling oil and preventing new breakouts. Started with a lower concentration and worked up.', helpful: 134 },
    ],
    'glycolic-acid': [
      { id: 80, author: 'Jasmine W.', skinType: 'Combination', concerns: ['Dullness', 'Texture'], fitzpatrickType: 'IV', rating: 5, date: '5 days ago', comment: 'My skin looks noticeably brighter and smoother after each use. I use it twice a week in the evening.', helpful: 234 },
      { id: 81, author: 'Laura B.', skinType: 'Normal', concerns: ['Hyperpigmentation', 'Texture'], fitzpatrickType: 'II', rating: 4, date: '2 weeks ago', comment: 'Helped fade some sun spots over a few weeks. Slight tingling is normal but no irritation. Sunscreen daily is essential.', helpful: 178 },
      { id: 82, author: 'Kenji T.', skinType: 'Combination', concerns: ['Fine Lines', 'Dullness'], fitzpatrickType: 'III', rating: 4, date: '1 month ago', comment: 'Good exfoliation without being harsh. My skin absorbs other products better now. Started slow and built up tolerance.', helpful: 145 },
    ],
  };

  const communityReviews: Review[] = ingredientReviewData[ingredientId] || [];

  // Filter reviews from users with similar profiles
  const getSimilarProfileReviews = (): Review[] => {
    if (!userProfile) return [];

    const allReviews = communityReviews;

    return allReviews.filter(review => {
      const skinTypeMatch = review.skinType.toLowerCase() === userProfile.skinType?.toLowerCase();
      const concernsMatch = review.concerns?.some(c => 
        userProfile.concerns?.some((uc: string) => uc.toLowerCase() === c.toLowerCase())
      );
      const fitzpatrickMatch = review.fitzpatrickType === userProfile.fitzpatrickType;

      // Return reviews that match at least 2 out of 3 criteria
      const matches = [skinTypeMatch, concernsMatch, fitzpatrickMatch].filter(Boolean).length;
      return matches >= 2;
    });
  };

  const similarProfileReviews = getSimilarProfileReviews();
  const otherReviews = communityReviews.filter(r => !similarProfileReviews.includes(r));
  const allReviewsCombined = communityReviews;

  // Check if a review is from similar skin profile
  const isSimilarSkinReview = (reviewId: number): boolean => {
    return similarProfileReviews.some(r => r.id === reviewId);
  };

  return (
    <div className="min-h-screen py-8 px-6 lg:px-12 bg-cream">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-warm-gray hover:text-primary mb-6 transition-colors cursor-pointer text-sm"
        >
          <i className="ri-arrow-left-line text-lg"></i>
          <span className="font-medium">Back to Library</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-md border border-blush/30 mb-6">
          {/* Clickable Rating - Top */}
          <button
            onClick={scrollToReviews}
            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-cream rounded-full hover:bg-blush/30 transition-colors cursor-pointer"
          >
            <StarRating rating={ingredient.rating} size="text-sm" showNumeric />
            <span className="text-xs text-warm-gray hover:text-primary transition-colors">
              ({ingredient.reviews} reviews)
            </span>
          </button>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1">
              <div className="mb-3">
                <h1 className="font-serif text-2xl lg:text-3xl font-semibold text-deep mb-1">
                  {ingredient.name}
                </h1>
                <p className="text-sm text-warm-gray mb-2">{ingredient.scientificName}</p>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    ingredient.safetyRating === 'Excellent'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    Safety: {ingredient.safetyRating}
                  </div>
                </div>
                <ExplainWhyDropdown explanation={ingredient.safetyExplanation} />
              </div>
              <p className="text-sm text-warm-gray leading-relaxed">
                {ingredient.description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Ingredient Insight — Phase 3 AI WHY */}
            {aiContext && (
              <div>
                {hasProfile && (
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 bg-primary/15 rounded-full flex items-center justify-center">
                      <i className="ri-dna-line text-sm text-primary"></i>
                    </div>
                    <h2 className="font-serif text-lg font-semibold text-deep">For Your Skin</h2>
                  </div>
                )}
                <AIInsightBlock context={aiContext} compact={!hasProfile} />
                {isGuest && !hasProfile && (
                  <p className="text-[10px] text-warm-gray/50 mt-1.5 flex items-center gap-1 px-3">
                    <i className="ri-information-line text-[10px]" />
                    Based on general guidance.
                    <button
                      onClick={() => navigate('/login')}
                      className="text-primary hover:text-deep transition-colors underline underline-offset-2 cursor-pointer"
                    >
                      Sign in
                    </button>
                    {' '}for personalized ingredient insights.
                  </p>
                )}
              </div>
            )}

            {/* Benefits */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-blush/30">
              <h2 className="font-serif text-xl font-semibold text-deep mb-4">Key Benefits</h2>
              <ul className="space-y-2.5">
                {ingredient.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <i className="ri-checkbox-circle-fill text-lg text-primary flex-shrink-0 mt-0.5"></i>
                    <span className="text-sm text-warm-gray">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How to Use */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-blush/30">
              <h2 className="font-serif text-xl font-semibold text-deep mb-4">How to Use</h2>
              <p className="text-sm text-deep leading-relaxed mb-5">{ingredient.howToUse}</p>
              <div className="bg-cream rounded-xl p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-1.5">
                  <i className="ri-test-tube-line text-sm text-primary"></i>
                  <p className="text-xs font-semibold text-deep">Optimal Concentration</p>
                </div>
                <p className="text-sm font-medium text-primary">{ingredient.concentration}</p>
              </div>
            </div>

            {/* Myth Busting */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-blush/30">
              <h2 className="font-serif text-xl font-semibold text-deep mb-4">Myth Busting</h2>
              <div className="space-y-5">
                {ingredient.myths.map((item, index) => (
                  <div key={index} className="border-l-3 border-primary pl-4">
                    <div className="flex items-start gap-2 mb-2">
                      <i className="ri-close-circle-line text-lg text-terracotta flex-shrink-0 mt-0.5"></i>
                      <p className="text-sm font-medium text-deep">{item.myth}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <i className="ri-checkbox-circle-line text-lg text-primary flex-shrink-0 mt-0.5"></i>
                      <p className="text-sm text-warm-gray">{item.truth}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Reviews */}
            <div ref={reviewsRef} className="bg-white rounded-2xl p-6 shadow-md border border-blush/30 scroll-mt-24">
              <h2 className="font-serif text-xl font-semibold text-deep mb-1">Community Reviews</h2>
              <ExplainWhyDropdown label="How are these matched?" explanation="Reviews are prioritized based on your skin profile. Users who share your skin type, concerns, and sensitivities are surfaced first so you see the most relevant experiences." />
              <div className="mb-5" />

              {/* Curated Reviews */}
              {userProfile && similarProfileReviews.length > 0 && (
                <div className="mb-8">
                  {/* Curated Section Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-sage rounded-full">
                        <i className="ri-user-heart-line text-white"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-sage">Curated for You</h3>
                    </div>
                    <span className="text-xs bg-sage/20 text-sage px-3 py-1 rounded-full font-medium">
                      {similarProfileReviews.length} matches
                    </span>
                  </div>

                  <p className="text-sm text-warm-gray mb-4">
                    Reviews from users with a similar skin profile who have experience with {ingredient.name}.
                  </p>
                  <div className="space-y-6">
                    {similarProfileReviews.map((review) => (
                      <div key={review.id} className="border-2 border-sage/20 rounded-xl p-6 bg-sage/10 relative">
                        {/* Curated Badge */}
                        <div className="absolute top-4 right-4 z-10">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sage text-white rounded-full text-xs font-semibold shadow-md" aria-label="This review was curated for your skin profile">
                            <i className="ri-user-heart-line text-sm"></i>
                            Curated for You
                          </span>
                        </div>
                        
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 pr-32">
                            <p className="font-semibold text-deep">{review.author}</p>
                            <div className="flex items-center gap-2 text-sm text-warm-gray mt-1">
                              <span>{review.skinType}</span>
                              {review.fitzpatrickType && (
                                <>
                                  <span>•</span>
                                  <span>Fitzpatrick Type {review.fitzpatrickType}</span>
                                </>
                              )}
                            </div>
                            {review.concerns && review.concerns.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {review.concerns.map((concern, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-white px-2 py-1 rounded-full text-warm-gray"
                                  >
                                    {concern}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <StarRating rating={review.rating} size="text-sm" showNumeric />
                        </div>
                        <p className="text-warm-gray leading-relaxed mb-3">{review.comment}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-blush/50">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleHelpfulClick(review.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                                helpfulReviews.has(review.id)
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-warm-gray hover:bg-cream'
                              } ${animatingReview === review.id ? 'scale-110' : 'scale-100'}`}
                              style={{ transition: 'transform 0.15s ease-out, background-color 0.2s, color 0.2s' }}
                            >
                              <i className={`text-sm ${helpfulReviews.has(review.id) ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'} ${animatingReview === review.id ? 'animate-bounce' : ''}`}></i>
                              <span className="text-xs">Helpful ({getHelpfulCount(review.id, review.helpful)})</span>
                            </button>
                            {reportedReviews.has(review.id) ? (
                              <span className="text-xs text-warm-gray/60 flex items-center gap-1">
                                <i className="ri-flag-fill text-xs"></i>
                                Reported
                              </span>
                            ) : showReportConfirm === review.id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-warm-gray">Report?</span>
                                <button
                                  onClick={() => handleReportReview(review.id)}
                                  className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setShowReportConfirm(null)}
                                  className="text-xs text-warm-gray hover:text-deep cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowReportConfirm(review.id)}
                                className="text-warm-gray/50 hover:text-warm-gray text-xs cursor-pointer"
                                title="Report review"
                              >
                                <i className="ri-flag-line"></i>
                              </button>
                            )}
                          </div>
                          <span className="text-xs text-warm-gray/70">{review.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Other Reviews */}
              {otherReviews.length > 0 && (
                <div>
                  {userProfile && similarProfileReviews.length > 0 && (
                    <h3 className="text-lg font-semibold text-deep mb-4 mt-8">All Reviews</h3>
                  )}
                  <div className="space-y-6">
                    {otherReviews.map((review) => (
                      <div key={review.id} className="border-b border-blush last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-deep">{review.author}</p>
                            <p className="text-sm text-warm-gray">{review.skinType} • {review.date}</p>
                            {review.concerns && review.concerns.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {review.concerns.map((concern, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-cream px-2 py-1 rounded-full text-warm-gray"
                                  >
                                    {concern}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <StarRating rating={review.rating} size="text-sm" showNumeric />
                        </div>
                        <p className="text-warm-gray leading-relaxed text-sm mb-3">{review.comment}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-blush/50">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleHelpfulClick(review.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                                helpfulReviews.has(review.id)
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-warm-gray hover:bg-cream'
                              } ${animatingReview === review.id ? 'scale-110' : 'scale-100'}`}
                              style={{ transition: 'transform 0.15s ease-out, background-color 0.2s, color 0.2s' }}
                            >
                              <i className={`text-sm ${helpfulReviews.has(review.id) ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'} ${animatingReview === review.id ? 'animate-bounce' : ''}`}></i>
                              <span className="text-xs">Helpful ({getHelpfulCount(review.id, review.helpful)})</span>
                            </button>
                            {reportedReviews.has(review.id) ? (
                              <span className="text-xs text-warm-gray/60 flex items-center gap-1">
                                <i className="ri-flag-fill text-xs"></i>
                                Reported
                              </span>
                            ) : showReportConfirm === review.id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-warm-gray">Report?</span>
                                <button
                                  onClick={() => handleReportReview(review.id)}
                                  className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setShowReportConfirm(null)}
                                  className="text-xs text-warm-gray hover:text-deep cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowReportConfirm(review.id)}
                                className="text-warm-gray/50 hover:text-warm-gray text-xs cursor-pointer"
                                title="Report review"
                              >
                                <i className="ri-flag-line"></i>
                              </button>
                            )}
                          </div>
                          <span className="text-xs text-warm-gray/70">{review.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowAllReviewsModal(true)}
                className="w-full mt-5 py-2.5 border border-primary text-primary rounded-lg font-medium text-sm hover:bg-primary/5 transition-colors whitespace-nowrap cursor-pointer"
              >
                Read All Reviews
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Best For */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-blush/30">
              <h3 className="font-medium text-deep text-sm mb-4">Best For</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-warm-gray mb-2">Skin Types</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ingredient.skinTypes.map((type, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-warm-gray mb-2">Concerns</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ingredient.concerns.map((concern, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-cream text-deep text-xs font-medium rounded-full"
                      >
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Products with this Ingredient */}
            {matchedProducts.length > 0 ? (
              <div className="bg-white rounded-2xl p-5 shadow-md border border-blush/30">
                <h3 className="font-medium text-deep text-sm mb-1">Products with {ingredient.name}</h3>
                {userProfile && (
                  <p className="text-xs text-primary mb-3">Personalized for your skin profile</p>
                )}
                {!userProfile && (
                  <p className="text-xs text-warm-gray mb-3">{matchedProducts.length} products found</p>
                )}
                <div className="space-y-3">
                  {matchedProducts.slice(0, 3).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => navigate(`/product-detail?id=${product.id}`)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-blush/30 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer text-left bg-white"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-deep truncate">{product.name}</p>
                        <p className="text-xs text-warm-gray truncate">{product.brand}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-semibold text-deep">
                            {priceRange && priceRange.min !== priceRange.max
                              ? `$${priceRange.min} – $${priceRange.max}`
                              : `$${product.price}`}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <i className="ri-star-fill text-xs text-amber-400"></i>
                            <span className="text-xs text-warm-gray">{product.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-warm-gray">{((product.id % 4) + 2)} retailers</span>
                          <span className="text-xs text-warm-gray">·</span>
                          {product.inStock ? (
                            <span className="text-xs text-primary font-medium">In Stock</span>
                          ) : (
                            <span className="text-xs text-terracotta font-medium">Out of Stock</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {matchedProducts.length > 3 && (
                  <button
                    onClick={() => setShowAllProductsModal(true)}
                    className="w-full mt-3 py-2 text-primary text-xs font-medium hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
                  >
                    View All {matchedProducts.length} Products
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-primary to-dark rounded-2xl p-5 text-white">
                <h3 className="font-serif text-lg font-semibold mb-2">Find Products</h3>
                <p className="text-white/80 text-xs mb-4">
                  Discover products featuring this ingredient in our curated marketplace.
                </p>
                <a
                  href="/marketplace"
                  className="block w-full py-2.5 bg-white text-deep rounded-lg font-medium text-sm hover:bg-cream transition-colors whitespace-nowrap cursor-pointer text-center"
                >
                  Shop Now
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Reviews Modal */}
      {showAllReviewsModal && (
        <div className="fixed inset-0 bg-deep/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-blush/30">
              <div>
                <h2 className="font-serif text-xl font-semibold text-deep">All Reviews</h2>
                <p className="text-xs text-warm-gray mt-1">{allReviewsCombined.length} total reviews</p>
              </div>
              <button
                onClick={() => setShowAllReviewsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl text-warm-gray"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Curated Reviews Section - Always at Top */}
              {userProfile && similarProfileReviews.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-sage rounded-full">
                        <i className="ri-user-heart-line text-white"></i>
                      </div>
                      <h3 className="text-lg font-semibold text-sage">Curated for You</h3>
                    </div>
                    <span className="text-xs bg-sage/20 text-sage px-3 py-1 rounded-full font-medium">
                      {similarProfileReviews.length} matches
                    </span>
                  </div>
                  <p className="text-sm text-warm-gray mb-4">
                    Reviews from users with similar skin type, concerns, and profile attributes as you.
                  </p>
                  <div className="space-y-6">
                    {similarProfileReviews.map((review) => (
                      <div key={review.id} className="border-2 border-sage/20 rounded-xl p-6 bg-sage/10 hover:shadow-md transition-shadow relative">
                        {/* Curated Badge */}
                        <div className="absolute top-4 right-4 z-10">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sage text-white rounded-full text-xs font-semibold shadow-md" aria-label="This review was curated for your skin profile">
                            <i className="ri-user-heart-line text-sm"></i>
                            Curated for You
                          </span>
                        </div>
                        
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 pr-32">
                            <p className="font-semibold text-deep">{review.author}</p>
                            <div className="flex items-center gap-2 text-sm text-warm-gray mt-1">
                              <span>{review.skinType}</span>
                              {review.fitzpatrickType && (
                                <>
                                  <span>•</span>
                                  <span>Fitzpatrick Type {review.fitzpatrickType}</span>
                                </>
                              )}
                            </div>
                            {review.concerns && review.concerns.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {review.concerns.map((concern, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-white px-2 py-1 rounded-full text-warm-gray"
                                  >
                                    {concern}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <StarRating rating={review.rating} size="text-sm" showNumeric />
                        </div>
                        <p className="text-warm-gray leading-relaxed text-sm mb-3">{review.comment}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-blush/50">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleHelpfulClick(review.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                                helpfulReviews.has(review.id)
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-warm-gray hover:bg-cream'
                              } ${animatingReview === review.id ? 'scale-110' : 'scale-100'}`}
                              style={{ transition: 'transform 0.15s ease-out, background-color 0.2s, color 0.2s' }}
                            >
                              <i className={`text-sm ${helpfulReviews.has(review.id) ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'} ${animatingReview === review.id ? 'animate-bounce' : ''}`}></i>
                              <span className="text-xs">Helpful ({getHelpfulCount(review.id, review.helpful)})</span>
                            </button>
                            {reportedReviews.has(review.id) ? (
                              <span className="text-xs text-warm-gray/60 flex items-center gap-1">
                                <i className="ri-flag-fill text-xs"></i>
                                Reported
                              </span>
                            ) : showReportConfirm === review.id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-warm-gray">Report?</span>
                                <button
                                  onClick={() => handleReportReview(review.id)}
                                  className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setShowReportConfirm(null)}
                                  className="text-xs text-warm-gray hover:text-deep cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowReportConfirm(review.id)}
                                className="text-warm-gray/50 hover:text-warm-gray text-xs cursor-pointer"
                                title="Report review"
                              >
                                <i className="ri-flag-line"></i>
                              </button>
                            )}
                          </div>
                          <span className="text-xs text-warm-gray/70">{review.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Other Reviews Section */}
              <div>
                {userProfile && similarProfileReviews.length > 0 && (
                  <h3 className="text-lg font-semibold text-deep mb-4">All Reviews</h3>
                )}
                <div className="space-y-6">
                  {allReviewsCombined.filter(r => !isSimilarSkinReview(r.id)).map((review) => (
                    <div key={review.id} className="border border-blush rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-deep">{review.author}</p>
                          <div className="flex items-center gap-2 text-sm text-warm-gray mt-1">
                            <span>{review.skinType}</span>
                            {review.fitzpatrickType && (
                              <>
                                <span>•</span>
                                <span>Fitzpatrick Type {review.fitzpatrickType}</span>
                              </>
                            )}
                          </div>
                          {review.concerns && review.concerns.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {review.concerns.map((concern, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-cream px-2 py-1 rounded-full text-warm-gray"
                                >
                                  {concern}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <StarRating rating={review.rating} size="text-sm" showNumeric />
                      </div>
                      <p className="text-warm-gray leading-relaxed text-sm mb-3">{review.comment}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-blush/50">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleHelpfulClick(review.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                              helpfulReviews.has(review.id)
                                ? 'bg-primary/10 text-primary'
                                : 'text-warm-gray hover:bg-cream'
                            } ${animatingReview === review.id ? 'scale-110' : 'scale-100'}`}
                            style={{ transition: 'transform 0.15s ease-out, background-color 0.2s, color 0.2s' }}
                          >
                            <i className={`text-sm ${helpfulReviews.has(review.id) ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'} ${animatingReview === review.id ? 'animate-bounce' : ''}`}></i>
                            <span className="text-xs">Helpful ({getHelpfulCount(review.id, review.helpful)})</span>
                          </button>
                          {reportedReviews.has(review.id) ? (
                            <span className="text-xs text-warm-gray/60 flex items-center gap-1">
                              <i className="ri-flag-fill text-xs"></i>
                              Reported
                            </span>
                          ) : showReportConfirm === review.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-warm-gray">Report?</span>
                              <button
                                onClick={() => handleReportReview(review.id)}
                                className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setShowReportConfirm(null)}
                                className="text-xs text-warm-gray hover:text-deep cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowReportConfirm(review.id)}
                              className="text-warm-gray/50 hover:text-warm-gray text-xs cursor-pointer"
                              title="Report review"
                            >
                              <i className="ri-flag-line"></i>
                            </button>
                          )}
                        </div>
                        <span className="text-xs text-warm-gray/70">{review.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-blush/30 bg-cream/30">
              <button
                onClick={() => setShowAllReviewsModal(false)}
                className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-dark transition-colors cursor-pointer whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Review Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-deep/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-5 border-b border-blush/30 flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-deep">Report Review</h3>
              <button
                onClick={() => {
                  setShowReportModal(null);
                  setReportReason('');
                  setReportDetails('');
                }}
                className="text-warm-gray hover:text-deep transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-deep mb-2">Reason for reporting</label>
                <Dropdown
                  id="report-reason"
                  value={reportReason}
                  onChange={(value) => setReportReason(value)}
                  placeholder="Select a reason..."
                  options={[
                    { value: 'spam', label: 'Spam or fake review' },
                    { value: 'inappropriate', label: 'Inappropriate content' },
                    { value: 'misleading', label: 'Misleading information' },
                    { value: 'harassment', label: 'Harassment or bullying' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-deep mb-2">Additional details (optional)</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide more context..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-blush bg-white text-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
            <div className="p-5 border-t border-blush/30 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReportModal(null);
                  setReportReason('');
                  setReportDetails('');
                }}
                className="px-4 py-2 text-warm-gray hover:text-deep transition-colors cursor-pointer text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={!reportReason}
                className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                  reportReason
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blush text-warm-gray cursor-not-allowed'
                }`}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Products Modal */}
      {showAllProductsModal && matchedProducts.length > 0 && (
        <div className="fixed inset-0 bg-deep/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-blush/30">
              <div>
                <h2 className="font-serif text-xl font-semibold text-deep">Products with {ingredient.name}</h2>
                <p className="text-xs text-warm-gray mt-1">{matchedProducts.length} products found</p>
              </div>
              <button
                onClick={() => setShowAllProductsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl text-warm-gray"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-3">
                {matchedProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setShowAllProductsModal(false);
                      navigate(`/product-detail?id=${product.id}`);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-blush/30 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer text-left bg-white"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-deep truncate">{product.name}</p>
                      <p className="text-xs text-warm-gray truncate">{product.brand}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-deep">
                          {priceRange && priceRange.min !== priceRange.max
                            ? `$${priceRange.min} – $${priceRange.max}`
                            : `$${product.price}`}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <i className="ri-star-fill text-xs text-amber-400"></i>
                          <span className="text-xs text-warm-gray">{product.rating}</span>
                        </div>
                        <span className="text-xs text-warm-gray">({product.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-warm-gray">{((product.id % 4) + 2)} retailers</span>
                        <span className="text-xs text-warm-gray">·</span>
                        {product.inStock ? (
                          <span className="text-xs text-primary font-medium">In Stock</span>
                        ) : (
                          <span className="text-xs text-terracotta font-medium">Out of Stock</span>
                        )}
                      </div>
                    </div>
                    <i className="ri-arrow-right-s-line text-lg text-warm-gray/50 flex-shrink-0"></i>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-blush/30 bg-cream/30">
              <button
                onClick={() => setShowAllProductsModal(false)}
                className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-dark transition-colors cursor-pointer whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientDetail;