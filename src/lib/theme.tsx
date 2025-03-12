import React, { createContext, useState, useContext, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDarkMode: boolean;
  initializeTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  isDarkMode: false,
  initializeTheme: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    // LocalStorage'dan tema tercihini al
    const savedTheme = localStorage.getItem('app_theme') as ThemeMode;
    return savedTheme || 'system';
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  const initializeTheme = () => {
    let finalIsDark = false;

    if (theme === 'system') {
      finalIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      finalIsDark = theme === 'dark';
    }

    // Tema değişikliğini hemen uygula
    setIsDarkMode(finalIsDark);
    document.documentElement.classList.toggle('dark', finalIsDark);
  };

  useEffect(() => {
    // Tema değişikliğini localStorage'a kaydet
    localStorage.setItem('app_theme', theme);

    // Tema uygulaması
    const applyTheme = () => {
      let finalIsDark = false;

      if (theme === 'system') {
        finalIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        finalIsDark = theme === 'dark';
      }

      setIsDarkMode(finalIsDark);
      document.documentElement.classList.toggle('dark', finalIsDark);
    };

    // Tema değişimini hemen uygula
    applyTheme();

    // Sistem tema değişimini dinle
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        setIsDarkMode(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const contextValue = {
    theme,
    setTheme: (newTheme: ThemeMode) => {
      setTheme(newTheme);
    },
    isDarkMode,
    initializeTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook oluştur
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 