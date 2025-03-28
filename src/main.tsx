import { StrictMode, lazy, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import * as Sentry from "@sentry/react";
import ErrorBoundary from './components/ErrorBoundary';

// Web Vitals izleme
import { monitorPerformance } from './utils/webVitals';

// Sentry başlatma
Sentry.init({
  dsn: "https://4dd039233c46422603a8685f436ddbd8@o4509052632891392.ingest.de.sentry.io/4509052636430416",
  integrations: [],
  // Performance izlemesini etkinleştir
  tracesSampleRate: 1.0,
  // Session Replay özelliğini etkinleştir
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Performans izlemeyi başlat
monitorPerformance().catch(err => {
  console.error('Performans izleme başlatılamadı:', err);
});

// Ana uygulamayı lazy loading ile yükle
const App = lazy(() => import('./App').then(module => ({ default: module.App })));

// Yükleme göstergesi için basit komponent
const LoadingFallback = () => <div style={{ 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  height: '100vh',
  fontFamily: 'system-ui, sans-serif',
}}>Yükleniyor...</div>;

// Hata mesajı için fallback komponent
const ErrorFallback = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontFamily: 'system-ui, sans-serif',
    color: '#e53e3e',
    textAlign: 'center',
    padding: '2rem',
  }}>
    <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Üzgünüz, bir şeyler yanlış gitti</h2>
    <p style={{ marginBottom: '2rem', color: '#555' }}>Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
    <button 
      onClick={() => window.location.reload()}
      style={{
        backgroundColor: '#4f46e5',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        fontWeight: 'bold',
      }}
    >
      Sayfayı Yenile
    </button>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
);