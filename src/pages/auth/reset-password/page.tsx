import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };
    checkSession();

    // Listen for auth state changes (user clicks email link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FDF8F5 0%, #F8F4F0 50%, #E8D4CC 100%)' }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C4704D', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  // Invalid or expired session
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'linear-gradient(135deg, #FDF8F5 0%, #F8F4F0 50%, #E8D4CC 100%)' }}>
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center mb-8 cursor-pointer">
            <span className="text-4xl font-serif" style={{ color: '#2D2A26' }}>Lorem Curae</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center" style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(139, 77, 53, 0.1)' }}>
              <i className="ri-time-line text-3xl" style={{ color: '#8B4D35' }}></i>
            </div>

            <h1 className="text-2xl font-serif mb-4" style={{ color: '#2D2A26' }}>
              Link expired
            </h1>

            <p className="mb-6" style={{ color: '#6B635A' }}>
              This password reset link has expired or is invalid. Please request a new one.
            </p>

            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="block w-full py-3 rounded-lg font-medium transition-colors text-center text-white cursor-pointer"
                style={{ backgroundColor: '#C4704D' }}
              >
                Request New Link
              </Link>

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
              <i className="ri-check-line text-3xl" style={{ color: '#7A8B7A' }}></i>
            </div>

            <h1 className="text-2xl font-serif mb-4" style={{ color: '#2D2A26' }}>
              Password updated
            </h1>

            <p className="mb-6" style={{ color: '#6B635A' }}>
              Your password has been successfully reset. You can now sign in with your new password.
            </p>

            <button
              onClick={() => navigate('/auth/login')}
              className="w-full py-3 rounded-lg font-medium transition-colors cursor-pointer text-white"
              style={{ backgroundColor: '#C4704D' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#8B4D35'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#C4704D'}
            >
              Sign In
            </button>
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
              <i className="ri-lock-password-line text-2xl" style={{ color: '#C4704D' }}></i>
            </div>
            <h1 className="text-3xl font-serif mb-2" style={{ color: '#2D2A26' }}>
              Set new password
            </h1>
            <p style={{ color: '#6B635A' }}>
              Enter your new password below
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
                New Password
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
                placeholder="Enter new password (min 6 characters)"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D2A26' }}>
                Confirm New Password
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
                placeholder="Confirm your new password"
                required
                disabled={isLoading}
                minLength={6}
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
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
