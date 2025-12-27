import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';
import { supabase } from '../../../lib/supabase-browser';

const StorefrontRegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [sellingType, setSellingType] = useState<'products' | 'services' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stripeConnected, setStripeConnected] = useState(false);
  const [stripeAccountStatus, setStripeAccountStatus] = useState<any>(null);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    brandName: '',
    logo: null as File | null,
    description: '',
    documents: [] as File[],
    agreedToTerms: false,
    email: '',
    country: 'US'
  });

  // Check for Stripe Connect return
  useEffect(() => {
    const success = searchParams.get('success');
    const refresh = searchParams.get('refresh');
    
    if (success === 'true') {
      checkStripeStatus();
      setCurrentStep(6);
    } else if (refresh === 'true') {
      setError('Stripe Connect setup was not completed. Please try again.');
    }
  }, [searchParams]);

  // Check Stripe Connect status
  const checkStripeStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-connect-status`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      
      if (data.connected) {
        setStripeConnected(true);
        setStripeAccountStatus(data.account);
      }
    } catch (err) {
      console.error('Error checking Stripe status:', err);
    }
  };

  useEffect(() => {
    checkStripeStatus();
  }, []);

  const handleStripeConnect = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please log in to continue');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-connect-account`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Origin': window.location.origin,
          },
          body: JSON.stringify({
            email: formData.email || session.user.email,
            businessType: formData.businessType || 'individual',
            country: formData.country,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to Stripe onboarding
      window.location.href = data.onboardingUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to connect Stripe account');
      setLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-connect-dashboard-link`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error opening dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'What Will You Sell', icon: 'ri-shopping-bag-line' },
    { number: 2, title: 'Business Identity', icon: 'ri-building-line' },
    { number: 3, title: 'Business Verification', icon: 'ri-shield-check-line' },
    { number: 4, title: 'Storefront Setup', icon: 'ri-store-2-line' },
    { number: 5, title: 'Compliance & Standards', icon: 'ri-file-list-line' },
    { number: 6, title: 'Payment & Logistics', icon: 'ri-bank-card-line' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form
      navigate('/seller/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-6 lg:px-12 py-24">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Storefront Registration</h1>
          <p className="text-lg text-gray-600">Complete the steps below to set up your storefront</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-full font-bold transition-all ${
                      currentStep >= step.number
                        ? 'bg-sage-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <i className="ri-check-line text-xl"></i>
                    ) : (
                      <i className={`${step.icon} text-xl`}></i>
                    )}
                  </div>
                  <span className={`text-xs mt-2 text-center ${
                    currentStep >= step.number ? 'text-sage-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 ${
                    currentStep > step.number ? 'bg-sage-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <i className="ri-error-warning-line text-red-600 text-xl"></i>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          {/* Step 1: What Will You Sell */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What Will You Sell?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setSellingType('products')}
                  className={`p-8 border-2 rounded-xl transition-all cursor-pointer ${
                    sellingType === 'products'
                      ? 'border-sage-600 bg-sage-50'
                      : 'border-gray-200 hover:border-sage-300'
                  }`}
                >
                  <div className="w-16 h-16 flex items-center justify-center bg-sage-100 text-sage-600 rounded-full mx-auto mb-4">
                    <i className="ri-shopping-bag-line text-3xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Products</h3>
                  <p className="text-gray-600">
                    Sell physical skincare products like serums, creams, cleansers, and more
                  </p>
                </button>

                <button
                  onClick={() => setSellingType('services')}
                  className={`p-8 border-2 rounded-xl transition-all cursor-pointer ${
                    sellingType === 'services'
                      ? 'border-sage-600 bg-sage-50'
                      : 'border-gray-200 hover:border-sage-300'
                  }`}
                >
                  <div className="w-16 h-16 flex items-center justify-center bg-coral-100 text-coral-600 rounded-full mx-auto mb-4">
                    <i className="ri-spa-line text-3xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Services</h3>
                  <p className="text-gray-600">
                    Offer skincare services like facials, consultations, treatments, and more
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Business Identity */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Identity</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legal Name of Business or Individual Seller
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  placeholder="Enter legal business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent cursor-pointer"
                >
                  <option value="">Select business type</option>
                  <option value="individual">Individual / Sole Proprietor</option>
                  <option value="company">Company / LLC / Corporation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent cursor-pointer"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="IT">Italy</option>
                  <option value="ES">Spain</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Business Verification */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Verification</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {sellingType === 'products' 
                    ? 'Upload Business License, Tax ID, or Product Compliance Documents'
                    : 'Upload Certifications and Licenses'}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <i className="ri-upload-cloud-line text-5xl text-gray-400 mb-4"></i>
                  <p className="text-gray-700 font-medium mb-2">Drop files here or click to browse</p>
                  <p className="text-sm text-gray-500 mb-4">PDF, JPG, PNG up to 10MB each</p>
                  <input type="file" multiple className="hidden" id="documents-upload" />
                  <label
                    htmlFor="documents-upload"
                    className="inline-block px-6 py-3 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Choose Files
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <i className="ri-information-line text-blue-600 text-xl mt-0.5"></i>
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">KYC/AML Verification</p>
                    <p className="text-sm text-blue-700">
                      We'll verify your identity and business information to ensure a safe marketplace for all users.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Storefront Setup */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Storefront Setup</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  placeholder="Enter your brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <i className="ri-image-line text-5xl text-gray-400 mb-4"></i>
                  <p className="text-gray-700 font-medium mb-2">Upload your brand logo</p>
                  <p className="text-sm text-gray-500 mb-4">PNG, JPG (Square format recommended)</p>
                  <input type="file" accept="image/*" className="hidden" id="logo-upload" />
                  <label
                    htmlFor="logo-upload"
                    className="inline-block px-6 py-3 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Choose Logo
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
                  placeholder="Tell customers about your brand, mission, and what makes your products/services special..."
                />
                <p className="text-sm text-gray-500 mt-1">{formData.description.length}/500 characters</p>
              </div>
            </div>
          )}

          {/* Step 5: Compliance & Standards */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Compliance & Standards</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {sellingType === 'products' ? 'Ingredient Disclosure' : 'Service Disclosure'}
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    {sellingType === 'products'
                      ? 'You must provide complete and accurate ingredient lists for all products. Transparency is key to building trust with customers.'
                      : 'You must provide clear descriptions of all services offered, including procedures, expected outcomes, and any potential risks.'}
                  </p>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="disclosure"
                      className="w-5 h-5 text-sage-600 border-gray-300 rounded focus:ring-sage-500 cursor-pointer"
                    />
                    <label htmlFor="disclosure" className="ml-3 text-sm text-gray-700 cursor-pointer">
                      I agree to provide complete and accurate information
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {sellingType === 'products' ? 'Product Standards' : 'Service Standards'}
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    {sellingType === 'products'
                      ? 'All products must meet safety standards and comply with relevant regulations. Products must be properly labeled and stored.'
                      : 'All services must be performed by qualified professionals. You must maintain proper licensing and insurance as required by law.'}
                  </p>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="standards"
                      className="w-5 h-5 text-sage-600 border-gray-300 rounded focus:ring-sage-500 cursor-pointer"
                    />
                    <label htmlFor="standards" className="ml-3 text-sm text-gray-700 cursor-pointer">
                      I agree to maintain quality standards
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Community Guidelines</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Sellers must agree to ethical selling, inclusivity, and transparency. We maintain a zero-tolerance policy for discrimination, false advertising, or harmful practices.
                  </p>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="guidelines"
                      checked={formData.agreedToTerms}
                      onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                      className="w-5 h-5 text-sage-600 border-gray-300 rounded focus:ring-sage-500 cursor-pointer"
                    />
                    <label htmlFor="guidelines" className="ml-3 text-sm text-gray-700 cursor-pointer">
                      I accept and agree to follow all community guidelines
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Payment & Logistics */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment & Logistics</h2>
              
              <div className="bg-gradient-to-br from-sage-50 to-sage-100 rounded-xl p-8 border-2 border-sage-200">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-md">
                    <i className="ri-bank-card-line text-3xl text-sage-600"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Stripe Connect</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Connect your Stripe account to receive payments directly from customers. You'll receive 90% of each sale, with 10% going to platform fees.
                    </p>
                  </div>
                </div>

                {!stripeConnected ? (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 space-y-3">
                      <div className="flex items-center space-x-3">
                        <i className="ri-check-line text-sage-600 text-xl"></i>
                        <span className="text-sm text-gray-700">Secure payment processing</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <i className="ri-check-line text-sage-600 text-xl"></i>
                        <span className="text-sm text-gray-700">Automatic payouts to your bank account</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <i className="ri-check-line text-sage-600 text-xl"></i>
                        <span className="text-sm text-gray-700">Real-time transaction tracking</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <i className="ri-check-line text-sage-600 text-xl"></i>
                        <span className="text-sm text-gray-700">Support for multiple currencies</span>
                      </div>
                    </div>

                    <button
                      onClick={handleStripeConnect}
                      disabled={loading}
                      className="w-full px-6 py-4 bg-sage-600 text-white rounded-lg font-semibold hover:bg-sage-700 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <i className="ri-loader-4-line animate-spin text-xl"></i>
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <i className="ri-link text-xl"></i>
                          <span>Connect Stripe Account</span>
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-600 text-center">
                      You'll be redirected to Stripe to complete the setup process
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-full">
                            <i className="ri-check-line text-green-600 text-xl"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Stripe Connected</h4>
                            <p className="text-sm text-gray-600">Your account is ready to receive payments</p>
                          </div>
                        </div>
                      </div>

                      {stripeAccountStatus && (
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Charges Enabled:</span>
                            <span className={`font-medium ${stripeAccountStatus.chargesEnabled ? 'text-green-600' : 'text-orange-600'}`}>
                              {stripeAccountStatus.chargesEnabled ? 'Yes' : 'Pending'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Payouts Enabled:</span>
                            <span className={`font-medium ${stripeAccountStatus.payoutsEnabled ? 'text-green-600' : 'text-orange-600'}`}>
                              {stripeAccountStatus.payoutsEnabled ? 'Yes' : 'Pending'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Details Submitted:</span>
                            <span className={`font-medium ${stripeAccountStatus.detailsSubmitted ? 'text-green-600' : 'text-orange-600'}`}>
                              {stripeAccountStatus.detailsSubmitted ? 'Complete' : 'Incomplete'}
                            </span>
                          </div>
                        </div>
                      )}

                      {stripeAccountStatus?.requiresAction && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                          <div className="flex items-start space-x-3">
                            <i className="ri-alert-line text-orange-600 text-xl mt-0.5"></i>
                            <div>
                              <p className="text-sm font-medium text-orange-900 mb-1">Action Required</p>
                              <p className="text-sm text-orange-700">
                                Please complete your Stripe account setup to start receiving payments.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleOpenDashboard}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <i className="ri-dashboard-line text-lg"></i>
                        <span>Open Stripe Dashboard</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {sellingType === 'products' ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Shipping Integration</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Set up your shipping preferences and connect with shipping carriers for automated label generation.
                  </p>
                  <button className="px-6 py-3 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors whitespace-nowrap cursor-pointer">
                    <i className="ri-truck-line mr-2"></i>
                    Configure Shipping
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Service Scheduling (Calendar Integration)</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Connect your calendar to manage appointments and availability for your services.
                  </p>
                  <button className="px-6 py-3 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors whitespace-nowrap cursor-pointer">
                    <i className="ri-calendar-line mr-2"></i>
                    Connect Calendar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 border border-gray-300 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Back
            </button>

            <div className="text-sm text-gray-600">
              Step {currentStep} of {steps.length}
            </div>

            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !sellingType) ||
                (currentStep === 6 && !stripeConnected)
              }
              className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                ((currentStep === 1 && !sellingType) || (currentStep === 6 && !stripeConnected))
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-sage-600 text-white hover:bg-sage-700'
              }`}
            >
              {currentStep === steps.length ? 'Complete Registration' : 'Continue'}
              <i className="ri-arrow-right-line ml-2"></i>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StorefrontRegisterPage;