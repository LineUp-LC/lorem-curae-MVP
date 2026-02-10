interface ResultsDisplayProps {
  data: any;
  onBackToCatalog?: () => void;
}

const ResultsDisplay = ({ data, onBackToCatalog }: ResultsDisplayProps) => {
  const recommendedProducts = [
    {
      id: 1,
      name: 'Gentle Hydrating Cleanser',
      brand: 'Pure Essence',
      step: 'Step 1: Cleanse',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=400&fit=crop&q=80',
      reason: 'Perfect for your skin type, removes impurities without stripping moisture',
    },
    {
      id: 2,
      name: 'Brightening Vitamin C Serum',
      brand: 'Glow Naturals',
      step: 'Step 2: Treat',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=400&fit=crop&q=80',
      reason: 'Addresses your concerns with powerful antioxidants and brightening agents',
    },
    {
      id: 3,
      name: 'Barrier Repair Moisturizer',
      brand: 'Skin Harmony',
      step: 'Step 3: Moisturize',
      image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=300&h=400&fit=crop&q=80',
      reason: 'Locks in hydration and strengthens your skin barrier for lasting results',
    },
  ];

  return (
    <div className="min-h-screen py-12 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBackToCatalog}
          className="flex items-center space-x-2 text-deep hover:text-taupe mb-8 cursor-pointer transition-colors"
        >
          <i className="ri-arrow-left-line text-xl"></i>
          <span className="font-medium">Back to Products</span>
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-taupe-100 rounded-full mb-6">
            <i className="ri-checkbox-circle-line text-4xl text-taupe"></i>
          </div>
          <h1 className="text-4xl lg:text-5xl font-serif text-deep-900 mb-4">
            Your Personalized Routine
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Based on your answers, we've curated a science-backed routine tailored to your unique skin needs and goals.
          </p>
        </div>

        {/* Skin Profile Summary */}
        <div className="bg-gradient-to-br from-taupe-50 to-cream-100 rounded-3xl p-8 mb-12 shadow-lg">
          <h2 className="text-2xl font-serif text-deep-900 mb-6">Your Skin Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center bg-taupe-100 rounded-full">
                  <i className="ri-user-line text-xl text-taupe"></i>
                </div>
                <h3 className="font-semibold text-deep-900">Skin Type</h3>
              </div>
              <p className="text-gray-700 capitalize">{data.skinType || 'Not specified'}</p>
            </div>
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center bg-primary-100 rounded-full">
                  <i className="ri-alert-line text-xl text-primary-600"></i>
                </div>
                <h3 className="font-semibold text-deep-900">Main Concerns</h3>
              </div>
              <p className="text-gray-700">
                {data.concerns?.length > 0 ? data.concerns.join(', ') : 'None specified'}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center bg-amber-100 rounded-full">
                  <i className="ri-target-line text-xl text-amber-600"></i>
                </div>
                <h3 className="font-semibold text-deep-900">Goals</h3>
              </div>
              <p className="text-gray-700">
                {data.goals?.length > 0 ? data.goals.join(', ') : 'None specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Recommended Routine */}
        <div className="mb-12">
          <h2 className="text-3xl font-serif text-deep-900 mb-8 text-center">
            Your Morning & Evening Routine
          </h2>
          <div className="space-y-6">
            {recommendedProducts.map((product, index) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 h-64 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={product.image || '/placeholder-product.svg'}
                      alt={product.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-product.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-taupe-100 text-taupe-700 text-sm font-semibold rounded-full mb-3">
                        {product.step}
                      </span>
                      <h3 className="text-2xl font-semibold text-deep-900 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-gray-600">by {product.brand}</p>
                    </div>
                    <div className="flex items-start space-x-3 bg-cream-50 rounded-xl p-4">
                      <i className="ri-lightbulb-line text-2xl text-taupe flex-shrink-0 mt-1"></i>
                      <div>
                        <p className="font-medium text-deep-900 mb-1">Why we recommend this:</p>
                        <p className="text-gray-700 text-sm leading-relaxed">{product.reason}</p>
                      </div>
                    </div>
                    <button className="w-full md:w-auto px-8 py-3 bg-taupe text-white rounded-full font-semibold hover:bg-taupe-700 transition-colors whitespace-nowrap cursor-pointer">
                      Add to Routine
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-deep-900 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-serif mb-4">Ready to Start Your Journey?</h2>
          <p className="text-cream-200 mb-8 max-w-2xl mx-auto">
            Save your personalized routine, track your progress, and connect with our community for ongoing support and inspiration.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-taupe text-white rounded-full font-semibold hover:bg-taupe-700 transition-all shadow-lg whitespace-nowrap cursor-pointer">
              Save My Routine
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all whitespace-nowrap cursor-pointer">
              Explore Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;