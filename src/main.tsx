import { StrictMode } from 'react'
import './env-check'  // Debug: log env vars at startup
import './i18n'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/**
 * Clear localStorage ONLY on tab/browser close, NOT on refresh
 * 
 * How it works:
 * - sessionStorage survives page refresh but is cleared when tab closes
 * - On every page load, we check if sessionStorage has our flag
 * - If the flag exists → this is a refresh (don't clear localStorage)
 * - If the flag doesn't exist → this is a new session (previous tab was closed)
 *   → Clear localStorage from the previous session
 * - Then we set the flag for future refresh detection
 * 
 * This approach is reliable across Chrome, Safari, and Firefox.
 */

const SESSION_FLAG = '__active_session__';

// Check if this is a new session (tab was previously closed) or a refresh
if (!sessionStorage.getItem(SESSION_FLAG)) {
  // New session - previous tab was closed, clear old localStorage data
  localStorage.clear();
}

// Mark this session as active (survives refreshes, cleared on tab close)
sessionStorage.setItem(SESSION_FLAG, '1');