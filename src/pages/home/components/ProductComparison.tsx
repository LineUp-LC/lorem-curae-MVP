import { Link } from 'react-router-dom';

const ProductComparison = () => {
  return (
    <section className="py-24 bg-cream-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://readdy.ai/api/search-image?query=product%20comparison%20interface%20side%20by%20side%20skincare%20analysis%20ingredients%20pricing%20reviews%20clean%20modern%20design%20professional%20aesthetic&width=800&height=800&seq=comparison-visual&orientation=squarish"
                alt="Product Comparison tool showing side-by-side skincare product analysis with ingredients, pricing, and reviews"
                className="w-full h-full object-cover object-top"
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
                  <p className="text-xs text-slate-600">Science-backed insights</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6">
              Product Comparison
            </h2>
            <h3 className="text-xl text-slate-600 mb-6 leading-relaxed font-semibold">
              Make informed decisions
            </h3>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Compare products side-by-side to see ingredients, pricing, reviews, and compatibility with your skin type. Our <a href="/discover" className="text-sage-600 hover:text-sage-700 font-medium underline" title="Use product comparison tool">comparison tool</a> highlights key differences and helps you choose the best option for your needs.
            </p>
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
