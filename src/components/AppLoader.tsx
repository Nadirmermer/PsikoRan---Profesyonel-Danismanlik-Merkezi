import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../lib/theme';
import logo1 from '../assets/logos/logo_1.webp';
import { Logo } from './Logo';

export const AppLoader: React.FC = () => {
  const { isDarkMode, initializeTheme } = useTheme();

  useEffect(() => {
    // Her render sırasında temayı yeniden başlat
    initializeTheme();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center ${
        isDarkMode ? 'bg-slate-900' : 'bg-slate-50'
      } select-none transition-colors duration-300`}
    >
      <div className="flex flex-col items-center justify-center">
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
          <Logo size="large" showText={false} />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mt-6"
        >
          <h2 className="font-bold text-3xl text-primary-600 dark:text-primary-400 mb-3">
            PsikoRan
          </h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.5, 1, 0.5],
              transition: { 
                repeat: Infinity, 
                duration: 1.5 
              } 
            }}
            className="text-sm text-slate-600 dark:text-slate-400 font-medium tracking-wide"
          >
            Uygulama başlatılıyor...
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}; 
