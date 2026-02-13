import { useState, useMemo } from 'react';

interface Product {
  id: string;
  name: string;
  brand: string;
  image: string;
  category: string;
  price?: number;
  rating?: number;
  skinType?: string[];
  concerns?: string[];
  isRecommended?: boolean;
  source?: 'discovery' | 'marketplace';
}

interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  onSelectProduct: (product: Product) => void;
  savedProducts?: Product[];
}

// Extended product catalog for browsing
const browseProducts: Product[] = [
  // Cleansers
  { id: 'b1', name: 'Gentle Hydrating Cleanser', brand: 'Pure Essence', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop&auto=format', category: 'Cleanser', price: 28, rating: 4.8, skinType: ['dry', 'sensitive'], concerns: ['hydration'], isRecommended: true },
  { id: 'b2', name: 'Foaming Gel Cleanser', brand: 'Clear Skin Co', image: 'https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=300&h=300&fit=crop&auto=format', category: 'Cleanser', price: 24, rating: 4.5, skinType: ['oily', 'combination'], concerns: ['acne', 'pores'], isRecommended: true },
  { id: 'b3', name: 'Cream Cleanser', brand: 'Glow Lab', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=300&fit=crop&auto=format', category: 'Cleanser', price: 32, rating: 4.7, skinType: ['dry', 'normal'], concerns: ['hydration', 'anti-aging'] },
  { id: 'b4', name: 'Micellar Water', brand: 'Aqua Pure', image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=300&h=300&fit=crop&auto=format', category: 'Cleanser', price: 18, rating: 4.6, skinType: ['all'], concerns: ['gentle'] },
  // Toners
  { id: 'b5', name: 'Hydrating Toner', brand: 'Dew Drop', image: 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=300&h=300&fit=crop&auto=format', category: 'Toner', price: 26, rating: 4.7, skinType: ['dry', 'normal'], concerns: ['hydration'], isRecommended: true },
  { id: 'b6', name: 'Exfoliating Toner', brand: 'Glow Lab', image: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=300&h=300&fit=crop&auto=format', category: 'Toner', price: 34, rating: 4.5, skinType: ['oily', 'combination'], concerns: ['acne', 'texture'] },
  // Serums
  { id: 'b7', name: 'Vitamin C Brightening Serum', brand: 'Glow Naturals', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop&auto=format', category: 'Serum', price: 45, rating: 4.9, skinType: ['all'], concerns: ['brightening', 'anti-aging'], isRecommended: true },
  { id: 'b8', name: 'Hyaluronic Acid Serum', brand: 'Hydra Plus', image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=300&h=300&fit=crop&auto=format', category: 'Serum', price: 38, rating: 4.8, skinType: ['all'], concerns: ['hydration', 'plumping'], isRecommended: true },
  { id: 'b9', name: 'Niacinamide Serum', brand: 'Clear Skin Co', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=300&h=300&fit=crop&auto=format', category: 'Serum', price: 32, rating: 4.6, skinType: ['oily', 'combination'], concerns: ['pores', 'acne'] },
  { id: 'b10', name: 'Retinol Serum', brand: 'Age Defy', image: 'https://images.unsplash.com/photo-1570194065650-d99fb4ee7ab8?w=300&h=300&fit=crop&auto=format', category: 'Serum', price: 52, rating: 4.7, skinType: ['normal', 'dry'], concerns: ['anti-aging', 'wrinkles'] },
  // Eye Creams
  { id: 'b11', name: 'Brightening Eye Cream', brand: 'Eye Revive', image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=300&h=300&fit=crop&auto=format', category: 'Eye Cream', price: 48, rating: 4.6, skinType: ['all'], concerns: ['dark circles', 'puffiness'], isRecommended: true },
  { id: 'b12', name: 'Anti-Wrinkle Eye Serum', brand: 'Age Defy', image: 'https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=300&h=300&fit=crop&auto=format', category: 'Eye Cream', price: 56, rating: 4.8, skinType: ['all'], concerns: ['wrinkles', 'firming'] },
  // Moisturizers
  { id: 'b13', name: 'Deep Hydration Moisturizer', brand: 'Skin Harmony', image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=300&h=300&fit=crop&auto=format', category: 'Moisturizer', price: 42, rating: 4.8, skinType: ['dry', 'normal'], concerns: ['hydration'], isRecommended: true },
  { id: 'b14', name: 'Oil-Free Gel Moisturizer', brand: 'Clear Skin Co', image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=300&h=300&fit=crop&auto=format', category: 'Moisturizer', price: 36, rating: 4.5, skinType: ['oily', 'combination'], concerns: ['lightweight', 'non-greasy'] },
  { id: 'b15', name: 'Barrier Repair Cream', brand: 'Skin Shield', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=300&h=300&fit=crop&auto=format', category: 'Moisturizer', price: 38, rating: 4.7, skinType: ['sensitive', 'dry'], concerns: ['barrier repair', 'soothing'] },
  // Sunscreens
  { id: 'b16', name: 'Mineral Sunscreen SPF 50', brand: 'Clarity Labs', image: 'https://images.unsplash.com/photo-1594125311687-3b1b3eefa9f2?w=300&h=300&fit=crop&auto=format', category: 'Sunscreen', price: 32, rating: 4.8, skinType: ['all'], concerns: ['protection'], isRecommended: true },
  { id: 'b17', name: 'Lightweight UV Shield SPF 40', brand: 'Sun Safe', image: 'https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?w=300&h=300&fit=crop&auto=format', category: 'Sunscreen', price: 28, rating: 4.6, skinType: ['oily', 'combination'], concerns: ['lightweight', 'no white cast'] },
  // Night Treatments
  { id: 'b18', name: 'Retinol Night Treatment', brand: 'Age Defy', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&auto=format', category: 'Night Treatment', price: 58, rating: 4.7, skinType: ['normal', 'combination'], concerns: ['anti-aging', 'renewal'], isRecommended: true },
  { id: 'b19', name: 'Sleeping Mask', brand: 'Dream Skin', image: 'https://images.unsplash.com/photo-1590393802688-ab3fd7c8c5a0?w=300&h=300&fit=crop&auto=format', category: 'Night Treatment', price: 44, rating: 4.8, skinType: ['all'], concerns: ['hydration', 'overnight repair'] },
  // Facial Oils
  { id: 'b20', name: 'Rosehip Facial Oil', brand: 'Botanic Bliss', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=300&h=300&fit=crop&auto=format', category: 'Facial Oil', price: 36, rating: 4.7, skinType: ['dry', 'normal'], concerns: ['nourishing', 'scars'], isRecommended: true },
  { id: 'b21', name: 'Squalane Oil', brand: 'Pure Essence', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=300&h=300&fit=crop&auto=format', category: 'Facial Oil', price: 32, rating: 4.8, skinType: ['all'], concerns: ['hydration', 'lightweight'] },
  // Night Creams
  { id: 'b22', name: 'Rich Night Cream', brand: 'Skin Harmony', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop&auto=format', category: 'Night Cream', price: 52, rating: 4.7, skinType: ['dry', 'normal'], concerns: ['nourishing', 'anti-aging'], isRecommended: true },
  { id: 'b23', name: 'Peptide Night Cream', brand: 'Age Defy', image: 'https://images.unsplash.com/photo-1556229010-aa3f7ff66b24?w=300&h=300&fit=crop&auto=format', category: 'Night Cream', price: 62, rating: 4.9, skinType: ['all'], concerns: ['firming', 'anti-aging'] },
];

export default function ProductPickerModal({ isOpen, onClose, category, onSelectProduct, savedProducts = [] }: ProductPickerModalProps) {
  const [visibleCount, setVisibleCount] = useState(6);
  const [activeTab, setActiveTab] = useState<'saved' | 'discovery' | 'marketplace'>('saved');

  // Filter saved products by category
  const filteredSavedProducts = useMemo(() => {
    return savedProducts.filter(product =>
      product.category.toLowerCase() === category.toLowerCase()
    );
  }, [savedProducts, category]);

  // Filter products by category and tab
  const filteredProducts = useMemo(() => {
    return browseProducts.filter(product => {
      // Category match
      if (product.category.toLowerCase() !== category.toLowerCase()) return false;

      // Tab filter (Discovery = recommended only, Marketplace = all)
      if (activeTab === 'discovery' && !product.isRecommended) return false;

      return true;
    });
  }, [category, activeTab]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleViewMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const handleSelect = (product: Product) => {
    onSelectProduct({
      id: product.id,
      name: product.name,
      brand: product.brand,
      image: product.image,
      category: product.category,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-blush">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-deep">
            Choose a {category}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream hover:bg-blush flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl text-warm-gray"></i>
          </button>
        </div>

        {/* Saved / Discovery / Marketplace Toggle */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 bg-cream/50">
          <div className="flex bg-white rounded-full p-1 border border-blush">
            <button
              onClick={() => { setActiveTab('saved'); setVisibleCount(6); }}
              className={`flex-1 px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-warm-gray hover:text-deep'
              }`}
            >
              <i className="ri-bookmark-line mr-1"></i>
              <span className="hidden xs:inline">Saved</span>
            </button>
            <button
              onClick={() => { setActiveTab('discovery'); setVisibleCount(6); }}
              className={`flex-1 px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'discovery'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-warm-gray hover:text-deep'
              }`}
            >
              <i className="ri-compass-3-line mr-1"></i>
              <span className="hidden xs:inline">Discovery</span>
            </button>
            <button
              onClick={() => { setActiveTab('marketplace'); setVisibleCount(6); }}
              className={`flex-1 px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'marketplace'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-warm-gray hover:text-deep'
              }`}
            >
              <i className="ri-store-2-line mr-1"></i>
              <span className="hidden xs:inline">Marketplace</span>
            </button>
          </div>
          <p className="text-xs text-warm-gray/70 text-center mt-2">
            {activeTab === 'saved'
              ? 'Products you\'ve bookmarked or purchased'
              : activeTab === 'discovery'
                ? 'Curated recommendations based on your skin profile'
                : (<>Full product catalog <span className="text-primary">· curated for you</span></>)}
          </p>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Saved Products Tab */}
          {activeTab === 'saved' ? (
            filteredSavedProducts.length > 0 ? (
              <>
                <p className="text-sm text-warm-gray mb-4">
                  {filteredSavedProducts.length} saved product{filteredSavedProducts.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {filteredSavedProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => handleSelect(product)}
                      className="bg-white border border-blush rounded-xl p-3 hover:border-primary hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-cream relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <i className="ri-bookmark-fill text-white text-xs"></i>
                        </div>
                      </div>
                      {product.source && (
                        <span className={`text-xs font-medium mb-1 inline-block ${
                          product.source === 'marketplace'
                            ? 'text-sage'
                            : 'text-primary'
                        }`}>
                          {product.source === 'marketplace' ? 'Marketplace' : 'Discovery'}
                        </span>
                      )}
                      <p className="text-xs text-warm-gray/80 mb-1">{product.brand}</p>
                      <h4 className="font-medium text-deep text-sm line-clamp-2 mb-2">{product.name}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = product.source === 'marketplace'
                            ? `/marketplace/product/${product.id}`
                            : `/product-detail?id=${product.id}`;
                          window.open(url, '_blank');
                        }}
                        className="text-xs text-primary hover:underline font-medium cursor-pointer"
                      >
                        View Product →
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <i className="ri-bookmark-line text-4xl text-blush mb-3 block"></i>
                <p className="text-warm-gray font-medium mb-1">No saved {category.toLowerCase()}s yet</p>
                <p className="text-sm text-warm-gray/70 mb-4">Browse products and bookmark them to save here</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('discovery')}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-dark transition-colors"
                  >
                    Browse Discovery
                  </button>
                  <button
                    onClick={() => setActiveTab('marketplace')}
                    className="px-4 py-2 bg-white text-primary border border-primary rounded-lg text-sm font-medium cursor-pointer hover:bg-cream transition-colors"
                  >
                    Browse Marketplace
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Discovery / Marketplace Products */
            visibleProducts.length > 0 ? (
              <>
                <p className="text-sm text-warm-gray mb-4">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {visibleProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => handleSelect(product)}
                      className="bg-white border border-blush rounded-xl p-3 hover:border-primary hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-cream">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <p className="text-xs text-warm-gray/80 mb-1">{product.brand}</p>
                      <h4 className="font-medium text-deep text-sm line-clamp-2 mb-2">{product.name}</h4>
                      <div className="flex items-center justify-between">
                        {product.price && (
                          <span className="text-sm font-semibold text-primary">${product.price}</span>
                        )}
                        {product.rating && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = activeTab === 'marketplace'
                                ? `/marketplace/product/${product.id}#reviews`
                                : `/product-detail?id=${product.id}#reviews`;
                              window.open(url, '_blank');
                            }}
                            className="text-xs text-warm-gray flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                          >
                            <i className="ri-star-fill text-amber-400"></i>
                            {product.rating}
                          </button>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = activeTab === 'marketplace'
                            ? `/marketplace/product/${product.id}`
                            : `/product-detail?id=${product.id}`;
                          window.open(url, '_blank');
                        }}
                        className="mt-2 text-xs text-primary hover:underline font-medium cursor-pointer w-full text-left"
                      >
                        View Product →
                      </button>
                    </div>
                  ))}
                </div>

                {/* View More Button */}
                {hasMore && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={handleViewMore}
                      className="px-6 py-2.5 bg-cream hover:bg-blush text-deep rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      <i className="ri-arrow-down-line mr-2"></i>
                      View More ({filteredProducts.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <i className="ri-search-line text-4xl text-blush mb-3 block"></i>
                <p className="text-warm-gray font-medium mb-1">No products found</p>
                <p className="text-sm text-warm-gray/70">Try adjusting your search or filters</p>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-blush bg-cream/30">
          <p className="text-xs text-warm-gray text-center">
            <i className="ri-information-line mr-1"></i>
            Select a product to add it to your routine
          </p>
        </div>
      </div>
    </div>
  );
}
