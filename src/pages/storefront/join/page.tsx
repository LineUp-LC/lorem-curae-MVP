import { Link } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';

const StorefrontJoinPage = () => {
  return (
    <div className="min-h-screen bg-[#FDF8F5]">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#C4704D] to-[#8B4D35]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30"></div>
          <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Become An LC Storefront
            </h1>
            <p className="text-xl text-[#FDF8F5]/90 mb-8">
              Join our marketplace and connect with thousands of skincare enthusiasts
            </p>
          </div>
        </section>

        {/* Promote Your Brand */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#2D2A26] mb-4">Promote Your Brand</h2>
              <p className="text-lg text-[#6B635A] max-w-3xl mx-auto">
                Scale your business by using us to spread your message &amp; vision through your products
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-[#E8A888]/30 text-[#C4704D] rounded-full mx-auto mb-4">
                  <i className="ri-megaphone-line text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-[#2D2A26] mb-2">Reach More Customers</h3>
                <p className="text-[#6B635A]">
                  Connect with our engaged community of skincare enthusiasts actively searching for quality products
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-[#E8A888]/30 text-[#C4704D] rounded-full mx-auto mb-4">
                  <i className="ri-line-chart-line text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-[#2D2A26] mb-2">Grow Your Sales</h3>
                <p className="text-[#6B635A]">
                  Leverage our platform's tools and analytics to optimize your storefront and increase conversions
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-[#E8A888]/30 text-[#C4704D] rounded-full mx-auto mb-4">
                  <i className="ri-shield-check-line text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-[#2D2A26] mb-2">Build Trust</h3>
                <p className="text-[#6B635A]">
                  Gain credibility through our verification process and customer review system
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/storefront/register"
                className="inline-block px-8 py-4 bg-[#C4704D] text-white rounded-lg font-semibold hover:bg-[#8B4D35] transition-colors whitespace-nowrap cursor-pointer"
              >
                Join Program for Free
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing Structure */}
        <section className="py-16 bg-[#FDF8F5]">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#2D2A26] mb-4">Simple, Transparent Pricing</h2>
              <p className="text-lg text-[#6B635A] max-w-3xl mx-auto">
                No upfront costs. Only pay when you make sales. Grow your business with confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Starter Tier */}
              <div className="bg-white rounded-2xl p-8 border-2 border-[#E8A888]/30">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center bg-[#FDF8F5] text-[#6B635A] rounded-full mx-auto mb-4">
                    <i className="ri-seedling-line text-3xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-[#2D2A26] mb-2">Starter</h3>
                  <p className="text-[#6B635A] mb-4">For hobbyists and testers</p>
                </div>

                <div className="mb-6">
                  <div className="text-center mb-4">
                    <span className="text-4xl font-bold text-[#2D2A26]">20%</span>
                    <span className="text-[#6B635A] ml-2">per transaction</span>
                  </div>
                  <p className="text-sm text-[#6B635A] text-center">
                    or $2 flat fee
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-[#7A8B7A] mr-2 mt-0.5"></i>
                    <span className="text-[#6B635A]">List up to 5 products</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-[#7A8B7A] mr-2 mt-0.5"></i>
                    <span className="text-[#6B635A]">No storefront page</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-[#7A8B7A] mr-2 mt-0.5"></i>
                    <span className="text-[#6B635A]">Basic product listings</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-[#7A8B7A] mr-2 mt-0.5"></i>
                    <span className="text-[#6B635A]">No analytics</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-[#7A8B7A] mr-2 mt-0.5"></i>
                    <span className="text-[#6B635A]">Customer review system</span>
                  </li>
                </ul>

                <Link
                  to="/storefront/register?tier=starter"
                  className="block w-full px-6 py-3 border-2 border-[#C4704D] text-[#C4704D] rounded-lg font-semibold hover:bg-[#E8A888]/20 transition-colors text-center whitespace-nowrap cursor-pointer"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Standard Tier */}
              <div className="bg-white rounded-2xl p-8 border-2 border-[#E8A888]/30">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center bg-[#FDF8F5] text-[#6B635A] rounded-full mx-auto mb-4">
                    <i className="ri-store-2-line text-3xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-[#2D2A26] mb-2">Standard Storefront</h3>
                  <p className="text-[#6B635A] mb-4">Perfect for getting started</p>
                </div>

                <div className="mb-6">
                  <div className="text-center mb-4">
                    <span className="text-4xl font-bold text-[#2D2A26]">15%</span>
                    <span className="text-[#6B635A] ml-2">per transaction</span>
                  </div>
                  <p className="text-sm text-[#6B635A] text-center">
                    or $2 flat fee
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-[#7A8B7A] mr-2 mt-0.5"></i>
                    <span className="text-[#6B635A]">List unlimited products</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-[#7A8B7A] mr-2 mt-0.5"></i>
                    <span className="text-[#6B635A]">Basic storefront customization</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-[#7A8B7A] mr-2 mt-0.5"></i>
                    <span className="text-[#6B635A]">Standard search visibility</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-[#7A8B7A] mr-2 mt-0.5"></i>
                    <span className="text-[#6B635A]">Sales analytics dashboard</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-[#7A8B7A] mr-2 mt-0.5"></i>
                    <span className="text-[#6B635A]">Customer review system</span>
                  </li>
                </ul>

                <Link
                  to="/storefront/register"
                  className="block w-full px-6 py-3 border-2 border-[#C4704D] text-[#C4704D] rounded-lg font-semibold hover:bg-[#E8A888]/20 transition-colors text-center whitespace-nowrap cursor-pointer"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Premium Tier */}
              <div className="bg-gradient-to-br from-[#E8A888]/20 to-white rounded-2xl p-8 border-2 border-[#C4704D] relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-[#C4704D] text-white text-sm font-medium rounded-full">
                    Best Value
                  </span>
                </div>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-[#C4704D] to-[#8B4D35] text-white rounded-full mx-auto mb-4">
                    <i className="ri-vip-crown-line text-3xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-[#2D2A26] mb-2">Premium Visibility</h3>
                  <p className="text-[#6B635A] mb-4">Small to mid-size indie creators</p>
                </div>

                <div className="mb-6">
                  <div className="text-center mb-4">
                    <span className="text-4xl font-bold text-[#2D2A26]">10%</span>
                    <span className="text-[#6B635A] ml-2">per transaction</span>
                  </div>
                  <p className="text-sm text-[#C4704D] text-center font-medium">
                    Save 5% on every sale + premium features
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start text-sm">
                    <i className="ri-check-line text-[#C4704D] mr-2 mt-0.5"></i>
                    <span className="text-[#6B635A] font-medium">All Standard features</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-star-fill text-[#C4704D] mr-2 mt-0.5"></i>
                    <span className="text-[#6B635A] font-medium">Custom storefront</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-star-fill text-[#C4704D] mr-2 mt-0.5"></i>
                    <span className="text-[#6B635A] font-medium">Premium search placement</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-star-fill text-[#C4704D] mr-2 mt-0.5"></i>
                    <span className="text-[#6B635A] font-medium">Featured storefront badge</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-star-fill text-[#C4704D] mr-2 mt-0.5"></i>
                    <span className="text-[#6B635A] font-medium">API access</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-star-fill text-[#C4704D] mr-2 mt-0.5"></i>
                    <span className="text-[#6B635A] font-medium">Priority customer support</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-star-fill text-[#C4704D] mr-2 mt-0.5"></i>
                    <span className="text-[#6B635A] font-medium">Advanced analytics &amp; insights</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <i className="ri-star-fill text-[#C4704D] mr-2 mt-0.5"></i>
                    <span className="text-[#6B635A] font-medium">Promotional campaign tools</span>
                  </li>
                </ul>

                <Link
                  to="/storefront/register?tier=premium"
                  className="block w-full px-6 py-3 bg-gradient-to-r from-[#C4704D] to-[#8B4D35] text-white rounded-lg font-semibold hover:from-[#8B4D35] hover:to-[#C4704D] transition-colors text-center whitespace-nowrap cursor-pointer"
                >
                  Start with Premium
                </Link>
              </div>
            </div>

            {/* Volume Incentives - Coming Soon */}
            <div className="bg-white rounded-xl p-8 border border-[#E8A888]/30 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-[#E8A888]/30 text-[#8B4D35] text-xs font-semibold rounded-full">
                  Coming Soon
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#2D2A26] mb-4 text-center">Volume Incentives</h3>
              <p className="text-[#6B635A] text-center mb-6">
                Grow your business and save more. Transaction fees decrease as your monthly sales increase.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
                <div className="text-center p-4 bg-[#E8A888]/10 rounded-lg">
                  <div className="text-2xl font-bold text-[#C4704D] mb-2">$10K+</div>
                  <div className="text-sm text-[#6B635A]">Monthly GMV</div>
                  <div className="text-lg font-semibold text-[#2D2A26] mt-2">12% fee</div>
                </div>
                <div className="text-center p-4 bg-[#E8A888]/10 rounded-lg">
                  <div className="text-2xl font-bold text-[#C4704D] mb-2">$25K+</div>
                  <div className="text-sm text-[#6B635A]">Monthly GMV</div>
                  <div className="text-lg font-semibold text-[#2D2A26] mt-2">10% fee</div>
                </div>
                <div className="text-center p-4 bg-[#E8A888]/10 rounded-lg">
                  <div className="text-2xl font-bold text-[#C4704D] mb-2">$50K+</div>
                  <div className="text-sm text-[#6B635A]">Monthly GMV</div>
                  <div className="text-lg font-semibold text-[#2D2A26] mt-2">8% fee</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Authenticity Message */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
            <div className="bg-[#FDF8F5] rounded-2xl p-12 shadow-lg border border-[#E8A888]/30">
              <i className="ri-heart-line text-5xl text-[#C4704D] mb-6"></i>
              <h2 className="text-3xl font-bold text-[#2D2A26] mb-4">
                As Long As You're Authentic, We're Here For You
              </h2>
              <p className="text-lg text-[#6B635A] mb-6">
                Giving the customers a safe and trustworthy experience is our top priority, even if that comes with the cost of losing you
              </p>
              <Link
                to="/storefront/register"
                className="inline-block px-8 py-4 bg-[#C4704D] text-white rounded-lg font-semibold hover:bg-[#8B4D35] transition-colors whitespace-nowrap cursor-pointer"
              >
                Join Program for Free
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-[#FDF8F5]">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <h2 className="text-4xl font-bold text-[#2D2A26] text-center mb-12">Benefits</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-[#E8A888]/20 to-white rounded-xl p-8 border border-[#E8A888]/30">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#C4704D] text-white rounded-lg flex-shrink-0">
                    <i className="ri-user-heart-line text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#2D2A26] mb-2">Reach Skincare Enthusiasts</h3>
                    <p className="text-[#6B635A]">
                      Access a dedicated community of users actively seeking skincare solutions and willing to invest in quality products
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#E8A888]/20 to-white rounded-xl p-8 border border-[#E8A888]/30">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#C4704D] text-white rounded-lg flex-shrink-0">
                    <i className="ri-trophy-line text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#2D2A26] mb-2">Showcase Your Expertise</h3>
                    <p className="text-[#6B635A]">
                      Highlight your brand story, values, and product formulations to build authentic connections with customers
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#E8A888]/20 to-white rounded-xl p-8 border border-[#E8A888]/30">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#C4704D] text-white rounded-lg flex-shrink-0">
                    <i className="ri-team-line text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#2D2A26] mb-2">Grow Within Our Community</h3>
                    <p className="text-[#6B635A]">
                      Benefit from word-of-mouth marketing as satisfied customers share their experiences and recommend your products
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#E8A888]/20 to-white rounded-xl p-8 border border-[#E8A888]/30">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#C4704D] text-white rounded-lg flex-shrink-0">
                    <i className="ri-bar-chart-box-line text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#2D2A26] mb-2">Analytics &amp; Insights</h3>
                    <p className="text-[#6B635A]">
                      Track your performance with detailed analytics on views, engagement, and sales to optimize your strategy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-[#C4704D] to-[#8B4D35] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30"></div>
          <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Join Us
            </h2>
            <p className="text-xl text-[#FDF8F5]/90 mb-8">
              Ready to grow your skincare brand? Start your journey with Lorem Curae today
            </p>
            <Link
              to="/storefront/register"
              className="inline-block px-8 py-4 bg-white text-[#8B4D35] rounded-lg font-semibold hover:bg-[#FDF8F5] transition-colors whitespace-nowrap cursor-pointer"
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