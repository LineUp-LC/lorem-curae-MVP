import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';

const IngredientPatchTestPage = () => {
  const [searchParams] = useSearchParams();
  const ingredientName = searchParams.get('name') || 'Niacinamide';
  const ingredientType = searchParams.get('type') || 'Active Ingredient';

  const ingredient = {
    name: ingredientName,
    type: ingredientType,
    image: 'https://readdy.ai/api/search-image?query=minimalist%20skincare%20ingredient%20serum%20dropper%20bottle%20white%20background%20clean%20product%20photography%20professional%20studio%20lighting%20scientific%20aesthetic&width=400&height=400&seq=ingredient-patch-test&orientation=squarish',
    about: 'Niacinamide, also known as Vitamin B3, is a water-soluble vitamin that works with the natural substances in your skin to help visibly minimize enlarged pores, tighten lax pores, improve uneven skin tone, soften fine lines and wrinkles, diminish dullness, and strengthen a weakened surface.',
    purpose: 'Brightening, pore minimizing, anti-aging, and barrier strengthening',
    concentration: '5-10%',
    pH: '5.0-7.0',
    suitableFor: [
      'All skin types',
      'Oily and combination skin',
      'Acne-prone skin',
      'Aging skin',
      'Sensitive skin (at lower concentrations)'
    ],
    lessSuitableFor: [
      'Those allergic to niacinamide',
      'Extremely sensitive skin (at high concentrations)',
      'When used with pure vitamin C (L-ascorbic acid) at the same time'
    ],
    benefits: [
      'Reduces appearance of pores',
      'Regulates oil production',
      'Improves skin barrier function',
      'Reduces hyperpigmentation',
      'Minimizes fine lines and wrinkles',
      'Reduces redness and inflammation'
    ],
    howToUse: [
      'Apply after cleansing and toning',
      'Use morning and evening',
      'Follow with moisturizer',
      'Can be used with most other ingredients',
      'Start with lower concentrations if new to the ingredient'
    ],
    patchTestSteps: [
      'Choose a small area on your inner forearm or behind your ear',
      'Apply a small amount of the product containing the ingredient',
      'Cover with a bandage if desired',
      'Wait 24-48 hours',
      'Check for any signs of irritation, redness, or itching',
      'If no reaction occurs, you can proceed to use on your face'
    ],
    products: [
      {
        name: 'The Ordinary Niacinamide 10% + Zinc 1%',
        brand: 'The Ordinary',
        price: '$5.90',
        image: 'https://readdy.ai/api/search-image?query=the%20ordinary%20niacinamide%20serum%20bottle%20white%20background%20clean%20product%20photography%20minimalist%20packaging&width=200&height=200&seq=product-niacin-1&orientation=squarish',
        link: '/product/1'
      },
      {
        name: 'Paula\'s Choice 10% Niacinamide Booster',
        brand: 'Paula\'s Choice',
        price: '$52.00',
        image: 'https://readdy.ai/api/search-image?query=paulas%20choice%20niacinamide%20booster%20bottle%20white%20background%20clean%20product%20photography%20professional%20packaging&width=200&height=200&seq=product-niacin-2&orientation=squarish',
        link: '/product/2'
      },
      {
        name: 'CeraVe PM Facial Moisturizing Lotion',
        brand: 'CeraVe',
        price: '$16.08',
        image: 'https://readdy.ai/api/search-image?query=cerave%20pm%20moisturizer%20bottle%20white%20background%20clean%20product%20photography%20drugstore%20skincare&width=200&height=200&seq=product-niacin-3&orientation=squarish',
        link: '/product/3'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/ingredients" className="hover:text-taupe cursor-pointer">Ingredients</Link>
          <i className="ri-arrow-right-s-line"></i>
          <span className="text-gray-900 font-medium">{ingredient.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="bg-white rounded-xl p-8">
              <div className="flex items-start space-x-6">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  <img 
                    src={ingredient.image}
                    alt={ingredient.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{ingredient.name}</h1>
                      <span className="inline-block px-3 py-1 bg-taupe-100 text-taupe-700 text-sm rounded-full">
                        {ingredient.type}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Concentration</p>
                      <p className="font-semibold text-gray-900">{ingredient.concentration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">pH Level</p>
                      <p className="font-semibold text-gray-900">{ingredient.pH}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{ingredient.about}</p>
            </div>

            {/* Purpose */}
            <div className="bg-white rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Purpose</h2>
              <p className="text-gray-700">{ingredient.purpose}</p>
            </div>

            {/* Suitable For */}
            <div className="bg-white rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Most Suitable For</h2>
              <div className="space-y-3">
                {ingredient.suitableFor.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className="w-6 h-6 flex items-center justify-center bg-taupe-100 text-taupe rounded-full flex-shrink-0 mt-0.5">
                      <i className="ri-check-line text-sm"></i>
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Less Suitable For */}
            <div className="bg-white rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Less Suitable For</h2>
              <div className="space-y-3">
                {ingredient.lessSuitableFor.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full flex-shrink-0 mt-0.5">
                      <i className="ri-close-line text-sm"></i>
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Patch Test */}
            <div className="bg-gradient-to-br from-taupe to-taupe-700 rounded-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">How to Patch Test</h2>
              <div className="space-y-4">
                {ingredient.patchTestSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full flex-shrink-0 font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-taupe-50 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Buy Now */}
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Buy Products with {ingredient.name}</h3>
              <div className="space-y-4">
                {ingredient.products.map((product, idx) => (
                  <Link
                    key={idx}
                    to={product.link}
                    className="block group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-taupe-300 transition-all">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                        <img 
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-taupe transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-600">{product.brand}</p>
                        <p className="text-sm font-semibold text-taupe mt-1">{product.price}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                to="/discover"
                className="block w-full mt-4 px-4 py-3 bg-taupe text-white text-center rounded-lg font-medium hover:bg-taupe-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                View All Products
              </Link>
            </div>

            {/* Key Benefits */}
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Key Benefits</h3>
              <div className="space-y-2">
                {ingredient.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <i className="ri-star-fill text-amber-500 text-sm mt-1"></i>
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Use */}
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">How to Use</h3>
              <div className="space-y-2">
                {ingredient.howToUse.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <i className="ri-checkbox-circle-fill text-taupe text-sm mt-1"></i>
                    <span className="text-sm text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IngredientPatchTestPage;