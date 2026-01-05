import { Link } from 'react-router-dom';

const RewardsSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6">
              Earn Curae Points with Every Action
            </h2>
            <h3 className="text-xl text-slate-600 mb-6 leading-relaxed font-semibold">
              Get rewarded for your skincare journey
            </h3>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Earn Curae Points when you shop, review products, complete your <a href="/skin-survey" className="text-taupe hover:text-taupe-700 font-medium underline" title="Take skin assessment">skin assessment</a>, and engage with our community. Redeem points for exclusive perks, early access to features, and future discounts.
            </p>
            
            {/* Points earning examples */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-taupe-100 rounded-full flex items-center justify-center">
                  <i className="ri-shopping-bag-line text-taupe" aria-hidden="true"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Shop Smart</p>
                  <p className="text-sm text-gray-600">Earn 1-2 points per dollar spent</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-taupe-100 rounded-full flex items-center justify-center">
                  <i className="ri-star-line text-taupe" aria-hidden="true"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Share Reviews</p>
                  <p className="text-sm text-gray-600">Earn 25 points per product review</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-taupe-100 rounded-full flex items-center justify-center">
                  <i className="ri-user-heart-line text-taupe" aria-hidden="true"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Complete Your Profile</p>
                  <p className="text-sm text-gray-600">Earn up to 225 bonus points</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/discover"
                className="inline-flex items-center space-x-3 bg-taupe hover:bg-taupe-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg cursor-pointer whitespace-nowrap"
                aria-label="Start earning Curae Points"
              >
                <span>Start Earning</span>
                <i className="ri-arrow-right-line text-xl"></i>
              </Link>
              
              <Link
                to="/account"
                className="text-taupe hover:text-taupe-700 font-medium cursor-pointer whitespace-nowrap"
                title="Check your Curae Points balance"
              >
                View My Points →
              </Link>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://readdy.ai/api/search-image?query=modern%20rewards%20program%20interface%20showing%20tiered%20membership%20levels%20bronze%20silver%20gold%20platinum%20badges%20with%20point%20accumulation%20display%20clean%20minimalist%20design%20professional%20aesthetic%20celebratory%20confetti%20elements&width=800&height=800&seq=curae-points-rewards&orientation=squarish"
                alt="Curae Points rewards program showing tiered membership levels and point accumulation"
                className="w-full h-full object-cover object-top"
              />
            </div>
            
            {/* Floating Tier Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                  <i className="ri-vip-crown-line text-2xl text-white" aria-hidden="true"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Gold Tier</p>
                  <p className="text-xs text-slate-600">2,000+ Points</p>
                </div>
              </div>
            </div>
            
            {/* Floating Points Badge */}
            <div className="absolute -top-6 -right-6 bg-gradient-to-br from-taupe-500 to-taupe-700 rounded-2xl shadow-xl p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="ri-coin-line text-2xl text-white" aria-hidden="true"></i>
                </div>
                <p className="text-2xl font-bold text-white">1,250</p>
                <p className="text-xs text-white/80">Curae Points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tier Benefits Section */}
        <div className="mt-20">
          <h3 className="text-3xl font-serif text-center text-slate-900 mb-12">
            Unlock Exclusive Benefits
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bronze Tier */}
            <article className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-700 to-amber-900 rounded-full flex items-center justify-center mb-4">
                <i className="ri-medal-line text-white text-xl" aria-hidden="true"></i>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Bronze</h4>
              <p className="text-sm text-gray-600 mb-4">0+ points</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <i className="ri-check-line text-amber-700 mr-2 mt-0.5" aria-hidden="true"></i>
                  <span>1 point per $1 spent</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-amber-700 mr-2 mt-0.5" aria-hidden="true"></i>
                  <span>Community access</span>
                </li>
              </ul>
            </article>

            {/* Silver Tier */}
            <article className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-300">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mb-4">
                <i className="ri-medal-2-line text-white text-xl" aria-hidden="true"></i>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Silver</h4>
              <p className="text-sm text-gray-600 mb-4">500+ points</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <i className="ri-check-line text-gray-600 mr-2 mt-0.5" aria-hidden="true"></i>
                  <span>1.25 points per $1</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-gray-600 mr-2 mt-0.5" aria-hidden="true"></i>
                  <span>Early feature access</span>
                </li>
              </ul>
            </article>

            {/* Gold Tier */}
            <article className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-400 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                POPULAR
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-4">
                <i className="ri-vip-crown-line text-white text-xl" aria-hidden="true"></i>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Gold</h4>
              <p className="text-sm text-gray-600 mb-4">2,000+ points</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <i className="ri-check-line text-yellow-600 mr-2 mt-0.5" aria-hidden="true"></i>
                  <span>1.5 points per $1</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-yellow-600 mr-2 mt-0.5" aria-hidden="true"></i>
                  <span>Free shipping</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-yellow-600 mr-2 mt-0.5" aria-hidden="true"></i>
                  <span>Exclusive discounts</span>
                </li>
              </ul>
            </article>

            {/* Platinum Tier */}
            <article className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <i className="ri-vip-diamond-line text-white text-xl" aria-hidden="true"></i>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Platinum</h4>
              <p className="text-sm text-gray-600 mb-4">5,000+ points</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <i className="ri-check-line text-purple-600 mr-2 mt-0.5" aria-hidden="true"></i>
                  <span>2 points per $1</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-purple-600 mr-2 mt-0.5" aria-hidden="true"></i>
                  <span>VIP support</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-purple-600 mr-2 mt-0.5" aria-hidden="true"></i>
                  <span>Personal consultant</span>
                </li>
              </ul>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RewardsSection;