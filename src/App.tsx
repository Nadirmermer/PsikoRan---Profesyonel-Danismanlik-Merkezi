import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy } from 'react';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { ThemeProvider } from './lib/theme';
import { AnimatePresence } from 'framer-motion';
import { AppLoader } from './components/AppLoader';
import { CookieBanner } from './components/CookieBanner';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { checkUpcomingAppointments } from './utils/notificationUtils';
import { useAuth } from './lib/auth';
import { useTheme } from './lib/theme';
import { SubscriptionProvider } from './components/payment/SubscriptionContext';
import { listenForNetworkChanges, listenForInstallPrompt, getDisplayMode } from './utils/pwa';

// Tüm sayfaları lazy loading ile yükle
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/CreateAssistant').then(m => ({ default: m.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const CreateAssistant = lazy(() => import('./pages/CreateAssistant').then(m => ({ default: m.CreateAssistant })));
const Professionals = lazy(() => import('./pages/Professionals').then(m => ({ default: m.Professionals })));
const Clients = lazy(() => import('./pages/Clients').then(m => ({ default: m.Clients })));
const ClientDetails = lazy(() => import('./pages/ClientDetails').then(m => ({ default: m.ClientDetails })));
const Appointments = lazy(() => import('./pages/Appointments').then(m => ({ default: m.Appointments })));
const Payments = lazy(() => import('./pages/Payments').then(m => ({ default: m.Payments })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.default })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const KVKK = lazy(() => import('./pages/KVKK').then(m => ({ default: m.KVKK })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Help = lazy(() => import('./pages/Help').then(m => ({ default: m.Help })));
const Test = lazy(() => import('./pages/Test').then(m => ({ default: m.Test })));
const TestCompleted = lazy(() => import('./pages/TestCompleted').then(m => ({ default: m.TestCompleted })));
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const BlogPost = lazy(() => import('./pages/BlogPost').then(m => ({ default: m.BlogPost })));
const BlogAdmin = lazy(() => import('./pages/BlogAdmin').then(m => ({ default: m.BlogAdmin })));
const Features = lazy(() => import('./pages/Features').then(m => ({ default: m.Features })));
const Pricing = lazy(() => import('./pages/Pricing').then(m => ({ default: m.Pricing })));
const Demo = lazy(() => import('./pages/Demo').then(m => ({ default: m.Demo })));
const AppointmentDetails = lazy(() => import('./components/AppointmentDetails'));

// React Router v7 için future flag'leri
const v7_startTransition = true;
const v7_relativeSplatPath = true;

// Global loading state için context oluştur
export const LoadingContext = React.createContext({
  isLoading: false,
  setIsLoading: (loading: boolean) => {},
});

// PWA durumu için context oluştur
export const PWAContext = React.createContext({
  isOnline: true, 
  isPWA: false,
  isInstallPromptShown: false,
  setIsInstallPromptShown: (shown: boolean) => {}
});

// Basit yükleme göstergesi komponenti
const PageLoader = () => <div className="loading-spinner" />;

function AnimatedRoutes() {
  const location = useLocation();
  const { isLoading, setIsLoading } = React.useContext(LoadingContext);
  const { professional, assistant, user } = useAuth();

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

  // Periyodik olarak yaklaşan randevuları kontrol et
  useEffect(() => {
    if (!user) return;

    // Randevu kontrolü yapmak için yardımcı fonksiyon
    const checkAppointments = () => {
      try {
        if (professional) {
          checkUpcomingAppointments(professional.id, 'professional');
        } else if (assistant) {
          checkUpcomingAppointments(assistant.id, 'assistant');
        }
      } catch (error) {
        console.error('Randevu kontrolü sırasında hata oluştu:', error);
      }
    };

    // İlk kontrolü yap
    checkAppointments();

    // Her 15 dakikada bir kontrol et
    const checkInterval = setInterval(checkAppointments, 15 * 60 * 1000); // 15 dakika

    return () => {
      clearInterval(checkInterval);
    };
  }, [user, professional, assistant]);
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={
          <Suspense fallback={<PageLoader />}>
            <Login />
          </Suspense>
        } />
        <Route path="/register" element={
          <Suspense fallback={<PageLoader />}>
            <Register />
          </Suspense>
        } />
        <Route path="/create-assistant" element={
          <Suspense fallback={<PageLoader />}>
            <CreateAssistant />
          </Suspense>
        } />
        <Route path="/forgot-password" element={
          <Suspense fallback={<PageLoader />}>
            <ForgotPassword />
          </Suspense>
        } />
        <Route path="/reset-password" element={
          <Suspense fallback={<PageLoader />}>
            <ResetPassword />
          </Suspense>
        } />
        <Route path="/" element={
          <Suspense fallback={<PageLoader />}>
            <Home />
          </Suspense>
        } />
        <Route path="/features" element={
          <Suspense fallback={<PageLoader />}>
            <Features />
          </Suspense>
        } />
        <Route path="/pricing" element={
          <Suspense fallback={<PageLoader />}>
            <Pricing />
          </Suspense>
        } />
        <Route path="/demo" element={
          <Suspense fallback={<PageLoader />}>
            <Demo />
          </Suspense>
        } />
        <Route path="/blog" element={
          <Suspense fallback={<PageLoader />}>
            <Blog />
          </Suspense>
        } />
        <Route path="/blog/:slug" element={
          <Suspense fallback={<PageLoader />}>
            <BlogPost />
          </Suspense>
        } />
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/professionals"
          element={
            <AuthGuard requireAssistant>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Professionals />
                </Suspense>
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/clients"
          element={
            <AuthGuard>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Clients />
                </Suspense>
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/clients/:clientId"
          element={
            <AuthGuard>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <ClientDetails />
                </Suspense>
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/appointments"
          element={
            <AuthGuard>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Appointments />
                </Suspense>
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/appointment/:id"
          element={
            <AuthGuard>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <AppointmentDetails />
                </Suspense>
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/payments"
          element={
            <AuthGuard>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Payments />
                </Suspense>
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/settings"
          element={
            <AuthGuard>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Settings />
                </Suspense>
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/blog-admin"
          element={
            <AuthGuard>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <BlogAdmin />
                </Suspense>
              </Layout>
            </AuthGuard>
          }
        />
        <Route path="/test/:testId/:clientId" element={
          <Suspense fallback={<PageLoader />}>
            <Test />
          </Suspense>
        } />
        <Route path="/public-test/:token" element={
          <Suspense fallback={<PageLoader />}>
            <Test />
          </Suspense>
        } />
        <Route path="/test-completed" element={
          <Suspense fallback={<PageLoader />}>
            <TestCompleted />
          </Suspense>
        } />
        <Route path="/privacy" element={
          <Suspense fallback={<PageLoader />}>
            <Privacy />
          </Suspense>
        } />
        <Route path="/terms" element={
          <Suspense fallback={<PageLoader />}>
            <Terms />
          </Suspense>
        } />
        <Route path="/kvkk" element={
          <Suspense fallback={<PageLoader />}>
            <KVKK />
          </Suspense>
        } />
        <Route path="/contact" element={
          <Suspense fallback={<PageLoader />}>
            <Contact />
          </Suspense>
        } />
        <Route path="/help" element={
          <Suspense fallback={<PageLoader />}>
            <Help />
          </Suspense>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export function App() {
  const { initializeTheme } = useTheme();
  const { user } = useAuth();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // PWA Durumu
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isPWA, setIsPWA] = useState<boolean>(false);
  const [isInstallPromptShown, setIsInstallPromptShown] = useState<boolean>(false);

  // Uygulama başlatma
  useEffect(() => {
    const initApp = async () => {
      try {
        // Tema başlatma
        await initializeTheme();

        // PWA durumunu kontrol et
        const displayMode = getDisplayMode();
        setIsPWA(displayMode === 'standalone' || displayMode === 'standalone-ios');
        
        // PWA yükleme olayını dinlemeye başla
        listenForInstallPrompt();
        
        // Çevrimiçi durumu dinle
        listenForNetworkChanges(setIsOnline);
        
        // Sonunda yüklemeyi tamamla
        setIsInitialLoading(false);
      } catch (error) {
        console.error('Uygulama başlatılırken bir hata oluştu:', error);
        setIsInitialLoading(false);
      }
    };

    initApp();
  }, [initializeTheme]);

  return (
    <ThemeProvider>
      <SubscriptionProvider>
        <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
          <PWAContext.Provider value={{ 
            isOnline, 
            isPWA, 
            isInstallPromptShown, 
            setIsInstallPromptShown
          }}>
            <Router>
              {isInitialLoading ? <AppLoader /> : (
                <>
                  <AnimatedRoutes />
                  <CookieBanner />
                  {!isPWA && <PWAInstallPrompt />}
                </>
              )}
            </Router>
          </PWAContext.Provider>
        </LoadingContext.Provider>
      </SubscriptionProvider>
    </ThemeProvider>
  );
}