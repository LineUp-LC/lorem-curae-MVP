import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import PasswordGate from "./PasswordGate";
import { AuthProvider } from "./lib/AuthContext";

function App() {
  return (
    <PasswordGate>
      <AuthProvider>
        <I18nextProvider i18n={i18n}>
          <BrowserRouter basename={__BASE_PATH__}>
            <AppRoutes />
          </BrowserRouter>
        </I18nextProvider>
      </AuthProvider>
    </PasswordGate>
  );
}

export default App;