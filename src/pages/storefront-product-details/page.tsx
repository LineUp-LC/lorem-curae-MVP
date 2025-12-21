import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { supabase } from '../../lib/supabase';
import { cartState } from '../../utils/cartState';

export default function StorefrontProductDetailsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('id');
  const storefrontId = searchParams.get('storefrontId');
  
  const [product, setProduct] = useState<any>(null);
  const [storefront, setStorefront] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProductDetails();
    }
  }, [productId]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      
      const { data: productData, error: productError } = await supabase
        .from('marketplace_products')
        .select(`
          *,
          marketplace_storefronts!inner(
            id,
            business_name,
            is_verified,
            rating,
            description,
            logo_url,
            stripe_connected_accounts(charges_enabled)
          )
        `)
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      setProduct(productData);
      setStorefront(productData.marketplace_storefronts);
      
      // Set default variant if available
      if (productData.variants && productData.variants.length > 0) {
        setSelectedVariant(productData.variants[0]);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setPurchasing(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth/login?redirect=' + window.location.pathname);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-marketplace-checkout', {
        body: {
          productId: product.id,
          quantity,
          variantId: selectedVariant?.id,
          successUrl: `${window.location.origin}/marketplace/success`,
          cancelUrl: window.location.href,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      cartState.addItem({
        id: product.id,
        name: product.name,
        brand: storefront.business_name,
        price: selectedVariant?.price || product.price,
        image: product.image_url,
        inStock: product.in_stock,
        quantity
      });
      alert('Added to cart!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600 mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link to="/marketplace" className="text-sage-600 hover:text-sage-700 cursor-pointer">
            Return to Marketplace
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isConnected = storefront?.stripe_connected_accounts?.[0]?.charges_enabled;

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link to="/" className="hover:text-sage-600 cursor-pointer">Home</Link>
            <i className="ri-arrow-right-s-line"></i>
            <Link to="/marketplace" className="hover:text-sage-600 cursor-pointer">Marketplace</Link>
            <i className="ri-arrow-right-s-line"></i>
            <Link to={`/storefront/${storefront.id}`} className="hover:text-sage-600 cursor-pointer">
              {storefront.business_name}
            </Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-sage-600">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-white mb-4">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Product Info */}
            <div>
              {/* Storefront Info */}
              <Link
                to={`/storefront/${storefront.id}`}
                className="flex items-center gap-3 mb-6 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white">
                  <img
                    src={storefront.logo_url}
                    alt={storefront.business_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-sage-600 transition-colors">
                      {storefront.business_name}
                    </h3>
                    {storefront.is_verified && (
                      <i className="ri-verified-badge-fill text-sage-600"></i>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <i className="ri-star-fill text-amber-500"></i>
                    <span className="text-gray-600">{storefront.rating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>
              </Link>

              {/* Product Name */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`${
                        i < Math.floor(product.rating || 5)
                          ? 'ri-star-fill text-amber-500'
                          : 'ri-star-line text-gray-300'
                      }`}
                    ></i>
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating?.toFixed(1) || '5.0'} ({product.review_count || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${(selectedVariant?.price || product.price).toFixed(2)}
                </span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Select Variant</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((variant: any) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedVariant?.id === variant.id
                            ? 'border-sage-600 bg-sage-50 text-sage-700'
                            : 'border-gray-200 hover:border-sage-300'
                        }`}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                  >
                    <i className="ri-subtract-line"></i>
                  </button>
                  <span className="text-xl font-semibold text-gray-900 w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                  >
                    <i className="ri-add-line"></i>
                  </button>
                </div>
              </div>

              {/* Stock Status */}
              {product.in_stock ? (
                <div className="flex items-center gap-2 text-green-600 mb-6">
                  <i className="ri-checkbox-circle-fill"></i>
                  <span className="font-medium">In Stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 mb-6">
                  <i className="ri-close-circle-fill"></i>
                  <span className="font-medium">Out of Stock</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handlePurchase}
                  disabled={!product.in_stock || purchasing}
                  className="flex-1 py-4 bg-sage-600 text-white rounded-lg font-semibold hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {purchasing ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin"></i>
                      Processing...
                    </span>
                  ) : (
                    'Buy Now'
                  )}
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className="px-6 py-4 border-2 border-sage-600 text-sage-600 rounded-lg font-semibold hover:bg-sage-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <i className="ri-shopping-cart-line text-xl"></i>
                </button>
              </div>

              {/* Trust Signals */}
              {isConnected && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="ri-shield-check-line text-green-600"></i>
                    <span>Secure checkout powered by Stripe</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <i className="ri-hand-coin-line text-sage-600"></i>
                    <span>90% goes directly to the creator</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Storefront Info Section */}
          <div className="bg-white rounded-2xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About {storefront.business_name}</h2>
            <p className="text-gray-600 mb-6">{storefront.description}</p>
            <Link
              to={`/storefront/${storefront.id}`}
              className="inline-block px-6 py-3 bg-sage-600 text-white rounded-lg font-semibold hover:bg-sage-700 transition-colors cursor-pointer"
            >
              View All Products from {storefront.business_name}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
