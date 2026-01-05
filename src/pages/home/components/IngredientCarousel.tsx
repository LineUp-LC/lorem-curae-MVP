import { useState } from 'react';
import { Link } from 'react-router-dom';

const ingredients = [
  {
    id: 1,
    name: 'Hyaluronic Acid',
    icon: 'ri-drop-line',
    benefit: 'Draws moisture into skin for deep hydration',
    forWhom: 'All skin types, especially dehydrated',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 2,
    name: 'Niacinamide',
    icon: 'ri-star-line',
    benefit: 'Strengthens barrier, evens tone, controls oil',
    forWhom: 'Oily, acne-prone, hyperpigmentation',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 3,
    name: 'Retinol',
    icon: 'ri-flashlight-line',
    benefit: 'Accelerates cell turnover, reduces fine lines',
    forWhom: 'Aging concerns, acne (start slow)',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    id: 4,
    name: 'Vitamin C',
    icon: 'ri-sun-line',
    benefit: 'Antioxidant protection, brightens dark spots',
    forWhom: 'Dull skin, sun damage, prevention',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 5,
    name: 'Ceramides',
    icon: 'ri-shield-line',
    benefit: 'Restores skin\'s natural protective barrier',
    forWhom: 'Dry, sensitive, compromised barrier',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    id: 6,
    name: 'Peptides',
    icon: 'ri-links-line',
    benefit: 'Signals collagen production for firmness',
    forWhom: 'Fine lines, loss of firmness',
    color: 'bg-pink-100 text-pink-600',
  },
];

export default function IngredientCarousel() {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('ingredient-scroll');
    if (container) {
      const scrollAmount = 320;
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-sage-50/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full mb-6">
            <i className="ri-flask-line text-emerald-600 text-sm"></i>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Ingredient Transparency</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-serif text-forest-900 mb-4">
            Knowledge is your best skincare product
          </h2>
          
          {/* Pain Point */}
          <p className="text-xl text-coral-700 font-medium mb-4 max-w-2xl mx-auto">
            The pain: You've avoided products because ingredient lists looked like chemistry exams.
          </p>
        </div>

        {/* Why It Matters Box */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-emerald-50 to-sage-50 rounded-2xl p-6 border border-emerald-100">
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              Understanding ingredients means you stop buying on hype and start buying on science. Our <Link to="/ingredients" className="text-sage-600 hover:text-sage-700 font-medium underline">ingredient library</Link> gives you the truth about every ingredient—what it does, who it's for, and what to watch out for.
            </p>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Scroll Buttons */}
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100"
            aria-label="Scroll left"
          >
            <i className="ri-arrow-left-s-line text-2xl text-forest-800"></i>
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100"
            aria-label="Scroll right"
          >
            <i className="ri-arrow-right-s-line text-2xl text-forest-800"></i>
          </button>

          {/* Cards */}
          <div
            id="ingredient-scroll"
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex-shrink-0 w-72 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 group cursor-pointer"
              >
                <div className={`w-14 h-14 flex items-center justify-center ${ingredient.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  <i className={`${ingredient.icon} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-semibold text-forest-900 mb-2">
                  {ingredient.name}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {ingredient.benefit}
                </p>
                <p className="text-xs text-sage-600 font-medium mb-4">
                  Best for: {ingredient.forWhom}
                </p>
                <Link
                  to="/ingredients"
                  className="inline-flex items-center space-x-1 text-sage-600 hover:text-sage-700 font-medium text-sm transition-colors"
                >
                  <span>Learn More</span>
                  <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform"></i>
                </Link>
              </div>
            ))}
          </div>

          {/* Gradient Fades */}
          <div className="absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            to="/ingredients"
            className="inline-flex items-center space-x-3 bg-sage-600 hover:bg-sage-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg"
          >
            <span>Explore Full Ingredient Library</span>
            <i className="ri-microscope-line text-xl"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}