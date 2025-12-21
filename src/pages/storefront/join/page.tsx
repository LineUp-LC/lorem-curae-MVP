import { Link } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';

const StorefrontJoinPage = () => {
  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sage-600 to-sage-800"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30"></div>
          <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Become An LC Storefront
            </h1>
            <p className="text-xl text-sage-100 mb-8">
              Join our marketplace and connect with thousands of skincare enthusiasts
            </p>
          </div>
        </section>

        {/* Promote Your Brand */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Promote Your Brand</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Scale your business by using us to spread your message &amp; vision through your products
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-sage-100 text-sage-600 rounded-full mx-auto mb-4">
                  <i className="ri-megaphone-line text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Reach More Customers</h3>
                <p className="text-gray-600">
                  Connect with our engaged community of skincare enthusiasts actively searching for quality products
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-coral-100 text-coral-600 rounded-full mx-auto mb-4">
                  <i className="ri-line-chart-line text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Grow Your Sales</h3>
                <p className="text-gray-600">
                  Leverage our platform's tools and analytics to optimize your storefront and increase conversions
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full mx-auto mb-4">
                  <i className="ri-shield-check-line text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Build Trust</h3>
                <p className="text-gray-600">
                  Gain credibility through our verification process and customer review system
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/storefront/register"
                className="inline-block px-8 py-4 bg-sage-600 text-white rounded-lg font-semibold hover:bg-sage-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                Join Program for Free
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing Structure */}
        <section className="py-16 bg-cream-50">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                No upfront costs. Only pay when you make sales. Grow your business with confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Starter Tier */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full mx-auto mb-4">
                    <i className="ri-seedling-line text-3xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                  <p className="text-gray-600 mb-4">For hobbyists and testers</p>
                </div>

                <div className="mb-6">
                  <div className="text-center mb-4">
                    <span className="text-4xl font-bold text-gray-900">20%</span>
                    <span className="text-gray-600 ml-2">per transaction</span>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    or $2 flat fee
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-sage-600 mr-2 mt-0.5"></i>
                    <span className="text-gray-700">List up to 5 products</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-sage-600 mr-2 mt-0.5"></i>
                    <span className="text-gray-700">No storefront page</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-sage-600 mr-2 mt-0.5"></i>
                    <span className="text-gray-700">Basic product listings</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-sage-600 mr-2 mt-0.5"></i>
                    <span className="text-gray-700">No analytics</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-sage-600 mr-2 mt-0.5"></i>
                    <span className="text-gray-700">Customer review system</span>
                  </li>
                </ul>

                <Link
                  to="/storefront/register?tier=starter"
                  className="block w-full px-6 py-3 border-2 border-sage-600 text-sage-600 rounded-lg font-semibold hover:bg-sage-50 transition-colors text-center whitespace-nowrap cursor-pointer"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Standard Tier */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full mx-auto mb-4">
                    <i className="ri-store-2-line text-3xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Standard Storefront</h3>
                  <p className="text-gray-600 mb-4">Perfect for getting started</p>
                </div>

                <div className="mb-6">
                  <div className="text-center mb-4">
                    <span className="text-4xl font-bold text-gray-900">15%</span>
                    <span className="text-gray-600 ml-2">per transaction</span>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    or $2 flat fee
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-sage-600 mr-2 mt-0.5"></i>
                    <span className="text-gray-700">List unlimited products</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-sage-600 mr-2 mt-0.5"></i>
                    <span className="text-gray-700">Basic storefront customization</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-sage-600 mr-2 mt-0.5"></i>
                    <span className="text-gray-700">Standard search visibility</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-sage-600 mr-2 mt-0.5"></i>
                    <span className="text-gray-700">Sales analytics dashboard</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-sage-600 mr-2 mt-0.5"></i>
                    <span className="text-gray-700">Customer review system</span>
                  </li>
                </ul>

                <Link
                  to="/storefront/register"
                  className="block w-full px-6 py-3 border-2 border-sage-600 text-sage-600 rounded-lg font-semibold hover:bg-sage-50 transition-colors text-center whitespace-nowrap cursor-pointer"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Premium Tier */}
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border-2 border-purple-600 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
                    Best Value
                  </span>
                </div>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full mx-auto mb-4">
                    <i className="ri-vip-crown-line text-3xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Visibility</h3>
                  <p className="text-gray-600 mb-4">Small to mid-size indie creators</p>
                </div>

                <div className="mb-6">
                  <div className="text-center mb-4">
                    <span className="text-4xl font-bold text-gray-900">10%</span>
                    <span className="text-gray-600 ml-2">per transaction</span>
                  </div>
                  <p className="text-sm text-purple-600 text-center font-medium">
                    Save 5% on every sale + premium features
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-purple-600 mr-2 mt-0.5"></i>
                    <span className="text-gray-700 font-medium">All Standard features</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-star-fill text-purple-600 mr-2 mt-0.5"></i>
                    <span className="text-gray-700 font-medium">Custom storefront</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-star-fill text-purple-600 mr-2 mt-0.5"></i>
                    <span className="text-gray-700 font-medium">Premium search placement</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-star-fill text-purple-600 mr-2 mt-0.5"></i>
                    <span className="text-gray-700 font-medium">Featured storefront badge</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-star-fill text-purple-600 mr-2 mt-0.5"></i>
                    <span className="text-gray-700 font-medium">API access</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-star-fill text-purple-600 mr-2 mt-0.5"></i>
                    <span className="text-gray-700 font-medium">Priority customer support</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-star-fill text-purple-600 mr-2 mt-0.5"></i>
                    <span className="text-gray-700 font-medium">Advanced analytics &amp; insights</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-star-fill text-purple-600 mr-2 mt-0.5"></i>
                    <span className="text-gray-700 font-medium">Promotional campaign tools</span>
                  </li>
                </ul>

                <Link
                  to="/storefront/register?tier=premium"
                  className="block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-colors text-center whitespace-nowrap cursor-pointer"
                >
                  Start with Premium
                </Link>
              </div>
            </div>

            {/* Volume Incentives - Coming Soon */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-sage-100 text-sage-700 text-xs font-semibold rounded-full">
                  Coming Soon
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Volume Incentives</h3>
              <p className="text-gray-600 text-center mb-6">
                Grow your business and save more. Transaction fees decrease as your monthly sales increase.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
                <div className="text-center p-4 bg-sage-50 rounded-lg">
                  <div className="text-2xl font-bold text-sage-600 mb-2">$10K+</div>
                  <div className="text-sm text-gray-600">Monthly GMV</div>
                  <div className="text-lg font-semibold text-gray-900 mt-2">12% fee</div>
                </div>
                <div className="text-center p-4 bg-coral-50 rounded-lg">
                  <div className="text-2xl font-bold text-coral-600 mb-2">$25K+</div>
                  <div className="text-sm text-gray-600">Monthly GMV</div>
                  <div className="text-lg font-semibold text-gray-900 mt-2">10% fee</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">$50K+</div>
                  <div className="text-sm text-gray-600">Monthly GMV</div>
                  <div className="text-lg font-semibold text-gray-900 mt-2">8% fee</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Authenticity Message */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
            <div className="bg-cream-50 rounded-2xl p-12 shadow-lg">
              <i className="ri-heart-line text-5xl text-sage-600 mb-6"></i>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                As Long As You're Authentic, We're Here For You
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Giving the customers a safe and trustworthy experience is our top priority, even if that comes with the cost of losing you
              </p>
              <Link
                to="/storefront/register"
                className="inline-block px-8 py-4 bg-sage-600 text-white rounded-lg font-semibold hover:bg-sage-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                Join Program for Free
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-cream-50">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Benefits</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-sage-50 to-white rounded-xl p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-sage-600 text-white rounded-lg flex-shrink-0">
                    <i className="ri-user-heart-line text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Reach Skincare Enthusiasts</h3>
                    <p className="text-gray-700">
                      Access a dedicated community of users actively seeking skincare solutions and willing to invest in quality products
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-coral-50 to-white rounded-xl p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-coral-600 text-white rounded-lg flex-shrink-0">
                    <i className="ri-trophy-line text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Showcase Your Expertise</h3>
                    <p className="text-gray-700">
                      Highlight your brand story, values, and product formulations to build authentic connections with customers
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-purple-600 text-white rounded-lg flex-shrink-0">
                    <i className="ri-team-line text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Grow Within Our Community</h3>
                    <p className="text-gray-700">
                      Benefit from word-of-mouth marketing as satisfied customers share their experiences and recommend your products
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-amber-600 text-white rounded-lg flex-shrink-0">
                    <i className="ri-bar-chart-box-line text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics &amp; Insights</h3>
                    <p className="text-gray-700">
                      Track your performance with detailed analytics on views, engagement, and sales to optimize your strategy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-sage-600 to-sage-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30"></div>
          <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Join Us
            </h2>
            <p className="text-xl text-sage-100 mb-8">
              Ready to grow your skincare brand? Start your journey with Lorem Curae today
            </p>
            <Link
              to="/storefront/register"
              className="inline-block px-8 py-4 bg-white text-sage-700 rounded-lg font-semibold hover:bg-sage-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default StorefrontJoinPage;
