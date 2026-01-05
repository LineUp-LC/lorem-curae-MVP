import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Conflict {
  id: string;
  severity: 'high' | 'medium' | 'low';
  products: string[];
  issue: string;
  explanation: string;
  recommendation: string;
  alternativeProducts?: {
    id: string;
    name: string;
    brand: string;
    image: string;
    reason: string;
  }[];
}

const detectedConflicts: Conflict[] = [
  {
    id: '1',
    severity: 'high',
    products: ['Vitamin C Brightening Serum', 'Night Treatment (Retinol)'],
    issue: 'Vitamin C + Retinol Conflict',
    explanation: 'Using Vitamin C and Retinol together can cause skin irritation, redness, and reduce the effectiveness of both ingredients. Vitamin C works best at a lower pH (3-4), while Retinol is more stable at a higher pH (5.5-6). When combined, they can destabilize each other and increase sensitivity.',
    recommendation: 'Use Vitamin C in your morning routine and Retinol in your evening routine. This separation allows each ingredient to work at its optimal pH level and prevents irritation.',
    alternativeProducts: [
      {
        id: 'alt-1',
        name: 'Niacinamide Brightening Serum',
        brand: 'Radiant Skin Co.',
        image: 'https://readdy.ai/api/search-image?query=elegant%20white%20dropper%20bottle%20niacinamide%20serum%20on%20marble%20surface%20with%20soft%20lighting%20minimalist%20skincare%20product%20photography%20clean%20background&width=300&height=300&seq=conflict-alt-1&orientation=squarish',
        reason: 'Niacinamide is gentler and works well with Retinol. It provides similar brightening benefits without pH conflicts, reduces inflammation, and strengthens your skin barrier.',
      },
    ],
  },
  {
    id: '2',
    severity: 'medium',
    products: ['Gentle Hydrating Cleanser', 'Vitamin C Brightening Serum'],
    issue: 'pH Imbalance Warning',
    explanation: 'Your cleanser has a pH of 6.5, which is great for maintaining skin barrier health. However, Vitamin C serums work best at a pH of 3-4. Using a higher pH cleanser immediately before Vitamin C can reduce its absorption and effectiveness by up to 50%.',
    recommendation: 'After cleansing, use a pH-balancing toner (pH 4-5) to prepare your skin for Vitamin C absorption. Wait 1-2 minutes after toning before applying your Vitamin C serum for optimal results.',
    alternativeProducts: [
      {
        id: 'alt-2',
        name: 'pH Balancing Toner',
        brand: 'Pure Balance',
        image: 'https://readdy.ai/api/search-image?query=minimalist%20clear%20glass%20bottle%20ph%20balancing%20toner%20on%20white%20surface%20with%20green%20botanical%20elements%20soft%20natural%20lighting%20clean%20product%20photography&width=300&height=300&seq=conflict-alt-2&orientation=squarish',
        reason: 'This toner adjusts your skin\'s pH to 4.5, creating the perfect environment for Vitamin C absorption. It contains gentle AHAs that enhance serum penetration without irritation.',
      },
    ],
  },
];

export default function ConflictDetection() {
  const navigate = useNavigate();
  const [expandedConflict, setExpandedConflict] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'ri-error-warning-line';
      case 'medium':
        return 'ri-alert-line';
      case 'low':
        return 'ri-information-line';
      default:
        return 'ri-information-line';
    }
  };

  if (detectedConflicts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-taupe-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-checkbox-circle-line text-taupe text-4xl"></i>
          </div>
          <h3 className="font-serif text-2xl font-bold text-deep mb-2">
            No Conflicts Detected
          </h3>
          <p className="text-gray-600">
            Your routine looks great! All products are compatible with each other.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <i className="ri-shield-check-line text-red-600 text-xl"></i>
          </div>
          <h2 className="font-serif text-3xl font-bold text-deep">
            Conflict Detection
          </h2>
        </div>
        <p className="text-gray-600 text-sm ml-13">
          We've identified {detectedConflicts.length} potential {detectedConflicts.length === 1 ? 'conflict' : 'conflicts'} in your routine
        </p>
      </div>

      {/* Conflicts List */}
      <div className="space-y-4">
        {detectedConflicts.map((conflict) => (
          <div
            key={conflict.id}
            className={`border-2 rounded-xl overflow-hidden transition-all ${
              expandedConflict === conflict.id ? 'border-deep' : 'border-gray-200'
            }`}
          >
            {/* Conflict Header */}
            <button
              onClick={() => setExpandedConflict(expandedConflict === conflict.id ? null : conflict.id)}
              className="w-full p-6 cursor-pointer hover:bg-gray-50 transition-colors text-left"
              aria-expanded={expandedConflict === conflict.id}
              aria-controls={`conflict-details-${conflict.id}`}
            >
              <div className="flex items-start gap-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-2 whitespace-nowrap ${getSeverityColor(conflict.severity)}`}>
                  <i className={getSeverityIcon(conflict.severity)}></i>
                  {conflict.severity.toUpperCase()} PRIORITY
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-bold text-deep mb-2">
                    {conflict.issue}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {conflict.products.map((product, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {product}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {conflict.explanation.substring(0, 150)}...
                  </p>
                </div>
                <span className="text-deep hover:text-deep-900 transition-colors" aria-hidden="true">
                  <i className={`text-2xl transition-transform duration-200 ${expandedConflict === conflict.id ? 'ri-arrow-up-s-line rotate-0' : 'ri-arrow-down-s-line'}`}></i>
                </span>
              </div>
            </button>

            {/* Expanded Details */}
            {expandedConflict === conflict.id && (
              <div 
                id={`conflict-details-${conflict.id}`}
                className="border-t border-gray-200 bg-cream-100 p-6 motion-safe:animate-slide-down"
              >
                {/* Full Explanation */}
                <div className="mb-6">
                  <h4 className="font-medium text-deep mb-2 flex items-center gap-2">
                    <i className="ri-information-line"></i>
                    Why This Matters
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {conflict.explanation}
                  </p>
                </div>

                {/* Recommendation */}
                <div className="mb-6 p-4 bg-white rounded-lg border border-deep/20">
                  <h4 className="font-medium text-deep mb-2 flex items-center gap-2">
                    <i className="ri-lightbulb-line"></i>
                    Our Recommendation
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {conflict.recommendation}
                  </p>
                </div>

                {/* Alternative Products */}
                {conflict.alternativeProducts && conflict.alternativeProducts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-deep mb-4 flex items-center gap-2">
                      <i className="ri-star-line"></i>
                      Better Alternatives for Your Routine
                    </h4>
                    {/* Horizontal scrollable container for mobile */}
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-2 px-2 md:grid md:grid-cols-1 md:overflow-visible md:mx-0 md:px-0">
                      {conflict.alternativeProducts.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white rounded-lg p-4 border border-gray-200 hover:border-taupe-500 transition-colors duration-fast flex-shrink-0 w-[85vw] max-w-sm snap-start md:w-full md:max-w-none"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                              <h5 className="font-medium text-deep mb-2">{product.name}</h5>
                              <div className="mb-3 p-3 bg-taupe-50 rounded-lg border border-taupe-200">
                                <p className="text-sm text-gray-700">
                                  <strong className="text-taupe-700">Why this works better:</strong> {product.reason}
                                </p>
                              </div>
                              <button
                                onClick={() => navigate(`/product-detail?id=${product.id}`)}
                                className="px-4 py-2 bg-taupe text-white rounded-lg hover:bg-taupe-700 focus:outline-none focus:ring-2 focus:ring-taupe-500 focus:ring-offset-2 transition-colors duration-fast text-sm font-medium whitespace-nowrap cursor-pointer"
                                aria-label={`View details for ${product.name}`}
                              >
                                View Product Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Educational Footer */}
      <div className="mt-8 p-6 bg-gradient-to-r from-[#2C5F4F]/5 to-[#E8956C]/5 rounded-xl border border-deep/10">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <i className="ri-book-open-line text-deep text-xl"></i>
          </div>
          <div>
            <h4 className="font-medium text-deep mb-2">Learn More About Ingredient Interactions</h4>
            <p className="text-sm text-gray-600 mb-3">
              Understanding how ingredients work together helps you build a more effective routine. Our conflict detection uses dermatological research to keep your skin safe and healthy.
            </p>
            <button
              onClick={() => navigate('/ingredients')}
              className="text-sm text-deep hover:underline font-medium cursor-pointer whitespace-nowrap"
            >
              Explore Ingredient Library →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}