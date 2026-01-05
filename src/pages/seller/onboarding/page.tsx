import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';

interface OnboardingData {
  businessType: 'products' | 'services' | '';
  businessName: string;
  description: string;
  category: string;
  businessAddress: string;
  contactEmail: string;
  phone: string;
  website: string;
  logo: File | null;
  businessLicense: string;
  taxId: string;
  bankAccount: string;
  routingNumber: string;
  acceptedTerms: boolean;
}

export default function SellerOnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    businessType: '',
    businessName: '',
    description: '',
    category: '',
    businessAddress: '',
    contactEmail: '',
    phone: '',
    website: '',
    logo: null,
    businessLicense: '',
    taxId: '',
    bankAccount: '',
    routingNumber: '',
    acceptedTerms: false,
  });

  const totalSteps = 5;

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Here you would typically submit to your backend
    console.log('Submitting onboarding data:', formData);
    navigate('/seller/dashboard');
  };

  const renderProgressBar = () => (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
      <div 
        className="bg-teal-500 h-2 rounded-full transition-all duration-500"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      />
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">What type of business are you?</h2>
        <p className="text-gray-600 mb-6">Choose the option that best describes your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => handleInputChange('businessType', 'products')}
          className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg ${
            formData.businessType === 'products' 
              ? 'border-teal-500 bg-teal-50' 
              : 'border-gray-200 hover:border-teal-300'
          }`}
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-taupe-100 rounded-lg flex items-center justify-center">
              <i className="ri-shopping-bag-line text-taupe text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 ml-4">Physical Products</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Sell skincare products, ingredients, supplements, or other physical items
          </p>
        </button>

        <button
          onClick={() => handleInputChange('businessType', 'services')}
          className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg ${
            formData.businessType === 'services' 
              ? 'border-teal-500 bg-teal-50' 
              : 'border-gray-200 hover:border-teal-300'
          }`}
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <i className="ri-service-line text-primary-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 ml-4">Professional Services</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Offer consultations, treatments, analysis, or other professional services
          </p>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Business Information</h2>
        <p className="text-gray-600 mb-6">Tell us about your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Enter your business name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            {formData.businessType === 'products' ? (
              <>
                <option value="skincare">Skincare Products</option>
                <option value="ingredients">Raw Ingredients</option>
                <option value="supplements">Supplements</option>
                <option value="tools">Beauty Tools</option>
              </>
            ) : (
              <>
                <option value="dermatology">Dermatology</option>
                <option value="esthetics">Esthetics</option>
                <option value="nutrition">Nutrition Consulting</option>
                <option value="coaching">Skin Coaching</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Description *</label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Describe your business and what you offer..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleInputChange('logo', e.target.files?.[0] || null)}
            className="hidden"
            id="logo-upload"
          />
          <label htmlFor="logo-upload" className="cursor-pointer">
            <i className="ri-upload-cloud-line text-gray-400 text-3xl mb-2"></i>
            <p className="text-gray-600">Click to upload your logo</p>
            <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 2MB</p>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Contact Information</h2>
        <p className="text-gray-600 mb-6">How can customers reach you?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="business@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Address *</label>
        <textarea
          rows={3}
          value={formData.businessAddress}
          onChange={(e) => handleInputChange('businessAddress', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Enter your complete business address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Website (Optional)</label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="https://www.yourwebsite.com"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Legal & Financial Information</h2>
        <p className="text-gray-600 mb-6">We need this information for tax and payment purposes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business License Number</label>
          <input
            type="text"
            value={formData.businessLicense}
            onChange={(e) => handleInputChange('businessLicense', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Enter license number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID / EIN *</label>
          <input
            type="text"
            value={formData.taxId}
            onChange={(e) => handleInputChange('taxId', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="XX-XXXXXXX"
          />
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <i className="ri-information-line text-yellow-600 text-lg mr-3 mt-1"></i>
          <div>
            <h4 className="font-medium text-yellow-800 mb-1">Payment Information</h4>
            <p className="text-yellow-700 text-sm">
              Bank account details will be collected securely after your application is approved. 
              You'll receive payment instructions via email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Review & Submit</h2>
        <p className="text-gray-600 mb-6">Please review your information before submitting</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Business Type</p>
            <p className="font-medium capitalize">{formData.businessType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Business Name</p>
            <p className="font-medium">{formData.businessName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium">{formData.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{formData.contactEmail}</p>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-6">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={formData.acceptedTerms}
            onChange={(e) => handleInputChange('acceptedTerms', e.target.checked)}
            className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <div className="text-sm">
            <p className="text-gray-900">
              I agree to the{' '}
              <a href="/terms" className="text-teal-600 hover:text-teal-700 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/seller-agreement" className="text-teal-600 hover:text-teal-700 underline">
                Seller Agreement
              </a>
            </p>
            <p className="text-gray-600 mt-1">
              By checking this box, you confirm that all information provided is accurate and complete.
            </p>
          </div>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Become a Seller</h1>
          <p className="text-lg text-gray-600">
            Join thousands of sellers on the Nutrire marketplace
          </p>
        </div>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i + 1 <= currentStep ? 'bg-teal-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Back
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !formData.businessType) ||
                  (currentStep === 2 && (!formData.businessName || !formData.category || !formData.description))
                }
                className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!formData.acceptedTerms}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Submit Application
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}