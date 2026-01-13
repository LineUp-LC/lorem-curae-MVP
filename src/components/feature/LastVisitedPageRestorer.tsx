import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sessionState } from '../../lib/utils/sessionState';

/**
 * LastVisitedPageRestorer
 *
 * Restores the user's last visited page on app load for session continuity.
 * Only triggers on fresh app load (not on navigation within the app).
 *
 * Exclusions:
 * - Auth pages (/auth/*)
 * - Onboarding (/skin-survey, /onboarding)
 * - Home page (/)
 * - Password gate
 */
export default function LastVisitedPageRestorer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    // Only restore once per app session
    if (hasRestored) return;

    // Only restore if we're on the home page (fresh load)
    if (location.pathname !== '/') return;

    // Check if this is a fresh page load (not SPA navigation)
    const isFirstLoad = sessionStorage.getItem('app_loaded') !== 'true';
    if (!isFirstLoad) return;

    // Mark app as loaded for this browser session
    sessionStorage.setItem('app_loaded', 'true');

    // Get last visited page from session state
    const lastPage = sessionState.getLastVisitedPage();

    if (lastPage) {
      // Small delay to ensure app is fully mounted
      const timer = setTimeout(() => {
        navigate(lastPage, { replace: true });
        setHasRestored(true);
      }, 100);

      return () => clearTimeout(timer);
    }

    setHasRestored(true);
  }, [location.pathname, navigate, hasRestored]);

  // This component renders nothing - it's purely for side effects
  return null;
}
