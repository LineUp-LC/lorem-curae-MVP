import { useEffect, useState, useCallback } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import PasswordGate from "./PasswordGate";
import { AuthProvider, useAuth } from "./lib/auth/AuthContext";
import LastVisitedPageRestorer from "./components/feature/LastVisitedPageRestorer";
import PersistenceDebugPanel from "./components/feature/PersistenceDebugPanel";
import ScrollToTop from "./components/feature/ScrollToTop";
import { initProductCatalog } from "./lib/data/products";
import PointsEarnedToast from "./components/feature/PointsEarnedToast";

interface ToastData {
  points: number;
  description: string;
  badgeName?: string;
}

/**
 * AppInner — renders inside AuthProvider so it can gate product catalog
 * loading behind auth resolution, avoiding concurrent Supabase connections.
 */
function AppInner() {
  const { loading } = useAuth();
  const [toast, setToast] = useState<ToastData | null>(null);
  const [catalogLoaded, setCatalogLoaded] = useState(false);

  const handleGamificationEvent = useCallback((e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (!detail) return;
    setToast({
      points: detail.pointsAwarded ?? 0,
      description: detail.description ?? '',
      badgeName: detail.badgesUnlocked?.[0]?.name,
    });
  }, []);

  // Defer product catalog load until after auth resolves to avoid
  // overwhelming the Supabase connection pool with concurrent requests
  useEffect(() => {
    if (!loading && !catalogLoaded) {
      setCatalogLoaded(true);
      initProductCatalog();
    }
  }, [loading, catalogLoaded]);

  useEffect(() => {
    window.addEventListener('curae:gamification', handleGamificationEvent);
    return () => window.removeEventListener('curae:gamification', handleGamificationEvent);
  }, [handleGamificationEvent]);

  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter basename={__BASE_PATH__}>
        <ScrollToTop />
        <LastVisitedPageRestorer />
        <PersistenceDebugPanel />
        <AppRoutes />
        {toast && (
          <PointsEarnedToast
            points={toast.points}
            description={toast.description}
            badgeName={toast.badgeName}
            onClose={() => setToast(null)}
          />
        )}
      </BrowserRouter>
    </I18nextProvider>
  );
}

function App() {
  return (
    <PasswordGate>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </PasswordGate>
  );
}

export default App;