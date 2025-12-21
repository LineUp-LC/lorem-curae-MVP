import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

const PremiumPackagesPage = () => {
  const [selectedSkinType, setSelectedSkinType] = useState('all');
  const currentTier = 'premium'; // Mock: free, plus, premium

  const packages = [
    {
      id: 1,
      name: 'Radiant Glow Essentials',
      sponsor: 'Glow Naturals',
      sponsorLogo: 'https://readdy.ai/api/search-image?query=minimalist%20modern%20skincare%20brand%20logo%20clean%20aesthetic%20natural%20beauty%20leaf%20icon%20professional%20design&width=200&height=200&seq=sponsor-logo-1&orientation=squarish',
      image: 'https://readdy.ai/api/search-image?query=luxury%20skincare%20product%20bundle%20set%20elegant%20packaging%20natural%20botanical%20ingredients%20clean%20white%20background%20professional%20product%20photography%20serums%20creams%20bottles&width=800&height=600&seq=package-1&orientation=landscape',
      skinTypes: ['dry', 'normal'],
      concerns: ['Dullness', 'Uneven Tone', 'Dehydration'],
      products: 5,
      value: 189,
      price: 129,
      savings: 60,
      tier: 'premium',
      description: 'A curated collection of hydrating and brightening products tailored to your skin profile',
      items: [
        'Vitamin C Serum (30ml)',
        'Hyaluronic Acid Moisturizer (50ml)',
        'Gentle Exfoliating Toner (150ml)',
        'Nourishing Face Oil (30ml)',
        'Brightening Eye Cream (15ml)'
      ],
      featured: true
    },
    {
      id: 2,
      name: 'Clear Skin Reset',
      sponsor: 'Pure Essence Lab',
      sponsorLogo: 'https://readdy.ai/api/search-image?query=modern%20scientific%20skincare%20brand%20logo%20minimalist%20laboratory%20aesthetic%20professional%20clean%20design&width=200&height=200&seq=sponsor-logo-2&orientation=squarish',
      image: 'https://readdy.ai/api/search-image?query=clinical%20skincare%20acne%20treatment%20product%20set%20scientific%20aesthetic%20clean%20white%20background%20professional%20photography%20serums%20treatments%20bottles&width=800&height=600&seq=package-2&orientation=landscape',
      skinTypes: ['oily', 'combination'],
      concerns: ['Acne', 'Excess Oil', 'Large Pores'],
      products: 4,
      value: 156,
      price: 99,
      savings: 57,
      tier: 'premium',
      description: 'Science-backed formulations to combat breakouts and balance oil production',
      items: [
        'Salicylic Acid Cleanser (150ml)',
        'Niacinamide Serum (30ml)',
        'Oil-Free Moisturizer (50ml)',
        'Clay Mask Treatment (75ml)'
      ],
      featured: true
    },
    {
      id: 3,
      name: 'Age-Defying Ritual',
      sponsor: 'Youth Elixir',
      sponsorLogo: 'https://readdy.ai/api/search-image?query=anti%20aging%20skincare%20brand%20logo%20modern%20elegant%20timeless%20design%20professional%20aesthetic&width=200&height=200&seq=sponsor-logo-3&orientation=squarish',
      image: 'https://readdy.ai/api/search-image?query=luxury%20anti%20aging%20skincare%20product%20bundle%20elegant%20gold%20packaging%20premium%20aesthetic%20clean%20white%20background%20professional%20photography%20serums%20creams&width=800&height=600&seq=package-3&orientation=landscape',
      skinTypes: ['mature', 'dry'],
      concerns: ['Fine Lines', 'Loss of Firmness', 'Dark Spots'],
      products: 6,
      value: 245,
      price: 179,
      savings: 66,
      tier: 'premium',
      description: 'Premium anti-aging solutions with proven ingredients for visible results',
      items: [
        'Retinol Night Serum (30ml)',
        'Peptide Day Cream (50ml)',
        'Vitamin C Brightening Serum (30ml)',
        'Firming Eye Treatment (15ml)',
        'Collagen Boosting Mask (5 sheets)',
        'Antioxidant Face Oil (30ml)'
      ],
      featured: true
    },
    {
      id: 4,
      name: 'Sensitive Skin Soother',
      sponsor: 'Botanical Beauty Co',
      sponsorLogo: 'https://readdy.ai/api/search-image?query=botanical%20plant%20based%20skincare%20brand%20logo%20natural%20organic%20aesthetic%20leaf%20flower%20design&width=200&height=200&seq=sponsor-logo-4&orientation=squarish',
      image: 'https://readdy.ai/api/search-image?query=gentle%20sensitive%20skincare%20product%20bundle%20botanical%20natural%20ingredients%20soft%20packaging%20clean%20white%20background%20professional%20photography&width=800&height=600&seq=package-4&orientation=landscape',
      skinTypes: ['sensitive', 'dry'],
      concerns: ['Redness', 'Irritation', 'Sensitivity'],
      products: 4,
      value: 142,
      price: 95,
      savings: 47,
      tier: 'plus',
      description: 'Gentle, calming formulas perfect for reactive and sensitive skin',
      items: [
        'Calming Cleanser (150ml)',
        'Centella Repair Serum (30ml)',
        'Barrier Support Cream (50ml)',
        'Soothing Sheet Masks (5 pack)'
      ],
      featured: false
    },
    {
      id: 5,
      name: 'Hydration Hero Bundle',
      sponsor: 'Derma Solutions',
      sponsorLogo: 'https://readdy.ai/api/search-image?query=medical%20dermatology%20skincare%20brand%20logo%20clinical%20professional%20minimalist%20design&width=200&height=200&seq=sponsor-logo-5&orientation=squarish',
      image: 'https://readdy.ai/api/search-image?query=hydrating%20skincare%20product%20bundle%20clinical%20aesthetic%20blue%20tones%20clean%20white%20background%20professional%20photography%20serums%20moisturizers&width=800&height=600&seq=package-5&orientation=landscape',
      skinTypes: ['dry', 'dehydrated'],
      concerns: ['Dryness', 'Flakiness', 'Tightness'],
      products: 5,
      value: 168,
      price: 115,
      savings: 53,
      tier: 'plus',
      description: 'Deep hydration system for parched and dehydrated skin',
      items: [
        'Hydrating Cleanser (150ml)',
        'Hyaluronic Acid Serum (30ml)',
        'Rich Moisture Cream (50ml)',
        'Overnight Sleeping Mask (75ml)',
        'Hydrating Mist (100ml)'
      ],
      featured: false
    },
    {
      id: 6,
      name: 'Minimalist Starter Kit',
      sponsor: 'Radiance Rituals',
      sponsorLogo: 'https://readdy.ai/api/search-image?query=luxury%20premium%20skincare%20brand%20logo%20elegant%20sophisticated%20gold%20accents%20minimalist%20design&width=200&height=200&seq=sponsor-logo-6&orientation=squarish',
      image: 'https://readdy.ai/api/search-image?query=minimalist%20skincare%20starter%20kit%20simple%20elegant%20packaging%20clean%20aesthetic%20white%20background%20professional%20photography%20basic%20essentials&width=800&height=600&seq=package-6&orientation=landscape',
      skinTypes: ['all'],
      concerns: ['General Care', 'Maintenance'],
      products: 3,
      value: 89,
      price: 65,
      savings: 24,
      tier: 'plus',
      description: 'Essential basics for a simple, effective skincare routine',
      items: [
        'Gentle Cleanser (150ml)',
        'Daily Moisturizer (50ml)',
        'SPF 50 Sunscreen (50ml)'
      ],
      featured: false
    }
  ];

  const filteredPackages = selectedSkinType === 'all' 
    ? packages 
    : packages.filter(pkg => pkg.skinTypes.includes(selectedSkinType));

  const canAccessPackage = (packageTier: string) => {
    if (packageTier === 'plus') return currentTier === 'plus' || currentTier === 'premium';
    if (packageTier === 'premium') return currentTier === 'premium';
    return true;
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30"></div>
          <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium mb-4">
              <i className="ri-vip-crown-line mr-2"></i>
              Curae Luxe Exclusive
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Brand-Sponsored Skincare Packages
            </h1>
            <p className="text-xl text-amber-100 mb-8">
              Personalized bundles curated by trusted brands, tailored to your unique skin needs
            </p>
            {currentTier !== 'premium' && (
              <Link
                to="/subscription"
                className="inline-block px-8 py-4 bg-white text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                Upgrade to Premium
              </Link>
            )}
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Filter by Skin Type</h2>
                <p className="text-sm text-gray-600">Find packages perfect for your skin</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['all', 'dry', 'oily', 'combination', 'sensitive', 'normal', 'mature'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedSkinType(type)}
                    className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                      selectedSkinType === type
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Packages Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPackages.map((pkg) => {
                const hasAccess = canAccessPackage(pkg.tier);
                
                return (
                  <div
                    key={pkg.id}
                    className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all ${
                      !hasAccess ? 'opacity-75' : ''
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={pkg.image}
                        alt={pkg.name}
                        className="w-full h-full object-cover object-top"
                      />
                      {pkg.featured && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                            Featured
                          </span>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 text-white text-xs font-semibold rounded-full ${
                          pkg.tier === 'premium' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-sage-600'
                        }`}>
                          {pkg.tier === 'premium' ? 'Premium' : 'Plus'}
                        </span>
                      </div>
                      {!hasAccess && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="text-center">
                            <i className="ri-lock-line text-4xl text-white mb-2"></i>
                            <p className="text-white font-semibold">
                              {pkg.tier === 'premium' ? 'Premium' : 'Plus'} Required
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Sponsor */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-200">
                          <img 
                            src={pkg.sponsorLogo}
                            alt={pkg.sponsor}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Sponsored by</p>
                          <p className="text-sm font-semibold text-gray-900">{pkg.sponsor}</p>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>

                      {/* Concerns */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pkg.concerns.map((concern, idx) => (
                          <span key={idx} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full">
                            {concern}
                          </span>
                        ))}
                      </div>

                      {/* Items */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">
                          Includes {pkg.products} Products:
                        </p>
                        <ul className="space-y-1">
                          {pkg.items.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                              <i className="ri-check-line text-sage-600 mr-1 mt-0.5 flex-shrink-0"></i>
                              <span>{item}</span>
                            </li>
                          ))}
                          {pkg.items.length > 3 && (
                            <li className="text-sm text-gray-500">
                              + {pkg.items.length - 3} more items
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Pricing */}
                      <div className="border-t border-gray-200 pt-4 mb-4">
                        <div className="flex items-baseline justify-between mb-2">
                          <div>
                            <span className="text-2xl font-bold text-gray-900">${pkg.price}</span>
                            <span className="text-sm text-gray-500 line-through ml-2">${pkg.value}</span>
                          </div>
                          <span className="px-3 py-1 bg-sage-100 text-sage-700 text-sm font-semibold rounded-full">
                            Save ${pkg.savings}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {Math.round((pkg.savings / pkg.value) * 100)}% off retail value
                        </p>
                      </div>

                      {/* CTA */}
                      {hasAccess ? (
                        <button className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-colors whitespace-nowrap cursor-pointer">
                          Get This Package
                        </button>
                      ) : (
                        <Link
                          to="/subscription"
                          className="block w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center whitespace-nowrap cursor-pointer"
                        >
                          Upgrade to Access
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-amber-100 text-amber-600 rounded-full mx-auto mb-4">
                  <i className="ri-user-search-line text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">1. Share Your Profile</h3>
                <p className="text-gray-600">
                  Complete your skin profile with concerns, preferences, and goals
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-sage-100 text-sage-600 rounded-full mx-auto mb-4">
                  <i className="ri-magic-line text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">2. Get Matched</h3>
                <p className="text-gray-600">
                  Brands curate personalized packages based on your unique needs
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-coral-100 text-coral-600 rounded-full mx-auto mb-4">
                  <i className="ri-gift-line text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">3. Enjoy Savings</h3>
                <p className="text-gray-600">
                  Receive exclusive bundles at special rates only for premium members
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {currentTier !== 'premium' && (
          <section className="py-20 bg-gradient-to-br from-amber-500 to-orange-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30"></div>
            <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
              <h2 className="text-4xl font-bold text-white mb-6">
                Unlock Premium Packages
              </h2>
              <p className="text-xl text-amber-100 mb-8">
                Upgrade to Premium and get access to exclusive brand-sponsored bundles tailored just for you
              </p>
              <Link
                to="/subscription"
                className="inline-block px-8 py-4 bg-white text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                Upgrade to Premium
              </Link>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PremiumPackagesPage;