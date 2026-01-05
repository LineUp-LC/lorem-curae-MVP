import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MarketplaceWaitlistPage = () => {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Load Mailchimp validation script
    const script = document.createElement('script');
    script.src = '//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Initialize Mailchimp validation
      if (window.jQuery) {
        (window as any).fnames = new Array();
        (window as any).ftypes = new Array();
        (window as any).fnames[0] = 'EMAIL';
        (window as any).ftypes[0] = 'email';
        (window as any).fnames[1] = 'FNAME';
        (window as any).ftypes[1] = 'text';
        (window as any).fnames[2] = 'LNAME';
        (window as any).ftypes[2] = 'text';
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-serif text-slate-900">
            Lorem Curae
          </Link>
          <a 
            href="#waitlist" 
            className="px-6 py-2.5 bg-taupe text-white rounded-full hover:bg-taupe-700 transition-colors text-sm font-medium whitespace-nowrap"
          >
            Join Waitlist
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-taupe-50 via-white to-cream-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-taupe-100 rounded-full mb-8">
            <i className="ri-store-3-line text-3xl text-taupe"></i>
          </div>
          <h1 className="text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
            Marketplace for Indie Beauty Creators
          </h1>
          <p className="text-xl text-slate-600 mb-4 leading-relaxed max-w-2xl mx-auto">
            Coming Soon
          </p>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            A transparent, creator-first platform to sell your products and grow your brand
          </p>
          <a 
            href="#waitlist" 
            className="inline-block px-8 py-4 bg-taupe text-white rounded-full hover:bg-taupe-700 transition-colors text-lg font-medium whitespace-nowrap"
          >
            Join the Creator Waitlist
          </a>
        </div>
      </section>

      {/* Who Can Sell */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-12 text-center">
            Who Can Sell
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-taupe-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-seedling-line text-2xl text-taupe"></i>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Hobbyists</h3>
              <p className="text-sm text-slate-600">Testing the waters with your first products</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-taupe-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-flask-line text-2xl text-taupe"></i>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Testers</h3>
              <p className="text-sm text-slate-600">Experimenting with formulations and feedback</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-taupe-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-store-2-line text-2xl text-taupe"></i>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Small to Mid-Size Brands</h3>
              <p className="text-sm text-slate-600">Growing indie creators ready to scale</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-taupe-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-vip-crown-line text-2xl text-taupe"></i>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Established Creators</h3>
              <p className="text-sm text-slate-600">Proven brands seeking new audiences</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Benefits */}
      <section className="py-20 px-6 bg-gradient-to-br from-cream-50 to-taupe-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-12 text-center">
            Core Benefits
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-taupe-100 rounded-full flex items-center justify-center mb-6">
                <i className="ri-user-heart-line text-2xl text-taupe"></i>
              </div>
              <h3 className="text-2xl font-serif text-slate-900 mb-4">Reach More Customers</h3>
              <p className="text-slate-600 leading-relaxed">
                Connect with our engaged community of skincare enthusiasts actively searching for quality products
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-taupe-100 rounded-full flex items-center justify-center mb-6">
                <i className="ri-line-chart-line text-2xl text-taupe"></i>
              </div>
              <h3 className="text-2xl font-serif text-slate-900 mb-4">Grow Your Sales</h3>
              <p className="text-slate-600 leading-relaxed">
                Leverage our platform's tools and analytics to optimize your storefront and increase conversions
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-taupe-100 rounded-full flex items-center justify-center mb-6">
                <i className="ri-shield-check-line text-2xl text-taupe"></i>
              </div>
              <h3 className="text-2xl font-serif text-slate-900 mb-4">Build Trust</h3>
              <p className="text-slate-600 leading-relaxed">
                Gain credibility through our verification process and customer review system
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools That Help You Stand Out */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-12 text-center">
            Tools That Help You Stand Out
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4 p-6 bg-cream-50 rounded-xl">
              <i className="ri-star-line text-2xl text-taupe flex-shrink-0 mt-1"></i>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Premium Search Placement</h3>
                <p className="text-sm text-slate-600">Get featured at the top of search results and category pages</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 bg-cream-50 rounded-xl">
              <i className="ri-medal-line text-2xl text-taupe flex-shrink-0 mt-1"></i>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Featured Badge</h3>
                <p className="text-sm text-slate-600">Stand out with verified and featured storefront badges</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 bg-cream-50 rounded-xl">
              <i className="ri-megaphone-line text-2xl text-taupe flex-shrink-0 mt-1"></i>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Promotional Tools</h3>
                <p className="text-sm text-slate-600">Run campaigns and promotions to boost visibility</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 bg-cream-50 rounded-xl">
              <i className="ri-book-open-line text-2xl text-taupe flex-shrink-0 mt-1"></i>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Brand Storytelling</h3>
                <p className="text-sm text-slate-600">Share your journey and values with custom storefront pages</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 bg-cream-50 rounded-xl">
              <i className="ri-team-line text-2xl text-taupe flex-shrink-0 mt-1"></i>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Community Growth</h3>
                <p className="text-sm text-slate-600">Build a following and engage with your customers directly</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics & Insights */}
      <section className="py-20 px-6 bg-gradient-to-br from-taupe-50 to-cream-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6 text-center">
            Analytics &amp; Insights
          </h2>
          <p className="text-lg text-slate-600 mb-12 text-center max-w-3xl mx-auto">
            Track your performance with detailed analytics on views, engagement, and sales to optimize your strategy
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center">
              <i className="ri-eye-line text-3xl text-taupe mb-4"></i>
              <h3 className="font-semibold text-slate-900 mb-2">Performance Tracking</h3>
              <p className="text-sm text-slate-600">Monitor views, clicks, and conversions</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <i className="ri-heart-pulse-line text-3xl text-taupe mb-4"></i>
              <h3 className="font-semibold text-slate-900 mb-2">Engagement Metrics</h3>
              <p className="text-sm text-slate-600">See how customers interact with your products</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <i className="ri-bar-chart-box-line text-3xl text-taupe mb-4"></i>
              <h3 className="font-semibold text-slate-900 mb-2">Sales Optimization</h3>
              <p className="text-sm text-slate-600">Identify trends and improve your offerings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Seller Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-12 text-center">
            Advanced Seller Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4 p-6 border border-gray-200 rounded-xl">
              <i className="ri-palette-line text-2xl text-taupe flex-shrink-0 mt-1"></i>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Custom Storefront</h3>
                <p className="text-sm text-slate-600">Design your storefront to match your brand identity</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 border border-gray-200 rounded-xl">
              <i className="ri-code-box-line text-2xl text-taupe flex-shrink-0 mt-1"></i>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">API Access</h3>
                <p className="text-sm text-slate-600">Integrate with your existing systems and workflows</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 border border-gray-200 rounded-xl">
              <i className="ri-customer-service-2-line text-2xl text-taupe flex-shrink-0 mt-1"></i>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Priority Support</h3>
                <p className="text-sm text-slate-600">Get dedicated help when you need it most</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 border border-gray-200 rounded-xl">
              <i className="ri-dashboard-line text-2xl text-taupe flex-shrink-0 mt-1"></i>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Advanced Analytics</h3>
                <p className="text-sm text-slate-600">Deep insights into customer behavior and trends</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Volume Incentives */}
      <section className="py-20 px-6 bg-gradient-to-br from-cream-50 to-taupe-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6 text-center">
            Volume Incentives
          </h2>
          <p className="text-lg text-slate-600 mb-4 text-center">Coming Soon</p>
          <p className="text-slate-600 mb-12 text-center max-w-3xl mx-auto">
            Transaction fees decrease as your monthly sales increase
          </p>
          <div className="grid md:grid-cols-3 gap-6 opacity-60">
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="text-3xl font-bold text-taupe mb-2">12%</div>
              <div className="text-sm text-slate-600 mb-4">Transaction Fee</div>
              <div className="text-lg font-semibold text-slate-900">$10K+ Monthly GMV</div>
            </div>
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="text-3xl font-bold text-taupe mb-2">10%</div>
              <div className="text-sm text-slate-600 mb-4">Transaction Fee</div>
              <div className="text-lg font-semibold text-slate-900">$25K+ Monthly GMV</div>
            </div>
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="text-3xl font-bold text-taupe mb-2">8%</div>
              <div className="text-sm text-slate-600 mb-4">Transaction Fee</div>
              <div className="text-lg font-semibold text-slate-900">$50K+ Monthly GMV</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Waitlist CTA */}
      <section id="waitlist" className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-taupe-100 rounded-full mb-8">
              <i className="ri-hand-heart-line text-4xl text-taupe"></i>
            </div>
            <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6">
              Join the Creator Waitlist
            </h2>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Get early access and priority onboarding when we launch. Be among the first creators to join our marketplace.
            </p>

            {/* Mailchimp Form */}
            <div id="mc_embed_signup" className="max-w-xl mx-auto">
              <form 
                action="https://link.us8.list-manage.com/subscribe/post?u=b3a22b6bbe3475a62a1f21ced&amp;id=1ed344bdf9&amp;f_id=0063b9e1f0" 
                method="post" 
                id="mc-embedded-subscribe-form" 
                name="mc-embedded-subscribe-form" 
                className="validate" 
                target="_blank"
              >
                <div id="mc_embed_signup_scroll">
                  <div className="mc-field-group mb-4">
                    <input 
                      type="email" 
                      name="EMAIL" 
                      className="required email w-full px-6 py-4 border-2 border-slate-200 rounded-full focus:border-taupe focus:outline-none text-lg" 
                      id="mce-EMAIL" 
                      required 
                      placeholder="Your email address *"
                    />
                  </div>
                  
                  <div id="mce-responses" className="clear foot">
                    <div className="response" id="mce-error-response" style={{ display: 'none' }}></div>
                    <div className="response" id="mce-success-response" style={{ display: 'none' }}></div>
                  </div>
                  
                  {/* Bot prevention field */}
                  <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
                    <input 
                      type="text" 
                      name="b_b3a22b6bbe3475a62a1f21ced_1ed344bdf9" 
                      tabIndex={-1} 
                      defaultValue="" 
                    />
                  </div>
                  
                  <div className="optionalParent">
                    <div className="clear foot">
                      <button
                        type="submit"
                        name="subscribe"
                        id="mc-embedded-subscribe"
                        className="w-full px-8 py-4 bg-taupe text-white rounded-full hover:bg-taupe-700 transition-colors text-lg font-medium whitespace-nowrap"
                      >
                        Join the Creator Waitlist
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <p className="text-sm text-slate-500 mt-6">
              We respect your privacy. No spam, ever.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <Link to="/" className="text-3xl font-serif mb-4 inline-block">
            Lorem Curae
          </Link>
          <p className="text-slate-400 mb-6">
            Empowering indie beauty creators
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <span>•</span>
            <a 
              href="https://readdy.ai/?origin=logo" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors"
            >
              Powered by Readdy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketplaceWaitlistPage;