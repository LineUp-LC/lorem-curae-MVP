import { Link } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';

/**
 * AuthPrompt Component
 * 
 * Displayed on /skin-survey before the quiz.
 * - Create Account → /auth/signup
 * - Sign In → /auth/login  
 * - Continue as Guest → /skin-survey-account (starts the quiz directly)
 */

const AuthPrompt = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 lg:px-12 py-24">
        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-blush max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-deep mb-4">
              How would you like to continue?
            </h2>
            <p className="text-warm-gray">
              Create an account to save your results permanently, or continue as a guest to try it out first.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to="/auth/signup"
              className="w-full block bg-primary hover:bg-dark text-white py-4 px-6 rounded-lg font-semibold text-center transition-colors cursor-pointer whitespace-nowrap"
            >
              Create Account
            </Link>
            
            <Link
              to="/auth/login"
              className="w-full block border-2 border-blush hover:border-primary text-deep py-4 px-6 rounded-lg font-semibold text-center transition-colors cursor-pointer whitespace-nowrap"
            >
              Sign In
            </Link>

            {/* Continue as Guest now links to /skin-survey-account */}
            <Link
              to="/skin-survey-account"
              className="w-full block border-2 border-blush hover:border-primary text-primary-700 py-4 px-6 rounded-lg font-semibold text-center transition-colors cursor-pointer whitespace-nowrap"
            >
              Continue as Guest
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-blush">
            <h3 className="font-semibold text-deep mb-4">What you'll get:</h3>
            <ul className="space-y-3 text-sm text-warm-gray">
              <li className="flex items-center space-x-3">
                <i className="ri-check-line text-primary"></i>
                <span>Personalized skincare routine recommendations</span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="ri-check-line text-primary"></i>
                <span>Ingredient analysis based on your skin type</span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="ri-check-line text-primary"></i>
                <span>Progress tracking and routine adjustments</span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="ri-check-line text-primary"></i>
                <span>Access to curated product recommendations</span>
              </li>
            </ul>

            <p className="mt-4 text-xs text-warm-gray">
              <i className="ri-information-line mr-1"></i>
              Guest results are saved locally and will be merged into your account when you sign up.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthPrompt;