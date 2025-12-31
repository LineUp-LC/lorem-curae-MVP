import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the URL hash parameters (Supabase sends tokens in the hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        // Check for errors in URL
        if (error) {
          setStatus('error');
          setErrorMessage(errorDescription || 'An error occurred during verification');
          return;
        }

        // If we have tokens, set the session
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            setStatus('error');
            setErrorMessage(sessionError.message);
            return;
          }

          setStatus('success');
          
          // Redirect to account after a short delay
          setTimeout(() => {
            navigate('/account');
          }, 2000);
        } else {
          // No tokens - check if there's an existing session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            setStatus('success');
            setTimeout(() => {
              navigate('/account');
            }, 2000);
          } else {
            setStatus('error');
            setErrorMessage('No verification token found. Please try signing up again.');
          }
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage('An unexpected error occurred');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-cream-50 to-coral-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center mb-8 cursor-pointer">
          <span className="text-4xl font-serif text-slate-900">Lorem Curae</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-loader-4-line text-3xl text-sage-600 animate-spin"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Verifying your email...
              </h1>
              <p className="text-gray-600">
                Please wait while we confirm your account.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-check-line text-3xl text-green-600"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Email verified!
              </h1>
              <p className="text-gray-600 mb-6">
                Your account has been verified successfully. Redirecting you to your account...
              </p>
              <div className="flex items-center justify-center gap-2 text-sage-600">
                <i className="ri-loader-4-line animate-spin"></i>
                <span>Redirecting...</span>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-error-warning-line text-3xl text-red-600"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Verification failed
              </h1>
              <p className="text-gray-600 mb-6">
                {errorMessage}
              </p>
              <div className="space-y-3">
                <Link
                  to="/auth/signup"
                  className="block w-full bg-sage-600 text-white py-3 rounded-lg font-medium hover:bg-sage-700 transition-colors text-center"
                >
                  Try signing up again
                </Link>
                <Link
                  to="/auth/login"
                  className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;