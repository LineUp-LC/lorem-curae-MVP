import { Link } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';

interface AuthPromptProps {
  onContinueAsGuest?: () => void;
}

const AuthPrompt = ({ onContinueAsGuest }: AuthPromptProps) => {
  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 lg:px-12 py-24">
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-sage-100 rounded-full flex items-center justify-center">
            <i className="ri-questionnaire-line text-3xl text-sage-600"></i>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Start Your Skin Survey
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized skincare recommendations based on your unique skin profile. 
            Sign in to save your results and track your progress over time.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-100 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              How would you like to continue?
            </h2>
            <p className="text-gray-600">
              Create an account to save your results permanently, or continue as a guest to try it out first.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to="/auth/signup"
              className="w-full block bg-sage-600 hover:bg-sage-700 text-white py-4 px-6 rounded-lg font-semibold text-center transition-colors cursor-pointer whitespace-nowrap"
            >
              Create Account
            </Link>
            
            <Link
              to="/auth/login"
              className="w-full block border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-4 px-6 rounded-lg font-semibold text-center transition-colors cursor-pointer whitespace-nowrap"
            >
              Sign In
            </Link>

            {onContinueAsGuest && (
              <button
                onClick={onContinueAsGuest}
                className="w-full block border-2 border-sage-300 hover:border-sage-400 text-sage-700 py-4 px-6 rounded-lg font-semibold text-center transition-colors cursor-pointer whitespace-nowrap"
              >
                Continue as Guest
              </button>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">What you'll get:</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center space-x-3">
                <i className="ri-check-line text-sage-600"></i>
                <span>Personalized skincare routine recommendations</span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="ri-check-line text-sage-600"></i>
                <span>Ingredient analysis based on your skin type</span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="ri-check-line text-sage-600"></i>
                <span>Progress tracking and routine adjustments</span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="ri-check-line text-sage-600"></i>
                <span>Access to curated product recommendations</span>
              </li>
            </ul>

            {onContinueAsGuest && (
              <p className="mt-4 text-xs text-gray-500">
                <i className="ri-information-line mr-1"></i>
                Guest results are saved locally and will be merged into your account when you sign up.
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthPrompt;