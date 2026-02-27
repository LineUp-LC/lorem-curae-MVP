import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const sendResetEmail = async (targetEmail: string) => {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    return resetError;
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      const resetError = await sendResetEmail(email);
      if (!resetError) {
        // Start 60 second cooldown
        setResendCooldown(60);
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const resetError = await sendResetEmail(email);

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
              We've sent a password reset link to <strong style={{ color: '#2D2A26' }}>{email}</strong>.
              Click the link in the email to reset your password.
            </p>

            <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: 'rgba(196, 112, 77, 0.08)', border: '1px solid rgba(196, 112, 77, 0.15)' }}>
              <p className="text-sm" style={{ color: '#8B4D35' }}>
                <i className="ri-information-line mr-2"></i>
                Didn't receive the email? Check your spam folder or wait a few minutes.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
                className="w-full py-3 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
                style={{ backgroundColor: '#C4704D' }}
                onMouseOver={(e) => !isResending && resendCooldown === 0 && (e.currentTarget.style.backgroundColor = '#8B4D35')}
                onMouseOut={(e) => !isResending && resendCooldown === 0 && (e.currentTarget.style.backgroundColor = '#C4704D')}
              >
                {isResending ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  <>
                    <i className="ri-mail-send-line"></i>
                    Resend Email
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                  setResendCooldown(0);
                }}
                className="w-full py-3 rounded-lg font-medium transition-colors cursor-pointer"
                style={{ backgroundColor: '#FDF8F5', color: '#2D2A26', border: '1px solid #E8D4CC' }}
              >
                Try a different email
              </button>

              <Link
                to="/auth/login"
                className="block w-full py-3 rounded-lg font-medium transition-colors text-center"
                style={{ color: '#6B635A' }}
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
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center mb-8 cursor-pointer">
          <span className="text-4xl font-serif" style={{ color: '#2D2A26' }}>Lorem Curae</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8" style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}>
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(196, 112, 77, 0.1)' }}>
              <i className="ri-lock-unlock-line text-2xl" style={{ color: '#C4704D' }}></i>
            </div>
            <h1 className="text-3xl font-serif mb-2" style={{ color: '#2D2A26' }}>
              Forgot password?
            </h1>
            <p style={{ color: '#6B635A' }}>
              Enter your email and we'll send you a reset link
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
              style={{ backgroundColor: '#C4704D' }}
              onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#8B4D35')}
              onMouseOut={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#C4704D')}
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#6B635A' }}>
            Remember your password?{' '}
            <Link to="/auth/login" className="font-medium cursor-pointer" style={{ color: '#C4704D' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
