import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState, Suspense } from 'react';
import {
  Login, Register, Dashboard, CreateAssistant, Professionals, Clients,
  ClientDetails, Appointments, Payments, Settings, ForgotPassword,
  ResetPassword, Privacy, Terms, KVKK, Contact, Help, Test, TestCompleted, Home,
  Blog, BlogAdmin, Features, Pricing, Demo
} from './pages';
import { AdminLogin } from './pages/admin/AdminLogin';
import AdminPanel from './pages/admin/AdminPanel';
import { BlogPost } from './pages/BlogPost';
import AppointmentDetails from './components/AppointmentDetails';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { ThemeProvider } from './lib/theme';
import { AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { CookieBanner } from './components/CookieBanner';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { checkUpcomingAppointments } from './utils/notificationUtils';
import { useAuth } from './lib/auth';
import { useTheme } from './lib/theme';
import { listenForNetworkChanges, listenForInstallPrompt, getDisplayMode } from './utils/pwa';
import { supabase } from './lib/supabase';

// Test Raporu sayfasını lazy-load ile import ediyoruz (default export varsayımıyla)
const TestResultPage = React.lazy(() => import('./pages/test-results/TestResult'));

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

// Herkese açık yolların listesi
const PUBLIC_PATHS = [
  '/', '/giris', '/kayit', '/asistan-olustur', '/sifremi-unuttum', '/sifre-sifirlama',
  '/ozellikler', '/fiyatlandirma', '/demo', '/blog', '/gizlilik', '/kosullar', '/kvkk', '/iletisim', '/yardim', '/test-tamamlandi'
];

// Blog ve test gibi dinamik public yolları kontrol etmek için regex
const PUBLIC_PATH_PATTERNS = [ /^\/blog\/.+$/, /^\/test\/.+$/, /^\/genel-test\/.+$/ ];

// BrowserRouter artık kullanılmıyor, doğrudan içerik döndürülüyor
function AnimatedRoutes() {
  const location = useLocation();
  const { isLoading, setIsLoading } = React.useContext(LoadingContext);
  const { professional, assistant, user } = useAuth();
  const currentPath = location.pathname;

  // Route değişiminde loading state'ini kapalı tut
  useEffect(() => {
    // Route değişimlerinde loading göstermeye gerek yok
    // Sayfaların kendi içinde loading state'leri var
    setIsLoading(false);
  }, [currentPath, setIsLoading]);

  // Periyodik olarak yaklaşan randevuları SADECE GEREKLİ SAYFALARDA kontrol et
  useEffect(() => {
    // Kullanıcı yoksa veya herkese açık bir yoldaysak kontrol yapma
    const isPublic = PUBLIC_PATHS.includes(currentPath) || PUBLIC_PATH_PATTERNS.some(pattern => pattern.test(currentPath));
    if (!user || isPublic) {
      // Eğer interval çalışıyorsa temizle (sayfa değişimi durumu için)
      // Bu kısmı interval değişkenini dışarıda tanımlayarak daha iyi yönetebiliriz,
      // ama şimdilik basit tutalım. En kötü ihtimalle gereksiz yere çalışmaz.
      return; 
    }

    // Sadece giriş yapmış ve özel bir sayfada olan kullanıcı için kontrol yap
    let checkInterval: NodeJS.Timeout | null = null;
    
    const checkAppointments = () => {
      try {
        if (professional) {
          checkUpcomingAppointments(professional.id, 'professional');
        } else if (assistant) {
          checkUpcomingAppointments(assistant.id, 'assistant');
        }
        // Danışanlar için de randevu kontrolü gerekiyorsa buraya eklenebilir
      } catch (error) {
        // console.error('Randevu kontrolü sırasında hata oluştu:', error);
      }
    };

    checkAppointments(); // İlk kontrolü yap
    checkInterval = setInterval(checkAppointments, 15 * 60 * 1000); // 15 dakika

    // Cleanup fonksiyonu
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
    // Bağımlılıklar: user, professional, assistant VE currentPath
  }, [user, professional, assistant, currentPath]);
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/admin/giris" element={<AdminLogin />} />
        <Route
          path="/admin/panel"
          element={
            <AuthGuard requireAdmin>
              <AdminPanel />
            </AuthGuard>
          }
        />
        <Route path="/giris" element={<Login />} />
        <Route path="/kayit" element={<Register />} />
        <Route path="/asistan-olustur" element={<CreateAssistant />} />
        <Route path="/sifremi-unuttum" element={<ForgotPassword />} />
        <Route path="/sifre-sifirlama" element={<ResetPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/ozellikler" element={<Features />} />
        <Route path="/fiyatlandirma" element={<Pricing />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route 
          path="/test-sonuclari" 
          element={<Navigate to="/" replace />} 
        />
        <Route 
          path="/test-sonuclari/:id" 
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
              <TestResultPage />
            </Suspense>
          } 
        />
        <Route
          path="/panel"
          element={
            <AuthGuard>
              <Layout>
                <Dashboard />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/uzmanlar"
          element={
            <AuthGuard requireAssistant>
              <Layout>
                <Professionals />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/danisanlar"
          element={
            <AuthGuard>
              <Layout>
                <Clients />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/danisanlar/:clientId"
          element={
            <AuthGuard>
              <Layout>
                <ClientDetails />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/randevular"
          element={
            <AuthGuard>
              <Layout>
                <Appointments />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/randevular/:id"
          element={
            <AuthGuard>
              <Layout>
                <AppointmentDetails />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/randevular/duzenle/:id"
          element={
            <AuthGuard>
              <Layout>
                <AppointmentDetails isEditing={true} />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/odemeler"
          element={
            <AuthGuard>
              <Layout>
                <Payments />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/ayarlar"
          element={
            <AuthGuard>
              <Layout>
                <Settings />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/blog-yonetim"
          element={
            <AuthGuard>
              <Layout>
                <BlogAdmin />
              </Layout>
            </AuthGuard>
          }
        />
        <Route path="/test/:testId/:clientId" element={<Test />} />
        <Route path="/genel-test/:token" element={<Test />} />
        <Route path="/test-tamamlandi" element={<TestCompleted />} />
        <Route path="/gizlilik" element={<Privacy />} />
        <Route path="/kosullar" element={<Terms />} />
        <Route path="/kvkk" element={<KVKK />} />
        <Route path="/iletisim" element={<Contact />} />
        <Route path="/yardim" element={<Help />} />
      </Routes>
    </AnimatePresence>
  );
}

export function App() {
  const { initializeTheme } = useTheme();
  const { user } = useAuth();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPWA, setIsPWA] = useState(false);
  const [isInstallPromptShown, setIsInstallPromptShown] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  
  useEffect(() => {
    // Uygulama başlangıç işlemleri
    const initApp = async () => {
      initializeTheme();
      setIsPWA(getDisplayMode() === 'standalone');
      
      // Network dinleyicileri
      const removeNetworkListener = listenForNetworkChanges(
        () => setIsOnline(true), 
        () => setIsOnline(false) 
      );
      // Install prompt dinleyicisi
      listenForInstallPrompt(); // Sadece çağrı yapılıyor, dönüş değeri kullanılmıyor

      // Cookie banner kontrolü
      const cookieConsent = localStorage.getItem('cookie_consent');
      if (!cookieConsent) {
        setShowCookieBanner(true);
      }
      
      setIsInitialLoading(false);

      // Temizleme fonksiyonu - Sadece network listener için
      return () => {
        if (typeof removeNetworkListener === 'function') removeNetworkListener();
        // removeInstallListener ile ilgili kısım kaldırıldı
      };
    };

    initApp();
  }, [initializeTheme]);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookie_consent', 'true');
    setShowCookieBanner(false);
  };

  if (isInitialLoading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="large" isAppLoading={true} /></div>;
  }

  return (
    <ThemeProvider>
      <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
        <PWAContext.Provider value={{ isOnline, isPWA, isInstallPromptShown, setIsInstallPromptShown }}>
          <AnimatedRoutes />
          {showCookieBanner && <CookieBanner />}
          <PWAInstallPrompt />
        </PWAContext.Provider>
      </LoadingContext.Provider>
    </ThemeProvider>
  );
}

export default App;