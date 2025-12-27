import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';

export default function BookingSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId');

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-white">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 motion-safe:animate-bounce">
              <i className="ri-check-line text-5xl text-green-600"></i>
            </div>
            <h1 className="font-serif text-5xl font-bold text-forest-800 mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-xl text-gray-600">
              Your appointment has been successfully scheduled
            </p>
          </div>

          {/* Confirmation Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-forest-800/10 flex items-center justify-center flex-shrink-0">
                <i className="ri-mail-line text-forest-800 text-2xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Confirmation Email Sent</h3>
                <p className="text-gray-600 text-sm">
                  We've sent a confirmation email with all the details to your registered email address. 
                  Please check your inbox and spam folder.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-forest-800/10 flex items-center justify-center flex-shrink-0">
                  <i className="ri-calendar-check-line text-forest-800 text-2xl"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">What's Next?</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <i className="ri-checkbox-circle-line text-forest-800 mt-0.5"></i>
                      <span>You'll receive a reminder 24 hours before your appointment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-checkbox-circle-line text-forest-800 mt-0.5"></i>
                      <span>Arrive 10 minutes early to complete any necessary paperwork</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="ri-checkbox-circle-line text-forest-800 mt-0.5"></i>
                      <span>Bring any relevant medical history or skincare concerns</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-forest-800/10 flex items-center justify-center flex-shrink-0">
                  <i className="ri-phone-line text-forest-800 text-2xl"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Need to Make Changes?</h4>
                  <p className="text-sm text-gray-600">
                    If you need to reschedule or cancel your appointment, please contact the business 
                    directly using the contact information in your confirmation email.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to={serviceId ? `/services/${serviceId}` : '/services'}
              className="flex-1 px-8 py-4 bg-white border-2 border-forest-800 text-forest-800 rounded-lg hover:bg-cream-100 transition-colors font-medium text-center whitespace-nowrap cursor-pointer"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Back to Business
            </Link>
            <Link
              to="/account"
              className="flex-1 px-8 py-4 bg-forest-800 text-white rounded-lg hover:bg-forest-900 transition-colors font-medium text-center whitespace-nowrap cursor-pointer"
            >
              View My Bookings
              <i className="ri-arrow-right-line ml-2"></i>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-6 bg-gradient-to-br from-[#2C5F4F]/5 to-[#E8956C]/5 rounded-xl border border-forest-800/20">
            <div className="flex items-start gap-3">
              <i className="ri-information-line text-forest-800 text-xl flex-shrink-0 mt-0.5"></i>
              <div>
                <h4 className="font-semibold text-forest-800 mb-2">Cancellation Policy</h4>
                <p className="text-sm text-gray-700">
                  Please provide at least 24 hours notice if you need to cancel or reschedule your appointment. 
                  Late cancellations may be subject to a fee as per the business's policy.
                </p>
              </div>
            </div>
          </div>

          {/* Explore More */}
          <div className="mt-12 text-center">
            <h3 className="font-serif text-2xl font-bold text-forest-800 mb-6">
              Explore More Services
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/services/search"
                className="px-6 py-3 bg-cream-100 text-forest-800 rounded-lg hover:bg-gray-200 transition-colors font-medium whitespace-nowrap cursor-pointer"
              >
                <i className="ri-search-line mr-2"></i>
                Find More Services
              </Link>
              <Link
                to="/marketplace"
                className="px-6 py-3 bg-cream-100 text-forest-800 rounded-lg hover:bg-gray-200 transition-colors font-medium whitespace-nowrap cursor-pointer"
              >
                <i className="ri-shopping-bag-line mr-2"></i>
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}