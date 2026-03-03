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
              <h2 className="text-xl font-serif font-bold text-deep">Available Stores</h2>
              <p className="text-sm text-warm-gray">
                {retailers.length} {retailers.length === 1 ? 'store' : 'stores'} carrying this product
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
          {/* Retailer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {retailers.map((retailer) => {
              const hasFreeShipping = retailer.shipping === 0;

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
                    <div className="p-3 rounded-xl bg-white">
                      <p className="text-xs font-semibold text-warm-gray mb-1">Total Price</p>
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
                        <span className={`text-sm font-medium ${hasFreeShipping ? 'text-green-600 font-semibold' : 'text-deep'}`}>
                          {retailer.shipping === 0 ? 'FREE' : `$${retailer.shipping.toFixed(2)}`}
                          {hasFreeShipping && <i className="ri-check-line ml-1 text-green-600"></i>}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-warm-gray">Est. Tax:</span>
                        <span className="text-sm font-medium text-deep">${retailer.estimatedTax.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Trust Score */}
                    <div className="p-3 rounded-xl bg-white">
                      <p className="text-xs font-semibold text-warm-gray mb-1">Trust Score</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-300 shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all ${
                              retailer.trustScore >= 9 ? 'bg-gradient-to-r from-green-500 to-green-400' : retailer.trustScore >= 8 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-orange-500 to-orange-400'
                            }`}
                            style={{ width: `${(retailer.trustScore / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-base font-bold text-deep min-w-[50px]">{retailer.trustScore}/10</span>
                      </div>
                    </div>

                    {/* Delivery */}
                    <div className="p-3 rounded-xl bg-white">
                      <p className="text-xs font-semibold text-warm-gray mb-1">Delivery</p>
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
                            <i className="ri-checkbox-circle-fill text-green-600"></i>
                            <span className="text-sm font-medium text-green-600">In Stock</span>
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

        </div>
      </div>
    </div>
  );
}
