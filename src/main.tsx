import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  </StrictMode>
);