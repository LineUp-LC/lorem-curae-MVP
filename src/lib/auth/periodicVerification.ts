/**
 * Periodic Email Verification
 *
 * Requires returning users to re-verify their email after a configurable
 * interval (default: 30 days). Works for both email/password and OAuth users.
 *
 * Flow:
 *   1. On login / OAuth callback, check lastVerifiedAt
 *   2. If stale (> threshold), redirect to /auth/verify-email?type=periodic
 *   3. Verify-email page sends OTP via signInWithOtp and verifies
 *   4. On success, update lastVerifiedAt
 */

/** Re-verification threshold in milliseconds (30 days) */
const VERIFICATION_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;

function storageKey(userId: string): string {
  return `lc_lastVerifiedAt_${userId}`;
}

/** Get the last verification timestamp for a user */
export function getLastVerifiedAt(userId: string): number | null {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

/** Update the last verification timestamp to now */
export function setLastVerifiedAt(userId: string): void {
  try {
    localStorage.setItem(storageKey(userId), Date.now().toString());
  } catch {
    // Storage quota exceeded — silently skip
  }
}

/**
 * Check whether a user needs periodic re-verification.
 * Returns false for first-time users (they just verified via signup).
 */
export function needsPeriodicVerification(userId: string): boolean {
  const last = getLastVerifiedAt(userId);
  if (!last) return false; // First login — initialize, don't require
  return Date.now() - last > VERIFICATION_THRESHOLD_MS;
}

/**
 * Initialize verification timestamp for a new user.
 * Called on first signup/login — sets the clock for periodic checks.
 */
export function initializeVerification(userId: string): void {
  if (!getLastVerifiedAt(userId)) {
    setLastVerifiedAt(userId);
  }
}
