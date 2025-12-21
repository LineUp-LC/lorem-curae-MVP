import { Link } from 'react-router-dom';

const IngredientIntelligence = () => {
  return (
    <section className="py-24 bg-cream-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://readdy.ai/api/search-image?query=scientific%20ingredient%20analysis%20display%20molecular%20structure%20skincare%20formulation%20clean%20modern%20interface%20educational%20content%20professional%20design&width=800&height=800&seq=ingredient-intel&orientation=squarish"
                alt="Ingredient Intelligence library showing scientific analysis and molecular structure of skincare ingredients"
                className="w-full h-full object-cover object-top"
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
                  <p className="text-xs text-slate-600">Easy to understand</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6">
              Ingredient Intelligence
            </h2>
            <h3 className="text-xl text-slate-600 mb-6 leading-relaxed font-semibold">
              Know what you're putting on your skin
            </h3>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Access our comprehensive <a href="/ingredients" className="text-sage-600 hover:text-sage-700 font-medium underline" title="Browse complete ingredient library">ingredient library</a> with detailed information about benefits, potential concerns, and scientific research. Understand how ingredients work together and which ones to avoid based on your skin type.
            </p>
            <Link
              to="/ingredients"
              className="inline-flex items-center space-x-3 bg-sage-600 hover:bg-sage-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg cursor-pointer whitespace-nowrap"
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
