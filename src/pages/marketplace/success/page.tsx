import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';

const MarketplaceSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // You can verify the session here if needed
      setTimeout(() => setLoading(false), 1000);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-5xl text-taupe animate-spin mb-4"></i>
          <p className="text-gray-600">Confirming your purchase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-taupe-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-check-line text-5xl text-taupe"></i>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Purchase Successful!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Thank you for supporting our verified creators. Your order has been confirmed.
          </p>

          {/* Info Cards */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 text-left">
            <h2 className="text-lg font-bold text-gray-900 mb-4">What's Next?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-taupe-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-mail-line text-taupe"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Check Your Email</h3>
                  <p className="text-sm text-gray-600">
                    You'll receive a confirmation email with your order details and receipt.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-taupe-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-hand-coin-line text-taupe"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Creator Payout</h3>
                  <p className="text-sm text-gray-600">
                    90% of your purchase goes directly to the creator through Stripe Connect.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-taupe-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-shield-check-line text-taupe"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Secure Transaction</h3>
                  <p className="text-sm text-gray-600">
                    Your payment was processed securely through Stripe.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/marketplace"
              className="px-8 py-4 bg-taupe text-white rounded-lg font-semibold hover:bg-taupe-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              Continue Shopping
            </Link>
            <Link
              to="/account"
              className="px-8 py-4 border border-taupe text-taupe rounded-lg font-semibold hover:bg-taupe-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              View Orders
            </Link>
          </div>

          {/* Support */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              Need help with your order?
            </p>
            <Link
              to="/contact"
              className="text-taupe font-medium hover:text-taupe-700 cursor-pointer"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MarketplaceSuccessPage;