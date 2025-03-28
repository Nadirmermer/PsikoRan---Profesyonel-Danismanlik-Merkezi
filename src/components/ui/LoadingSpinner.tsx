import React, { useEffect } from 'react';
import { Logo } from '../Logo';
import { useTheme } from '../../lib/theme';

interface LoadingSpinnerProps {
  /**
   * Sadece veri yükleniyor yazısını göstermeyi kontrol eder
   */
  showLoadingText?: boolean;
  /**
   * Özel yükleniyor metni
   */
  loadingText?: string;
  /**
   * Logo boyutu: 'small', 'medium', 'large'
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Sayfa genelinde mi yoksa bir bileşen içinde mi gösterileceği
   */
  fullPage?: boolean;
  /**
   * Yükleme animasyonunun süresi (saniye)
   */
  duration?: number;
  /**
   * Uygulama ilk yüklenme anı için mi?
   */
  isAppLoading?: boolean;
}

/**
 * Dönen logo animasyonu ile loading bileşeni
 * Performans için optimize edilmiş, hem tam sayfa hem de bileşen içi kullanıma uygun
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  showLoadingText = true,
  loadingText = 'Veri yükleniyor...',
  size = 'medium',
  fullPage = false,
  duration = 3,
  isAppLoading = false
}) => {
  const { isDarkMode, initializeTheme } = useTheme();

  // Eğer uygulama ilk yüklenme ise temayı başlat
  useEffect(() => {
    if (isAppLoading) {
      initializeTheme();
    }
  }, [isAppLoading, initializeTheme]);

  // Performanslı CSS animasyonu için stil
  const spinnerStyle = {
    animation: `spin ${duration}s linear infinite`,
  };

  // CSS keyframes animasyonu için global stil ekleme
  useEffect(() => {
    if (!document.getElementById('spinner-keyframes')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'spinner-keyframes';
      styleSheet.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(styleSheet);
    }

    return () => {
      const styleSheet = document.getElementById('spinner-keyframes');
      if (styleSheet) {
        styleSheet.remove();
      }
    };
  }, []);

  // Tam sayfa loading için stil
  if (fullPage || isAppLoading) {
    return (
      <div 
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center ${
          isDarkMode ? 'bg-slate-900' : 'bg-slate-50'
        } select-none transition-colors duration-300`}
      >
        <div className="flex flex-col items-center justify-center">
          <div style={spinnerStyle} className="relative">
            <Logo size={size} showText={false} />
          </div>
          <p className="text-primary-600 dark:text-primary-400 font-bold mt-3 text-xl">PsikoRan</p>
          {showLoadingText && (
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{loadingText}</p>
          )}
        </div>
      </div>
    );
  }

  // Bileşen içi loading için stil (daha hafif)
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm z-10 rounded-lg">
      <div style={spinnerStyle} className="relative">
        <Logo size={size === 'large' ? 'medium' : 'small'} showText={false} />
      </div>
      <p className="text-primary-600 dark:text-primary-400 font-bold mt-3">PsikoRan</p>
      {showLoadingText && (
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{loadingText}</p>
      )}
    </div>
  );
}; 