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
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">{cartItems.length} items in your cart</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="ri-shopping-cart-line text-3xl text-gray-400"></i>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link
              to="/marketplace"
              className="inline-flex items-center space-x-2 bg-sage-600 hover:bg-sage-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Continue Shopping</span>
              <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* In Stock Items */}
              {inStockItems.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Items ({inStockItems.length})</h2>
                  <div className="space-y-6">
                    {inStockItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{item.brand}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">${item.price}</span>
                            {item.originalPrice && (
                              <span className="text-sm text-gray-400 line-through">${item.originalPrice}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <i className="ri-subtract-line text-sm"></i>
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <i className="ri-add-line text-sm"></i>
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <i className="ri-delete-bin-line text-lg"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Out of Stock Items */}
              {outOfStockItems.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-100 opacity-60">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Out of Stock ({outOfStockItems.length})</h2>
                  <div className="space-y-6">
                    {outOfStockItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">Out of Stock</span>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{item.brand}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">${item.price}</span>
                            {item.originalPrice && (
                              <span className="text-sm text-gray-400 line-through">${item.originalPrice}</span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
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
              <div className="bg-white rounded-xl p-6 border border-gray-100 sticky top-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={inStockItems.length === 0}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    inStockItems.length > 0
                      ? 'bg-sage-600 hover:bg-sage-700 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Proceed to Checkout
                </button>

                <div className="mt-4 text-center">
                  <Link
                    to="/marketplace"
                    className="text-sage-600 hover:text-sage-700 font-medium text-sm transition-colors cursor-pointer"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <i className="ri-shield-check-line"></i>
                    <span>Secure Checkout</span>
                  </div>
                </div>
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