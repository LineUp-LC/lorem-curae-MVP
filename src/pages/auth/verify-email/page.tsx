/**
 * VerifyEmailPage — 6-digit OTP code verification
 *
 * Handles two verification types:
 *   1. 'signup' (default) — After email/password signup. Uses verifyOtp({ type: 'signup' }).
 *   2. 'periodic' — Returning user re-verification. Sends OTP via signInWithOtp,
 *      then verifies with verifyOtp({ type: 'email' }).
 *
 * Includes resend button with cooldown and expiration warning.
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { setLastVerifiedAt } from '../../../lib/auth/periodicVerification';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;
const EXPIRY_MINUTES = 5;

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const verificationType = searchParams.get('type') === 'periodic' ? 'periodic' : 'signup';

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verified, setVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(verificationType === 'signup');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Redirect if no email
  useEffect(() => {
    if (!email) navigate('/auth/signup');
  }, [email, navigate]);

  // For periodic verification, send OTP on mount
  useEffect(() => {
    if (verificationType !== 'periodic' || otpSent) return;
    let cancelled = false;

    const sendOtp = async () => {
      try {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: false },
        });
        if (!cancelled) {
          if (otpError) {
            setError('Failed to send verification code. Please try again.');
          } else {
            setOtpSent(true);
            setResendCooldown(RESEND_COOLDOWN_SECONDS);
          }
        }
      } catch {
        if (!cancelled) setError('Failed to send verification code.');
      }
    };

    sendOtp();
    return () => { cancelled = true; };
  }, [verificationType, email, otpSent]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    setError(null);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && index === CODE_LENGTH - 1 && next.every(d => d)) {
      verifyCode(next.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setCode(next);
    setError(null);
    if (pasted.length === CODE_LENGTH) {
      verifyCode(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const verifyCode = async (token: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      const otpType = verificationType === 'periodic' ? 'email' : 'signup';
      const { data, error: otpError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: otpType,
      });
      if (otpError) {
        if (otpError.message.toLowerCase().includes('expired')) {
          setError('Code has expired. Please request a new one.');
        } else {
          setError('Invalid verification code. Please try again.');
        }
        setCode(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        return;
      }

      // Update periodic verification timestamp
      const userId = data?.user?.id;
      if (userId) {
        setLastVerifiedAt(userId);
      }

      setVerified(true);
      setTimeout(() => navigate('/account'), 1500);
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setCode(Array(CODE_LENGTH).fill(''));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setError(null);
    try {
      if (verificationType === 'periodic') {
        const { error: resendError } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: false },
        });
        if (resendError) {
          setError(resendError.message);
        } else {
          setResendCooldown(RESEND_COOLDOWN_SECONDS);
        }
      } else {
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email,
        });
        if (resendError) {
          setError(resendError.message);
        } else {
          setResendCooldown(RESEND_COOLDOWN_SECONDS);
        }
      }
    } catch {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Verified success state
  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'linear-gradient(135deg, #FDF8F5 0%, #F8F4F0 50%, #E8D4CC 100%)' }}>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center" style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(122, 139, 122, 0.1)' }}>
              <i className="ri-check-double-line text-3xl" style={{ color: '#7A8B7A' }}></i>
            </div>
            <h1 className="text-2xl font-serif mb-2" style={{ color: '#2D2A26' }}>Email verified</h1>
            <p style={{ color: '#6B635A' }}>Redirecting to your account...</p>
          </div>
        </div>
      </div>
    );
  }

  const isPeriodic = verificationType === 'periodic';

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'linear-gradient(135deg, #FDF8F5 0%, #F8F4F0 50%, #E8D4CC 100%)' }}>
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center mb-8 cursor-pointer">
          <span className="text-4xl font-serif" style={{ color: '#2D2A26' }}>Lorem Curae</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8" style={{ border: '1px solid rgba(232, 212, 204, 0.3)' }}>
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: isPeriodic ? 'rgba(122, 139, 122, 0.1)' : 'rgba(196, 112, 77, 0.1)' }}>
              <i className={`${isPeriodic ? 'ri-shield-check-line' : 'ri-mail-send-line'} text-2xl`} style={{ color: isPeriodic ? '#7A8B7A' : '#C4704D' }}></i>
            </div>
            <h1 className="text-2xl font-serif mb-2" style={{ color: '#2D2A26' }}>
              {isPeriodic ? 'Confirm your identity' : 'Verify your email'}
            </h1>
            <p className="text-sm" style={{ color: '#6B635A' }}>
              {isPeriodic
                ? <>For your security, please enter the {CODE_LENGTH}-digit code we sent to{' '}<strong style={{ color: '#2D2A26' }}>{email}</strong></>
                : <>We sent a {CODE_LENGTH}-digit code to{' '}<strong style={{ color: '#2D2A26' }}>{email}</strong></>
              }
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

          {/* Code input */}
          <div className="flex justify-center gap-2.5 mb-6" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={isVerifying}
                className="w-12 h-14 text-center text-xl font-semibold rounded-xl border-2 outline-none transition-all"
                style={{
                  borderColor: digit ? '#C4704D' : '#E8D4CC',
                  color: '#2D2A26',
                  backgroundColor: isVerifying ? '#F8F4F0' : '#fff',
                }}
                onFocus={e => { e.target.style.borderColor = '#C4704D'; e.target.style.boxShadow = '0 0 0 3px rgba(196, 112, 77, 0.1)'; }}
                onBlur={e => { e.target.style.borderColor = digit ? '#C4704D' : '#E8D4CC'; e.target.style.boxShadow = 'none'; }}
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          {/* Expiration note */}
          <p className="text-center text-xs mb-6" style={{ color: '#6B635A' }}>
            <i className="ri-time-line mr-1"></i>
            Code expires in {EXPIRY_MINUTES} minutes
          </p>

          {/* Verify button */}
          <button
            onClick={() => {
              const full = code.join('');
              if (full.length === CODE_LENGTH) verifyCode(full);
            }}
            disabled={isVerifying || code.some(d => !d)}
            className="w-full py-3 rounded-lg font-medium transition-colors cursor-pointer text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#C4704D' }}
          >
            {isVerifying ? (
              <span className="flex items-center justify-center gap-2">
                <i className="ri-loader-4-line animate-spin"></i>
                Verifying...
              </span>
            ) : (
              isPeriodic ? 'Confirm identity' : 'Verify email'
            )}
          </button>

          {/* Resend */}
          <div className="text-center mt-5">
            <p className="text-sm" style={{ color: '#6B635A' }}>
              Didn't receive the code?{' '}
              {resendCooldown > 0 ? (
                <span style={{ color: '#6B635A' }}>Resend in {resendCooldown}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-medium transition-colors cursor-pointer bg-transparent border-none p-0"
                  style={{ color: '#C4704D' }}
                >
                  {isResending ? 'Sending...' : 'Resend code'}
                </button>
              )}
            </p>
          </div>

          {/* Back link */}
          <div className="text-center mt-4">
            <Link
              to={isPeriodic ? '/auth/login' : '/auth/signup'}
              className="text-sm font-medium transition-colors"
              style={{ color: '#6B635A' }}
            >
              {isPeriodic ? 'Back to login' : 'Use a different email'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
