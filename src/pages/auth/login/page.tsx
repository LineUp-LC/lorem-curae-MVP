import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { supabase } from '../../../lib/supabase';

const LoginPage = () => {
  const navigate = useNavigate();
  const captchaRef = useRef<HCaptcha>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

  const handleCaptchaError = () => {
    setCaptchaToken(null);
    setError('Captcha verification failed. Please try again.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!captchaToken) {
      setError('Please complete the captcha verification');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
        options: {
          captchaToken,
        },
      });

      if (signInError) {
        setError(signInError.message);
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
        return;
      }

      if (data.user) {
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

  const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.warn('VITE_HCAPTCHA_SITE_KEY is not set. Captcha will not work.');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'linear-gradient(135deg, #FDF8F5 0%, #F8F4F0 50%, #E8D4CC 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center mb-8 cursor-pointer">
          <span className="text-4xl font-serif" style={{ color: '#2D2A26' }}>Lorem Curae</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8" style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif mb-2" style={{ color: '#2D2A26' }}>
              Welcome back
            </h1>
            <p style={{ color: '#6B635A' }}>
              Sign in to continue your skincare journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(139, 77, 53, 0.08)', border: '1px solid rgba(139, 77, 53, 0.2)' }}>
              <p className="text-sm flex items-center gap-2" style={{ color: '#8B4D35' }}>
                <i className="ri-error-warning-line"></i>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D2A26' }}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg transition-all"
                style={{ border: '1px solid #E8D4CC', outline: 'none' }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#C4704D';
                  e.target.style.boxShadow = '0 0 0 3px rgba(196, 112, 77, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E8D4CC';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium" style={{ color: '#2D2A26' }}>
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm cursor-pointer" style={{ color: '#C4704D' }}>
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-lg transition-all"
                style={{ border: '1px solid #E8D4CC', outline: 'none' }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#C4704D';
                  e.target.style.boxShadow = '0 0 0 3px rgba(196, 112, 77, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E8D4CC';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: '#C4704D' }}
                disabled={isLoading}
              />
              <label htmlFor="remember" className="ml-2 text-sm cursor-pointer" style={{ color: '#6B635A' }}>
                Remember me
              </label>
            </div>

            {/* HCaptcha */}
            {siteKey && (
              <div className="flex justify-center">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={siteKey}
                  onVerify={handleCaptchaVerify}
                  onExpire={handleCaptchaExpire}
                  onError={handleCaptchaError}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (siteKey && !captchaToken)}
              className="w-full py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
              style={{ backgroundColor: '#C4704D' }}
              onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#8B4D35')}
              onMouseOut={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#C4704D')}
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid #E8D4CC' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white" style={{ color: '#6B635A' }}>Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              disabled={isLoading}
              className="flex items-center justify-center px-4 py-3 rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              style={{ border: '1px solid #E8D4CC' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FDF8F5'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <i className="ri-google-fill text-xl text-red-500 mr-2"></i>
              <span className="text-sm font-medium" style={{ color: '#2D2A26' }}>Google</span>
            </button>
            <button 
              type="button"
              disabled={isLoading}
              className="flex items-center justify-center px-4 py-3 rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              style={{ border: '1px solid #E8D4CC' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FDF8F5'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <i className="ri-apple-fill text-xl mr-2" style={{ color: '#2D2A26' }}></i>
              <span className="text-sm font-medium" style={{ color: '#2D2A26' }}>Apple</span>
            </button>
          </div>

          {/* Signup Link */}
          <p className="text-center text-sm mt-6" style={{ color: '#6B635A' }}>
            Don't have an account?{' '}
            <Link to="/auth/signup" className="font-medium cursor-pointer" style={{ color: '#C4704D' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;