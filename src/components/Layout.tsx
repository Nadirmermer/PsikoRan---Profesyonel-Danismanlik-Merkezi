import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import {
  Menu,
  Users,
  Calendar,
  ClipboardList,
  LogOut,
  CreditCard,
  Sun,
  Moon,
  UserSquare2,
  Home as HomeIcon,
  FileText,
  Settings,
  Bell,
  BookOpen,
  X,
  AlertTriangle,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './layout.css';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Doğru tema yönetimi:
    // 1. Kullanıcı tercihi kontrol et (app_theme)
    // 2. Eğer tercih yoksa veya "system" ise sistem temasını kontrol et
    const savedTheme = localStorage.getItem('app_theme');
    
    if (savedTheme === 'dark') {
      return true;
    }
    
    if (savedTheme === 'light') {
      return false;
    }
    
    // Sistem tercihini kontrol et 
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { signOut, professional, assistant } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  // Body scroll kilidini yönet
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSidebarOpen]);

  // Sidebar durum değişikliğini localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('sidebarOpen', isSidebarOpen.toString());
  }, [isSidebarOpen]);

  // Tema değişikliklerini takip et ve uygula
  useEffect(() => {
    // HTML elementine doğru class'ı ekle/çıkar
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Tema tercihini kaydet
    localStorage.setItem('app_theme', isDarkMode ? 'dark' : 'light');
    
    // Sistem tema değişimini dinle
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Sadece tema "system" olarak ayarlanmışsa değişiklik yap
      const currentTheme = localStorage.getItem('app_theme');
      if (!currentTheme || currentTheme === 'system') {
        setIsDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSignOut = async () => {
    setIsSignOutModalOpen(true);
  };

  const confirmSignOut = async () => {
    await signOut();
    setIsSignOutModalOpen(false);
    navigate('/login');
  };

  // Rol bazlı menü öğelerini tanımla
  let menuItems = [];
  
  if (professional) {
    menuItems = [
      { icon: HomeIcon, label: 'Ana Sayfa', path: '/dashboard' },
      { icon: UserSquare2, label: 'Danışanlarım', path: '/clients' },
      { icon: Calendar, label: 'Randevularım', path: '/appointments' },
      { icon: BookOpen, label: 'Blog Yönetimi', path: '/blog-admin' },
      { icon: Settings, label: 'Ayarlar', path: '/settings' },
    ];
  } else if (assistant) {
    menuItems = [
      { icon: HomeIcon, label: 'Ana Sayfa', path: '/dashboard' },
      { icon: Users, label: 'Ruh sağlığı uzmanları', path: '/professionals' },
      { icon: UserSquare2, label: 'Danışanlar', path: '/clients' },
      { icon: Calendar, label: 'Randevular', path: '/appointments' },
      { icon: CreditCard, label: 'Ödemeler', path: '/payments' },
      { icon: BookOpen, label: 'Blog Yönetimi', path: '/blog-admin' },
      { icon: Settings, label: 'Ayarlar', path: '/settings' },
    ];
  } else {
    // Varsayılan menü
    menuItems = [
      { icon: HomeIcon, label: 'Ana Sayfa', path: '/dashboard' },
      { icon: Settings, label: 'Ayarlar', path: '/settings' },
    ];
  }

  // Sidebar dışı tıklamaları dinle
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    }

    // ESC tuşuna basıldığında sidebar'ı kapat
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && isSidebarOpen) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-700">
      {/* Premium mobil header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 z-40 transition-all duration-500">
        <div className="h-full grid grid-cols-3 items-center px-4">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-gray-700 dark:text-gray-200 transition-colors duration-300" />
            </button>
          </div>

          <div className="flex justify-center items-center">
            <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent text-lg transform transition-all duration-500">
              PsikoRan
            </span>
          </div>

          <div className="flex justify-end">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label={isDarkMode ? 'Açık moda geç' : 'Koyu moda geç'}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-amber-500 transition-transform duration-500 rotate-0" />
              ) : (
                <Moon className="h-5 w-5 text-blue-600 transition-transform duration-500 rotate-180" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Premium overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 lg:hidden 
            transition-all duration-500 ease-out"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Premium sidebar */}
        <aside
          ref={sidebarRef}
          className={`
            fixed lg:static
            z-[60]
            will-change-transform
            transition-all duration-300 ease-out
            bg-white/90 dark:bg-gray-800/90
            backdrop-blur-xl
            border-r border-gray-200/50 dark:border-gray-700/50
            h-full
            shadow-lg dark:shadow-gray-900/30
            ${
              isSidebarOpen
                ? 'translate-x-0 w-[280px] lg:w-72'
                : '-translate-x-full w-[280px] lg:w-20 lg:translate-x-0'
            }
          `}
        >
          <div className="h-full flex flex-col">
            <div className="h-16 flex items-center justify-between px-5">
              <div className="flex items-center">
                <div className="flex items-center justify-center h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md shadow-blue-500/20 dark:shadow-blue-500/10 mr-2 overflow-hidden">
                  <Logo size="small" showText={false} />
                </div>
                <h1
                  className={`
                  font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent text-xl
                  will-change-transform will-change-opacity
                  transition-all duration-200 ease-out
                  ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 lg:hidden'}
                `}
                >
                  PsikoRan
                </h1>
              </div>
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className={`
                  p-2.5 rounded-lg bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200/80 dark:hover:bg-gray-600/80
                  transition-all duration-200 ease-out hover:scale-105 active:scale-95
                  ${!isSidebarOpen && 'lg:w-10 lg:h-10 lg:flex lg:justify-center lg:items-center'}
                `}
              >
                <Menu className={`h-5 w-5 text-gray-600 dark:text-gray-300 transition-transform duration-200 ease-out ${isSidebarOpen ? 'rotate-90' : 'rotate-0'}`} />
              </button>
            </div>
            
            <div className={`px-3 py-2 ${!isSidebarOpen && 'lg:px-2'}`}>
              <div className={`py-2 px-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 flex items-center ${!isSidebarOpen && 'lg:justify-center lg:px-0'}`}>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20 dark:shadow-blue-500/10">
                  <User className="h-4 w-4 text-white" />
                </div>
                {isSidebarOpen && (
                  <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {professional?.full_name || assistant?.full_name || 'Kullanıcı'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {professional ? 'Ruh Sağlığı Uzmanı' : assistant ? 'Asistan' : 'Misafir'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <nav className={`flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar ${!isSidebarOpen && 'lg:px-2'}`}>
              {menuItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`
                      w-full flex items-center px-4 py-3 rounded-xl
                      transition-all duration-200 ease-out
                      hover:scale-[1.02] active:scale-[0.98]
                      ${!isSidebarOpen && 'lg:justify-center lg:px-0 lg:py-3'}
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80'
                      }
                    `}
                  >
                    <div className={`
                      flex items-center justify-center 
                      h-9 w-9 rounded-lg 
                      ${isActive 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20 dark:shadow-blue-500/10' 
                        : 'bg-gray-100 dark:bg-gray-700/70'}
                      transition-colors duration-200
                    `}>
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                    </div>
                    {isSidebarOpen && (
                      <span className={`ml-3 will-change-transform will-change-opacity transition-all duration-200 ease-out text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Footer buttons with premium styling */}
            <div className={`p-4 space-y-2 border-t border-gray-200/50 dark:border-gray-700/50 ${!isSidebarOpen && 'lg:px-2'}`}>
              <button
                onClick={toggleDarkMode}
                className={`
                  w-full flex items-center px-4 py-3
                  text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 
                  rounded-xl transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]
                  ${!isSidebarOpen && 'lg:justify-center lg:px-0'}
                `}
              >
                <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  {isDarkMode ? (
                    <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Moon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                {isSidebarOpen && (
                  <span className="ml-3 will-change-transform will-change-opacity transition-all duration-200 ease-out text-sm font-medium">
                    {isDarkMode ? 'Açık Mod' : 'Koyu Mod'}
                  </span>
                )}
              </button>
              <button
                onClick={handleSignOut}
                className={`
                  w-full flex items-center px-4 py-3
                  text-gray-700 dark:text-gray-300 hover:bg-red-100/80 dark:hover:bg-red-900/30
                  hover:text-red-600 dark:hover:text-red-400
                  rounded-xl transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]
                  ${!isSidebarOpen && 'lg:justify-center lg:px-0'}
                `}
              >
                <div className="h-9 w-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                {isSidebarOpen && (
                  <span className="ml-3 will-change-transform will-change-opacity transition-all duration-200 ease-out text-sm font-medium">
                    Çıkış Yap
                  </span>
                )}
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto pt-20 lg:pt-8 px-4 lg:px-8 transition-all duration-500">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Çıkış Yapma Onay Modalı */}
      <AnimatePresence>
        {isSignOutModalOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center">
                  <span className="bg-red-100 dark:bg-red-900/30 rounded-full p-2 mr-3">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Çıkış Yap</h3>
                </div>
                <button 
                  onClick={() => setIsSignOutModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Oturumunuzu kapatmak istediğinize emin misiniz? Yeniden giriş yapmanız gerekecektir.
              </p>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button 
                  onClick={() => setIsSignOutModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-colors"
                >
                  Vazgeç
                </button>
                <button 
                  onClick={confirmSignOut}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                >
                  Çıkış Yap
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
