import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

// Rotalara göre lazy loading ile yükle, ana uygulama daha küçük parçalara bölünsün
const App = lazy(() => import('./App').then(module => ({ 
  default: module.App 
})));

// Daha minimal yükleme göstergesi
const LoadingFallback = () => <div className="loading-spinner" />;

// Daha basit hata mesajı
const ErrorFallback = () => (
  <div className="error-container">
    <h2>Bir şeyler yanlış gitti</h2>
    <button onClick={() => window.location.reload()}>Sayfayı Yenile</button>
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