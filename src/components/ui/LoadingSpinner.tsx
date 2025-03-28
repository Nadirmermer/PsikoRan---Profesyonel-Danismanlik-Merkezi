import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from '../Logo';

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
}

/**
 * Dönen logo animasyonu ile loading bileşeni
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  showLoadingText = true,
  loadingText = 'Veri yükleniyor...',
  size = 'medium',
  fullPage = false
}) => {
  // Tam sayfa loading için stil
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-900 z-[9999]">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ 
              rotate: 360
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3,
              ease: "linear"
            }}
            className="relative"
          >
            <Logo size={size} showText={false} />
          </motion.div>
          <p className="text-primary-600 dark:text-primary-400 font-bold mt-3 text-xl">PsikoRan</p>
          {showLoadingText && (
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{loadingText}</p>
          )}
        </div>
      </div>
    );
  }

  // Bileşen içi loading için stil
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm z-10 rounded-lg">
      <motion.div
        animate={{ 
          rotate: 360
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 3,
          ease: "linear"
        }}
        className="relative"
      >
        <Logo size={size === 'large' ? 'medium' : 'small'} showText={false} />
      </motion.div>
      <p className="text-primary-600 dark:text-primary-400 font-bold mt-3">PsikoRan</p>
      {showLoadingText && (
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{loadingText}</p>
      )}
    </div>
  );
}; 