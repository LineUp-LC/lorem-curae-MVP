import { Link } from 'react-router-dom';

const SmartProductSearch = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6">
              Smart Product Finder
            </h2>
            <h3 className="text-xl text-slate-600 mb-6 leading-relaxed font-semibold">
              Find <span className="text-sage-600 bg-sage-50 px-1 rounded">exactly what your skin needs</span>
            </h3>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Our intelligent search understands your skin type, concerns, and preferences to recommend products from verified retailers. Compare options, read reviews from people with similar skin, and make confident decisions.
            </p>
            <Link
              to="/discover"
              className="inline-flex items-center space-x-3 bg-sage-600 hover:bg-sage-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg cursor-pointer whitespace-nowrap"
              aria-label="Start searching for personalized skincare products"
            >
              <span>Start Searching</span>
              <i className="ri-search-line text-xl"></i>
            </Link>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://readdy.ai/api/search-image?query=modern%20smartphone%20displaying%20skincare%20product%20search%20interface%20clean%20minimal%20design%20product%20recommendations%20personalized%20results%20professional%20photography&width=800&height=800&seq=smart-search-visual&orientation=squarish"
                alt="Smart Product Finder interface showing personalized skincare product search and recommendations"
                className="w-full h-full object-cover object-top"
              />
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center">
                  <i className="ri-verified-badge-line text-2xl text-sage-600" aria-hidden="true"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Verified Retailers</p>
                  <p className="text-xs text-slate-600">Earn points through affiliate links</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartProductSearch;