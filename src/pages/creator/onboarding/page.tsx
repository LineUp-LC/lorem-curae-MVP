import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import ProgressBar from './components/ProgressBar';
import StepCard from './components/StepCard';
import MultiSelect from './components/MultiSelect';
import { fadeInUp, transitions } from '@/lib/motion/motionVariants';

interface OnboardingData {
  email: string;
  display_name: string;
  bio: string;
  expertise: string[];
  website: string;
  social_links: string[];
  country: string;
  government_id_last4: string;
  accepted_terms: boolean;
}

const EXPERTISE_OPTIONS = [
  { value: 'skincare', label: 'Skincare' },
  { value: 'haircare', label: 'Haircare' },
  { value: 'makeup', label: 'Makeup' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'esthetics', label: 'Esthetics' },
  { value: 'clean-beauty', label: 'Clean Beauty' },
];

const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' },
];

export default function CreatorOnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<OnboardingData>({
    email: '',
    display_name: '',
    bio: '',
    expertise: [],
    website: '',
    social_links: [''],
    country: '',
    government_id_last4: '',
    accepted_terms: false,
  });

  const updateField = <K extends keyof OnboardingData>(
    field: K,
    value: OnboardingData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const addSocialLink = () => {
    setFormData((prev) => ({
      ...prev,
      social_links: [...prev.social_links, ''],
    }));
  };

  const updateSocialLink = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      social_links: prev.social_links.map((link, i) =>
        i === index ? value : link
      ),
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      social_links: prev.social_links.filter((_, i) => i !== index),
    }));
  };

  // Step 1: Start Onboarding
  const handleStartOnboarding = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/creator/start-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to start onboarding.');
      }

      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Save Profile
  const handleSaveProfile = async () => {
    if (!formData.display_name.trim()) {
      setError('Display name is required.');
      return;
    }
    if (!formData.bio.trim()) {
      setError('Bio is required.');
      return;
    }
    if (formData.expertise.length === 0) {
      setError('Please select at least one area of expertise.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/creator/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: formData.display_name,
          bio: formData.bio,
          expertise: formData.expertise,
          website: formData.website || null,
          social_links: formData.social_links.filter((link) => link.trim()),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save profile.');
      }

      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Verify Identity
  const handleVerifyIdentity = async () => {
    if (!formData.country) {
      setError('Please select your country.');
      return;
    }
    if (
      !formData.government_id_last4 ||
      formData.government_id_last4.length !== 4 ||
      !/^\d{4}$/.test(formData.government_id_last4)
    ) {
      setError('Please enter the last 4 digits of your government ID.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/creator/verify-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          government_id_last4: formData.government_id_last4,
          country: formData.country,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to verify identity.');
      }

      setCurrentStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Complete Onboarding
  const handleCompleteOnboarding = async () => {
    if (!formData.accepted_terms) {
      setError('You must accept the Creator Terms to continue.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/creator/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accepted_terms: formData.accepted_terms }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to complete onboarding.');
      }

      navigate('/creator/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <StepCard
      title="Become a Creator"
      subtitle="Share your expertise with the world."
    >
      <div className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-deep mb-2"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-lg border border-blush-300 bg-white text-deep placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
          />
        </div>

        <button
          onClick={handleStartOnboarding}
          disabled={isLoading || !formData.email}
          className="w-full py-3 px-6 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Starting...' : 'Start Onboarding'}
        </button>
      </div>
    </StepCard>
  );

  const renderStep2 = () => (
    <StepCard
      title="Profile Setup"
      subtitle="Tell us about yourself and your expertise."
    >
      <div className="space-y-6">
        <div>
          <label
            htmlFor="display_name"
            className="block text-sm font-medium text-deep mb-2"
          >
            Display Name
          </label>
          <input
            id="display_name"
            type="text"
            value={formData.display_name}
            onChange={(e) => updateField('display_name', e.target.value)}
            placeholder="Your public name"
            className="w-full px-4 py-3 rounded-lg border border-blush-300 bg-white text-deep placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-deep mb-2"
          >
            Bio
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            placeholder="Tell us about your background and expertise..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-blush-300 bg-white text-deep placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-deep mb-2">
            Areas of Expertise
          </label>
          <MultiSelect
            options={EXPERTISE_OPTIONS}
            selected={formData.expertise}
            onChange={(selected) => updateField('expertise', selected)}
            placeholder="Select your expertise..."
          />
        </div>

        <div>
          <label
            htmlFor="website"
            className="block text-sm font-medium text-deep mb-2"
          >
            Website{' '}
            <span className="text-warm-gray font-normal">(optional)</span>
          </label>
          <input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => updateField('website', e.target.value)}
            placeholder="https://yourwebsite.com"
            className="w-full px-4 py-3 rounded-lg border border-blush-300 bg-white text-deep placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-deep mb-2">
            Social Links{' '}
            <span className="text-warm-gray font-normal">(optional)</span>
          </label>
          <div className="space-y-3">
            {formData.social_links.map((link, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => updateSocialLink(index, e.target.value)}
                  placeholder="https://instagram.com/username"
                  className="flex-1 px-4 py-3 rounded-lg border border-blush-300 bg-white text-deep placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                />
                {formData.social_links.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="px-3 py-2 text-warm-gray hover:text-primary-500 transition-colors"
                    aria-label="Remove social link"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSocialLink}
              className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              + Add another link
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 py-3 px-6 border border-blush-300 text-deep font-medium rounded-lg hover:bg-blush-100 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={
              isLoading ||
              !formData.display_name ||
              !formData.bio ||
              formData.expertise.length === 0
            }
            className="flex-1 py-3 px-6 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </StepCard>
  );

  const renderStep3 = () => (
    <StepCard
      title="Identity Verification"
      subtitle="We need to verify your identity for payment processing."
    >
      <div className="space-y-6">
        <div className="p-4 bg-sage/10 rounded-lg border border-sage/20">
          <p className="text-sm text-warm-gray">
            Your information is securely encrypted and used only for identity
            verification. We never store your full government ID.
          </p>
        </div>

        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-deep mb-2"
          >
            Country of Residence
          </label>
          <select
            id="country"
            value={formData.country}
            onChange={(e) => updateField('country', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-blush-300 bg-white text-deep focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">Select your country</option>
            {COUNTRY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="government_id_last4"
            className="block text-sm font-medium text-deep mb-2"
          >
            Last 4 Digits of Government ID
          </label>
          <input
            id="government_id_last4"
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={formData.government_id_last4}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 4);
              updateField('government_id_last4', value);
            }}
            placeholder="1234"
            className="w-full px-4 py-3 rounded-lg border border-blush-300 bg-white text-deep placeholder:text-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all tracking-widest"
          />
          <p className="mt-2 text-xs text-warm-gray">
            SSN, National ID, or Passport number depending on your country
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setCurrentStep(2)}
            className="flex-1 py-3 px-6 border border-blush-300 text-deep font-medium rounded-lg hover:bg-blush-100 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleVerifyIdentity}
            disabled={
              isLoading ||
              !formData.country ||
              formData.government_id_last4.length !== 4
            }
            className="flex-1 py-3 px-6 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Verifying...' : 'Continue'}
          </button>
        </div>
      </div>
    </StepCard>
  );

  const renderStep4 = () => (
    <StepCard
      title="Terms & Confirmation"
      subtitle="Review and accept the Creator Terms to complete your registration."
    >
      <div className="space-y-6">
        <div className="p-6 bg-white rounded-lg border border-blush-300 max-h-64 overflow-y-auto">
          <h4 className="font-serif text-lg font-semibold text-deep mb-4">
            Creator Terms Summary
          </h4>
          <div className="space-y-4 text-sm text-warm-gray">
            <div>
              <h5 className="font-medium text-deep mb-1">Content Guidelines</h5>
              <p>
                You agree to create original, accurate, and helpful content.
                All recommendations must be evidence-based and transparent
                about any affiliations.
              </p>
            </div>
            <div>
              <h5 className="font-medium text-deep mb-1">Revenue Sharing</h5>
              <p>
                Creators receive 70% of net revenue from premium content sales.
                Payments are processed monthly via Stripe Connect.
              </p>
            </div>
            <div>
              <h5 className="font-medium text-deep mb-1">Community Standards</h5>
              <p>
                You agree to maintain a supportive, respectful environment.
                Discriminatory, harmful, or misleading content is prohibited.
              </p>
            </div>
            <div>
              <h5 className="font-medium text-deep mb-1">Intellectual Property</h5>
              <p>
                You retain ownership of your content. By posting, you grant
                Lorem Curae a license to display and distribute your content
                on the platform.
              </p>
            </div>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={formData.accepted_terms}
              onChange={(e) => updateField('accepted_terms', e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-blush-300 rounded transition-colors peer-checked:bg-primary-500 peer-checked:border-primary-500 peer-focus:ring-2 peer-focus:ring-primary-500/30">
              {formData.accepted_terms && (
                <svg
                  className="w-full h-full text-white p-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-deep group-hover:text-deep/80 transition-colors">
            I have read and agree to the{' '}
            <a
              href="/legal/creator-terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-500 hover:underline"
            >
              Creator Terms and Conditions
            </a>
          </span>
        </label>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setCurrentStep(3)}
            className="flex-1 py-3 px-6 border border-blush-300 text-deep font-medium rounded-lg hover:bg-blush-100 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleCompleteOnboarding}
            disabled={isLoading || !formData.accepted_terms}
            className="flex-1 py-3 px-6 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Completing...' : 'Complete Onboarding'}
          </button>
        </div>
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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      <Navbar />

      <main className="pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-xl mx-auto">
          <ProgressBar currentStep={currentStep} totalSteps={4} />

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

      <Footer />
    </div>
  );
}
