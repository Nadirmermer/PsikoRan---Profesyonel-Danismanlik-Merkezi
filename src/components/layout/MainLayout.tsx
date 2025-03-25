import { useState, useEffect, ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useTheme } from '../../lib/theme';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  // Theme context'ten tema bilgilerini al
  const { theme, isDarkMode, setTheme, initializeTheme } = useTheme();
  const [localIsDarkMode, setLocalIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('app_theme');
      if (savedTheme === 'dark') return true;
      if (savedTheme === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Tema başlatma: sayfa yüklendiğinde tema tercihini uygula
  useEffect(() => {
    // Tema context'i başlat
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const currentTheme = localStorage.getItem('app_theme');
      if (!currentTheme || currentTheme === 'system') {
        setLocalIsDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    if (localIsDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [localIsDarkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !localIsDarkMode;
    setLocalIsDarkMode(newDarkMode);
    
    // Context'teki tema durumunu güncelle
    setTheme(newDarkMode ? 'dark' : 'light');
    
    // Local storage'ı güncelle
    localStorage.setItem('app_theme', newDarkMode ? 'dark' : 'light');
    
    // HTML elementine doğru class ekle/kaldır
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col transition-colors duration-300">
      <Header toggleDarkMode={toggleDarkMode} isDarkMode={localIsDarkMode} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
} 