import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { supabase } from '../../../lib/supabase';

const SignUpPage = () => {
  const navigate = useNavigate();
  const captchaRef = useRef<HCaptcha>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const handleCaptchaExpire = () => {
    setCaptchaToken(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate captcha
    if (!captchaToken) {
      setError('Please complete the captcha verification');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          captchaToken,
          data: {
            full_name: formData.name,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        // Reset captcha on error
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
        return;
      }

      if (data.user) {
        // Success - navigate to account or show confirmation
        navigate('/account');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-cream-50 to-coral-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center mb-8 cursor-pointer">
          <span className="text-4xl font-serif text-slate-900">Lorem Curae</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Here to find what works for you?
            </h1>
            <p className="text-gray-600">
              Join our community and start your personalized skincare journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <i className="ri-error-warning-line"></i>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
                placeholder="Enter your name"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
                placeholder="Create a password"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
                placeholder="Confirm your password"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            {/* HCaptcha */}
            <div className="flex justify-center">
              <HCaptcha
                ref={captchaRef}
                sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY || ''}
                onVerify={handleCaptchaVerify}
                onExpire={handleCaptchaExpire}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !captchaToken}
              className="w-full bg-sage-600 text-white py-3 rounded-lg font-medium hover:bg-sage-700 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              disabled={isLoading}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              <i className="ri-google-fill text-xl text-red-500 mr-2"></i>
              <span className="text-sm font-medium text-gray-700">Google</span>
            </button>
            <button 
              type="button"
              disabled={isLoading}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              <i className="ri-apple-fill text-xl text-gray-900 mr-2"></i>
              <span className="text-sm font-medium text-gray-700">Apple</span>
            </button>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-sage-600 font-medium hover:text-sage-700 cursor-pointer">
              Sign in
            </Link>
          </p>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By signing up, you agree to our{' '}
          <a href="/terms" className="text-sage-600 hover:underline cursor-pointer">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-sage-600 hover:underline cursor-pointer">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;