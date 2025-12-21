import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Retailer {
  id: number;
  name: string;
  logo: string;
  price: number;
  shipping: number;
  estimatedTax: number;
  totalPrice: number;
  trustScore: number;
  deliveryDays: string;
  inStock: boolean;
  url: string;
  features: string[];
  isAffiliate?: boolean;
  isSponsored?: boolean;
}

interface PurchaseOptionsProps {
  productId: number;
}

const PurchaseOptions = ({ productId }: PurchaseOptionsProps) => {
  const [sortBy, setSortBy] = useState<string>('trust');
  const [showTaxInfo, setShowTaxInfo] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedRetailers, setSelectedRetailers] = useState<number[]>([]);

  // Mock retailer data
  const retailers: Retailer[] = [
    {
      id: 1,
      name: 'Official Brand Store',
      logo: 'https://readdy.ai/api/search-image?query=Minimalist%20skincare%20brand%20logo%2C%20clean%20modern%20design%2C%20sage%20green%20and%20white%20colors%2C%20simple%20geometric%20shape%2C%20professional%20beauty%20brand%20identity&width=80&height=80&seq=retailer-logo-001&orientation=squarish',
      price: 45.00,
      shipping: 0,
      estimatedTax: 3.94,
      totalPrice: 48.94,
      trustScore: 9.8,
      deliveryDays: '2-3',
      inStock: true,
      url: 'https://example.com',
      features: ['Free Shipping', 'Authenticity Guaranteed', 'Rewards Program'],
      isAffiliate: true,
      isSponsored: true
    },
    {
      id: 2,
      name: 'Beauty Haven',
      logo: 'https://readdy.ai/api/search-image?query=Beauty%20retailer%20logo%2C%20elegant%20cosmetics%20store%20branding%2C%20coral%20and%20cream%20colors%2C%20sophisticated%20design%2C%20luxury%20beauty%20marketplace&width=80&height=80&seq=retailer-logo-002&orientation=squarish',
      price: 45.00,
      shipping: 5.99,
      estimatedTax: 4.46,
      totalPrice: 55.45,
      trustScore: 9.5,
      deliveryDays: '3-5',
      inStock: true,
      url: 'https://example.com',
      features: ['Verified Seller', 'Easy Returns', 'Customer Support'],
      isAffiliate: true,
      isSponsored: false
    },
    {
      id: 3,
      name: 'Glow Market',
      logo: 'https://readdy.ai/api/search-image?query=Online%20beauty%20marketplace%20logo%2C%20modern%20e-commerce%20branding%2C%20forest%20green%20accent%2C%20clean%20minimalist%20design%2C%20trusted%20retailer%20identity&width=80&height=80&seq=retailer-logo-003&orientation=squarish',
      price: 43.50,
      shipping: 4.99,
      estimatedTax: 4.24,
      totalPrice: 52.73,
      trustScore: 9.2,
      deliveryDays: '4-6',
      inStock: true,
      url: 'https://example.com',
      features: ['Price Match', 'Loyalty Points', 'Gift Wrapping'],
      isAffiliate: false,
      isSponsored: true
    },
    {
      id: 4,
      name: 'Skin Essentials',
      logo: 'https://readdy.ai/api/search-image?query=Skincare%20retailer%20logo%2C%20professional%20beauty%20store%20branding%2C%20neutral%20earth%20tones%2C%20trustworthy%20design%2C%20premium%20cosmetics%20marketplace&width=80&height=80&seq=retailer-logo-004&orientation=squarish',
      price: 46.00,
      shipping: 3.99,
      estimatedTax: 4.37,
      totalPrice: 54.36,
      trustScore: 8.9,
      deliveryDays: '3-4',
      inStock: true,
      url: 'https://example.com',
      features: ['Expert Advice', 'Sample Included', 'Secure Checkout'],
      isAffiliate: false,
      isSponsored: false
    },
    {
      id: 5,
      name: 'Pure Beauty Co',
      logo: 'https://readdy.ai/api/search-image?query=Natural%20beauty%20store%20logo%2C%20organic%20cosmetics%20branding%2C%20sage%20green%20and%20cream%2C%20eco-friendly%20design%2C%20clean%20beauty%20marketplace&width=80&height=80&seq=retailer-logo-005&orientation=squarish',
      price: 44.99,
      shipping: 6.50,
      estimatedTax: 4.50,
      totalPrice: 55.99,
      trustScore: 8.7,
      deliveryDays: '5-7',
      inStock: false,
      url: 'https://example.com',
      features: ['Eco Packaging', 'Carbon Neutral', 'Cruelty Free'],
      isAffiliate: true,
      isSponsored: false
    }
  ];

  const sortedRetailers = [...retailers].sort((a, b) => {
    // Sponsored retailers always appear first
    if (a.isSponsored && !b.isSponsored) return -1;
    if (!a.isSponsored && b.isSponsored) return 1;
    
    // Then sort by selected criteria
    switch (sortBy) {
      case 'trust':
        return b.trustScore - a.trustScore;
      case 'price-low':
        return a.totalPrice - b.totalPrice;
      case 'price-high':
        return b.totalPrice - a.totalPrice;
      case 'delivery':
        return parseInt(a.deliveryDays) - parseInt(b.deliveryDays);
      default:
        return 0;
    }
  });

  const toggleRetailerSelection = (id: number) => {
    if (selectedRetailers.includes(id)) {
      setSelectedRetailers(selectedRetailers.filter(r => r !== id));
    } else {
      if (selectedRetailers.length < 3) {
        setSelectedRetailers([...selectedRetailers, id]);
      }
    }
  };

  const compareRetailers = retailers.filter(r => selectedRetailers.includes(r.id));

  // Calculate highlights for comparison
  const getComparisonHighlights = () => {
    if (compareRetailers.length < 2) return {};

    const prices = compareRetailers.map(r => r.totalPrice);
    const trustScores = compareRetailers.map(r => r.trustScore);
    const deliveryDays = compareRetailers.map(r => parseInt(r.deliveryDays.split('-')[0]));

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const maxTrust = Math.max(...trustScores);
    const minTrust = Math.min(...trustScores);
    const minDelivery = Math.min(...deliveryDays);
    const maxDelivery = Math.max(...deliveryDays);

    return {
      minPrice,
      maxPrice,
      maxTrust,
      minTrust,
      minDelivery,
      maxDelivery,
    };
  };

  const highlights = getComparisonHighlights();

  const renderTrustScore = (score: number) => {
    const percentage = (score / 10) * 100;
    let color = 'bg-green-500';
    if (score < 8) color = 'bg-yellow-500';
    if (score < 7) color = 'bg-red-500';

    return (
      <div className="flex items-center space-x-2">
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} transition-all`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm font-semibold text-gray-900">{score}/10</span>
      </div>
    );
  };

  return (
    <div className="py-12 px-6 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-serif text-forest-900 mb-3">Where to Buy</h2>
          <p className="text-gray-600">
            Compare prices from trusted retailers. All prices include estimated shipping and taxes.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-semibold text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-full border border-gray-300 focus:border-sage-600 focus:outline-none text-sm cursor-pointer"
            >
              <option value="trust">Trust Score</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="delivery">Fastest Delivery</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowComparison(!showComparison);
                if (showComparison) setSelectedRetailers([]);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                showComparison
                  ? 'bg-sage-600 text-white'
                  : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
              }`}
            >
              <i className="ri-scales-line text-lg"></i>
              <span>{showComparison ? 'Exit Compare' : 'Compare Stores'}</span>
              {selectedRetailers.length > 0 && (
                <span className="bg-white text-sage-700 px-2 py-0.5 rounded-full text-xs font-bold">
                  {selectedRetailers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowTaxInfo(!showTaxInfo)}
              className="flex items-center space-x-2 text-sm text-sage-600 hover:text-sage-700 cursor-pointer"
            >
              <i className="ri-information-line text-lg"></i>
              <span className="font-medium">About Pricing</span>
            </button>
          </div>
        </div>

        {/* Comparison View */}
        {showComparison && selectedRetailers.length > 0 && (
          <div className="mb-8 bg-gradient-to-br from-sage-50 to-cream-50 rounded-2xl p-6 border-2 border-sage-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-forest-900 flex items-center space-x-2">
                <i className="ri-scales-line text-sage-600"></i>
                <span>Store Comparison</span>
              </h3>
              <button
                onClick={() => setSelectedRetailers([])}
                className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {compareRetailers.map((retailer) => {
                const isBestPrice = compareRetailers.length >= 2 && retailer.totalPrice === highlights.minPrice;
                const isHighestPrice = compareRetailers.length >= 2 && retailer.totalPrice === highlights.maxPrice && highlights.minPrice !== highlights.maxPrice;
                const hasFreeShipping = retailer.shipping === 0;
                const isHighestTrust = compareRetailers.length >= 2 && retailer.trustScore === highlights.maxTrust;
                const isLowestTrust = compareRetailers.length >= 2 && retailer.trustScore === highlights.minTrust && highlights.minTrust !== highlights.maxTrust;
                const isFastestDelivery = compareRetailers.length >= 2 && parseInt(retailer.deliveryDays.split('-')[0]) === highlights.minDelivery;
                const isSlowestDelivery = compareRetailers.length >= 2 && parseInt(retailer.deliveryDays.split('-')[0]) === highlights.maxDelivery && highlights.minDelivery !== highlights.maxDelivery;

                return (
                  <div key={retailer.id} className="bg-white rounded-xl p-5 border-2 border-sage-300 relative">
                    <button
                      onClick={() => toggleRetailerSelection(retailer.id)}
                      className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center bg-sage-600 text-white rounded-full hover:bg-sage-700 cursor-pointer"
                    >
                      <i className="ri-close-line text-sm"></i>
                    </button>

                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-cream-50 rounded-lg overflow-hidden">
                        <img src={retailer.logo} alt={retailer.name} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-semibold text-forest-900 text-sm">{retailer.name}</h4>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Total Price:</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg font-bold ${isBestPrice ? 'text-sage-600' : isHighestPrice ? 'text-orange-600' : 'text-gray-900'}`}>
                            ${retailer.totalPrice.toFixed(2)}
                          </span>
                          {isBestPrice && (
                            <span className="px-2 py-0.5 bg-sage-100 text-sage-700 text-xs font-semibold rounded-full whitespace-nowrap">
                              Best Price
                            </span>
                          )}
                          {isHighestPrice && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full whitespace-nowrap">
                              Highest
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Product:</span>
                        <span className="text-sm font-medium text-gray-900">${retailer.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Shipping:</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${hasFreeShipping ? 'text-sage-600 font-semibold' : 'text-gray-900'}`}>
                            {retailer.shipping === 0 ? 'FREE' : `$${retailer.shipping.toFixed(2)}`}
                          </span>
                          {hasFreeShipping && (
                            <i className="ri-check-line text-sage-600"></i>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Est. Tax:</span>
                        <span className="text-sm font-medium text-gray-900">${retailer.estimatedTax.toFixed(2)}</span>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-600">Trust Score:</span>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-semibold ${isHighestTrust ? 'text-sage-600' : isLowestTrust ? 'text-orange-600' : 'text-gray-900'}`}>
                              {retailer.trustScore}/10
                            </span>
                            {isHighestTrust && (
                              <span className="px-2 py-0.5 bg-sage-100 text-sage-700 text-xs font-semibold rounded-full whitespace-nowrap">
                                Highest Rated
                              </span>
                            )}
                            {isLowestTrust && (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full whitespace-nowrap">
                                Lowest
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Delivery:</span>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${isFastestDelivery ? 'text-sage-600 font-semibold' : isSlowestDelivery ? 'text-orange-600' : 'text-gray-900'}`}>
                              {retailer.deliveryDays} days
                            </span>
                            {isFastestDelivery && (
                              <span className="px-2 py-0.5 bg-sage-100 text-sage-700 text-xs font-semibold rounded-full whitespace-nowrap">
                                Fastest
                              </span>
                            )}
                            {isSlowestDelivery && (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full whitespace-nowrap">
                                Slowest
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <a
                      href={retailer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-sage-600 text-white rounded-full font-semibold hover:bg-sage-700 transition-all cursor-pointer text-sm whitespace-nowrap"
                    >
                      <span>Visit Store</span>
                      <i className="ri-external-link-line"></i>
                    </a>
                  </div>
                );
              })}
            </div>

            {selectedRetailers.length < 3 && (
              <p className="text-center text-sm text-gray-600 mt-4">
                Select up to {3 - selectedRetailers.length} more store{3 - selectedRetailers.length !== 1 ? 's' : ''} to compare
              </p>
            )}

            {/* Legend */}
            {compareRetailers.length >= 2 && (
              <div className="mt-6 pt-6 border-t border-sage-200">
                <div className="flex items-center justify-center gap-6 flex-wrap">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-sage-100 rounded"></div>
                    <span className="text-sm text-gray-700">Best Value</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-100 rounded"></div>
                    <span className="text-sm text-gray-700">Needs Attention</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tax Info Banner */}
        {showTaxInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full flex-shrink-0">
                <i className="ri-information-line text-xl text-blue-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-forest-900 mb-2">
                  Understanding Total Costs
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start space-x-2">
                    <i className="ri-checkbox-circle-fill text-sage-600 mt-0.5"></i>
                    <span><strong>Estimated taxes</strong> are calculated based on your location and may vary at checkout</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <i className="ri-checkbox-circle-fill text-sage-600 mt-0.5"></i>
                    <span><strong>Shipping costs</strong> are provided by each retailer and may change based on delivery speed</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <i className="ri-checkbox-circle-fill text-sage-600 mt-0.5"></i>
                    <span><strong>Total price</strong> includes product price + shipping + estimated tax for easy comparison</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <i className="ri-checkbox-circle-fill text-sage-600 mt-0.5"></i>
                    <span>Final price will be confirmed at the retailer's checkout</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Retailer List */}
        <div className="space-y-4">
          {sortedRetailers.map((retailer) => (
            <div
              key={retailer.id}
              className={`bg-cream-50 rounded-2xl p-6 border-2 transition-all ${
                selectedRetailers.includes(retailer.id)
                  ? 'border-sage-400 shadow-lg'
                  : retailer.inStock
                  ? 'border-gray-200 hover:border-sage-300 hover:shadow-lg'
                  : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Retailer Info */}
                <div className="flex items-start space-x-4 flex-1">
                  {showComparison && retailer.inStock && (
                    <button
                      onClick={() => toggleRetailerSelection(retailer.id)}
                      className={`w-6 h-6 flex items-center justify-center rounded border-2 cursor-pointer transition-all flex-shrink-0 mt-1 ${
                        selectedRetailers.includes(retailer.id)
                          ? 'bg-sage-600 border-sage-600'
                          : 'bg-white border-gray-300 hover:border-sage-400'
                      }`}
                    >
                      {selectedRetailers.includes(retailer.id) && (
                        <i className="ri-check-line text-white text-sm"></i>
                      )}
                    </button>
                  )}

                  <div className="w-20 h-20 flex items-center justify-center bg-white rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={retailer.logo}
                      alt={retailer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-forest-900">
                        {retailer.name}
                      </h3>
                      
                      {/* Sponsored Badge */}
                      {retailer.isSponsored && (
                        <span className="flex items-center space-x-1 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-300">
                          <i className="ri-star-fill"></i>
                          <span>Sponsored</span>
                        </span>
                      )}
                      
                      {/* Affiliate Partner Badge */}
                      {retailer.isAffiliate && (
                        <span className="flex items-center space-x-1 px-3 py-1 bg-sage-100 text-sage-800 text-xs font-semibold rounded-full border border-sage-300">
                          <i className="ri-shield-check-fill"></i>
                          <span>Partner</span>
                        </span>
                      )}
                    </div>
                    
                    {/* Trust Score */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Trust &amp; Reliability</p>
                      {renderTrustScore(retailer.trustScore)}
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {retailer.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="flex items-center space-x-1 px-3 py-1 bg-white text-gray-700 text-xs rounded-full border border-gray-200"
                        >
                          <i className="ri-check-line text-sage-600"></i>
                          <span>{feature}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing Details */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-8">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-sm text-gray-600">Product:</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${retailer.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-sm text-gray-600">Shipping:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {retailer.shipping === 0 ? 'FREE' : `$${retailer.shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-sm text-gray-600">Est. Tax:</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${retailer.estimatedTax.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-8 pt-2 border-t border-gray-300">
                      <span className="text-base font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-forest-900">
                        ${retailer.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 text-right">
                      Delivery: {retailer.deliveryDays} days
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className="flex flex-col items-end space-y-2">
                    {retailer.inStock ? (
                      <>
                        <a
                          href={retailer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-6 py-3 bg-sage-600 text-white rounded-full font-semibold hover:bg-sage-700 transition-all shadow-md hover:shadow-lg cursor-pointer whitespace-nowrap"
                        >
                          <span>Visit Store</span>
                          <i className="ri-external-link-line"></i>
                        </a>
                        <Link
                          to="/retailer-reviews"
                          className="text-sage-600 hover:text-sage-700 text-sm font-medium cursor-pointer underline"
                        >
                          View Reviews
                        </Link>
                      </>
                    ) : (
                      <>
                        <button
                          disabled
                          className="px-6 py-3 bg-gray-300 text-gray-500 rounded-full font-semibold cursor-not-allowed whitespace-nowrap"
                        >
                          Out of Stock
                        </button>
                        <Link
                          to="/retailer-reviews"
                          className="text-sage-600 hover:text-sage-700 text-sm font-medium cursor-pointer underline"
                        >
                          View Reviews
                        </Link>
                      </>
                    )}
                    <p className="text-xs text-gray-500">
                      <i className="ri-shield-check-line text-sage-600"></i> Secure checkout
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-600 text-center">
            <i className="ri-information-line"></i> Prices and availability are subject to change. 
            Lorem Curae is not responsible for pricing discrepancies. 
            Final prices will be confirmed at retailer checkout. Sponsored listings and affiliate partners help support our platform.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOptions;