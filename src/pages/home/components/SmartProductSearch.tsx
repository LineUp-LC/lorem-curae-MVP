import { Link } from 'react-router-dom';

// Unsplash - woman using phone for skincare research
const SEARCH_IMAGE = 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80';

const SmartProductSearch = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Pain Point Callout */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-coral-50 text-coral-700 rounded-full text-sm font-medium mb-4">
            <i className="ri-error-warning-line"></i>
            The Problem
          </span>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            You've scrolled through hundreds of products on Sephora, read conflicting reviews, 
            and still have no idea what actually works for <em>your</em> skin.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-xs font-semibold mb-4">
              <i className="ri-search-eye-line"></i>
              Smart Discovery
            </span>
            <h2 className="text-4xl lg:text-5xl font-serif text-forest-900 mb-6">
              Smart Product Finder
            </h2>
            <h3 className="text-xl text-slate-600 mb-6 leading-relaxed font-semibold">
              Find <span className="text-sage-600 bg-sage-50 px-1 rounded">exactly what your skin needs</span>—not what algorithms want to sell you.
            </h3>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Our intelligent search understands your skin type, concerns, and preferences to recommend products from verified retailers. Read reviews from people with <strong>your exact skin profile</strong>, not random strangers.
            </p>

            {/* Outcome */}
            <div className="bg-sage-50 rounded-xl p-4 mb-8 border-l-4 border-sage-600">
              <div className="flex items-start gap-3">
                <i className="ri-checkbox-circle-fill text-sage-600 text-xl mt-0.5"></i>
                <div>
                  <p className="font-semibold text-forest-900">The Outcome</p>
                  <p className="text-sm text-gray-600">Stop wasting money on products that don't work. Find your perfect matches on the first try.</p>
                </div>
              </div>
            </div>

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
                src={SEARCH_IMAGE}
                alt="Person researching skincare products on their phone"
                className="w-full h-full object-cover"
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
                  <p className="text-xs text-slate-600">Skin-matched reviews</p>
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