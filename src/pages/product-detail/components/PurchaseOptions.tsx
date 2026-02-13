import { useState } from 'react';
import { Link } from 'react-router-dom';
import RetailerComparisonModal from '../../../components/feature/RetailerComparisonModal';

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
  const [showComparisonMode, setShowComparisonMode] = useState(false);
  const [selectedRetailers, setSelectedRetailers] = useState<number[]>([]);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showPricingTooltip, setShowPricingTooltip] = useState(false);

  const sortOptions = [
    { value: 'trust', label: 'Trust Score', icon: 'ri-shield-star-line' },
    { value: 'price-low', label: 'Price: Low to High', icon: 'ri-arrow-up-line' },
    { value: 'price-high', label: 'Price: High to Low', icon: 'ri-arrow-down-line' },
    { value: 'delivery', label: 'Fastest Delivery', icon: 'ri-truck-line' },
  ];

  // Mock retailer data
  const retailers: Retailer[] = [
    {
      id: 1,
      name: 'Official Brand Store',
      logo: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=80&h=80&fit=crop&q=80',
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
      logo: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=80&h=80&fit=crop&q=80',
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
      logo: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=80&h=80&fit=crop&q=80',
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
      logo: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=80&h=80&fit=crop&q=80',
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
      logo: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=80&h=80&fit=crop&q=80',
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
    <div id="where-to-buy-section" className="py-12 px-6 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-serif text-gray-900 mb-3">Where to Buy</h2>
          <p className="text-gray-600">
            Compare prices from trusted retailers. All prices include estimated shipping and taxes.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-semibold text-gray-700">Sort by:</label>
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 hover:border-primary bg-white text-sm cursor-pointer min-w-[180px] justify-between"
              >
                <span className="flex items-center gap-2">
                  <i className={`${sortOptions.find(o => o.value === sortBy)?.icon} text-primary`}></i>
                  {sortOptions.find(o => o.value === sortBy)?.label}
                </span>
                <i className={`ri-arrow-${showSortDropdown ? 'up' : 'down'}-s-line text-gray-500`}></i>
              </button>
              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-cream transition-colors cursor-pointer ${
                        sortBy === option.value ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'
                      }`}
                    >
                      <i className={`${option.icon} ${sortBy === option.value ? 'text-primary' : 'text-gray-400'}`}></i>
                      {option.label}
                      {sortBy === option.value && <i className="ri-check-line ml-auto text-primary"></i>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowComparisonMode(!showComparisonMode);
                if (showComparisonMode) setSelectedRetailers([]);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                showComparisonMode
                  ? 'bg-primary text-white'
                  : 'bg-cream text-deep hover:bg-blush'
              }`}
            >
              <i className="ri-scales-line text-lg"></i>
              <span>{showComparisonMode ? 'Exit Compare' : 'Compare Stores'}</span>
              {selectedRetailers.length > 0 && (
                <span className="bg-white text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                  {selectedRetailers.length}
                </span>
              )}
            </button>

            {/* Compare Button - Opens Modal */}
            {selectedRetailers.length >= 2 && (
              <button
                onClick={() => setShowComparisonModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-full font-medium transition-all cursor-pointer whitespace-nowrap hover:bg-dark"
              >
                <i className="ri-bar-chart-box-line text-lg"></i>
                <span>Compare ({selectedRetailers.length})</span>
              </button>
            )}

            <div className="relative">
              <button
                onMouseEnter={() => setShowPricingTooltip(true)}
                onMouseLeave={() => setShowPricingTooltip(false)}
                className="flex items-center space-x-2 text-sm text-taupe hover:text-taupe-700 cursor-pointer"
              >
                <i className="ri-information-line text-lg"></i>
                <span className="font-medium">About Pricing</span>
              </button>
              {showPricingTooltip && (
                <div className="absolute right-0 top-full mt-2 w-80 p-4 bg-gray-900 text-white text-sm rounded-xl shadow-xl z-50">
                  <div className="absolute -top-2 right-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"></div>
                  <p className="font-semibold mb-2">Understanding Total Costs</p>
                  <ul className="space-y-1.5 text-gray-300 text-xs">
                    <li><strong className="text-white">Estimated taxes</strong> are based on your location</li>
                    <li><strong className="text-white">Shipping costs</strong> may vary by delivery speed</li>
                    <li><strong className="text-white">Total price</strong> = product + shipping + tax</li>
                    <li>Final price confirmed at retailer checkout</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selection hint when in comparison mode */}
        {showComparisonMode && selectedRetailers.length > 0 && selectedRetailers.length < 2 && (
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-sm text-deep text-center">
              <i className="ri-information-line mr-1"></i>
              Select {2 - selectedRetailers.length} more store{2 - selectedRetailers.length !== 1 ? 's' : ''} to compare
            </p>
          </div>
        )}


        {/* Retailer List */}
        <div className="space-y-4">
          {sortedRetailers.map((retailer) => (
            <div
              key={retailer.id}
              className={`bg-cream-50 rounded-2xl p-6 border-2 transition-all ${
                selectedRetailers.includes(retailer.id)
                  ? 'border-taupe-400 shadow-lg'
                  : retailer.inStock
                  ? 'border-gray-200 hover:border-taupe-300 hover:shadow-lg'
                  : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Retailer Info */}
                <div className="flex items-start space-x-4 flex-1">
                  {showComparisonMode && retailer.inStock && (
                    <button
                      onClick={() => toggleRetailerSelection(retailer.id)}
                      className={`w-6 h-6 flex items-center justify-center rounded border-2 cursor-pointer transition-all flex-shrink-0 mt-1 ${
                        selectedRetailers.includes(retailer.id)
                          ? 'bg-primary border-primary'
                          : 'bg-white border-gray-300 hover:border-primary'
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
                      <h3 className="text-xl font-semibold text-gray-900">
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
                        <span className="flex items-center space-x-1 px-3 py-1 bg-cream-100 text-cream-800 text-xs font-semibold rounded-full border border-light">
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
                          <i className="ri-check-line text-taupe"></i>
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
                      <span className="text-2xl font-bold text-gray-900">
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
                          className="flex items-center space-x-2 px-6 py-3 bg-cream text-deep rounded-full font-semibold hover:bg-blush transition-all shadow-md hover:shadow-lg cursor-pointer whitespace-nowrap border border-blush"
                        >
                          <span>Visit Store</span>
                          <i className="ri-external-link-line"></i>
                        </a>
                        <Link
                          to="/retailer-reviews"
                          className="text-cream-600 hover:text-cream-700 text-sm font-medium cursor-pointer underline"
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
                          className="text-gray-600 hover:text-gray-700 text-sm font-medium cursor-pointer underline"
                        >
                          View Reviews
                        </Link>
                      </>
                    )}
                    <p className="text-xs text-gray-500">
                      <i className="ri-shield-check-line text-gray-600"></i> Secure checkout
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

      {/* Retailer Comparison Modal */}
      <RetailerComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        retailers={compareRetailers}
        onRemoveRetailer={(id) => {
          setSelectedRetailers(prev => prev.filter(r => r !== id));
          if (selectedRetailers.length <= 2) {
            setShowComparisonModal(false);
          }
        }}
      />
    </div>
  );
};

export default PurchaseOptions;