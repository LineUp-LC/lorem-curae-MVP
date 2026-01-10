import { useState, useMemo } from 'react';
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
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Product {
  id: string;
  name: string;
  brand: string;
  image: string;
  category: string;
  purchasedFrom?: string; // Store URL if purchased from marketplace
  purchaseDate?: Date;
  expirationDate?: Date;
}

interface RoutineStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  timeOfDay: 'morning' | 'evening' | 'both';
  product?: Product;
  recommended: boolean;
}

// Sortable Step Card Wrapper Component
interface SortableStepCardProps {
  step: RoutineStep;
  index: number;
  children: React.ReactNode;
}

function SortableStepCard({ step, children }: SortableStepCardProps) {
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
    width: '380px',
    flexShrink: 0,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-blush rounded-xl p-6 hover:border-primary/30 transition-all bg-white relative ${
        isDragging ? 'shadow-2xl ring-2 ring-primary' : ''
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-cream hover:bg-blush flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        title="Drag to reorder"
      >
        <i className="ri-draggable text-warm-gray"></i>
      </div>

      {children}
    </div>
  );
}

const templateSteps: RoutineStep[] = [
  {
    id: '1',
    stepNumber: 1,
    title: 'Cleanser',
    description: 'Start with a gentle cleanser to remove impurities and prepare your skin',
    timeOfDay: 'both',
    recommended: true,
  },
  {
    id: '2',
    stepNumber: 2,
    title: 'Toner',
    description: 'Balance your skin\'s pH and prep for better absorption',
    timeOfDay: 'both',
    recommended: false,
  },
  {
    id: '3',
    stepNumber: 3,
    title: 'Serum',
    description: 'Target specific concerns with concentrated active ingredients',
    timeOfDay: 'both',
    recommended: true,
  },
  {
    id: '4',
    stepNumber: 4,
    title: 'Eye Cream',
    description: 'Nourish the delicate eye area with specialized care',
    timeOfDay: 'both',
    recommended: false,
  },
  {
    id: '5',
    stepNumber: 5,
    title: 'Moisturizer',
    description: 'Lock in hydration and strengthen your skin barrier',
    timeOfDay: 'both',
    recommended: true,
  },
  {
    id: '6',
    stepNumber: 6,
    title: 'Sunscreen',
    description: 'Protect your skin from UV damage (SPF 30 or higher)',
    timeOfDay: 'morning',
    recommended: true,
  },
  {
    id: '7',
    stepNumber: 7,
    title: 'Night Treatment',
    description: 'Apply targeted treatments like retinol or sleeping masks',
    timeOfDay: 'evening',
    recommended: false,
  },
  {
    id: '9',
    stepNumber: 9,
    title: 'Facial Oil',
    description: 'Nourish and seal in moisture with botanical oils',
    timeOfDay: 'evening',
    recommended: false,
  },
  {
    id: '10',
    stepNumber: 10,
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
    image: 'https://readdy.ai/api/search-image?query=minimalist%20white%20bottle%20gentle%20hydrating%20facial%20cleanser%20on%20clean%20white%20surface%20with%20water%20droplets%20soft%20natural%20lighting%20product%20photography&width=300&height=300&seq=routine-cleanser-1&orientation=squarish',
    category: 'Cleanser',
    purchasedFrom: 'https://example.com/store',
    purchaseDate: new Date('2024-01-10'),
    expirationDate: new Date('2025-01-10'),
  },
  {
    id: '2',
    name: 'Vitamin C Brightening Serum',
    brand: 'Glow Naturals',
    image: 'https://readdy.ai/api/search-image?query=elegant%20amber%20glass%20dropper%20bottle%20vitamin%20c%20serum%20on%20white%20marble%20surface%20with%20orange%20slices%20soft%20lighting%20minimalist%20product%20photography&width=300&height=300&seq=routine-serum-1&orientation=squarish',
    category: 'Serum',
    purchasedFrom: 'https://example.com/store',
    purchaseDate: new Date('2024-01-05'),
    expirationDate: new Date('2024-07-05'),
  },
  {
    id: '3',
    name: 'Deep Hydration Moisturizer',
    brand: 'Skin Harmony',
    image: 'https://readdy.ai/api/search-image?query=luxurious%20white%20jar%20moisturizer%20cream%20on%20clean%20surface%20with%20green%20leaves%20soft%20natural%20lighting%20minimalist%20skincare%20photography&width=300&height=300&seq=routine-moisturizer-1&orientation=squarish',
    category: 'Moisturizer',
    purchaseDate: new Date('2023-12-20'),
    expirationDate: new Date('2024-12-20'),
  },
  {
    id: '4',
    name: 'Mineral Sunscreen SPF 50',
    brand: 'Clarity Labs',
    image: 'https://readdy.ai/api/search-image?query=modern%20white%20tube%20sunscreen%20spf%2050%20on%20beach%20sand%20with%20blue%20sky%20background%20clean%20product%20photography%20natural%20lighting&width=300&height=300&seq=routine-sunscreen-1&orientation=squarish',
    category: 'Sunscreen',
    purchasedFrom: 'https://example.com/store',
    purchaseDate: new Date('2024-01-15'),
    expirationDate: new Date('2025-06-15'),
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
  const [timeFilter, setTimeFilter] = useState<'morning' | 'evening' | 'both'>('both');
  const [routineSteps, setRoutineSteps] = useState<RoutineStep[]>(templateSteps);
  const [showProductSelector, setShowProductSelector] = useState<string | null>(null);

  const filteredSteps = routineSteps.filter(
    step => timeFilter === 'both' || step.timeOfDay === timeFilter || step.timeOfDay === 'both'
  );

  // Count filled steps for summary
  const filledStepsCount = filteredSteps.filter(s => s.product).length;

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
    if (onBrowseClick) {
      onBrowseClick();
    } else {
      navigate('/discover', { state: { filterCategory: category } });
    }
  };

  const getExpirationStatus = (expirationDate?: Date) => {
    if (!expirationDate) return null;
    
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) {
      return { status: 'expired', color: 'text-red-600 bg-red-50', text: 'Expired', icon: 'ri-error-warning-line' };
    } else if (daysUntilExpiration <= 30) {
      return { status: 'expiring-soon', color: 'text-amber-600 bg-amber-50', text: `Expires in ${daysUntilExpiration} days`, icon: 'ri-time-line' };
    } else if (daysUntilExpiration <= 90) {
      return { status: 'valid', color: 'text-blue-600 bg-blue-50', text: `Expires in ${Math.ceil(daysUntilExpiration / 30)} months`, icon: 'ri-calendar-line' };
    }
    return { status: 'fresh', color: 'text-sage bg-sage/10', text: 'Fresh', icon: 'ri-checkbox-circle-line' };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-deep mb-2">
            Build Your Routine
          </h2>
          <p className="text-warm-gray text-sm">
            Follow our expert-guided template for a successful skincare routine
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex bg-cream rounded-full p-1">
          <button
            onClick={() => setTimeFilter('morning')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              timeFilter === 'morning'
                ? 'bg-white text-deep shadow-sm'
                : 'text-warm-gray'
            }`}
          >
            <i className="ri-sun-line mr-2"></i>
            Morning
          </button>
          <button
            onClick={() => setTimeFilter('evening')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              timeFilter === 'evening'
                ? 'bg-white text-deep shadow-sm'
                : 'text-warm-gray'
            }`}
          >
            <i className="ri-moon-line mr-2"></i>
            Evening
          </button>
          <button
            onClick={() => setTimeFilter('both')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              timeFilter === 'both'
                ? 'bg-white text-deep shadow-sm'
                : 'text-warm-gray'
            }`}
          >
            <i className="ri-time-line mr-2"></i>
            Both
          </button>
        </div>
      </div>

      {/* FIX #1: Prominent Routine Type Header */}
      <div className="mb-6 text-center py-4 bg-gradient-to-r from-cream to-white rounded-xl border border-blush">
        <h3 className="text-2xl font-serif font-bold text-deep flex items-center justify-center gap-3">
          {timeFilter === 'morning' && (
            <>
              <i className="ri-sun-line text-amber-500 text-3xl"></i>
              Morning Routine
            </>
          )}
          {timeFilter === 'evening' && (
            <>
              <i className="ri-moon-line text-indigo-500 text-3xl"></i>
              Evening Routine
            </>
          )}
          {timeFilter === 'both' && (
            <>
              <i className="ri-calendar-line text-primary text-3xl"></i>
              Full Daily Routine
            </>
          )}
        </h3>
        <p className="text-warm-gray text-sm mt-2">
          {filteredSteps.length} steps in your {timeFilter === 'both' ? 'complete' : timeFilter} routine
          {filledStepsCount > 0 && (
            <span className="text-primary font-medium"> • {filledStepsCount} products added</span>
          )}
        </p>
      </div>

      {/* Horizontal Routine Steps with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="relative mb-8">
          <div className="overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
            <SortableContext items={stepIds} strategy={horizontalListSortingStrategy}>
              <div className="flex gap-6" style={{ minWidth: 'max-content' }}>
                {filteredSteps.map((step, index) => (
                  <SortableStepCard key={step.id} step={step} index={index}>
                    {/* Step Number & Title */}
                    <div className="flex items-start gap-4 mb-4 pr-10">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {index + 1}
                      </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-serif text-2xl font-bold text-deep">
                        {step.title}
                      </h3>
                      {step.recommended && (
                        <span className="px-3 py-1 bg-light/20 text-primary text-xs font-medium rounded-full whitespace-nowrap">
                          Recommended
                        </span>
                      )}
                    </div>
                    {step.timeOfDay !== 'both' && (
                      <span className="inline-flex items-center px-3 py-1 bg-blush/50 text-warm-gray text-xs font-medium rounded-full whitespace-nowrap mb-2">
                        <i className={`${step.timeOfDay === 'morning' ? 'ri-sun-line' : 'ri-moon-line'} mr-1`}></i>
                        {step.timeOfDay === 'morning' ? 'Morning Only' : 'Evening Only'}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-warm-gray text-sm mb-4">{step.description}</p>

                {/* Product Display or Add Button */}
                {step.product ? (
                  <div className="bg-cream rounded-lg p-4">
                    <div className="flex flex-col gap-3 mb-3">
                      <div 
                        className="w-full h-32 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
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
                          className="font-medium text-deep mb-2 cursor-pointer hover:underline"
                          onClick={() => handleProductClick(step.product!)}
                        >
                          {step.product.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleProductClick(step.product!)}
                            className="text-sm text-primary hover:underline font-medium cursor-pointer"
                          >
                            View Details →
                          </button>
                          <button
                            onClick={() => handleRemoveProduct(step.id)}
                            className="ml-auto px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expiration Date & Purchase Info */}
                    <div className="pt-3 border-t border-blush space-y-2">
                      {step.product.expirationDate && (
                        <div>
                          {(() => {
                            const expStatus = getExpirationStatus(step.product.expirationDate);
                            return expStatus ? (
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${expStatus.color}`}>
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
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                        >
                          <i className="ri-refresh-line"></i>
                          Purchase Again
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowProductSelector(step.id)}
                        className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-dark transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                      >
                        <i className="ri-add-line mr-2"></i>
                        Add from Saved
                      </button>
                      <button
                        onClick={() => handleBrowseProducts(step.title)}
                        className="w-full px-6 py-3 bg-white border-2 border-primary text-primary rounded-lg hover:bg-cream transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                      >
                        <i className="ri-search-line mr-2"></i>
                        Browse {step.title}s
                      </button>
                    </div>

                    {/* Product Selector Modal */}
                    {showProductSelector === step.id && (
                      <div className="mt-4 p-4 bg-white border border-blush rounded-lg max-h-96 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-deep text-sm">Select Product</h4>
                          <button
                            onClick={() => setShowProductSelector(null)}
                            className="text-warm-gray/60 hover:text-warm-gray cursor-pointer"
                          >
                            <i className="ri-close-line text-xl"></i>
                          </button>
                        </div>
                        <div className="space-y-3">
                          {savedProducts
                            .filter(p => p.category === step.title)
                            .map(product => (
                              <div
                                key={product.id}
                                onClick={() => handleAddProduct(step.id, product)}
                                className="flex items-center gap-3 p-3 border border-blush rounded-lg hover:border-primary hover:bg-cream transition-all cursor-pointer"
                              >
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-warm-gray/80 mb-1">{product.brand}</p>
                                  <p className="text-sm font-medium text-deep truncate">
                                    {product.name}
                                  </p>
                                </div>
                              </div>
                            ))}
                          {savedProducts.filter(p => p.category === step.title).length === 0 && (
                            <div className="text-center py-6 text-warm-gray text-sm">
                              No saved products for this category.
                              <br />
                              <button
                                onClick={() => handleBrowseProducts(step.title)}
                                className="text-primary hover:underline mt-2 cursor-pointer whitespace-nowrap"
                              >
                                Browse {step.title}s →
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                  </SortableStepCard>
                ))}

                {/* Add Custom Step Button Card */}
                <div
                  className="border-2 border-dashed border-primary/40 rounded-xl p-6 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center text-center"
                  style={{ width: '380px', flexShrink: 0, minHeight: '300px' }}
                  onClick={() => {
                    if (onBrowseClick) onBrowseClick();
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <i className="ri-add-line text-3xl text-primary"></i>
                  </div>
                  <h4 className="font-serif text-xl font-bold text-deep mb-2">+ Add Custom Step</h4>
                  <p className="text-warm-gray text-sm mb-4">
                    Add a product that doesn't fit the template
                  </p>
                  <span className="px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    Browse Products
                  </span>
                </div>
              </div>
            </SortableContext>
          </div>

          {/* Drag hint */}
          <div className="flex justify-center items-center gap-2 mt-4 text-warm-gray text-sm">
            <i className="ri-drag-move-line"></i>
            <span>Drag steps to reorder your routine</span>
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center gap-2 mt-2">
            {filteredSteps.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-blush"
              ></div>
            ))}
            <div className="w-2 h-2 rounded-full bg-primary/30"></div>
          </div>
        </div>
      </DndContext>

      {/* Tips Section */}
      <div className="p-6 bg-cream rounded-xl mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-light/30 flex items-center justify-center flex-shrink-0">
            <i className="ri-lightbulb-line text-primary text-xl"></i>
          </div>
          <div>
            <h4 className="font-medium text-deep mb-2">Pro Tips for Success</h4>
            <ul className="text-sm text-warm-gray space-y-1">
              <li>• Wait 30-60 seconds between each step for better absorption</li>
              <li>• Apply products from thinnest to thickest consistency</li>
              <li>• Always use sunscreen as your final morning step</li>
              <li>• Introduce new products one at a time to monitor reactions</li>
              <li>• Check expiration dates regularly and replace expired products</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FIX #3: Your Routine Summary Card */}
      <div className="bg-gradient-to-br from-cream to-white rounded-2xl border-2 border-primary/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-2xl font-bold text-deep flex items-center gap-2">
            <i className="ri-list-check-2 text-primary"></i>
            Your Routine Summary
          </h3>
          <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
            {filledStepsCount} of {filteredSteps.length} steps filled
          </span>
        </div>
        
        {/* Ordered Summary List */}
        <div className="space-y-2 mb-6">
          {filteredSteps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                step.product 
                  ? 'bg-white border border-primary/20' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step.product 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${step.product ? 'text-deep' : 'text-gray-400'}`}>
                  {step.title}
                </p>
                {step.product && (
                  <p className="text-sm text-warm-gray truncate">
                    {step.product.brand} - {step.product.name}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                {step.product ? (
                  <i className="ri-checkbox-circle-fill text-primary text-xl"></i>
                ) : (
                  <i className="ri-checkbox-blank-circle-line text-gray-300 text-xl"></i>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-warm-gray mb-1">
            <span>Progress</span>
            <span>{filteredSteps.length > 0 ? Math.round((filledStepsCount / filteredSteps.length) * 100) : 0}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${filteredSteps.length > 0 ? (filledStepsCount / filteredSteps.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* FIX #4b: Save Routine Button */}
        <button
          onClick={onSave}
          disabled={filledStepsCount === 0}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
            filledStepsCount > 0
              ? 'bg-primary text-white hover:bg-dark shadow-lg hover:shadow-xl cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <i className="ri-save-line text-xl"></i>
          Save My Routine
        </button>
        
        {filledStepsCount === 0 && (
          <p className="text-center text-warm-gray text-sm mt-2">
            Add at least one product to save your routine
          </p>
        )}
      </div>
    </div>
  );
}