import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

const WaitlistLandingPage = () => {
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
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 pb-20 px-6 bg-gradient-to-br from-sage-50 via-white to-cream-50">
        <div className="max-w-4xl mx-auto text-center">
          {/* Creator Waitlist Link */}
          <div className="mb-8">
            <Link
              to="/preview-of-waitlist-early-access-2025-marketplace"
              className="inline-flex items-center space-x-2 text-taupe hover:text-taupe-700 font-medium transition-colors"
            >
              <span>Are you a creator? Join the Marketplace waitlist</span>
              <i className="ri-arrow-right-line"></i>
            </Link>
          </div>

          <div className="inline-flex items-center justify-center w-16 h-16 bg-taupe-100 rounded-full mb-8">
            <i className="ri-sparkling-2-line text-3xl text-taupe"></i>
          </div>
          <h1 className="text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
            Skincare clarity, powered by science and personalization
          </h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Discover products with confidence, understand ingredients, and get guidance tailored to your skin.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#waitlist" 
              className="px-8 py-4 bg-taupe text-white rounded-full hover:bg-taupe-700 transition-colors text-lg font-medium whitespace-nowrap w-full sm:w-auto"
            >
              Join the waitlist
            </a>
            <a 
              href="#how-it-works" 
              className="px-8 py-4 bg-white text-taupe border-2 border-taupe rounded-full hover:bg-taupe-50 transition-colors text-lg font-medium whitespace-nowrap w-full sm:w-auto"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Core Value Proposition */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6">
              Finally, skincare that makes sense
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Lorem Curae helps you cut through confusion with science-backed clarity and personalized guidance. Built for real people, not perfection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-taupe-50 rounded-2xl p-8">
              <div className="w-14 h-14 bg-taupe-100 rounded-full flex items-center justify-center mb-6">
                <i className="ri-search-line text-2xl text-taupe"></i>
              </div>
              <h3 className="text-2xl font-serif text-slate-900 mb-4">
                Trusted product discovery
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Find verified products from trusted retailers with transparent pricing and availability.
              </p>
            </div>

            <div className="bg-cream-50 rounded-2xl p-8">
              <div className="w-14 h-14 bg-cream-100 rounded-full flex items-center justify-center mb-6">
                <i className="ri-flask-line text-2xl text-taupe"></i>
              </div>
              <h3 className="text-2xl font-serif text-slate-900 mb-4">
                Ingredient transparency
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Understand what's inside your products with science-backed explanations.
              </p>
            </div>

            <div className="bg-cream-50 rounded-2xl p-8">
              <div className="w-14 h-14 bg-cream-100 rounded-full flex items-center justify-center mb-6">
                <i className="ri-robot-2-line text-2xl text-taupe"></i>
              </div>
              <h3 className="text-2xl font-serif text-slate-900 mb-4">
                Personalized AI guidance
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Get tailored recommendations that adapt to your unique skin concerns and goals.
              </p>
            </div>

            <div className="bg-taupe-50 rounded-2xl p-8">
              <div className="w-14 h-14 bg-taupe-100 rounded-full flex items-center justify-center mb-6">
                <i className="ri-book-open-line text-2xl text-taupe"></i>
              </div>
              <h3 className="text-2xl font-serif text-slate-900 mb-4">
                Clear, science-backed explanations
              </h3>
              <p className="text-slate-600 leading-relaxed">
                No jargon, no confusion—just honest, evidence-based skincare information.
              </p>
            </div>
          </div>

          <div className="text-center">
            <a 
              href="#waitlist" 
              className="inline-block px-8 py-4 bg-taupe text-white rounded-full hover:bg-taupe-700 transition-colors text-lg font-medium whitespace-nowrap"
            >
              Join the waitlist
            </a>
          </div>
        </div>
      </section>

      {/* Smart Product Search */}
      <section className="py-20 px-6 bg-gradient-to-br from-taupe-50 to-cream-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 bg-taupe-100 rounded-full mb-6">
                <i className="ri-shopping-bag-3-line text-2xl text-taupe"></i>
              </div>
              <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6">
                Find the right product — and the best place to buy it
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Our Smart Product Finder searches across multiple retailers to find the exact configuration you need—size, formulation, packaging, and more.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                When you purchase through our link, you earn rewards that can be redeemed for perks like early access, beta features, and future discounts — bringing transparency, convenience, and trust together in one place.
              </p>
              <a 
                href="#waitlist" 
                className="inline-block px-8 py-4 bg-taupe text-white rounded-full hover:bg-taupe-700 transition-colors text-lg font-medium whitespace-nowrap"
              >
                Get early access
              </a>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://readdy.ai/api/search-image?query=modern%20minimalist%20skincare%20product%20search%20interface%20on%20tablet%20screen%20with%20clean%20white%20background%20soft%20natural%20lighting%20sage%20green%20accents%20professional%20product%20photography%20style&width=600&height=600&seq=waitlist-search-1&orientation=squarish"
                  alt="Product search interface"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-taupe-100 rounded-full flex items-center justify-center">
                    <i className="ri-gift-line text-taupe"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Earn rewards</p>
                    <p className="text-xs text-slate-600">5% cashback</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredient Intelligence */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://readdy.ai/api/search-image?query=scientific%20ingredient%20analysis%20display%20with%20molecular%20structures%20and%20clean%20data%20visualization%20white%20background%20sage%20green%20highlights%20modern%20educational%20interface%20professional%20style&width=600&height=600&seq=waitlist-ingredient-1&orientation=squarish"
                  alt="Ingredient analysis"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute -top-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center">
                    <i className="ri-flask-line text-taupe"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Science-backed</p>
                    <p className="text-xs text-slate-600">Verified data</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-cream-100 rounded-full mb-6">
                <i className="ri-microscope-line text-2xl text-taupe"></i>
              </div>
              <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6">
                Understand what's inside your products
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Explore ingredient breakdowns with science-backed clarity. Every explanation is easy to understand and tailored to your concerns.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Transparency and education are at the core of Lorem Curae. Know exactly what you're putting on your skin—and why it matters.
              </p>
              <a 
                href="#waitlist" 
                className="inline-block px-8 py-4 bg-taupe text-white rounded-full hover:bg-taupe-700 transition-colors text-lg font-medium whitespace-nowrap"
              >
                Join the waitlist
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized AI Guidance */}
      <section className="py-20 px-6 bg-gradient-to-br from-cream-50 to-taupe-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 bg-taupe-100 rounded-full mb-6">
                <i className="ri-chat-smile-3-line text-2xl text-taupe"></i>
              </div>
              <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6">
                Guidance tailored to your skin
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Initially, recommendations are based on basic profile inputs from the survey. But over time, the platform learns from your behavior—such as product ratings, routine logs (notes feature), and skin progress reports—to refine its guidance.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                This feedback loop ensures you receive relevant, safe, and effective guidance tailored to your unique skincare journey.
              </p>
              <a 
                href="#waitlist" 
                className="inline-block px-8 py-4 bg-taupe text-white rounded-full hover:bg-taupe-700 transition-colors text-lg font-medium whitespace-nowrap"
              >
                Get early access
              </a>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://readdy.ai/api/search-image?query=friendly%20AI%20chat%20interface%20with%20personalized%20skincare%20recommendations%20clean%20modern%20design%20white%20background%20sage%20green%20message%20bubbles%20warm%20helpful%20conversation%20style&width=600&height=600&seq=waitlist-ai-1&orientation=squarish"
                  alt="AI guidance interface"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-taupe-100 rounded-full flex items-center justify-center">
                    <i className="ri-user-heart-line text-taupe"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Personalized</p>
                    <p className="text-xs text-slate-600">Just for you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://readdy.ai/api/search-image?query=rewards%20and%20cashback%20program%20display%20with%20coins%20and%20gift%20icons%20clean%20white%20background%20sage%20green%20accents%20modern%20loyalty%20program%20interface%20professional%20style&width=600&height=600&seq=waitlist-rewards-1&orientation=squarish"
                  alt="Rewards program"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute -top-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-taupe-100 rounded-full flex items-center justify-center">
                    <i className="ri-coin-line text-taupe"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">+250 points</p>
                    <p className="text-xs text-slate-600">Earned today</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-taupe-100 rounded-full mb-6">
                <i className="ri-gift-2-line text-2xl text-taupe"></i>
              </div>
              <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6">
                Earn rewards for smart shopping
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Find the exact product you need across verified retailers — and earn rewards when you buy through us.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Shop through our Smart Product Finder and we’ll share a portion of what we earn from our retail partners as rewards — and with cashback coming soon, you’ll get even more value for your informed choices.
              </p>
              <a 
                href="#waitlist" 
                className="inline-block px-8 py-4 bg-taupe text-white rounded-full hover:bg-taupe-700 transition-colors text-lg font-medium whitespace-nowrap"
              >
                Join the waitlist
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Credibility */}
      <section className="py-20 px-6 bg-gradient-to-br from-taupe-50 to-cream-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6">
            Built with science. Designed for real skin.
          </h2>
          <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
            Lorem Curae is founded on evidence-based skincare principles, transparent ingredient explanations, and user-centric design. We're here to help you make confident decisions—not sell you perfection.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-taupe-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-test-tube-line text-2xl text-taupe"></i>
              </div>
              <h3 className="text-xl font-serif text-slate-900 mb-3">
                Science-backed approach
              </h3>
              <p className="text-slate-600">
                Every recommendation is grounded in dermatological research and evidence-based practices.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-eye-line text-2xl text-taupe"></i>
              </div>
              <h3 className="text-xl font-serif text-slate-900 mb-3">
                Transparent ingredients
              </h3>
              <p className="text-slate-600">
                No hidden formulas, no marketing fluff—just honest, clear explanations of what's in your products.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-taupe-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-heart-3-line text-2xl text-taupe"></i>
              </div>
              <h3 className="text-xl font-serif text-slate-900 mb-3">
                User-centric design
              </h3>
              <p className="text-slate-600">
                Built for real people with real skin concerns—not influencers or perfection seekers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Waitlist CTA */}
      <section id="waitlist" className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-taupe-100 rounded-full mb-8">
              <i className="ri-seedling-line text-4xl text-taupe"></i>
            </div>
            <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6">
              Be part of the future of skincare
            </h2>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Join early and help shape Lorem Curae. Be part of a community that values transparency, science, and individual care. Your journey starts here.
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
                        Join the waitlist
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

      <Footer />
    </div>
  );
};

export default WaitlistLandingPage;