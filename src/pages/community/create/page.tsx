import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';

const CommunityCreatePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [communityData, setCommunityData] = useState({
    name: '',
    description: '',
    category: '',
    privacy: 'public',
    rules: [''],
    coverImage: null as string | null
  });

  // Mock user tier check
  const userTier = 'free'; // 'free', 'basic', 'premium'
  const canCreateCommunity = userTier !== 'free';

  const categories = [
    { id: 'skin-concerns', name: 'Skin Concerns', icon: 'ri-heart-pulse-line' },
    { id: 'lifestyle', name: 'Lifestyle', icon: 'ri-leaf-line' },
    { id: 'regional-beauty', name: 'Regional Beauty', icon: 'ri-global-line' },
    { id: 'ingredients', name: 'Ingredients', icon: 'ri-flask-line' },
    { id: 'routines', name: 'Routines', icon: 'ri-calendar-check-line' },
    { id: 'reviews', name: 'Reviews', icon: 'ri-star-line' }
  ];

  const handleAddRule = () => {
    setCommunityData({
      ...communityData,
      rules: [...communityData.rules, '']
    });
  };

  const handleRemoveRule = (index: number) => {
    const newRules = communityData.rules.filter((_, i) => i !== index);
    setCommunityData({
      ...communityData,
      rules: newRules
    });
  };

  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...communityData.rules];
    newRules[index] = value;
    setCommunityData({
      ...communityData,
      rules: newRules
    });
  };

  if (!canCreateCommunity) {
    return (
      <div className="min-h-screen bg-cream-50">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-6 lg:px-12 py-24">
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-20 h-20 flex items-center justify-center bg-amber-100 text-amber-600 rounded-full mx-auto mb-6">
              <i className="ri-vip-crown-line text-4xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Upgrade to Create Communities</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Creating your own community is a premium feature. Upgrade to Curae Plus or Curae Luxe Premium to start building your own skincare community!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-sage-50 rounded-xl p-6 text-left">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Curae Plus</h3>
                  <span className="text-2xl font-bold text-sage-600">$4.99</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-700 mb-6">
                  <li className="flex items-start">
                    <i className="ri-check-line text-sage-600 mr-2 mt-0.5"></i>
                    <span>Create 1 community</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-sage-600 mr-2 mt-0.5"></i>
                    <span>Join up to 8 communities</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-sage-600 mr-2 mt-0.5"></i>
                    <span>100MB uploads</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-sage-600 mr-2 mt-0.5"></i>
                    <span>Customizable profile</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-6 text-left text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Curae Luxe Premium</h3>
                  <span className="text-2xl font-bold">$14.99</span>
                </div>
                <ul className="space-y-3 text-sm mb-6">
                  <li className="flex items-start">
                    <i className="ri-check-line mr-2 mt-0.5"></i>
                    <span>Create unlimited communities</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line mr-2 mt-0.5"></i>
                    <span>Join unlimited communities</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line mr-2 mt-0.5"></i>
                    <span>500MB uploads</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line mr-2 mt-0.5"></i>
                    <span>Custom community appearance</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line mr-2 mt-0.5"></i>
                    <span>Custom app icon</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => navigate('/community')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                Back to Community
              </button>
              <button
                onClick={() => navigate('/subscription')}
                className="px-8 py-3 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                View Plans
              </button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-8">
          <button
            onClick={() => navigate('/community')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Back to Community
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Community</h1>
          <p className="text-gray-600">Build a space for like-minded skincare enthusiasts</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 flex items-center justify-center rounded-full font-semibold ${
                  step >= s ? 'bg-sage-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    step > s ? 'bg-sage-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm font-medium text-gray-700">Basic Info</span>
            <span className="text-sm font-medium text-gray-700">Category & Privacy</span>
            <span className="text-sm font-medium text-gray-700">Rules & Guidelines</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Community Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={communityData.name}
                  onChange={(e) => setCommunityData({ ...communityData, name: e.target.value })}
                  placeholder="e.g., Acne Warriors, Natural Beauty Lovers"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={communityData.description}
                  onChange={(e) => setCommunityData({ ...communityData, description: e.target.value })}
                  placeholder="Describe what your community is about..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {communityData.description.length} / 500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <i className="ri-image-add-line text-4xl text-gray-400 mb-3"></i>
                  <p className="text-gray-600 mb-2">Upload a cover image for your community</p>
                  <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 5MB</p>
                  <input type="file" accept="image/*" className="hidden" id="cover-upload" />
                  <label
                    htmlFor="cover-upload"
                    className="inline-block px-6 py-2 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Choose Image
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setStep(2)}
                  disabled={!communityData.name || !communityData.description}
                  className="px-8 py-3 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Category & Privacy */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Category & Privacy</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCommunityData({ ...communityData, category: cat.id })}
                      className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                        communityData.category === cat.id
                          ? 'border-sage-600 bg-sage-50'
                          : 'border-gray-200 hover:border-sage-300'
                      }`}
                    >
                      <i className={`${cat.icon} text-2xl mb-2 ${
                        communityData.category === cat.id ? 'text-sage-600' : 'text-gray-600'
                      }`}></i>
                      <p className="font-medium text-gray-900">{cat.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Privacy Settings <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <button
                    onClick={() => setCommunityData({ ...communityData, privacy: 'public' })}
                    className={`w-full p-4 border-2 rounded-lg transition-all text-left cursor-pointer ${
                      communityData.privacy === 'public'
                        ? 'border-sage-600 bg-sage-50'
                        : 'border-gray-200 hover:border-sage-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <i className="ri-global-line text-2xl text-sage-600 mr-3"></i>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Public</p>
                        <p className="text-sm text-gray-600">
                          Anyone can find and join this community
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setCommunityData({ ...communityData, privacy: 'private' })}
                    className={`w-full p-4 border-2 rounded-lg transition-all text-left cursor-pointer ${
                      communityData.privacy === 'private'
                        ? 'border-sage-600 bg-sage-50'
                        : 'border-gray-200 hover:border-sage-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <i className="ri-lock-line text-2xl text-sage-600 mr-3"></i>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Private</p>
                        <p className="text-sm text-gray-600">
                          Members must request to join and be approved
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!communityData.category}
                  className="px-8 py-3 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Rules & Guidelines */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Community Rules</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Community Guidelines
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Set clear rules to maintain a positive and respectful community environment
                </p>
                
                <div className="space-y-3">
                  {communityData.rules.map((rule, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <input
                        type="text"
                        value={rule}
                        onChange={(e) => handleRuleChange(index, e.target.value)}
                        placeholder={`Rule ${index + 1}`}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                      />
                      {communityData.rules.length > 1 && (
                        <button
                          onClick={() => handleRemoveRule(index)}
                          className="w-10 h-10 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <i className="ri-delete-bin-line text-xl"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddRule}
                  className="mt-3 flex items-center text-sage-600 hover:text-sage-700 font-medium cursor-pointer"
                >
                  <i className="ri-add-line mr-1"></i>
                  Add Another Rule
                </button>
              </div>

              <div className="bg-sage-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Preview</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Community Name</p>
                    <p className="font-semibold text-gray-900">{communityData.name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="font-semibold text-gray-900">
                      {categories.find(c => c.id === communityData.category)?.name || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Privacy</p>
                    <p className="font-semibold text-gray-900 capitalize">{communityData.privacy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rules</p>
                    <ul className="space-y-1">
                      {communityData.rules.filter(r => r).map((rule, idx) => (
                        <li key={idx} className="text-sm text-gray-900">• {rule}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    // Create community logic here
                    navigate('/community');
                  }}
                  className="px-8 py-3 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Create Community
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityCreatePage;