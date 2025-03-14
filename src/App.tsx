import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState, Suspense } from 'react';
import { Login } from './pages/Login';
import { CreateAssistant } from './pages/CreateAssistant';
import { Dashboard } from './pages/Dashboard';
import { Professionals } from './pages/Professionals';
import { Clients } from './pages/Clients';
import { ClientDetails } from './pages/ClientDetails';
import { Appointments } from './pages/Appointments';
import { Payments } from './pages/Payments';
import { Settings } from './pages/Settings';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { useAuth } from './lib/auth';
import { useTheme } from './lib/theme';
import { ThemeProvider } from './lib/theme';
import { AnimatePresence } from 'framer-motion';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { KVKK } from './pages/KVKK';
import { AppLoader } from './components/AppLoader';
import { Contact } from './pages/Contact';
import { Help } from './pages/Help';
import { Test } from './pages/Test';
import { TestCompleted } from './pages/TestCompleted';
import React from 'react';
import { UNSAFE_DataRouterContext, UNSAFE_DataRouterStateContext, UNSAFE_NavigationContext, UNSAFE_RouteContext } from 'react-router-dom';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';

// React Router v7 için future flag'leri
const v7_startTransition = true;
const v7_relativeSplatPath = true;

// Global loading state için context oluştur
export const LoadingContext = React.createContext({
  isLoading: false,
  setIsLoading: (loading: boolean) => {},
});

function AnimatedRoutes() {
  const location = useLocation();
  const { isLoading, setIsLoading } = React.useContext(LoadingContext);

  useEffect(() => {
    let loadingTimer: NodeJS.Timeout | null = null;
    
    const handleRouteChange = () => {
      // Hemen loading state'ini false yap
      setIsLoading(false);
      
      // Eğer varsa timer'ı temizle
      if (loadingTimer) {
        clearTimeout(loadingTimer);
        loadingTimer = null;
      }
    };

    // Sadece uzun süren route değişimlerinde loading göster
    loadingTimer = setTimeout(() => {
      setIsLoading(true);
    }, 500);

    // Route değişiminde hemen loading'i kapat
    handleRouteChange();

    return () => {
      if (loadingTimer) {
        clearTimeout(loadingTimer);
      }
      setIsLoading(false);
    };
  }, [location.pathname, setIsLoading]);
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/create-assistant" element={<CreateAssistant />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout>
                <Dashboard />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/professionals"
          element={
            <AuthGuard requireAssistant>
              <Layout>
                <Professionals />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/clients"
          element={
            <AuthGuard>
              <Layout>
                <Clients />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/clients/:id"
          element={
            <AuthGuard>
              <Layout>
                <ClientDetails />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/appointments"
          element={
            <AuthGuard>
              <Layout>
                <Appointments />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/payments"
          element={
            <AuthGuard>
              <Layout>
                <Payments />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/settings"
          element={
            <AuthGuard>
              <Layout>
                <Settings />
              </Layout>
            </AuthGuard>
          }
        />
        <Route path="/test/:testId/:clientId" element={<Test />} />
        <Route path="/public-test/:token" element={<Test />} />
        <Route path="/test-completed" element={<TestCompleted />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/kvkk" element={<KVKK />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </AnimatePresence>
  );
}

export function App() {
  const { initialize } = useAuth();
  const { initializeTheme } = useTheme();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Temayı önce başlat
        initializeTheme();
        
        // Sonra auth işlemlerini yap
        await initialize();
      } catch (error) {
        console.error('Uygulama başlatma hatası:', error);
      } finally {
        // Initial loading'i hemen kapat
        setIsInitialLoading(false);
        // Global loading state'ini de kapat
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [initialize, initializeTheme]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      <Router future={{ v7_startTransition, v7_relativeSplatPath }}>
        {isInitialLoading ? (
          <AppLoader />
        ) : (
          <>
            {isLoading && <AppLoader />}
            <OfflineIndicator />
            <PWAInstallPrompt />
            <Suspense>
              <AnimatedRoutes />
            </Suspense>
          </>
        )}
      </Router>
    </LoadingContext.Provider>
  );
}