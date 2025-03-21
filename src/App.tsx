import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState, Suspense } from 'react';
import {
  Login, Register, Dashboard, CreateAssistant, Professionals, Clients,
  ClientDetails, Appointments, Payments, Settings, ForgotPassword,
  ResetPassword, Privacy, Terms, KVKK, Contact, Help, Test, TestCompleted, Home,
  Blog, BlogAdmin, ProfessionalProfile
} from './pages';
import { BlogPost } from './pages/BlogPost';
import AppointmentDetails from './components/AppointmentDetails';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { ThemeProvider } from './lib/theme';
import { AnimatePresence } from 'framer-motion';
import { AppLoader } from './components/AppLoader';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAPrompts } from './components/PWAPrompts';
import { CookieBanner } from './components/CookieBanner';
import { checkUpcomingAppointments } from './utils/notificationUtils';
import { useAuth } from './lib/auth';
import { useTheme } from './lib/theme';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

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

    // İlk kontrolü yap
    if (professional) {
      checkUpcomingAppointments(professional.id, 'professional');
    } else if (assistant) {
      checkUpcomingAppointments(assistant.id, 'assistant');
    }

    // Her 15 dakikada bir kontrol et
    const checkInterval = setInterval(() => {
      if (professional) {
        checkUpcomingAppointments(professional.id, 'professional');
      } else if (assistant) {
        checkUpcomingAppointments(assistant.id, 'assistant');
      }
    }, 15 * 60 * 1000); // 15 dakika

    return () => {
      clearInterval(checkInterval);
    };
  }, [user, professional, assistant]);
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-assistant" element={<CreateAssistant />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/professional/:slug" element={<ProfessionalProfile />} />
        <Route
          path="/dashboard"
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
          path="/clients/:clientId"
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
          path="/appointment/:id"
          element={
            <AuthGuard>
              <Layout>
                <AppointmentDetails />
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
        <Route
          path="/blog-admin"
          element={
            <AuthGuard>
              <Layout>
                <BlogAdmin />
              </Layout>
            </AuthGuard>
          }
        />
        <Route path="/test/:testId/:clientId" element={<Test />} />
        <Route path="/public-test/:token" element={<Test />} />
        <Route path="/test-completed" element={<TestCompleted />} />
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
  const { initializeTheme } = useTheme();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [pwaInstallReady, setPwaInstallReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Tema başlatma
        await initializeTheme();

        // Google aramalarından gelen ziyaretçileri ana sayfaya yönlendir
        const isFromExternalSource = document.referrer && 
          (document.referrer.includes('google.com') || 
           document.referrer.includes('google.com.tr') ||
           document.referrer.includes('bing.com') ||
           document.referrer.includes('yandex.com') ||
           !document.referrer.includes(window.location.hostname));
        
        const isLoginPage = window.location.pathname === '/login';
        
        if (isLoginPage && isFromExternalSource) {
          window.history.replaceState({}, '', '/');
        }
      } catch (error) {
        console.error('Tema başlatılamadı:', error);
      } finally {
        // Yükleme durumlarını güncelle
        setIsInitialLoading(false);
        // Global loading state'ini de kapat
        setTimeout(() => setIsLoading(false), 800);

        // PWA kurulum durumunu kontrol et
        const standalone = window.matchMedia('(display-mode: standalone)').matches;
        // PWA yüklü değilse ve kullanıcı daha önce hatırlatıcıyı kapatmadıysa
        if (!standalone && localStorage.getItem('pwa_install_dismissed') !== 'true') {
          // PWA yükleme hatırlatıcısı gösterme zamanını ayarla
          setTimeout(() => setPwaInstallReady(true), 5000);
        }
      }
    };

    initApp();
  }, [initializeTheme]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      <Router future={{ v7_startTransition, v7_relativeSplatPath }}>
        {isInitialLoading ? (
          <AppLoader />
        ) : (
          <>
            {isLoading && <AppLoader />}
            <OfflineIndicator />
            <PWAPrompts />
            <CookieBanner />
            <Suspense>
              <AnimatedRoutes />
            </Suspense>
            {pwaInstallReady && <PWAInstallPrompt />}
          </>
        )}
      </Router>
    </LoadingContext.Provider>
  );
}