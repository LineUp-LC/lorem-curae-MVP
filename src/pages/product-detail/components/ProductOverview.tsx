import { useState } from 'react';

export default function ProductOverview() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const scrollToReviews = () => {
    setTimeout(() => {
      const reviewsSection = document.getElementById('reviews-section');
      if (reviewsSection) {
        reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Mock product data
  const product = {
    id: 1,
    name: 'Brightening Vitamin C Serum',
    brand: 'Glow Naturals',
    category: 'Serum',
    rating: 4.9,
    reviewCount: 2156,
    price: 45.00,
    image: 'https://readdy.ai/api/search-image?query=Brightening%20vitamin%20C%20serum%20in%20elegant%20glass%20dropper%20bottle%20with%20golden%20liquid%2C%20minimalist%20white%20background%2C%20professional%20product%20photography%2C%20soft%20lighting%2C%20clean%20aesthetic&width=600&height=600&seq=1&orientation=squarish',
    description: 'Powerful antioxidant serum that brightens, evens tone, and protects against environmental damage.',
    inStock: true,
    skinTypes: ['dry', 'oily', 'combination', 'normal'],
    concerns: ['hydration', 'texture', 'brightening']
  };

  // Mock user profile data
  const userProfile = {
    skinType: 'combination',
    concerns: ['hydration', 'texture'],
    location: 'New York, NY',
    climate: 'Humid Continental',
    uvIndex: 'Moderate (5-6)',
    pollution: 'Moderate',
    season: 'Spring'
  };

  const isRecommendedForUser = product.skinTypes.includes(userProfile.skinType) &&
    product.concerns.some(concern => userProfile.concerns.includes(concern));

  const handleSaveToRoutine = () => {
    const savedProducts = JSON.parse(localStorage.getItem('savedProducts') || '[]');
    if (!savedProducts.find((p: any) => p.id === product.id)) {
      savedProducts.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        image: product.image,
        price: product.price,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('savedProducts', JSON.stringify(savedProducts));
      alert('Product saved to your routine!');
    } else {
      alert('Product already in your routine!');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8">
      {/* Product Category Label */}
      <div className="mb-6">
        <span className="inline-flex items-center space-x-2 px-4 py-2 bg-[#8B9D83]/10 text-[#8B9D83] rounded-full text-sm font-semibold border border-[#8B9D83]/20">
          <i className="ri-flask-line"></i>
          <span>{product.category}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Benefits */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Benefits</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <i className="ri-checkbox-circle-fill text-[#8B9D83] text-xl mt-0.5"></i>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Brightens Skin Tone</h3>
                <p className="text-sm text-gray-700">Vitamin C helps reduce dark spots and hyperpigmentation for a more even complexion.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <i className="ri-checkbox-circle-fill text-[#8B9D83] text-xl mt-0.5"></i>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Powerful Antioxidant Protection</h3>
                <p className="text-sm text-gray-700">Ferulic acid and Vitamin E work together to protect against environmental damage and free radicals.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <i className="ri-checkbox-circle-fill text-[#8B9D83] text-xl mt-0.5"></i>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Boosts Collagen Production</h3>
                <p className="text-sm text-gray-700">Stimulates collagen synthesis to improve skin firmness and reduce fine lines.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <i className="ri-checkbox-circle-fill text-[#8B9D83] text-xl mt-0.5"></i>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Lightweight Formula</h3>
                <p className="text-sm text-gray-700">Fast-absorbing serum that layers well under moisturizer and makeup.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Right Column - Suitable For */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Best For</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Skin Types</h3>
              <div className="flex flex-wrap gap-2">
                <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  userProfile.skinType === 'dry' 
                    ? 'bg-[#8B9D83] text-white ring-2 ring-[#8B9D83] ring-offset-2' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  Dry
                </span>
                <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  userProfile.skinType === 'oily' 
                    ? 'bg-[#8B9D83] text-white ring-2 ring-[#8B9D83] ring-offset-2' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  Oily
                </span>
                <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  userProfile.skinType === 'combination' 
                    ? 'bg-[#8B9D83] text-white ring-2 ring-[#8B9D83] ring-offset-2' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  Combination
                </span>
                <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  userProfile.skinType === 'normal' 
                    ? 'bg-[#8B9D83] text-white ring-2 ring-[#8B9D83] ring-offset-2' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  Normal
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Skin Concerns</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                  Dark Spots
                </span>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                  Dullness
                </span>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                  Uneven Tone
                </span>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                  Fine Lines
                </span>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                  Sun Damage
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#8B9D83]/10 to-[#8B9D83]/5 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <i className="ri-lightbulb-line text-xl text-[#8B9D83] mt-0.5"></i>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Pro Tip</h3>
                  <p className="text-sm text-gray-700">
                    For best results, apply in the morning before sunscreen. Vitamin C works synergistically with SPF to provide enhanced protection against UV damage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}