import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLocalStorageState } from '../../../lib/utils/useLocalStorageState';
import { routineProgressState } from '../../../lib/utils/routineProgressState';
import { getEffectiveSkinType, getEffectiveConcerns } from '../../../lib/utils/sessionState';
import ConflictDetectionPopup from './ConflictDetectionPopup';
import ProductPickerModal from './ProductPickerModal';
import CustomStepModal from './CustomStepModal';

interface Product {
  id: string;
  name: string;
  brand: string;
  image: string;
  category: string;
  purchasedFrom?: string; // Store URL if purchased from marketplace
  purchaseDate?: Date;
  expirationDate?: Date;
  source?: 'discovery' | 'marketplace';
}

interface RoutineStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  timeOfDay: 'morning' | 'evening';
  product?: Product;
  recommended: boolean;
}

// Sortable Step Card Wrapper Component
interface SortableStepCardProps {
  step: RoutineStep;
  index: number;
  isFirst?: boolean;
  children: React.ReactNode;
}

function SortableStepCard({ step, isFirst, children }: SortableStepCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-blush rounded-xl p-3 sm:p-4 hover:border-primary/30 transition-all bg-white relative h-full flex flex-col ${
        isDragging ? 'shadow-2xl ring-2 ring-primary' : ''
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-cream hover:bg-blush flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        title="Drag to reorder"
        {...(isFirst ? { 'data-tutorial': 'first-drag-handle' } : {})}
      >
        <i className="ri-draggable text-warm-gray"></i>
      </div>

      {children}
    </div>
  );
}

const templateSteps: RoutineStep[] = [
  // Morning Routine Steps
  {
    id: 'am-1',
    stepNumber: 1,
    title: 'Cleanser',
    description: 'Start with a gentle cleanser to remove impurities and prepare your skin',
    timeOfDay: 'morning',
    recommended: true,
  },
  {
    id: 'am-2',
    stepNumber: 2,
    title: 'Toner',
    description: 'Balance your skin\'s pH and prep for better absorption',
    timeOfDay: 'morning',
    recommended: false,
  },
  {
    id: 'am-3',
    stepNumber: 3,
    title: 'Serum',
    description: 'Target specific concerns with concentrated active ingredients',
    timeOfDay: 'morning',
    recommended: true,
  },
  {
    id: 'am-4',
    stepNumber: 4,
    title: 'Eye Cream',
    description: 'Nourish the delicate eye area with specialized care',
    timeOfDay: 'morning',
    recommended: false,
  },
  {
    id: 'am-5',
    stepNumber: 5,
    title: 'Moisturizer',
    description: 'Lock in hydration and strengthen your skin barrier',
    timeOfDay: 'morning',
    recommended: true,
  },
  {
    id: 'am-6',
    stepNumber: 6,
    title: 'Sunscreen',
    description: 'Protect your skin from UV damage (SPF 30 or higher)',
    timeOfDay: 'morning',
    recommended: true,
  },
  // Evening Routine Steps
  {
    id: 'pm-1',
    stepNumber: 1,
    title: 'Cleanser',
    description: 'Remove makeup, sunscreen, and daily buildup with a thorough cleanse',
    timeOfDay: 'evening',
    recommended: true,
  },
  {
    id: 'pm-2',
    stepNumber: 2,
    title: 'Toner',
    description: 'Balance your skin\'s pH and prep for nighttime treatments',
    timeOfDay: 'evening',
    recommended: false,
  },
  {
    id: 'pm-3',
    stepNumber: 3,
    title: 'Serum',
    description: 'Apply treatment serums while your skin repairs overnight',
    timeOfDay: 'evening',
    recommended: true,
  },
  {
    id: 'pm-4',
    stepNumber: 4,
    title: 'Eye Cream',
    description: 'Nourish the delicate eye area while you sleep',
    timeOfDay: 'evening',
    recommended: false,
  },
  {
    id: 'pm-5',
    stepNumber: 5,
    title: 'Moisturizer',
    description: 'Lock in hydration to support overnight skin repair',
    timeOfDay: 'evening',
    recommended: true,
  },
  {
    id: 'pm-6',
    stepNumber: 6,
    title: 'Night Treatment',
    description: 'Apply targeted treatments like retinol or sleeping masks',
    timeOfDay: 'evening',
    recommended: false,
  },
  {
    id: 'pm-7',
    stepNumber: 7,
    title: 'Facial Oil',
    description: 'Nourish and seal in moisture with botanical oils',
    timeOfDay: 'evening',
    recommended: false,
  },
  {
    id: 'pm-8',
    stepNumber: 8,
    title: 'Night Cream',
    description: 'Rich moisturizer to support overnight repair',
    timeOfDay: 'evening',
    recommended: false,
  },
];

const savedProducts: Product[] = [
  {
    id: '1',
    name: 'Gentle Hydrating Cleanser',
    brand: 'Pure Essence',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
    category: 'Cleanser',
    purchasedFrom: 'https://example.com/store',
    purchaseDate: new Date('2024-01-10'),
    expirationDate: new Date('2025-01-10'),
    source: 'marketplace',
  },
  {
    id: '2',
    name: 'Vitamin C Brightening Serum',
    brand: 'Glow Naturals',
    image: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=300&h=300&fit=crop',
    category: 'Serum',
    purchasedFrom: 'https://example.com/store',
    purchaseDate: new Date('2024-01-05'),
    expirationDate: new Date('2024-07-05'),
    source: 'discovery',
  },
  {
    id: '3',
    name: 'Deep Hydration Moisturizer',
    brand: 'Skin Harmony',
    image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=300&h=300&fit=crop',
    category: 'Moisturizer',
    purchaseDate: new Date('2023-12-20'),
    expirationDate: new Date('2024-12-20'),
    source: 'discovery',
  },
  {
    id: '4',
    name: 'Mineral Sunscreen SPF 50',
    brand: 'Clarity Labs',
    image: 'https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?w=300&h=300&fit=crop',
    category: 'Sunscreen',
    purchasedFrom: 'https://example.com/store',
    purchaseDate: new Date('2024-01-15'),
    expirationDate: new Date('2025-06-15'),
    source: 'marketplace',
  },
];

interface RoutineBuilderProps {
  steps?: any[];
  onAddStep?: (step: any) => void;
  onRemoveStep?: (stepId: string) => void;
  onReorderSteps?: (steps: any[]) => void;
  onSave?: () => void;
  onBrowseClick?: () => void;
}

// FIX #4a: Added onSave to destructured props
export default function RoutineBuilder({ onBrowseClick, onSave }: RoutineBuilderProps) {
  const navigate = useNavigate();

  // Initialize time filter - default to morning
  const [timeFilter, setTimeFilter] = useLocalStorageState<'morning' | 'evening'>(
    'routine_builder_time_filter',
    'morning'
  );
  const [routineSteps, setRoutineSteps] = useState<RoutineStep[]>(templateSteps);

  // Check for unfinished session on mount and restore if needed
  useEffect(() => {
    const progress = routineProgressState.getProgress();
    if (progress.hasUnfinishedSession && progress.lastTimeFilter) {
      setTimeFilter(progress.lastTimeFilter);
    }
  }, []);
  const [showProductSelector, setShowProductSelector] = useState<string | null>(null);
  const [showConflictPopup, setShowConflictPopup] = useState(false);
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [browseCategory, setBrowseCategory] = useState('');
  const [browseStepId, setBrowseStepId] = useState<string | null>(null);
  const [showCustomStepModal, setShowCustomStepModal] = useState(false);

  // Get user's skin profile for keyword highlighting
  const userSkinType = getEffectiveSkinType();
  const userConcerns = getEffectiveConcerns();

  // Generate tailored tips based on user's skin profile and routine
  const proTips = useMemo(() => {
    // Basic tips everyone gets
    const basicTips = [
      "Wait 30-60 seconds between each step for better absorption",
      "Apply products from thinnest to thickest consistency",
      "Introduce new products one at a time to monitor reactions",
      "Check expiration dates regularly and replace expired products",
      "Cleanse for at least 60 seconds to properly remove impurities",
      "Pat, don't rub, products into your skin for better absorption",
      "Consistency beats perfection - a simple routine done daily works best",
    ];

    // Morning-specific tips
    const morningTips = timeFilter === 'morning' ? [
      "Always use sunscreen as your final morning step",
      "Vitamin C works best in the morning to protect against environmental damage",
      "Reapply sunscreen every 2 hours when exposed to direct sunlight",
      "A lighter moisturizer works better under makeup and sunscreen",
    ] : [];

    // Evening-specific tips
    const eveningTips = timeFilter === 'evening' ? [
      "Double cleanse at night to remove sunscreen and makeup thoroughly",
      "Retinol and AHAs work best at night when skin is in repair mode",
      "Apply eye cream with your ring finger for the gentlest touch",
      "Let your skin rest - not every night needs actives",
      "Night is the best time for heavier, more nourishing products",
    ] : [];

    // Skin type specific tips
    const skinTypeTips: Record<string, string[]> = {
      'dry': [
        "Layer hydrating products - toner, serum, then moisturizer for dry skin",
        "Look for hyaluronic acid and ceramides to boost hydration",
        "Avoid hot water when cleansing - it strips natural oils",
        "Consider a facial oil as your last step to lock in moisture",
      ],
      'oily': [
        "Don't skip moisturizer - dehydrated oily skin produces more oil",
        "Use a gentle foaming cleanser to control excess sebum",
        "Niacinamide helps regulate oil production and minimize pores",
        "Blotting papers are your friend for midday shine control",
      ],
      'combination': [
        "Apply richer products to dry areas, lighter ones to oily zones",
        "Your T-zone and cheeks may need different products",
        "Gel-cream moisturizers work well for combination skin",
      ],
      'sensitive': [
        "Patch test new products on your inner arm before applying to face",
        "Fragrance-free products are gentler on sensitive skin",
        "Centella asiatica and aloe vera are great soothing ingredients",
        "Less is more - keep your routine simple to avoid irritation",
      ],
      'normal': [
        "Focus on prevention and maintenance with antioxidants",
        "Your skin is balanced - don't overcomplicate your routine",
      ],
    };

    // Concern-specific tips
    const concernTips: Record<string, string[]> = {
      'acne': [
        "Don't pick or pop pimples - it can lead to scarring",
        "Salicylic acid helps unclog pores and prevent breakouts",
        "Change your pillowcase frequently to reduce bacteria",
        "Non-comedogenic products won't clog your pores",
      ],
      'aging': [
        "Retinol is the gold standard for anti-aging - start slow",
        "Peptides help stimulate collagen production",
        "Don't forget your neck and hands - they show age too",
        "SPF is the best anti-aging product you can use",
      ],
      'hyperpigmentation': [
        "Vitamin C and niacinamide help fade dark spots over time",
        "Always wear SPF - sun exposure worsens pigmentation",
        "Alpha arbutin is a gentle alternative for brightening",
        "Be patient - fading dark spots takes 3-6 months",
      ],
      'dryness': [
        "Apply products to damp skin to lock in more hydration",
        "Humectants like glycerin draw moisture into skin",
        "Occlusive ingredients like squalane prevent water loss",
      ],
      'dullness': [
        "Exfoliate 1-2 times weekly to reveal brighter skin",
        "Vitamin C in the morning gives you that glow",
        "Hydration is key - dehydrated skin looks dull",
      ],
      'texture': [
        "AHAs like glycolic acid smooth skin texture over time",
        "Retinoids help with cell turnover for smoother skin",
        "Don't over-exfoliate - it can worsen texture issues",
      ],
      'pores': [
        "Niacinamide helps minimize the appearance of pores",
        "Clay masks once a week can help deep clean pores",
        "BHAs penetrate pores to clear out buildup",
      ],
    };

    // Build personalized tips array
    const personalizedTips: string[] = [];

    // Add skin type tips
    if (userSkinType) {
      const skinLower = userSkinType.toLowerCase();
      Object.entries(skinTypeTips).forEach(([key, tips]) => {
        if (skinLower.includes(key)) {
          personalizedTips.push(...tips);
        }
      });
    }

    // Add concern tips
    userConcerns.forEach(concern => {
      const concernLower = concern.toLowerCase();
      Object.entries(concernTips).forEach(([key, tips]) => {
        if (concernLower.includes(key) || key.includes(concernLower)) {
          personalizedTips.push(...tips);
        }
      });
    });

    // Combine all tips: basic + time-specific + personalized
    const allTips = [...basicTips, ...morningTips, ...eveningTips, ...personalizedTips];

    // Remove duplicates and shuffle
    const uniqueTips = [...new Set(allTips)];
    return uniqueTips.sort(() => Math.random() - 0.5);
  }, [userSkinType, userConcerns, timeFilter]);

  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [tipFading, setTipFading] = useState(false);

  // Cycle through tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipFading(true);
      setTimeout(() => {
        setCurrentTipIndex(prev => (prev + 1) % proTips.length);
        setTipFading(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [proTips.length]);

  // Helper to highlight keywords in custom step descriptions
  const highlightKeywords = (text: string, isCustomStep: boolean): React.ReactNode => {
    if (!isCustomStep || (!userSkinType && userConcerns.length === 0)) {
      return text;
    }

    // Build keywords from user profile
    const keywords: string[] = [];
    if (userSkinType) keywords.push(userSkinType.toLowerCase());
    userConcerns.forEach(c => keywords.push(c.toLowerCase()));

    // Common skincare keywords that might match
    const skinKeywords: Record<string, string[]> = {
      'dry': ['hydration', 'moisture', 'nourishing', 'hydrating', 'dry'],
      'oily': ['oil', 'sebum', 'shine', 'pores', 'oily', 'mattifying'],
      'combination': ['balance', 'combination', 'zone'],
      'sensitive': ['gentle', 'soothing', 'calming', 'sensitive', 'irritation'],
      'acne': ['breakouts', 'blemishes', 'acne', 'spots', 'pores'],
      'aging': ['wrinkles', 'fine lines', 'aging', 'firmness', 'elasticity'],
      'dullness': ['brightness', 'radiance', 'glow', 'dullness', 'luminosity'],
      'texture': ['texture', 'smooth', 'rough', 'uneven'],
      'hyperpigmentation': ['dark spots', 'hyperpigmentation', 'discoloration', 'tone'],
      'hydration': ['hydration', 'moisture', 'plumping', 'dehydration'],
    };

    // Expand keywords based on user profile
    const expandedKeywords: string[] = [...keywords];
    keywords.forEach(keyword => {
      Object.entries(skinKeywords).forEach(([key, values]) => {
        if (keyword.includes(key) || key.includes(keyword)) {
          expandedKeywords.push(...values);
        }
      });
    });

    const uniqueKeywords = [...new Set(expandedKeywords)].filter(k => k.length > 2);
    if (uniqueKeywords.length === 0) return text;

    // Create regex pattern
    const pattern = new RegExp(`(${uniqueKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = text.split(pattern);

    return parts.map((part, index) => {
      const isMatch = uniqueKeywords.some(k => k.toLowerCase() === part.toLowerCase());
      if (isMatch) {
        return (
          <span key={index} className="text-primary font-medium bg-primary/10 px-1 rounded">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Mock conflict count - in real app this would come from conflict detection logic
  const conflictCount = 2;

  // Feature 2: Routine Completion Tracker with daily reset
  const [completedSteps, setCompletedSteps] = useLocalStorageState<{
    morning: string[];
    evening: string[];
    morningFilledCount: number;
    eveningFilledCount: number;
    lastResetDate: string;
  }>('routine_completion_tracker', {
    morning: [],
    evening: [],
    morningFilledCount: 0,
    eveningFilledCount: 0,
    lastResetDate: new Date().toDateString()
  });

  // Reset completed steps at midnight (new day)
  useEffect(() => {
    const today = new Date().toDateString();
    if (completedSteps.lastResetDate !== today) {
      setCompletedSteps({
        morning: [],
        evening: [],
        morningFilledCount: completedSteps.morningFilledCount || 0,
        eveningFilledCount: completedSteps.eveningFilledCount || 0,
        lastResetDate: today
      });
    }
  }, [completedSteps.lastResetDate, setCompletedSteps]);

  // Update filled counts whenever routine steps change
  useEffect(() => {
    const morningSteps = routineSteps.filter(s => s.timeOfDay === 'morning');
    const eveningSteps = routineSteps.filter(s => s.timeOfDay === 'evening');
    const morningFilled = morningSteps.filter(s => s.product).length;
    const eveningFilled = eveningSteps.filter(s => s.product).length;

    if (morningFilled !== completedSteps.morningFilledCount || eveningFilled !== completedSteps.eveningFilledCount) {
      setCompletedSteps(prev => ({
        ...prev,
        morningFilledCount: morningFilled,
        eveningFilledCount: eveningFilled
      }));
    }
  }, [routineSteps]);

  // State for save confirmation toast
  const [saveConfirmation, setSaveConfirmation] = useState<{
    visible: boolean;
    routineType: 'morning' | 'evening';
  } | null>(null);

  const filteredSteps = routineSteps.filter(
    step => step.timeOfDay === timeFilter
  );

  // Count filled steps for summary
  const filledStepsCount = filteredSteps.filter(s => s.product).length;

  // Count completed steps for current time filter
  const completedStepsCount = timeFilter === 'morning'
    ? completedSteps.morning.length
    : completedSteps.evening.length;

  const isStepCompleted = (stepId: string) => {
    return timeFilter === 'morning'
      ? completedSteps.morning.includes(stepId)
      : completedSteps.evening.includes(stepId);
  };

  const toggleStepCompletion = (stepId: string) => {
    const key = timeFilter;
    const current = completedSteps[key];
    const updated = current.includes(stepId)
      ? current.filter(id => id !== stepId)
      : [...current, stepId];
    setCompletedSteps({ ...completedSteps, [key]: updated });

    // Track last interacted step for resume functionality
    const stepIndex = filteredSteps.findIndex(s => s.id === stepId);
    if (stepIndex >= 0) {
      routineProgressState.setLastStep(stepIndex, timeFilter);
    }
  };

  // DnD Kit sensors for mouse/touch/keyboard support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activation
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Touch delay to prevent accidental drags
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Get step IDs for SortableContext
  const stepIds = useMemo(() => filteredSteps.map(step => step.id), [filteredSteps]);

  // Handle drag end - reorder steps
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = routineSteps.findIndex(step => step.id === active.id);
      const newIndex = routineSteps.findIndex(step => step.id === over.id);
      const newOrder = arrayMove(routineSteps, oldIndex, newIndex);
      setRoutineSteps(newOrder);
    }
  };

  const handleAddProduct = (stepId: string, product: Product) => {
    setRoutineSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, product } : step
      )
    );
    setShowProductSelector(null);

    // Track last interacted step for resume functionality
    const stepIndex = filteredSteps.findIndex(s => s.id === stepId);
    if (stepIndex >= 0) {
      routineProgressState.setLastStep(stepIndex, timeFilter);
    }
  };

  const handleRemoveProduct = (stepId: string) => {
    setRoutineSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, product: undefined } : step
      )
    );
  };

  const handleProductClick = (product: Product) => {
    navigate('/product-detail', { state: { product } });
  };

  const handlePurchaseAgain = (product: Product) => {
    if (product.purchasedFrom) {
      window.open(product.purchasedFrom, '_blank');
    }
  };

  const handleBrowseProducts = (category: string) => {
    setBrowseCategory(category);
    setShowBrowseModal(true);
  };

  const handleBrowseForStep = (stepId: string, category: string) => {
    setBrowseStepId(stepId);
    setBrowseCategory(category);
    setShowBrowseModal(true);
  };

  const handleBrowseProductSelect = (product: any) => {
    if (browseStepId) {
      handleAddProduct(browseStepId, product);
      setBrowseStepId(null);
    }
    setShowBrowseModal(false);
  };

  // Handle save with confirmation
  const handleSaveWithConfirmation = () => {
    // Call the parent's onSave
    if (onSave) {
      onSave();
    }

    // Mark session as complete (routine saved)
    routineProgressState.markSessionComplete();

    // Show confirmation toast
    setSaveConfirmation({
      visible: true,
      routineType: timeFilter,
    });

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setSaveConfirmation(null);
    }, 4000);
  };

  const getExpirationStatus = (expirationDate?: Date) => {
    if (!expirationDate) return null;

    const now = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) {
      return {
        status: 'expired',
        color: 'text-red-600 bg-red-50',
        text: 'Expired',
        icon: 'ri-error-warning-line',
        tooltip: 'This product has expired. Replace it to avoid skin irritation or reduced effectiveness.'
      };
    } else if (daysUntilExpiration <= 30) {
      return {
        status: 'expiring-soon',
        color: 'text-amber-600 bg-amber-50',
        text: `Expires in ${daysUntilExpiration} days`,
        icon: 'ri-time-line',
        tooltip: 'This product is expiring soon. Consider reordering to avoid running out.'
      };
    } else if (daysUntilExpiration <= 90) {
      return {
        status: 'valid',
        color: 'text-blue-600 bg-blue-50',
        text: `Expires in ${Math.ceil(daysUntilExpiration / 30)} months`,
        icon: 'ri-calendar-line',
        tooltip: 'This product is still good to use. We\'ll remind you when it\'s time to reorder.'
      };
    }
    return {
      status: 'fresh',
      color: 'text-sage bg-sage/10',
      text: 'Fresh',
      icon: 'ri-checkbox-circle-line',
      tooltip: 'This product is fresh and at peak effectiveness.'
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-deep mb-2">
            Build Your Routine
          </h2>
          <p className="text-warm-gray text-sm">
            Drag to reorder steps, add products, and customize your perfect routine
          </p>
        </div>

        {/* Time Filter + Conflict Indicator */}
        <div className="flex items-start gap-3">
          {/* Conflict Indicator Button */}
          <button
            onClick={() => setShowConflictPopup(true)}
            className={`self-start mt-1 relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              conflictCount > 0
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'bg-sage/10 text-sage hover:bg-sage/20'
            }`}
            title={conflictCount > 0 ? `${conflictCount} ingredient conflicts detected` : 'No conflicts detected'}
            aria-label={`View ingredient conflicts. ${conflictCount} conflicts found.`}
          >
            <i className={conflictCount > 0 ? 'ri-error-warning-line' : 'ri-shield-check-line'}></i>
            <span className="hidden sm:inline">
              {conflictCount > 0 ? 'Conflicts' : 'No Conflicts'}
            </span>
            {conflictCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 bg-primary text-white text-xs font-bold rounded-full">
                {conflictCount}
              </span>
            )}
          </button>

          {/* Time Filter */}
          <div className="flex flex-col items-start lg:items-end gap-1">
            <div className="flex bg-cream rounded-full p-1">
              <button
                onClick={() => setTimeFilter('morning')}
                title="Show only morning routine steps (cleansing, SPF, etc.)"
                className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  timeFilter === 'morning'
                    ? 'bg-white text-deep shadow-sm'
                    : 'text-warm-gray hover:text-deep'
                }`}
              >
                <i className="ri-sun-line mr-1 sm:mr-2"></i>
                <span className="hidden sm:inline">Morning</span>
                <span className="sm:hidden">AM</span>
              </button>
              <button
                onClick={() => setTimeFilter('evening')}
                title="Show only evening routine steps (treatments, retinol, etc.)"
                className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  timeFilter === 'evening'
                    ? 'bg-white text-deep shadow-sm'
                    : 'text-warm-gray hover:text-deep'
                }`}
              >
                <i className="ri-moon-line mr-1 sm:mr-2"></i>
                <span className="hidden sm:inline">Evening</span>
                <span className="sm:hidden">PM</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Routine Type Header */}
      <div className="mb-6 text-center py-4">
        <h3 className="text-2xl font-serif font-bold text-deep flex items-center justify-center gap-3">
          {timeFilter === 'morning' ? (
            <>
              <i className="ri-sun-line text-amber-500 text-3xl"></i>
              Morning Routine
            </>
          ) : (
            <>
              <i className="ri-moon-line text-indigo-500 text-3xl"></i>
              Evening Routine
            </>
          )}
        </h3>
        <p className="text-warm-gray text-sm mt-2">
          {filteredSteps.length} steps in your {timeFilter} routine
          {filledStepsCount > 0 && (
            <span className="text-primary font-medium"> • {filledStepsCount} products added</span>
          )}
        </p>
      </div>

      {/* Vertical Routine Steps with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="routine-steps-container max-w-5xl mx-auto mb-8 px-3 sm:px-4 py-4 sm:py-6 bg-primary/5 rounded-xl">
          <SortableContext items={stepIds} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {filteredSteps.map((step, index) => (
                  <SortableStepCard key={step.id} step={step} index={index} isFirst={index === 0}>
                    {/* Mark as Done Toggle */}
                    {step.product && (
                      <button
                        onClick={() => toggleStepCompletion(step.id)}
                        className={`absolute top-2 left-2 sm:top-3 sm:left-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isStepCompleted(step.id)
                            ? 'bg-sage text-white'
                            : 'bg-cream text-warm-gray hover:bg-blush'
                        }`}
                        title={isStepCompleted(step.id) ? 'Mark as not done' : 'Mark as done'}
                      >
                        <i className={isStepCompleted(step.id) ? 'ri-check-line' : 'ri-checkbox-blank-circle-line'}></i>
                      </button>
                    )}

                    {/* Delete button for all steps */}
                    <button
                      onClick={() => setRoutineSteps(prev => prev.filter(s => s.id !== step.id))}
                      className="absolute top-2 right-10 sm:top-3 sm:right-14 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-cream text-warm-gray hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-all cursor-pointer z-10"
                      title="Remove step"
                    >
                      <i className="ri-close-line text-sm sm:text-base"></i>
                    </button>

                    {/* Step Number & Title */}
                    <div className="flex flex-col items-center text-center mb-2 sm:mb-3 pt-4 sm:pt-6">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mb-2">
                        {index + 1}
                      </div>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-deep">
                        {step.id.startsWith('custom-') ? highlightKeywords(step.title, true) : step.title}
                      </h3>
                      {step.recommended && (
                        <span
                          className="mt-1 px-2 py-0.5 bg-light/20 text-primary text-xs font-medium rounded-full whitespace-nowrap cursor-help"
                          title="This step is essential for most skin types and recommended by dermatologists"
                        >
                          Recommended
                        </span>
                      )}
                    </div>

                <p className="text-warm-gray text-xs mb-3 text-center">
                      {highlightKeywords(step.description, step.id.startsWith('custom-'))}
                    </p>

                {/* Product Display or Add Button */}
                {step.product ? (
                  <div className="bg-cream rounded-lg p-2 sm:p-4 relative mt-auto">
                    {/* Remove Product X Button */}
                    <button
                      onClick={() => handleRemoveProduct(step.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-blush text-warm-gray hover:bg-red-50 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition-all cursor-pointer z-10 shadow-sm"
                      title="Remove product"
                    >
                      <i className="ri-close-line text-sm"></i>
                    </button>
                    <div className="flex flex-col gap-3 mb-3">
                      <div
                        className="w-full h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleProductClick(step.product!)}
                      >
                        <img
                          src={step.product.image}
                          alt={step.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-warm-gray/80 mb-1">{step.product.brand}</p>
                        <h4
                          className="font-medium text-deep mb-2 cursor-pointer hover:underline text-sm line-clamp-2"
                          onClick={() => handleProductClick(step.product!)}
                        >
                          {step.product.name}
                        </h4>
                        <button
                            onClick={() => handleProductClick(step.product!)}
                            className="text-xs sm:text-sm text-primary hover:underline font-medium cursor-pointer"
                          >
                            View Details →
                          </button>
                      </div>
                    </div>

                    {/* Expiration Date & Purchase Info */}
                    <div className="pt-3 border-t border-blush space-y-2">
                      {step.product.expirationDate && (
                        <div>
                          {(() => {
                            const expStatus = getExpirationStatus(step.product!.expirationDate);
                            return expStatus ? (
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium cursor-help ${expStatus.color}`}
                                title={expStatus.tooltip}
                              >
                                <i className={expStatus.icon}></i>
                                {expStatus.text}
                              </span>
                            ) : null;
                          })()}
                        </div>
                      )}
                      {step.product.purchaseDate && (
                        <p className="text-xs text-warm-gray/80">
                          <i className="ri-shopping-bag-line mr-1"></i>
                          Purchased {step.product.purchaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                      {step.product.purchasedFrom && (
                        <button
                          onClick={() => handlePurchaseAgain(step.product!)}
                          className="w-full flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors text-xs sm:text-sm font-medium cursor-pointer"
                        >
                          <i className="ri-refresh-line"></i>
                          <span className="hidden xs:inline">Purchase Again</span>
                          <span className="xs:hidden">Reorder</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 mt-auto">
                    <button
                      onClick={() => handleBrowseForStep(step.id, step.title)}
                      className="w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors text-xs font-medium cursor-pointer"
                      title="Browse and add products for this step"
                    >
                      <i className="ri-search-line mr-1"></i>
                      Browse Products
                    </button>
                  </div>
                )}
                  </SortableStepCard>
                ))}

                {/* Add Custom Step Button Card */}
                <div
                  className="group border-2 border-dashed border-primary/40 rounded-xl p-6 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center text-center"
                  onClick={() => setShowCustomStepModal(true)}
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <i className="ri-add-line text-3xl text-primary group-hover:scale-110 transition-transform"></i>
                  </div>
                  <h4 className="font-serif text-xl font-bold text-deep mb-2">+ Add Custom Step</h4>
                  <p className="text-warm-gray text-sm mb-3">
                    For products that don't fit the standard steps
                  </p>

                  {/* Examples of custom steps */}
                  <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                    {['Essence', 'Face Mist', 'Sheet Mask', 'Spot Treatment'].map((example) => (
                      <span key={example} className="px-2 py-0.5 bg-blush/50 text-warm-gray text-xs rounded-full">
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </SortableContext>
          </div>
      </DndContext>

      {/* Tips Section - Rotating Tips */}
      <div className="p-4 bg-gradient-to-r from-cream to-white rounded-xl mb-8 border border-blush/50">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-primary uppercase tracking-wide mb-1 block">Pro Tip</span>
            <p
              className={`text-sm text-warm-gray transition-all duration-500 ${
                tipFading ? 'opacity-0 transform -translate-y-1' : 'opacity-100 transform translate-y-0'
              }`}
            >
              {proTips[currentTipIndex]}
            </p>
          </div>
          <button
            onClick={() => {
              setTipFading(true);
              setTimeout(() => {
                setCurrentTipIndex(prev => (prev + 1) % proTips.length);
                setTipFading(false);
              }, 200);
            }}
            className="w-8 h-8 rounded-full bg-white border border-blush hover:border-primary/30 flex items-center justify-center text-warm-gray hover:text-primary transition-all cursor-pointer flex-shrink-0"
            title="Next tip"
          >
            <i className="ri-arrow-right-s-line text-lg"></i>
          </button>
        </div>
      </div>

      {/* Today's Completion Progress */}
      {filledStepsCount > 0 && (
        <div className="mb-6 p-4 bg-sage/10 rounded-xl border border-sage/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-deep flex items-center gap-2">
              <i className="ri-calendar-check-line text-sage"></i>
              Today's {timeFilter === 'morning' ? 'Morning' : 'Evening'} Progress
            </h4>
            <span className="text-sm font-medium text-sage">
              {completedStepsCount} / {filledStepsCount} done
            </span>
          </div>
          <div className="h-2 bg-sage/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage rounded-full transition-all duration-500"
              style={{ width: `${filledStepsCount > 0 ? (completedStepsCount / filledStepsCount) * 100 : 0}%` }}
            ></div>
          </div>
          {completedStepsCount === filledStepsCount && filledStepsCount > 0 && (
            <p className="text-xs text-sage mt-2 flex items-center gap-1">
              <i className="ri-check-double-line"></i>
              All steps completed! Great job staying consistent.
            </p>
          )}
        </div>
      )}

      {/* Save Confirmation Toast */}
      {saveConfirmation && (
        <div
          className={`fixed top-24 right-6 z-50 transition-all duration-300 transform ${
            saveConfirmation.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
          role="status"
          aria-live="polite"
          aria-label={`${saveConfirmation.routineType === 'morning' ? 'Morning routine' : 'Evening routine'} saved successfully`}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-blush/50 p-5 min-w-[320px] max-w-[400px]">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                saveConfirmation.routineType === 'morning'
                  ? 'bg-amber-100'
                  : 'bg-indigo-100'
              }`}>
                <i className={`text-2xl ${
                  saveConfirmation.routineType === 'morning'
                    ? 'ri-sun-line text-amber-600'
                    : 'ri-moon-line text-indigo-600'
                }`}></i>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-serif text-lg font-semibold text-deep">
                    {saveConfirmation.routineType === 'morning'
                      ? 'Morning Routine Saved'
                      : 'Evening Routine Saved'}
                  </h4>
                  <button
                    onClick={() => setSaveConfirmation(null)}
                    className="text-warm-gray/50 hover:text-warm-gray cursor-pointer transition-colors p-1 -m-1"
                    aria-label="Dismiss notification"
                  >
                    <i className="ri-close-line text-lg"></i>
                  </button>
                </div>
                <p className="text-sm text-warm-gray leading-relaxed">
                  {saveConfirmation.routineType === 'morning'
                    ? 'Your morning routine is ready to help you start the day with glowing skin.'
                    : 'Your evening routine is set to work its magic while you rest.'}
                </p>
                <div className="mt-3 pt-3 border-t border-blush/30">
                  <p className="text-xs text-warm-gray/70 flex items-center gap-1">
                    <i className="ri-lightbulb-line"></i>
                    {saveConfirmation.routineType === 'morning'
                      ? 'Tip: Consistency is key — try to follow your routine daily.'
                      : 'Tip: Apply products on clean, slightly damp skin for better absorption.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Detection Popup */}
      <ConflictDetectionPopup
        isOpen={showConflictPopup}
        onClose={() => setShowConflictPopup(false)}
        conflictCount={conflictCount}
      />

      {/* Product Browse Modal */}
      <ProductPickerModal
        isOpen={showBrowseModal}
        onClose={() => {
          setShowBrowseModal(false);
          setBrowseStepId(null);
        }}
        category={browseCategory}
        onSelectProduct={handleBrowseProductSelect}
        savedProducts={savedProducts}
      />

      {/* Custom Step Modal */}
      <CustomStepModal
        isOpen={showCustomStepModal}
        onClose={() => setShowCustomStepModal(false)}
        onSelectCategory={(category) => {
          const newStepId = `custom-${Date.now()}`;
          const currentSteps = routineSteps.filter(s => s.timeOfDay === timeFilter);
          const newStep: RoutineStep = {
            id: newStepId,
            stepNumber: currentSteps.length + 1,
            title: category.name,
            description: category.description,
            timeOfDay: timeFilter,
            recommended: false,
          };
          setRoutineSteps(prev => [...prev, newStep]);
          setShowCustomStepModal(false);
          // Open browse modal for the new step
          setBrowseCategory(category.name);
          setBrowseStepId(newStepId);
          setShowBrowseModal(true);
        }}
      />
    </div>
  );
}
