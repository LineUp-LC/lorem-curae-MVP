import { Link } from 'react-router-dom';

// Unsplash - skincare products comparison/lineup
const COMPARISON_IMAGE = 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?auto=format&fit=crop&w=800&q=80';

const ProductComparison = () => {
  return (
    <section className="py-24 bg-cream-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Pain Point Callout */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-coral-50 text-coral-700 rounded-full text-sm font-medium mb-4">
            <i className="ri-error-warning-line"></i>
            Decision Paralysis
          </span>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            You've spent 20 minutes staring at two serums, switching between tabs, 
            trying to figure out which one is actually worth $68 vs. $19.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={COMPARISON_IMAGE}
                alt="Various skincare products arranged for comparison"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Badge */}
            <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <i className="ri-scales-3-line text-2xl text-amber-600" aria-hidden="true"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Smart Compare</p>
                  <p className="text-xs text-slate-600">Price-per-ml analysis</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold mb-4">
              <i className="ri-scales-3-line"></i>
              Side-by-Side
            </span>
            <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6">
              Product Comparison
            </h2>
            <h3 className="text-xl text-slate-600 mb-6 leading-relaxed font-semibold">
              Make informed decisions in minutes, not hours.
            </h3>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Compare products side-by-side with actual data: ingredients, pricing, reviews from 
              your skin type, and real effectiveness metrics. No more guessing.
            </p>

            {/* Why It Matters */}
            <div className="bg-amber-50 rounded-xl p-4 mb-8 border-l-4 border-amber-500">
              <p className="text-sm font-semibold text-amber-900 mb-2">Why It Matters</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• A $68 serum might have the same actives as a $19 one</li>
                <li>• Concentration matters more than brand name</li>
                <li>• Reviews from your skin type tell the real story</li>
              </ul>
            </div>

            <Link
              to="/discover"
              className="inline-flex items-center space-x-3 bg-sage-600 hover:bg-sage-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg cursor-pointer whitespace-nowrap"
              aria-label="Start comparing skincare products"
            >
              <span>Compare Products</span>
              <i className="ri-git-compare-line text-xl"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductComparison;