import { useMemo } from 'react';

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

interface RetailerComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  retailers: Retailer[];
  onRemoveRetailer: (id: number) => void;
}

export default function RetailerComparisonModal({
  isOpen,
  onClose,
  retailers,
  onRemoveRetailer,
}: RetailerComparisonModalProps) {
  // Calculate highlights for comparison
  const highlights = useMemo(() => {
    if (retailers.length < 2) return {};

    const prices = retailers.map(r => r.totalPrice);
    const trustScores = retailers.map(r => r.trustScore);
    const deliveryDays = retailers.map(r => parseInt(r.deliveryDays.split('-')[0]));

    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      maxTrust: Math.max(...trustScores),
      minTrust: Math.min(...trustScores),
      minDelivery: Math.min(...deliveryDays),
      maxDelivery: Math.max(...deliveryDays),
    };
  }, [retailers]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-blush px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full">
              <i className="ri-store-2-line text-xl text-primary"></i>
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-deep">Store Comparison</h2>
              <p className="text-sm text-warm-gray">
                Comparing {retailers.length} stores side by side
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-warm-gray hover:text-deep hover:bg-cream rounded-full transition-all cursor-pointer"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {retailers.map((retailer) => {
              const isBestPrice = retailers.length >= 2 && retailer.totalPrice === highlights.minPrice;
              const isHighestPrice = retailers.length >= 2 && retailer.totalPrice === highlights.maxPrice && highlights.minPrice !== highlights.maxPrice;
              const hasFreeShipping = retailer.shipping === 0;
              const isHighestTrust = retailers.length >= 2 && retailer.trustScore === highlights.maxTrust;
              const isLowestTrust = retailers.length >= 2 && retailer.trustScore === highlights.minTrust && highlights.minTrust !== highlights.maxTrust;
              const isFastestDelivery = retailers.length >= 2 && parseInt(retailer.deliveryDays.split('-')[0]) === highlights.minDelivery;
              const isSlowestDelivery = retailers.length >= 2 && parseInt(retailer.deliveryDays.split('-')[0]) === highlights.maxDelivery && highlights.minDelivery !== highlights.maxDelivery;

              return (
                <div
                  key={retailer.id}
                  className="bg-cream/50 rounded-2xl overflow-hidden border-2 border-blush"
                >
                  {/* Retailer Header */}
                  <div className="relative bg-white p-4 border-b border-blush">
                    <button
                      onClick={() => onRemoveRetailer(retailer.id)}
                      className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-full hover:bg-red-100 cursor-pointer"
                    >
                      <i className="ri-close-line text-lg"></i>
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 flex items-center justify-center bg-cream rounded-xl overflow-hidden flex-shrink-0">
                        <img src={retailer.logo} alt={retailer.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-deep text-lg">{retailer.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {retailer.isSponsored && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              Sponsored
                            </span>
                          )}
                          {retailer.isAffiliate && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                              Partner
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Retailer Info */}
                  <div className="p-4 space-y-3">
                    {/* Total Price */}
                    <div className={`p-3 rounded-xl transition-all ${
                      isBestPrice ? 'bg-sage/20 ring-2 ring-sage' : isHighestPrice ? 'bg-orange-50 ring-2 ring-orange-400' : 'bg-white'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-warm-gray">Total Price</p>
                        {isBestPrice && (
                          <span className="px-2 py-0.5 bg-sage text-white text-xs rounded-full font-semibold">Best Price</span>
                        )}
                        {isHighestPrice && (
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold">Highest</span>
                        )}
                      </div>
                      <span className="text-2xl font-bold text-deep">${retailer.totalPrice.toFixed(2)}</span>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-white p-3 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-warm-gray">Product:</span>
                        <span className="text-sm font-medium text-deep">${retailer.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-warm-gray">Shipping:</span>
                        <span className={`text-sm font-medium ${hasFreeShipping ? 'text-sage font-semibold' : 'text-deep'}`}>
                          {retailer.shipping === 0 ? 'FREE' : `$${retailer.shipping.toFixed(2)}`}
                          {hasFreeShipping && <i className="ri-check-line ml-1 text-sage"></i>}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-warm-gray">Est. Tax:</span>
                        <span className="text-sm font-medium text-deep">${retailer.estimatedTax.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Trust Score */}
                    <div className={`p-3 rounded-xl transition-all ${
                      isHighestTrust ? 'bg-sage/20 ring-2 ring-sage' : isLowestTrust ? 'bg-orange-50 ring-2 ring-orange-400' : 'bg-white'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-warm-gray">Trust Score</p>
                        {isHighestTrust && (
                          <span className="px-2 py-0.5 bg-sage text-white text-xs rounded-full font-semibold">Highest</span>
                        )}
                        {isLowestTrust && (
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold">Lowest</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-300 shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all ${
                              retailer.trustScore >= 9 ? 'bg-gradient-to-r from-sage to-sage/80' : retailer.trustScore >= 8 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-orange-500 to-orange-400'
                            }`}
                            style={{ width: `${(retailer.trustScore / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-base font-bold text-deep min-w-[50px]">{retailer.trustScore}/10</span>
                      </div>
                    </div>

                    {/* Delivery */}
                    <div className={`p-3 rounded-xl transition-all ${
                      isFastestDelivery ? 'bg-sage/20 ring-2 ring-sage' : isSlowestDelivery ? 'bg-orange-50 ring-2 ring-orange-400' : 'bg-white'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-warm-gray">Delivery</p>
                        {isFastestDelivery && (
                          <span className="px-2 py-0.5 bg-sage text-white text-xs rounded-full font-semibold">Fastest</span>
                        )}
                        {isSlowestDelivery && (
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-semibold">Slowest</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="ri-truck-line text-warm-gray"></i>
                        <span className="text-sm font-medium text-deep">{retailer.deliveryDays} days</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="bg-white p-3 rounded-xl">
                      <p className="text-xs font-semibold text-warm-gray mb-2">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {retailer.features.slice(0, 3).map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-cream text-warm-gray text-xs rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="bg-white p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        {retailer.inStock ? (
                          <>
                            <i className="ri-checkbox-circle-fill text-sage"></i>
                            <span className="text-sm font-medium text-sage">In Stock</span>
                          </>
                        ) : (
                          <>
                            <i className="ri-close-circle-fill text-red-500"></i>
                            <span className="text-sm font-medium text-red-500">Out of Stock</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    <a
                      href={retailer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full font-semibold transition-all cursor-pointer text-sm ${
                        retailer.inStock
                          ? 'bg-primary text-white hover:bg-dark'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Visit Store</span>
                      <i className="ri-external-link-line"></i>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-cream rounded-xl">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-sage rounded"></div>
                <span className="text-sm text-warm-gray">Best Value</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-sm text-warm-gray">Lowest Value / Priciest</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-all cursor-pointer"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
