import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Ana uygulamayı lazy loading ile yükle
const App = lazy(() => import('./App').then(module => ({ default: module.App })));

// Router yapılandırması - future flags ile
const router = createBrowserRouter([
  {
    path: '*',
    element: <App />
  }
], {
  future: {
    v7_startTransition: true, // React Router v7 için transition desteği
    v7_relativeSplatPath: true // React Router v7 için splat path desteği
  }
});

// Hata mesajı için fallback komponent
const ErrorFallback = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  
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
      <HelmetProvider>
        <Suspense fallback={<LoadingSpinner size="medium" loadingText="Yükleniyor..." />}>
          <RouterProvider router={router} />
        </Suspense>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
);