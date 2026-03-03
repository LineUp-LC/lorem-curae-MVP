import { useState, useEffect, useRef } from 'react';
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
  secureCheckout?: boolean;
}

interface PurchaseOptionsProps {
  productId: number;
}

const PurchaseOptions = ({ productId }: PurchaseOptionsProps) => {
  const [sortBy, setSortBy] = useState<string>('trust');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showPricingTooltip, setShowPricingTooltip] = useState<boolean>(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown on outside click or Escape
  useEffect(() => {
    if (!showSortDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSortDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showSortDropdown]);

  // Close store modal on Escape
  useEffect(() => {
    if (!showStoreModal) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowStoreModal(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showStoreModal]);

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
      isSponsored: true,
      secureCheckout: true
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
      isSponsored: false,
      secureCheckout: true
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

  // Only show retailers that actually carry the product
  const validRetailers = retailers.filter(r => r.inStock && r.url && r.price > 0);

  const sortedRetailers = [...validRetailers].sort((a, b) => {
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

  const renderTrustScore = (score: number) => {
    const percentage = (score / 10) * 100;
    let color = 'bg-green-500';
    if (score < 8) color = 'bg-yellow-500';
    if (score < 7) color = 'bg-red-500';

    return (
      <div className="flex items-center space-x-1.5">
        <div className="w-20 h-1.5 bg-blush/30 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} transition-all`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-xs font-semibold text-deep">{score}/10</span>
      </div>
    );
  };

  return (
    <div id="where-to-buy-section" className="py-8 px-6 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-serif text-deep mb-1">Where to Buy</h2>
          <p className="text-sm text-warm-gray">
            Compare prices from trusted retailers. All prices include estimated shipping and taxes.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-warm-gray">Sort by:</label>
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-blush hover:border-primary bg-white text-xs cursor-pointer min-w-[160px] justify-between"
              >
                <span className="flex items-center gap-2">
                  <i className={`${sortOptions.find(o => o.value === sortBy)?.icon} text-primary`}></i>
                  {sortOptions.find(o => o.value === sortBy)?.label}
                </span>
                <i className={`ri-arrow-${showSortDropdown ? 'up' : 'down'}-s-line text-warm-gray`}></i>
              </button>
              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-blush rounded-xl shadow-lg z-50 overflow-hidden">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-cream transition-colors cursor-pointer ${
                        sortBy === option.value ? 'bg-primary/10 text-primary font-medium' : 'text-warm-gray'
                      }`}
                    >
                      <i className={`${option.icon} ${sortBy === option.value ? 'text-primary' : 'text-warm-gray/60'}`}></i>
                      {option.label}
                      {sortBy === option.value && <i className="ri-check-line ml-auto text-primary"></i>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="relative"
              onMouseEnter={() => setShowPricingTooltip(true)}
              onMouseLeave={() => setShowPricingTooltip(false)}
            >
              <button
                onClick={() => setShowPricingTooltip((prev) => !prev)}
                onFocus={() => setShowPricingTooltip(true)}
                onBlur={() => setShowPricingTooltip(false)}
                aria-expanded={showPricingTooltip}
                aria-describedby="pricing-tooltip"
                className="flex items-center space-x-2 text-sm text-taupe hover:text-taupe-700 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none rounded-md"
              >
                <i className="ri-information-line text-lg" aria-hidden="true"></i>
                <span className="font-medium">About Pricing</span>
              </button>
              <div
                id="pricing-tooltip"
                role="tooltip"
                className={`absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] p-4 bg-deep text-white text-sm rounded-xl shadow-xl z-50 motion-safe:transition-all motion-safe:duration-200 ${
                  showPricingTooltip
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 -translate-y-1 pointer-events-none'
                }`}
              >
                <div className="absolute -top-2 right-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-deep" aria-hidden="true"></div>
                <p className="font-semibold mb-2">How Pricing Works</p>
                <ul className="space-y-1.5 text-white/80 text-xs">
                  <li><strong className="text-white">Prices and shipping costs</strong> are provided by each retailer</li>
                  <li><strong className="text-white">Tax estimates</strong> are approximate and may differ at checkout</li>
                  <li>You complete your purchase on the <strong className="text-white">retailer's own site</strong>, where the final price is confirmed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Retailer List (top 3) */}
        <div className="space-y-3">
          {sortedRetailers.slice(0, 3).map((retailer) => (
            <div
              key={retailer.id}
              className="bg-cream-50 rounded-xl p-4 border transition-all border-blush hover:border-taupe-300 hover:shadow-lg"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Retailer Info */}
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={retailer.logo}
                      alt={retailer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-deep">
                        {retailer.name}
                      </h3>

                      {/* Sponsored Badge */}
                      {retailer.isSponsored && (
                        <span className="flex items-center space-x-0.5 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-semibold rounded-full border border-amber-300">
                          <i className="ri-star-fill"></i>
                          <span>Sponsored</span>
                        </span>
                      )}

                      {/* Affiliate Partner Badge */}
                      {retailer.isAffiliate && (
                        <span className="flex items-center space-x-0.5 px-2 py-0.5 bg-cream-100 text-cream-800 text-[10px] font-semibold rounded-full border border-light">
                          <i className="ri-shield-check-fill"></i>
                          <span>Partner</span>
                        </span>
                      )}
                    </div>

                    {/* Trust Score */}
                    <div className="mb-2">
                      <p className="text-[10px] text-warm-gray mb-0.5">Trust &amp; Reliability</p>
                      {renderTrustScore(retailer.trustScore)}
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5">
                      {retailer.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="flex items-center space-x-0.5 px-2 py-0.5 bg-white text-warm-gray text-[10px] rounded-full border border-blush"
                        >
                          <i className="ri-check-line text-taupe"></i>
                          <span>{feature}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing Details */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-6">
                      <span className="text-xs text-warm-gray">Product:</span>
                      <span className="text-xs font-medium text-deep">
                        ${retailer.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-6">
                      <span className="text-xs text-warm-gray">Shipping:</span>
                      <span className="text-xs font-medium text-deep">
                        {retailer.shipping === 0 ? 'FREE' : `$${retailer.shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-6">
                      <span className="text-xs text-warm-gray">Est. Tax:</span>
                      <span className="text-xs font-medium text-deep">
                        ${retailer.estimatedTax.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-6 pt-1 border-t border-blush">
                      <span className="text-xs font-semibold text-deep">Total:</span>
                      <span className="text-lg font-bold text-deep">
                        ${retailer.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10px] text-warm-gray text-right">
                      Delivery: {retailer.deliveryDays} days
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className="flex flex-col items-end space-y-1.5">
                    {retailer.inStock ? (
                      <>
                        <a
                          href={retailer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1.5 px-4 py-2 bg-cream text-deep rounded-full text-xs font-semibold hover:bg-blush transition-all shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap border border-blush"
                        >
                          <span>Visit Store</span>
                          <i className="ri-external-link-line"></i>
                        </a>
                        <Link
                          to={`/retailer-reviews?retailer=${encodeURIComponent(retailer.name)}`}
                          className="text-cream-600 hover:text-cream-700 text-xs font-medium cursor-pointer underline"
                        >
                          View Reviews
                        </Link>
                      </>
                    ) : (
                      <>
                        <button
                          disabled
                          className="px-4 py-2 bg-blush text-warm-gray rounded-full text-xs font-semibold cursor-not-allowed whitespace-nowrap"
                        >
                          Out of Stock
                        </button>
                        <Link
                          to={`/retailer-reviews?retailer=${encodeURIComponent(retailer.name)}`}
                          className="text-warm-gray hover:text-warm-gray text-xs font-medium cursor-pointer underline"
                        >
                          View Reviews
                        </Link>
                      </>
                    )}
                    {retailer.secureCheckout && (
                      <p className="text-[10px] text-warm-gray">
                        <i className="ri-shield-check-line text-warm-gray"></i> Secure checkout
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Stores CTA */}
        {validRetailers.length > 3 && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowStoreModal(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-taupe hover:text-dark text-sm font-medium transition-colors cursor-pointer"
            >
              <span>View all {validRetailers.length} stores</span>
              <i className="ri-arrow-right-line"></i>
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-4 p-3 bg-cream/50 rounded-xl">
          <p className="text-xs text-warm-gray text-center">
            <i className="ri-information-line"></i> Prices and availability are subject to change.
            Lorem Curae is not responsible for pricing discrepancies.
            Final prices will be confirmed at retailer checkout. Sponsored listings and affiliate partners help support our platform.
          </p>
        </div>
      </div>

      {/* Compare Stores Modal */}
      {showStoreModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-deep">Where to Buy</h3>
                <p className="text-sm text-warm-gray mt-1">{validRetailers.length} retailers carry this product</p>
              </div>
              <button
                onClick={() => setShowStoreModal(false)}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-full"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {/* Sort Pills */}
            <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2 flex-shrink-0 overflow-x-auto">
              <span className="text-xs font-medium text-warm-gray flex-shrink-0">Sort:</span>
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
                    sortBy === option.value
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-warm-gray hover:bg-cream'
                  }`}
                >
                  <i className={`${option.icon} text-xs`}></i>
                  {option.label}
                </button>
              ))}
            </div>

            {/* Scrollable Retailer List */}
            <div className="overflow-y-auto flex-1 p-6 space-y-3">
              {sortedRetailers.map((retailer) => (
                <div key={retailer.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-cream-50 border border-blush gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                      <img src={retailer.logo} alt={retailer.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-deep truncate">{retailer.name}</h4>
                        {retailer.isSponsored && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold rounded-full flex-shrink-0">Sponsored</span>
                        )}
                        {retailer.isAffiliate && (
                          <span className="px-2 py-0.5 bg-cream-100 text-cream-800 text-[10px] font-semibold rounded-full flex-shrink-0">Partner</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-warm-gray">Trust: {retailer.trustScore}/10</span>
                        <span className="text-xs text-warm-gray">{retailer.deliveryDays} day delivery</span>
                        {retailer.shipping === 0 && (
                          <span className="text-xs text-green-600 font-medium">Free shipping</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0 pl-13 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <p className="text-lg font-bold text-deep">${retailer.totalPrice.toFixed(2)}</p>
                      <p className="text-[11px] text-warm-gray">
                        ${retailer.price.toFixed(2)} + {retailer.shipping === 0 ? 'free' : `$${retailer.shipping.toFixed(2)}`} ship
                      </p>
                    </div>
                    <a
                      href={retailer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-cream text-deep rounded-full text-sm font-semibold hover:bg-blush transition-colors border border-blush cursor-pointer whitespace-nowrap"
                    >
                      Visit <i className="ri-external-link-line ml-1"></i>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Range Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
              <span className="text-sm text-warm-gray">Price range across retailers</span>
              <span className="text-sm font-semibold text-deep">
                ${Math.min(...validRetailers.map(r => r.totalPrice)).toFixed(2)} – ${Math.max(...validRetailers.map(r => r.totalPrice)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOptions;