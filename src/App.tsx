import { useEffect, useState, useCallback } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import PasswordGate from "./PasswordGate";
import { AuthProvider } from "./lib/auth/AuthContext";
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

function App() {
  const [toast, setToast] = useState<ToastData | null>(null);

  const handleGamificationEvent = useCallback((e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (!detail) return;
    setToast({
      points: detail.pointsAwarded ?? 0,
      description: detail.description ?? '',
      badgeName: detail.badgesUnlocked?.[0],
    });
  }, []);

  useEffect(() => {
    initProductCatalog();
  }, []);

  useEffect(() => {
    window.addEventListener('curae:gamification', handleGamificationEvent);
    return () => window.removeEventListener('curae:gamification', handleGamificationEvent);
  }, [handleGamificationEvent]);

  return (
    <PasswordGate>
      <AuthProvider>
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
      </AuthProvider>
    </PasswordGate>
  );
}

export default App;