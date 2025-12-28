import { useState } from 'react';
import { Link } from 'react-router-dom';

const ingredients = [
  {
    id: 1,
    name: 'Hyaluronic Acid',
    icon: 'ri-drop-line',
    description: 'Deeply hydrates and plumps skin by attracting moisture molecules.',
  },
  {
    id: 2,
    name: 'Niacinamide',
    icon: 'ri-star-line',
    description: 'Brightens skin tone and strengthens the protective barrier.',
  },
  {
    id: 3,
    name: 'Retinol',
    icon: 'ri-flashlight-line',
    description: 'Promotes cell turnover and reduces signs of aging effectively.',
  },
  {
    id: 4,
    name: 'Vitamin C',
    icon: 'ri-sun-line',
    description: 'Powerful antioxidant that brightens and protects from damage.',
  },
  {
    id: 5,
    name: 'Ceramides',
    icon: 'ri-shield-line',
    description: 'Restores and maintains the skin\'s natural protective barrier.',
  },
  {
    id: 6,
    name: 'Peptides',
    icon: 'ri-links-line',
    description: 'Supports collagen production for firmer, smoother skin.',
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
    <section className="py-24 bg-gradient-to-b from-white to-teal-50/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-serif text-gray-900 mb-4">
            Ingredient Transparency You Can Trust
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our science-backed <a href="/ingredients" className="text-sage-600 hover:text-sage-700 font-medium underline" title="Browse complete ingredient library">ingredient library</a> with comprehensive information about benefits, potential concerns, and scientific research. Understand how ingredients work together, which ones to avoid based on your skin type, and access clear explanations with myth-busting content and community reviews.
          </p>
        </div>

        <div className="relative">
          {/* Scroll Buttons */}
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer"
            aria-label="Scroll left"
          >
            <i className="ri-arrow-left-s-line text-2xl text-forest-800"></i>
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer"
            aria-label="Scroll right"
          >
            <i className="ri-arrow-right-s-line text-2xl text-forest-800"></i>
          </button>

          {/* Carousel */}
          <div
            id="ingredient-scroll"
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex-shrink-0 w-72 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                  <i className={`${ingredient.icon} text-3xl text-gray-600`}></i>
                </div>
                <h3 className="text-xl font-semibold text-forest-900 mb-2">
                  {ingredient.name}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {ingredient.description}
                </p>
                <Link
                  to="/ingredients"
                  className="inline-flex items-center space-x-1 text-sage-600 hover:text-sage-700 font-medium text-sm transition-colors cursor-pointer"
                >
                  <span>Learn More</span>
                  <i className="ri-arrow-right-line"></i>
                </Link>
              </div>
            ))}
          </div>

          {/* Gradient Fade */}
          <div className="absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-cream-50 to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-cream-50 to-transparent pointer-events-none"></div>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/ingredients"
            className="inline-flex items-center space-x-2 text-sage-600 hover:text-sage-700 font-semibold transition-colors cursor-pointer"
          >
            <span>Explore Full Library</span>
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}