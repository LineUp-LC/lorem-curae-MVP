import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, transitions } from '@/lib/motion/motionVariants';

// Types
interface Product {
  id: string;
  name: string;
  status: string;
}

interface CheckIn {
  day: number;
  questions: string[];
}

interface PatchTestData {
  product_id: string;
  product_name: string;
  instructions: {
    where_to_apply: string;
    how_much: string;
    wait_time_hours: number;
    what_to_expect: string;
    creator_notes: string;
  };
  checkins: CheckIn[];
  thresholds: {
    mild_reaction: number;
    moderate_reaction: number;
    severe_reaction: number;
  };
}

// Default check-in questions
const DEFAULT_CHECKINS: CheckIn[] = [
  {
    day: 1,
    questions: [
      'Do you notice any redness at the application site?',
      'Is there any itching or tingling sensation?',
      'How does the area feel compared to before application?',
    ],
  },
  {
    day: 2,
    questions: [
      'Has the redness increased, decreased, or stayed the same?',
      'Do you notice any bumps, swelling, or texture changes?',
      'Rate your overall comfort level (1-10).',
    ],
  },
  {
    day: 3,
    questions: [
      'Is there any lingering irritation?',
      'Has your skin returned to normal?',
      'Would you feel comfortable using this product regularly?',
    ],
  },
];

// Step labels
const STEP_LABELS = ['Product', 'Instructions', 'Check-Ins', 'Thresholds', 'Review'];

// Icon component
function Icon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    chevronLeft: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
      </svg>
    ),
    chevronRight: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
      </svg>
    ),
    check: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    plus: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
    trash: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    beaker: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    cube: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    clock: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    clipboardList: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    shield: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    document: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  };

  return <>{icons[name] || null}</>;
}

// Progress Bar Component
function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between mb-3">
        {STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={label} className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-primary-500 text-white'
                      : isActive
                        ? 'bg-primary-500 text-white ring-4 ring-primary-500/20'
                        : 'bg-blush-200 text-warm-gray'
                  }
                `}
              >
                {isCompleted ? <Icon name="check" className="w-4 h-4" /> : stepNumber}
              </div>
              <span
                className={`
                  mt-2 text-xs font-medium transition-colors duration-300 hidden sm:block
                  ${isActive || isCompleted ? 'text-deep' : 'text-warm-gray'}
                `}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative h-1 bg-blush-200 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
        />
      </div>
    </div>
  );
}

// Step Card Component
function StepCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-blush-200 p-6 sm:p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Icon name={icon} className="w-6 h-6 text-primary-500" />
        </div>
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-deep">{title}</h2>
          <p className="text-warm-gray text-sm mt-1">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// Question List Editor Component
function QuestionListEditor({
  day,
  questions,
  onChange,
}: {
  day: number;
  questions: string[];
  onChange: (questions: string[]) => void;
}) {
  const updateQuestion = (index: number, value: string) => {
    const updated = [...questions];
    updated[index] = value;
    onChange(updated);
  };

  const addQuestion = () => {
    onChange([...questions, '']);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      onChange(questions.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="bg-cream/50 rounded-xl p-4 border border-blush-100">
      <h4 className="font-medium text-deep mb-3">Day {day}</h4>
      <div className="space-y-3">
        {questions.map((question, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => updateQuestion(index, e.target.value)}
              placeholder={`Question ${index + 1}`}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-blush-300 bg-white text-deep placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
            />
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="p-2 text-warm-gray hover:text-red-500 transition-colors"
              >
                <Icon name="trash" className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addQuestion}
          className="inline-flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
        >
          <Icon name="plus" className="w-4 h-4" />
          Add question
        </button>
      </div>
    </div>
  );
}

// Threshold Slider Component
function ThresholdSlider({
  label,
  description,
  value,
  onChange,
  color,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  color: 'yellow' | 'orange' | 'red';
}) {
  const colorClasses = {
    yellow: 'bg-amber-400',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  return (
    <div className="bg-cream/50 rounded-xl p-4 border border-blush-100">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-deep">{label}</h4>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white ${colorClasses[color]}`}
        >
          {value}
        </span>
      </div>
      <p className="text-xs text-warm-gray mb-3">{description}</p>
      <input
        type="range"
        min="0"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-2 bg-blush-200 rounded-full appearance-none cursor-pointer accent-primary-500"
      />
      <div className="flex justify-between text-xs text-warm-gray mt-1">
        <span>0</span>
        <span>10</span>
      </div>
    </div>
  );
}

// Review Section Component
function ReviewSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-cream/50 rounded-xl p-4 border border-blush-100">
      <div className="flex items-center gap-2 mb-3">
        <Icon name={icon} className="w-5 h-5 text-primary-500" />
        <h4 className="font-medium text-deep">{title}</h4>
      </div>
      {children}
    </div>
  );
}

// Main Component
export default function CreatePatchTestPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [formData, setFormData] = useState<PatchTestData>({
    product_id: '',
    product_name: '',
    instructions: {
      where_to_apply: '',
      how_much: '',
      wait_time_hours: 24,
      what_to_expect: '',
      creator_notes: '',
    },
    checkins: DEFAULT_CHECKINS,
    thresholds: {
      mild_reaction: 3,
      moderate_reaction: 5,
      severe_reaction: 7,
    },
  });

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/creator/products');
        if (!response.ok) throw new Error('Failed to load products');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        setError('Failed to load products. Please try again.');
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const updateInstructions = (field: keyof PatchTestData['instructions'], value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      instructions: { ...prev.instructions, [field]: value },
    }));
    setError(null);
  };

  const updateCheckin = (dayIndex: number, questions: string[]) => {
    setFormData((prev) => ({
      ...prev,
      checkins: prev.checkins.map((checkin, i) =>
        i === dayIndex ? { ...checkin, questions } : checkin
      ),
    }));
  };

  const updateThreshold = (field: keyof PatchTestData['thresholds'], value: number) => {
    setFormData((prev) => ({
      ...prev,
      thresholds: { ...prev.thresholds, [field]: value },
    }));
  };

  const selectProduct = (product: Product) => {
    setFormData((prev) => ({
      ...prev,
      product_id: product.id,
      product_name: product.name,
    }));
    setError(null);
  };

  // Validation
  const isStep1Valid = formData.product_id !== '';
  const isStep2Valid =
    formData.instructions.where_to_apply.trim() !== '' &&
    formData.instructions.how_much.trim() !== '' &&
    formData.instructions.wait_time_hours > 0 &&
    formData.instructions.what_to_expect.trim() !== '';
  const isStep3Valid = formData.checkins.every(
    (checkin) => checkin.questions.length > 0 && checkin.questions.every((q) => q.trim() !== '')
  );
  const isStep4Valid =
    formData.thresholds.mild_reaction < formData.thresholds.moderate_reaction &&
    formData.thresholds.moderate_reaction < formData.thresholds.severe_reaction;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return isStep1Valid;
      case 2:
        return isStep2Valid;
      case 3:
        return isStep3Valid;
      case 4:
        return isStep4Valid;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/creator/patch-tests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: formData.product_id,
          instructions: {
            where_to_apply: formData.instructions.where_to_apply,
            how_much: formData.instructions.how_much,
            wait_time_hours: formData.instructions.wait_time_hours,
            what_to_expect: formData.instructions.what_to_expect,
            creator_notes: formData.instructions.creator_notes || null,
          },
          checkins: formData.checkins,
          thresholds: formData.thresholds,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create patch test');
      }

      navigate('/creator/patch-tests');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Select Product
  const renderStep1 = () => (
    <StepCard
      title="Select Product"
      subtitle="Choose which product this patch test is for."
      icon="cube"
    >
      {isLoadingProducts ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-blush-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-warm-gray mb-4">
            You don't have any products yet. Create a product first before setting up a patch test.
          </p>
          <Link
            to="/creator/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            Go to Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => selectProduct(product)}
              className={`
                w-full p-4 rounded-xl border-2 text-left transition-all
                ${
                  formData.product_id === product.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-blush-200 hover:border-primary-300 bg-white'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${formData.product_id === product.id ? 'bg-primary-500' : 'bg-blush-100'}
                  `}
                >
                  <Icon
                    name="cube"
                    className={`w-5 h-5 ${formData.product_id === product.id ? 'text-white' : 'text-warm-gray'}`}
                  />
                </div>
                <div>
                  <h4 className="font-medium text-deep">{product.name}</h4>
                  <p className="text-xs text-warm-gray capitalize">{product.status}</p>
                </div>
                {formData.product_id === product.id && (
                  <div className="ml-auto">
                    <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                      <Icon name="check" className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-blush-100">
        <button
          onClick={handleNext}
          disabled={!isStep1Valid}
          className="w-full py-3 px-6 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </StepCard>
  );

  // Step 2: Instructions
  const renderStep2 = () => (
    <StepCard
      title="Instructions Setup"
      subtitle="Define how testers should apply and evaluate the product."
      icon="clipboardList"
    >
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-deep mb-2">
            Where to Apply
          </label>
          <input
            type="text"
            value={formData.instructions.where_to_apply}
            onChange={(e) => updateInstructions('where_to_apply', e.target.value)}
            placeholder="e.g., Inner forearm, behind the ear"
            className="w-full px-4 py-3 rounded-lg border border-blush-300 bg-white text-deep placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-deep mb-2">
            How Much to Apply
          </label>
          <input
            type="text"
            value={formData.instructions.how_much}
            onChange={(e) => updateInstructions('how_much', e.target.value)}
            placeholder="e.g., Pea-sized amount, thin layer"
            className="w-full px-4 py-3 rounded-lg border border-blush-300 bg-white text-deep placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-deep mb-2">
            Wait Time (Hours)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="72"
              value={formData.instructions.wait_time_hours}
              onChange={(e) => updateInstructions('wait_time_hours', parseInt(e.target.value, 10) || 24)}
              className="w-24 px-4 py-3 rounded-lg border border-blush-300 bg-white text-deep focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
            />
            <span className="text-warm-gray">hours before first check-in</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-deep mb-2">
            What to Expect
          </label>
          <textarea
            value={formData.instructions.what_to_expect}
            onChange={(e) => updateInstructions('what_to_expect', e.target.value)}
            placeholder="Describe what testers might experience during the patch test..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-blush-300 bg-white text-deep placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-deep mb-2">
            Creator Notes <span className="text-warm-gray font-normal">(optional)</span>
          </label>
          <textarea
            value={formData.instructions.creator_notes}
            onChange={(e) => updateInstructions('creator_notes', e.target.value)}
            placeholder="Any additional notes or tips for testers..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-blush-300 bg-white text-deep placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none"
          />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-blush-100 flex gap-3">
        <button
          onClick={handleBack}
          className="flex-1 py-3 px-6 border border-blush-300 text-deep font-medium rounded-lg hover:bg-blush-100 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!isStep2Valid}
          className="flex-1 py-3 px-6 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </StepCard>
  );

  // Step 3: Check-ins
  const renderStep3 = () => (
    <StepCard
      title="Check-In Structure"
      subtitle="Define the questions testers will answer each day."
      icon="clock"
    >
      <div className="space-y-4">
        {formData.checkins.map((checkin, index) => (
          <QuestionListEditor
            key={checkin.day}
            day={checkin.day}
            questions={checkin.questions}
            onChange={(questions) => updateCheckin(index, questions)}
          />
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-blush-100 flex gap-3">
        <button
          onClick={handleBack}
          className="flex-1 py-3 px-6 border border-blush-300 text-deep font-medium rounded-lg hover:bg-blush-100 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!isStep3Valid}
          className="flex-1 py-3 px-6 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </StepCard>
  );

  // Step 4: Thresholds
  const renderStep4 = () => (
    <StepCard
      title="Safety Thresholds"
      subtitle="Set the reaction severity levels for tester feedback."
      icon="shield"
    >
      <div className="space-y-4">
        <ThresholdSlider
          label="Mild Reaction"
          description="Slight redness, minor dryness, or barely noticeable irritation"
          value={formData.thresholds.mild_reaction}
          onChange={(value) => updateThreshold('mild_reaction', value)}
          color="yellow"
        />

        <ThresholdSlider
          label="Moderate Reaction"
          description="Persistent redness, noticeable irritation, or visible skin changes"
          value={formData.thresholds.moderate_reaction}
          onChange={(value) => updateThreshold('moderate_reaction', value)}
          color="orange"
        />

        <ThresholdSlider
          label="Severe Reaction"
          description="Swelling, burning sensation, blistering, or worsening symptoms"
          value={formData.thresholds.severe_reaction}
          onChange={(value) => updateThreshold('severe_reaction', value)}
          color="red"
        />

        {!isStep4Valid && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              Thresholds must be in ascending order: Mild &lt; Moderate &lt; Severe
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-blush-100 flex gap-3">
        <button
          onClick={handleBack}
          className="flex-1 py-3 px-6 border border-blush-300 text-deep font-medium rounded-lg hover:bg-blush-100 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!isStep4Valid}
          className="flex-1 py-3 px-6 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </StepCard>
  );

  // Step 5: Review
  const renderStep5 = () => (
    <StepCard
      title="Review & Create"
      subtitle="Review your patch test configuration before creating."
      icon="document"
    >
      <div className="space-y-4">
        <ReviewSection title="Product" icon="cube">
          <p className="text-deep font-medium">{formData.product_name}</p>
        </ReviewSection>

        <ReviewSection title="Instructions" icon="clipboardList">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-warm-gray">Where to apply:</span>
              <span className="text-deep">{formData.instructions.where_to_apply}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-gray">How much:</span>
              <span className="text-deep">{formData.instructions.how_much}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-gray">Wait time:</span>
              <span className="text-deep">{formData.instructions.wait_time_hours} hours</span>
            </div>
            <div>
              <span className="text-warm-gray block mb-1">What to expect:</span>
              <p className="text-deep text-xs bg-white p-2 rounded border border-blush-100">
                {formData.instructions.what_to_expect}
              </p>
            </div>
            {formData.instructions.creator_notes && (
              <div>
                <span className="text-warm-gray block mb-1">Creator notes:</span>
                <p className="text-deep text-xs bg-white p-2 rounded border border-blush-100">
                  {formData.instructions.creator_notes}
                </p>
              </div>
            )}
          </div>
        </ReviewSection>

        <ReviewSection title="Check-Ins" icon="clock">
          <div className="space-y-3">
            {formData.checkins.map((checkin) => (
              <div key={checkin.day}>
                <h5 className="text-sm font-medium text-deep mb-1">Day {checkin.day}</h5>
                <ul className="list-disc list-inside text-xs text-warm-gray space-y-0.5">
                  {checkin.questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="Safety Thresholds" icon="shield">
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-warm-gray">Mild: {formData.thresholds.mild_reaction}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-warm-gray">Moderate: {formData.thresholds.moderate_reaction}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-warm-gray">Severe: {formData.thresholds.severe_reaction}</span>
            </div>
          </div>
        </ReviewSection>
      </div>

      <div className="mt-6 pt-6 border-t border-blush-100 flex gap-3">
        <button
          onClick={handleBack}
          className="flex-1 py-3 px-6 border border-blush-300 text-deep font-medium rounded-lg hover:bg-blush-100 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 py-3 px-6 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Creating...' : 'Create Patch Test'}
        </button>
      </div>
    </StepCard>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      {/* Header */}
      <header className="bg-white border-b border-blush-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/creator/patch-tests"
            className="inline-flex items-center gap-2 text-warm-gray hover:text-deep transition-colors"
          >
            <Icon name="chevronLeft" className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Patch Tests</span>
          </Link>
          <div className="flex items-center gap-2">
            <Icon name="beaker" className="w-5 h-5 text-primary-500" />
            <span className="font-serif font-semibold text-deep">New Patch Test</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="py-8 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <ProgressBar currentStep={currentStep} totalSteps={5} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={transitions.normal}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
