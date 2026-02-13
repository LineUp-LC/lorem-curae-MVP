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
        <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-blush/50 max-w-md mx-auto">
          <div className="text-center mb-6">
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-deep mb-2">
              How would you like to continue?
            </h2>
            <p className="text-warm-gray text-sm">
              Save your results permanently or try as a guest first.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/auth/signup"
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-dark text-white py-3 px-5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <i className="ri-user-add-line"></i>
              <span>Create Account</span>
            </Link>

            <Link
              to="/auth/login"
              className="w-full flex items-center justify-center gap-2 border border-blush hover:border-primary/50 text-deep py-3 px-5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <i className="ri-login-box-line"></i>
              <span>Sign In</span>
            </Link>

            <Link
              to="/skin-survey-account"
              className="w-full flex items-center justify-center gap-2 bg-cream hover:bg-blush/30 text-warm-gray py-3 px-5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <i className="ri-user-line"></i>
              <span>Continue as Guest</span>
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-blush/50">
            <h3 className="font-medium text-deep text-xs uppercase tracking-wide mb-3">What you'll get</h3>
            <ul className="space-y-2 text-xs text-warm-gray">
              <li className="flex items-center gap-2">
                <i className="ri-check-line text-sage"></i>
                <span>Personalized routine recommendations</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="ri-check-line text-sage"></i>
                <span>Ingredient analysis for your skin type</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="ri-check-line text-sage"></i>
                <span>Progress tracking & adjustments</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="ri-check-line text-sage"></i>
                <span>Curated product recommendations</span>
              </li>
            </ul>

            <p className="mt-4 text-xs text-warm-gray/80 flex items-center gap-1.5">
              <i className="ri-information-line text-sage"></i>
              <span>Guest results sync when you sign up.</span>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthPrompt;