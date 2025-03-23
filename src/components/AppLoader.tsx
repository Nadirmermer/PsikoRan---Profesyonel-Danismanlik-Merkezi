import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../lib/theme';
import logo2 from '../assets/logos/logo_2.png';

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
      className={`fixed inset-0 z-[9999] flex items-center justify-center ${
        isDarkMode ? 'bg-slate-900' : 'bg-slate-50'
      } select-none transition-colors duration-300`}
    >
      <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8 px-4">
        <div className="relative">
          <motion.div 
            className="flex items-center justify-center h-32 w-44 sm:h-40 sm:w-56"
            animate={{ 
              rotate: 360 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 6,
              ease: "linear"
            }}
          >
            <img 
              src={logo2} 
              alt="PsikoRan Logo" 
              className="h-full w-full object-contain"
            />
          </motion.div>
        </div>
        
        <div className="flex flex-col items-center space-y-3 sm:space-y-4 text-center">
          <div className="flex space-x-2">
            {[1, 2, 3].map((dot) => (
              <motion.div 
                key={dot}
                animate={{ 
                  y: [-5, 5, -5],
                  opacity: [0.6, 1, 0.6],
                  transition: { 
                    repeat: Infinity, 
                    duration: 1,
                    delay: dot * 0.2
                  } 
                }}
                className={`h-3 w-3 ${
                  isDarkMode ? 'bg-primary-400' : 'bg-primary-500'
                } rounded-full`}
              />
            ))}
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.5, 1, 0.5],
              transition: { 
                repeat: Infinity, 
                duration: 1.5 
              } 
            }}
            className={`text-xs sm:text-sm ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            } font-medium tracking-wide`}
          >
            Uygulama başlatılıyor...
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}; 
