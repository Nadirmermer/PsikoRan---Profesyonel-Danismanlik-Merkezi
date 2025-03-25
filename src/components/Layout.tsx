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
} from 'lucide-react';

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
    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      await signOut();
      navigate('/login');
    }
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
            transition-[width,transform] duration-200 ease-out
            bg-white/80 dark:bg-gray-800/80
            backdrop-blur-xl
            border-r border-gray-200/50 dark:border-gray-700/50
            h-full
            shadow-[0_0_30px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_0_30px_-15px_rgba(0,0,0,0.5)]
            ${
              isSidebarOpen
                ? 'translate-x-0 w-[280px] lg:w-64'
                : '-translate-x-full w-[280px] lg:w-20 lg:translate-x-0'
            }
          `}
        >
          <div className="h-full flex flex-col">
            <div className="h-16 flex items-center justify-between px-4">
              <h1
                className={`
                font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent
                will-change-transform will-change-opacity
                transition-[opacity,transform] duration-150 ease-out
                ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 lg:hidden'}
              `}
              >
                PsikoRan
              </h1>
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className={`
                  p-2.5 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 
                  transition-all duration-150 ease-out hover:scale-105 active:scale-95
                  ${!isSidebarOpen && 'lg:w-full lg:flex lg:justify-center'}
                `}
              >
                <Menu className={`h-5 w-5 text-gray-600 dark:text-gray-300 transition-transform duration-150 ease-out ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>
            </div>

            <nav className={`flex-1 px-2 py-4 space-y-2 ${!isSidebarOpen && 'lg:px-1'}`}>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`
                      w-full flex items-center px-4 py-2.5 rounded-xl
                      transition-all duration-150 ease-out
                      hover:scale-[1.02] active:scale-[0.98]
                      ${!isSidebarOpen && 'lg:justify-center lg:px-0'}
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/10 dark:to-purple-400/10 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80'
                      }
                    `}
                  >
                    <item.icon className={`h-5 w-5 transition-transform duration-150 ease-out ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                    {isSidebarOpen && (
                      <span className={`ml-3 will-change-transform will-change-opacity transition-[opacity,transform] duration-150 ease-out ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Footer buttons with premium styling */}
            <div className={`p-4 border-t border-gray-200/50 dark:border-gray-700/50 ${!isSidebarOpen && 'lg:px-1'}`}>
              <button
                onClick={toggleDarkMode}
                className={`
                  hidden lg:flex w-full items-center px-4 py-2.5 
                  text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 
                  rounded-xl transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]
                  ${!isSidebarOpen && 'lg:justify-center lg:px-0'}
                `}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-blue-600" />
                )}
                {isSidebarOpen && (
                  <span className="ml-3 will-change-transform will-change-opacity transition-opacity duration-150 ease-out">
                    {isDarkMode ? 'Açık Mod' : 'Koyu Mod'}
                  </span>
                )}
              </button>
              <button
                onClick={handleSignOut}
                className={`
                  w-full flex items-center px-4 py-2.5 mt-2 
                  text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 
                  rounded-xl transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]
                  ${!isSidebarOpen && 'lg:justify-center lg:px-0'}
                `}
              >
                <LogOut className="h-5 w-5" />
                {isSidebarOpen && <span className="ml-3 will-change-transform will-change-opacity transition-opacity duration-150 ease-out">Çıkış Yap</span>}
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto pt-20 lg:pt-8 px-4 lg:px-8 transition-all duration-500">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
