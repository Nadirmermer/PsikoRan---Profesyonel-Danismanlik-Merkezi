import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useTheme } from '../lib/theme';

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
          <div className={`h-20 w-20 sm:h-24 sm:w-24 flex items-center justify-center rounded-lg ${
            isDarkMode ? 'bg-primary-500' : 'bg-primary-600'
          } shadow-xl`}>
            <motion.div 
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1],
                transition: { 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "easeInOut"
                } 
              }}
              className={`h-4 w-4 ${
                isDarkMode ? 'bg-primary-400' : 'bg-primary-500'
              } rounded-full`}
            />
          </div>
        </div>
        
        <div className="flex flex-col items-center space-y-3 sm:space-y-4 text-center">
          <h2 className={`text-3xl sm:text-4xl font-bold ${
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}>
            PsiRan
          </h2>
          
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
