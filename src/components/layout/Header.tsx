import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, Sun, Moon, Menu, X, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import logo1 from '../../assets/base-logo.webp';

interface HeaderProps {
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

export function Header({ toggleDarkMode, isDarkMode }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-slate-900 sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 backdrop-blur-md transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo Bölümü */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 p-0.5 shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-xl bg-white dark:bg-slate-900 p-1">
                  <img src={logo1} alt="PsikoRan Logo" className="h-full w-full object-contain" />
                </div>
              </motion.div>
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 group-hover:from-primary-600 group-hover:to-primary-500 dark:group-hover:from-primary-400 dark:group-hover:to-primary-300 transition-all duration-300"
              >
                PsikoRan
              </motion.span>
            </Link>
          </div>
          
          {/* Masaüstü Menü */}
          <div className="hidden md:flex items-center space-x-4">
            <nav className="flex items-center space-x-1">
              <Link 
                to="/features" 
                className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-sm"
              >
                Özellikler
              </Link>
              <Link 
                to="/pricing" 
                className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-sm"
              >
                Fiyatlandırma
              </Link>
              <Link 
                to="/blog" 
                className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-sm"
              >
                Blog
              </Link>
              <Link 
                to="/contact" 
                className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-sm"
              >
                İletişim
              </Link>
            </nav>
            
            <div className="flex items-center pl-4 border-l border-slate-200 dark:border-slate-700">
              {/* Tema değiştirme butonu */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 mx-1"
                aria-label={isDarkMode ? 'Açık moda geç' : 'Koyu moda geç'}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-primary-600" />
                )}
              </button>

              <Link
                to="/login"
                className="px-3 py-2 rounded-lg text-primary-600 dark:text-primary-400 font-medium transition-colors bg-slate-100/70 dark:bg-slate-800/70 flex items-center space-x-1.5 text-sm mx-1"
              >
                <LogIn className="h-4 w-4" />
                <span>Giriş</span>
              </Link>
                
              <Link
                to="/register"
                className="px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium transition-all duration-200 flex items-center space-x-1.5 text-sm mx-1"
              >
                <span>Kayıt Ol</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          
          {/* Mobil Menü Butonları */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 mr-2"
              aria-label={isDarkMode ? 'Açık moda geç' : 'Koyu moda geç'}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 text-primary-600" />
              )}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
              aria-label="Menüyü aç/kapat"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobil Menü */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden py-2 border-t border-slate-200 dark:border-slate-800"
          >
            <nav className="flex flex-col space-y-1 py-3">
              <Link 
                to="/features" 
                className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Özellikler
              </Link>
              <Link 
                to="/pricing" 
                className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Fiyatlandırma
              </Link>
              <Link 
                to="/blog" 
                className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                to="/contact" 
                className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                İletişim
              </Link>
            </nav>
            
            <div className="flex flex-col space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <Link
                to="/login"
                className="px-4 py-2 text-primary-600 dark:text-primary-400 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors duration-200 font-medium flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn className="h-5 w-5 mr-2" />
                <span>Giriş Yap</span>
              </Link>
              <Link
                to="/register"
                className="mx-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Kayıt Ol</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
} 