import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/feature/Navbar';
import Footer from '../../components/feature/Footer';
import { useCartItems } from '../../lib/utils/cartState';

const CartPage = () => {
  const { items: cartItems, updateQuantity, removeItem, count } = useCartItems();

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const inStockItems = cartItems.filter(item => item.inStock);
  const outOfStockItems = cartItems.filter(item => !item.inStock);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF8F5' }}>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="mb-8">
          <h1 className="text-4xl font-serif mb-2" style={{ color: '#2D2A26' }}>Shopping Cart</h1>
          <p style={{ color: '#6B635A' }}>{cartItems.length} items in your cart</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F8F4F0' }}>
              <i className="ri-shopping-cart-line text-3xl" style={{ color: '#9A938A' }}></i>
            </div>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#2D2A26' }}>Your cart is empty</h2>
            <p className="mb-8" style={{ color: '#6B635A' }}>Looks like you haven't added any items to your cart yet.</p>
            <Link
              to="/marketplace"
              className="inline-flex items-center space-x-2 text-white px-8 py-3 rounded-lg font-semibold transition-colors cursor-pointer"
              style={{ backgroundColor: '#C4704D' }}
            >
              <span>Continue Shopping</span>
              <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {inStockItems.length > 0 && (
                <div className="bg-white rounded-xl p-6" style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}>
                  <h2 className="text-xl font-semibold mb-6" style={{ color: '#2D2A26' }}>Available Items ({inStockItems.length})</h2>
                  <div className="space-y-6">
                    {inStockItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 pb-6 last:pb-0" style={{ borderBottom: '1px solid rgba(232, 212, 204, 0.3)' }}>
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: '#F8F4F0' }}>
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate" style={{ color: '#2D2A26' }}>{item.name}</h3>
                          <p className="text-sm mb-2" style={{ color: '#6B635A' }}>{item.brand}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold" style={{ color: '#2D2A26' }}>${item.price}</span>
                            {item.originalPrice && (
                              <span className="text-sm line-through" style={{ color: '#9A938A' }}>${item.originalPrice}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer" style={{ border: '1px solid #E8D4CC' }}>
                            <i className="ri-subtract-line text-sm" style={{ color: '#6B635A' }}></i>
                          </button>
                          <span className="w-12 text-center font-medium" style={{ color: '#2D2A26' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer" style={{ border: '1px solid #E8D4CC' }}>
                            <i className="ri-add-line text-sm" style={{ color: '#6B635A' }}></i>
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-2 cursor-pointer" style={{ color: '#8B4D35' }}>
                          <i className="ri-delete-bin-line text-lg"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 sticky top-24" style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}>
                <h2 className="text-xl font-semibold mb-6" style={{ color: '#2D2A26' }}>Order Summary</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span style={{ color: '#6B635A' }}>Subtotal</span>
                    <span className="font-medium" style={{ color: '#2D2A26' }}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#6B635A' }}>Shipping</span>
                    <span className="font-medium" style={{ color: '#2D2A26' }}>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#6B635A' }}>Tax</span>
                    <span className="font-medium" style={{ color: '#2D2A26' }}>${tax.toFixed(2)}</span>
                  </div>
                  <div className="pt-4" style={{ borderTop: '1px solid rgba(232, 212, 204, 0.5)' }}>
                    <div className="flex justify-between">
                      <span className="font-semibold" style={{ color: '#2D2A26' }}>Total</span>
                      <span className="font-bold text-xl" style={{ color: '#C4704D' }}>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button className="w-full py-3 rounded-lg font-semibold text-white transition-colors cursor-pointer" style={{ backgroundColor: '#C4704D' }}>
                  Proceed to Checkout
                </button>
                <Link to="/marketplace" className="block text-center mt-4 text-sm font-medium" style={{ color: '#C4704D' }}>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;