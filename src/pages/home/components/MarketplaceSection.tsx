import { Link } from 'react-router-dom';
import { cartState } from '../../../lib/utils/cartState';

const MarketplaceSection = () => {
  const handleAddToCart = (product: {
    id: number;
    name: string;
    brand: string;
    price: number;
    image: string;
  }) => {
    cartState.addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      quantity: 1,
      image: product.image,
      inStock: true,
    });
  };

  return (
    <section className="py-24 bg-cream-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6">
            Marketplace
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Shop from verified brands and indie creators. Discover unique products curated for quality and effectiveness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-6" data-product-shop>
          {/* Featured Creator Spotlight - Wider */}
          <article className="lg:col-span-4 bg-forest-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sage-600/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white">
                    <img
                      src="https://readdy.ai/api/search-image?query=Portrait%20of%20confident%20diverse%20indie%20beauty%20entrepreneur%20with%20natural%20glowing%20skin%2C%20warm%20lighting%2C%20authentic%20smile%2C%20professional%20yet%20approachable%2C%20inclusive%20representation%2C%20soft%20neutral%20background&width=200&height=200&seq=creator-001&orientation=squarish"
                      alt="Maya Chen - Indie Beauty Creator"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center bg-sage-500 rounded-full border-2 border-forest-900">
                    <i className="ri-check-line text-xs" aria-hidden="true"></i>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Maya Chen</h3>
                  <p className="text-sm text-cream-200">Indie Beauty Creator</p>
                </div>
              </div>

              <p className="text-cream-100 leading-relaxed mb-6">
                "After years of struggling with sensitive skin, I created a line that celebrates gentle, effective ingredients. Every product is crafted with care and transparency."
              </p>

              <div className="mb-6">
                <div className="w-full h-48 rounded-2xl overflow-hidden">
                  <img
                    src="https://readdy.ai/api/search-image?query=Elegant%20minimalist%20skincare%20product%20bottle%20with%20natural%20botanical%20ingredients%2C%20clean%20aesthetic%2C%20soft%20lighting%2C%20simple%20neutral%20background%2C%20high-end%20beauty%20photography%2C%20product%20showcase&width=400&height=300&seq=product-featured-001&orientation=squarish"
                    alt="Featured skincare product from Maya Chen Naturals collection"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              <Link
                to="/storefront/detail?brand=maya-chen-naturals"
                className="block w-full py-3 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer text-center"
                aria-label="Explore Maya Chen Naturals collection"
              >
                Explore Collection
              </Link>
            </div>
          </article>

          {/* Product Card 1 */}
          <article className="lg:col-span-3 bg-cream-50 rounded-3xl p-6 hover:shadow-xl transition-all">
            <div className="relative mb-4">
              <span className="absolute top-3 left-3 px-3 py-1 bg-coral-500 text-white text-xs font-semibold rounded-full">
                Community Favorite
              </span>
              <div className="w-full h-64 rounded-2xl overflow-hidden">
                <img
                  src="https://readdy.ai/api/search-image?query=Premium%20skincare%20serum%20bottle%20with%20dropper%2C%20minimalist%20design%2C%20natural%20ingredients%20visible%2C%20soft%20lighting%2C%20clean%20white%20background%2C%20high-end%20beauty%20product%20photography&width=400&height=500&seq=product-001&orientation=portrait"
                  alt="Radiance Hydrating Serum by Glow Naturals - Premium skincare serum with dropper"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-forest-900">Radiance Hydrating Serum</h3>
                <p className="text-sm text-gray-600">by Glow Naturals</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center" aria-label="5 out of 5 stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i key={star} className="ri-star-fill text-amber-400 text-sm" aria-hidden="true"></i>
                  ))}
                </div>
                <span className="text-sm text-gray-600">(248 reviews)</span>
              </div>
              <p className="text-2xl font-bold text-forest-900">$42</p>
              <button
                onClick={() => handleAddToCart({
                  id: 1001,
                  name: 'Radiance Hydrating Serum',
                  brand: 'Glow Naturals',
                  price: 42,
                  image: 'https://readdy.ai/api/search-image?query=Premium%20skincare%20serum%20bottle%20with%20dropper%2C%20minimalist%20design%2C%20natural%20ingredients%20visible%2C%20soft%20lighting%2C%20clean%20white%20background%2C%20high-end%20beauty%20product%20photography&width=400&height=500&seq=product-001&orientation=portrait',
                })}
                className="w-full py-3 bg-sage-600 text-white rounded-full font-medium hover:bg-sage-700 transition-colors whitespace-nowrap cursor-pointer"
                aria-label="Add Radiance Hydrating Serum to cart"
              >
                Add to Cart
              </button>
            </div>
          </article>

          {/* Product Card 2 */}
          <article className="lg:col-span-3 bg-cream-50 rounded-3xl p-6 hover:shadow-xl transition-all">
            <div className="relative mb-4">
              <div className="w-full h-64 rounded-2xl overflow-hidden">
                <img
                  src="https://readdy.ai/api/search-image?query=Luxury%20face%20cream%20jar%20with%20natural%20botanical%20ingredients%2C%20elegant%20packaging%2C%20soft%20lighting%2C%20clean%20white%20background%2C%20premium%20beauty%20product%20photography&width=400&height=500&seq=product-002&orientation=portrait"
                  alt="Barrier Repair Night Cream by Pure Essence - Luxury face cream with botanical ingredients"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-forest-900">Barrier Repair Night Cream</h3>
                <p className="text-sm text-gray-600">by Pure Essence</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center" aria-label="5 out of 5 stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i key={star} className="ri-star-fill text-amber-400 text-sm" aria-hidden="true"></i>
                  ))}
                </div>
                <span className="text-sm text-gray-600">(192 reviews)</span>
              </div>
              <p className="text-2xl font-bold text-forest-900">$58</p>
              <button
                onClick={() => handleAddToCart({
                  id: 1002,
                  name: 'Barrier Repair Night Cream',
                  brand: 'Pure Essence',
                  price: 58,
                  image: 'https://readdy.ai/api/search-image?query=Luxury%20face%20cream%20jar%20with%20natural%20botanical%20ingredients%2C%20elegant%20packaging%2C%20soft%20lighting%2C%20clean%20white%20background%2C%20premium%20beauty%20product%20photography&width=400&height=500&seq=product-002&orientation=portrait',
                })}
                className="w-full py-3 bg-sage-600 text-white rounded-full font-medium hover:bg-sage-700 transition-colors whitespace-nowrap cursor-pointer"
                aria-label="Add Barrier Repair Night Cream to cart"
              >
                Add to Cart
              </button>
            </div>
          </article>
        </div>

        <div className="text-center mt-12">
          <Link
            to="/marketplace"
            className="inline-flex items-center space-x-3 bg-sage-600 hover:bg-sage-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg cursor-pointer whitespace-nowrap"
            aria-label="Explore full marketplace of curated skincare products"
          >
            <span>Explore Full Marketplace</span>
            <i className="ri-arrow-right-line text-xl"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceSection;
