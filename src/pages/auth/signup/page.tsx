import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { supabase } from '../../../lib/supabase';

const SignUpPage = () => {
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
  const [success, setSuccess] = useState(false);

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

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
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
        return;
      }

      if (data.user && !data.session) {
        setSuccess(true);
      } else if (data.user && data.session) {
        window.location.href = '/account';
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

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'linear-gradient(135deg, #FDF8F5 0%, #F8F4F0 50%, #E8D4CC 100%)' }}>
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center mb-8 cursor-pointer">
            <span className="text-4xl font-serif" style={{ color: '#2D2A26' }}>Lorem Curae</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center" style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(122, 139, 122, 0.1)' }}>
              <i className="ri-mail-check-line text-3xl" style={{ color: '#7A8B7A' }}></i>
            </div>
            
            <h1 className="text-2xl font-serif mb-4" style={{ color: '#2D2A26' }}>
              Check your email
            </h1>
            
            <p className="mb-6" style={{ color: '#6B635A' }}>
              We've sent a verification link to <strong style={{ color: '#2D2A26' }}>{formData.email}</strong>. 
              Please click the link in the email to verify your account.
            </p>

            <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: 'rgba(196, 112, 77, 0.08)', border: '1px solid rgba(196, 112, 77, 0.15)' }}>
              <p className="text-sm" style={{ color: '#8B4D35' }}>
                <i className="ri-information-line mr-2"></i>
                Didn't receive the email? Check your spam folder or wait a few minutes.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setSuccess(false);
                  setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                  setCaptchaToken(null);
                }}
                className="w-full py-3 rounded-lg font-medium transition-colors cursor-pointer text-white"
                style={{ backgroundColor: '#C4704D' }}
              >
                Try a different email
              </button>
              
              <Link
                to="/auth/login"
                className="block w-full py-3 rounded-lg font-medium transition-colors text-center"
                style={{ backgroundColor: '#FDF8F5', color: '#2D2A26', border: '1px solid #E8D4CC' }}
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'linear-gradient(135deg, #FDF8F5 0%, #F8F4F0 50%, #E8D4CC 100%)' }}>
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center mb-8 cursor-pointer">
          <span className="text-4xl font-serif" style={{ color: '#2D2A26' }}>Lorem Curae</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8" style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif mb-2" style={{ color: '#2D2A26' }}>
              Here to find what works for you?
            </h1>
            <p style={{ color: '#6B635A' }}>
              Join our community and start your personalized skincare journey
            </p>
          </div>

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
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                placeholder="Enter your name"
                required
                disabled={isLoading}
              />
            </div>

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
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D2A26' }}>
                Password
              </label>
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
                placeholder="Create a password (min 6 characters)"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D2A26' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                placeholder="Confirm your password"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

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
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid #E8D4CC' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white" style={{ color: '#6B635A' }}>Or continue with</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              disabled={isLoading}
              onClick={async () => {
                setError(null);
                const { error: oauthError } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                  },
                });
                if (oauthError) setError(oauthError.message);
              }}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              style={{ border: '1px solid #E8D4CC' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FDF8F5'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span className="text-sm font-medium" style={{ color: '#2D2A26' }}>Google</span>
            </button>
          </div>

          <p className="text-center text-sm mt-6" style={{ color: '#6B635A' }}>
            Already have an account?{' '}
            <Link to="/auth/login" className="font-medium cursor-pointer" style={{ color: '#C4704D' }}>
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#6B635A' }}>
          By signing up, you agree to our{' '}
          <Link to="/terms" className="cursor-pointer" style={{ color: '#C4704D' }}>Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="cursor-pointer" style={{ color: '#C4704D' }}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;