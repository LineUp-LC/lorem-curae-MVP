import { Link } from 'react-router-dom';

const YourJourneySection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-taupe-50 to-cream-100">
      <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-taupe-100 rounded-full mb-6">
            <i className="ri-seedling-line text-4xl text-taupe"></i>
          </div>
          <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6">
            Your Skin, Your Journey
          </h2>
          <p className="text-xl text-slate-600 mb-6 leading-relaxed">
            More personalized features coming soon
          </p>
          <p className="text-lg text-slate-700 mb-10 leading-relaxed max-w-3xl mx-auto">
            Join early and help shape the future of personalized skincare. Be part of a community that values transparency, science, and individual care. Your journey starts here.
          </p>
        </div>

        <Link
          to="/waitlist"
          className="inline-flex items-center space-x-3 bg-taupe hover:bg-taupe-700 text-white px-10 py-5 rounded-full font-semibold text-lg transition-all hover:shadow-lg cursor-pointer whitespace-nowrap"
        >
          <span>Join the waitlist</span>
          <i className="ri-arrow-right-line text-xl"></i>
        </Link>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-taupe mb-2">10K+</div>
            <div className="text-sm text-slate-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-taupe mb-2">500+</div>
            <div className="text-sm text-slate-600">Products Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-taupe mb-2">98%</div>
            <div className="text-sm text-slate-600">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default YourJourneySection;