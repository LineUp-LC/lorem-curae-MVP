import { Link } from 'react-router-dom';

// Unsplash - natural skincare ingredients, botanical elements
const INGREDIENT_IMAGE = 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80';

const IngredientIntelligence = () => {
  return (
    <section className="py-24 bg-cream-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Pain Point Callout */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-dark rounded-full text-sm font-medium mb-4">
            <i className="ri-error-warning-line"></i>
            Ingredient Overload
          </span>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            You've avoided products because the ingredient list looked like a chemistry exam. 
            What even is "sodium hyaluronate" and is it the same as hyaluronic acid?
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={INGREDIENT_IMAGE}
                alt="Natural skincare ingredients and botanical elements"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Badge */}
            <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <i className="ri-flask-line text-2xl text-emerald-600" aria-hidden="true"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Science-Backed</p>
                  <p className="text-xs text-slate-600">Plain English explanations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold mb-4">
              <i className="ri-flask-line"></i>
              Knowledge Library
            </span>
            <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6">
              Ingredient Intelligence
            </h2>
            <h3 className="text-xl text-slate-600 mb-6 leading-relaxed font-semibold">
              Know what you're putting on your skin—in words you actually understand.
            </h3>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Access our comprehensive ingredient library with benefits, concerns, and research—
              all written for real people, not chemists. Learn which ingredients work for 
              <strong> your skin type</strong> and which to avoid.
            </p>

            {/* Why Transparency Matters */}
            <div className="bg-emerald-50 rounded-xl p-4 mb-8 border-l-4 border-emerald-500">
              <p className="text-sm font-semibold text-emerald-900 mb-2">Why Transparency Matters</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Stop buying based on hype</li>
                <li>• Start buying based on science</li>
                <li>• Know your triggers before you buy</li>
              </ul>
            </div>

            <Link
              to="/ingredients"
              className="inline-flex items-center space-x-3 bg-taupe hover:bg-taupe-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg cursor-pointer whitespace-nowrap"
              aria-label="Explore comprehensive ingredient library"
            >
              <span>Explore Ingredients</span>
              <i className="ri-microscope-line text-xl"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IngredientIntelligence;