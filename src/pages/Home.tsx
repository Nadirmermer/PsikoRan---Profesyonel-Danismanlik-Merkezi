import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Calendar, Clipboard, Users, Clock, MessageSquare, BarChart, Award, Sun, Moon, LogIn, ArrowRight, Menu, X, ChevronRight, User, Heart, BrainCircuit, Sparkles, Wand2 } from 'lucide-react';
import logo2 from '../assets/logo/logo_2.png';
import { motion } from 'framer-motion';
import { fetchBlogPosts, formatBlogDate } from '../lib/blog';

// Blog yazısı tipi tanımı
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  published_at: string;
  category: string;
  tags: string[];
  slug: string;
  reading_time: number;
}

// İsmi URL-dostu formata dönüştür
const slugifyName = (name: string): string => {
  return name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[üÜ]/g, 'u')
    .replace(/[çÇ]/g, 'c')
    .replace(/[şŞ]/g, 's')
    .replace(/[ıİ]/g, 'i')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[öÖ]/g, 'o')
    .replace(/[^a-z0-9-]/g, '');
};

export function Home() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      // localStorage'dan tema tercihini al
      const savedTheme = localStorage.getItem('app_theme');
      
      if (savedTheme === 'dark') {
        return true;
      }
      
      if (savedTheme === 'light') {
        return false;
      }
      
      // Sistem tercihini kontrol et
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingBlogPosts, setLoadingBlogPosts] = useState(true);
    
    // Blog yazılarını getir
  useEffect(() => {
    document.title = "PsikoRan - Profesyonel Danışmanlık Merkezi";
    
    // Blog yazılarını getir
    async function loadBlogPosts() {
      try {
        setLoadingBlogPosts(true);
        const posts = await fetchBlogPosts();
        // Sadece ilk 3 blog yazısını kullan
        setBlogPosts(posts.slice(0, 3));
      } catch (err) {
        console.error('Blog yazıları yüklenirken hata oluştu:', err);
      } finally {
        setLoadingBlogPosts(false);
      }
    }
    
    loadBlogPosts();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const currentTheme = localStorage.getItem('app_theme');
      if (!currentTheme || currentTheme === 'system') {
        setIsDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('app_theme', !isDarkMode ? 'dark' : 'light');
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Navigasyon - Modern Tasarım */}
      <nav className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 md:h-20 items-center">
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-3 group">
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.5 }}
                  className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 p-0.5 shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300"
              >
                  <div className="absolute inset-0 rounded-xl bg-white dark:bg-slate-900 p-1">
                    <img src={logo2} alt="PsikoRan Logo" className="h-full w-full object-contain" />
                  </div>
              </motion.div>
              <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                  className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 group-hover:from-primary-600 group-hover:to-primary-500 dark:group-hover:from-primary-400 dark:group-hover:to-primary-300 transition-all duration-300"
              >
                PsikoRan
              </motion.span>
              </Link>
            </div>
            
            {/* Masaüstü Menü */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-1">
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
              </div>
              
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-700">
              {/* Tema değiştirme butonu */}
              <button
                onClick={toggleDarkMode}
                  className="p-2.5 rounded-lg bg-white dark:bg-slate-800 shadow-md hover:shadow-lg group border border-slate-200 dark:border-slate-700 transition-all duration-300"
                  aria-label={isDarkMode ? 'Açık moda geç' : 'Koyu moda geç'}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-amber-500 group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                  <Moon className="h-5 w-5 text-primary-600 group-hover:rotate-90 transition-transform duration-300" />
                )}
              </button>

              <Link
                to="/login"
                  className="px-4 py-2 rounded-lg text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/70 flex items-center space-x-1.5 text-sm"
              >
                  <LogIn className="h-4 w-4" />
                <span>Giriş Yap</span>
              </Link>
                
              <Link
                to="/create-assistant"
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium transition-all duration-300 flex items-center space-x-1.5 shadow-md hover:shadow-lg hover:shadow-primary-600/20 text-sm"
              >
                <span>Asistan Hesabı</span>
                  <ArrowRight className="h-4 w-4" />
              </Link>
              </div>
            </div>
            
            {/* Mobil Menü Butonları */}
            <div className="flex items-center space-x-3 md:hidden">
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-800 shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300"
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
                className="p-2.5 rounded-lg bg-white dark:bg-slate-800 shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300"
                aria-label="Menüyü aç/kapat"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                ) : (
                  <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobil Menü - Slide Down Animasyonu */}
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden py-3 border-t border-slate-200 dark:border-slate-700"
            >
              <div className="space-y-1.5 py-3">
                <Link 
                  to="/features" 
                  className="block px-4 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Özellikler
                </Link>
                <Link 
                  to="/pricing" 
                  className="block px-4 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Fiyatlandırma
                </Link>
                <Link 
                  to="/blog" 
                  className="block px-4 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link 
                  to="/contact" 
                  className="block px-4 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  İletişim
                </Link>
              </div>
              <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700 mt-2">
                <Link
                  to="/login"
                  className="block px-4 py-2.5 rounded-lg text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium flex items-center space-x-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="h-5 w-5" />
                  <span>Giriş Yap</span>
                </Link>
                <Link
                  to="/create-assistant"
                  className="block px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium flex items-center space-x-2 transition-colors mx-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Asistan Hesabı</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section - Tamamen Yenilendi */}
      <section className="relative overflow-hidden pt-16 pb-24 md:py-24 lg:py-32">
        {/* Arka Plan Efektleri */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(45%_40%_at_50%_40%,rgba(120,119,198,0.1),transparent)]"></div>
          {/* Hareketli Arkaplan Şekilleri */}
          <motion.div 
            className="absolute right-0 top-20 w-96 h-96 rounded-full opacity-20 bg-primary-400 dark:bg-primary-600 blur-3xl"
            animate={{ 
              x: [50, -20, 50],
              y: [20, 80, 20],
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15]
            }}
            transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute -left-20 bottom-0 w-80 h-80 rounded-full opacity-20 bg-indigo-400 dark:bg-indigo-600 blur-3xl"
            animate={{ 
              x: [-20, 30, -20],
              y: [20, -30, 20],
              scale: [1, 1.1, 1],
              opacity: [0.15, 0.2, 0.15]
            }}
            transition={{ repeat: Infinity, duration: 18, ease: "easeInOut", delay: 2 }}
          />
          <motion.div 
            className="absolute left-1/4 top-1/3 w-64 h-64 rounded-full opacity-10 bg-teal-400 dark:bg-teal-600 blur-3xl"
            animate={{ 
              x: [0, 40, 0],
              y: [0, -40, 0],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ repeat: Infinity, duration: 12, ease: "easeInOut", delay: 1 }}
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Sol Taraf - İçerik */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-100/70 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800/50 backdrop-blur-sm mb-6"
              >
                <Sparkles className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Ruh Sağlığı Profesyonelleri İçin</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 leading-tight tracking-tight"
              >
                Danışma Süreçlerinizi <span className="relative whitespace-nowrap text-primary-600 dark:text-primary-400">
                  <svg aria-hidden="true" viewBox="0 0 418 42" className="absolute left-0 top-full h-[.58em] w-full fill-primary-400/30 dark:fill-primary-500/30" preserveAspectRatio="none"><path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z"></path></svg>
                  <span className="relative">Dijitalleştirin</span>
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0"
              >
                PsikoRan ile danışanlarınıza daha iyi hizmet verin, randevularınızı yönetin, notlarınızı organize edin ve ruh sağlığı uygulamalarınızı tek platformda entegre edin.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link
                  to="/create-assistant"
                  className="px-7 py-3.5 rounded-full bg-primary-600 text-white font-medium text-center shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 hover:bg-primary-700 transition-all duration-300 flex items-center justify-center group"
                >
                  <span>Ücretsiz Başlayın</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 1 }}
                  >
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </motion.div>
                </Link>
                <Link
                  to="/demo"
                  className="px-7 py-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-medium text-center shadow-lg shadow-slate-300/10 dark:shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-300/20 dark:hover:shadow-slate-900/30 transition-all duration-300 flex items-center justify-center"
                >
                  <span>Ürün Demosu</span>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 }}
                className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-center lg:justify-start gap-6">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Profesyonellerin tercihi:</span>
                  <div className="flex -space-x-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-medium bg-${['indigo', 'blue', 'teal', 'green', 'amber'][i]}-100 dark:bg-${['indigo', 'blue', 'teal', 'green', 'amber'][i]}-900/30 text-${['indigo', 'blue', 'teal', 'green', 'amber'][i]}-600 dark:text-${['indigo', 'blue', 'teal', 'green', 'amber'][i]}-400`}
                      >
                        {['P', 'S', 'K', 'T', 'R'][i]}
            </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="text-primary-600 dark:text-primary-400 font-bold">1000+</span>
                    <span className="text-slate-500 dark:text-slate-400 ml-1">aktif kullanıcı</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Sağ Taraf - Görsel ve İnteraktif Öğeler */}
            <div className="relative lg:ml-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="relative"
              >
                {/* Ana 3D Görsel Bileşen */}
                <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  {/* Üst Kısım - Dashboard Önizleme */}
                  <div className="p-4 lg:p-5 backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                          <BrainCircuit className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                        <div>
                          <div className="text-lg font-bold text-slate-900 dark:text-white">PsikoRan Dashboard</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Pazartesi, 12 Mart 2025</div>
                </div>
                      </div>
                      <div className="flex space-x-1">
                        {["bg-red-500", "bg-amber-500", "bg-green-500"].map((color, i) => (
                          <div key={i} className={`h-3 w-3 rounded-full ${color}`}></div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-5">
                      {[
                        { label: "Bugünkü Randevular", value: "6", icon: <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />, color: "bg-indigo-100 dark:bg-indigo-900/30" },
                        { label: "Toplam Danışan", value: "48", icon: <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />, color: "bg-blue-100 dark:bg-blue-900/30" },
                        { label: "Yeni Mesajlar", value: "12", icon: <MessageSquare className="h-5 w-5 text-teal-600 dark:text-teal-400" />, color: "bg-teal-100 dark:bg-teal-900/30" },
                      ].map((item, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-3 border border-slate-200 dark:border-slate-700">
                          <div className="flex justify-between items-center">
                            <div className={`h-8 w-8 rounded-lg ${item.color} flex items-center justify-center`}>
                              {item.icon}
                            </div>
                            <div className="text-xl font-bold text-slate-900 dark:text-white">{item.value}</div>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.label}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="relative h-36 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 p-4 overflow-hidden">
                      <div className="absolute inset-0 bg-pattern-dots opacity-10"></div>
                      <div className="relative z-10">
                        <div className="text-sm font-medium text-white opacity-80">Günün Hatırlatması</div>
                        <div className="text-lg font-bold text-white mt-1">Danışanlarınızla İlgili Notları Tamamlayın</div>
                        <div className="mt-3 flex">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/20 text-xs font-medium text-white">
                    <motion.div 
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="mr-1"
                            >
                              <Wand2 className="h-3 w-3" />
                    </motion.div>
                            AI Yardımcı
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Alt Kısım - İlerleme Göstergeleri */}
                  <div className="p-4 lg:p-5">
                    <div className="text-sm font-medium text-slate-900 dark:text-white mb-4">Haftalık İlerleme</div>
                    <div className="space-y-4">
                      {[
                        { label: "Tamamlanan Randevular", value: "85%", color: "bg-teal-500" },
                        { label: "Not Dökümantasyonu", value: "67%", color: "bg-amber-500" },
                        { label: "Danışan Memnuniyeti", value: "92%", color: "bg-green-500" },
                      ].map((item, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-center mb-1">
                            <div className="text-xs text-slate-600 dark:text-slate-400">{item.label}</div>
                            <div className="text-xs font-medium text-slate-800 dark:text-slate-300">{item.value}</div>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <motion.div 
                              initial={{ width: "0%" }}
                              animate={{ width: item.value }}
                              transition={{ duration: 1, delay: 0.5 + (i * 0.2) }}
                              className={`h-full ${item.color}`}
                            ></motion.div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Yüzen Bildirim Kartları */}
                <motion.div
                  initial={{ opacity: 0, x: 30, y: -20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.7, delay: 1 }}
                  className="absolute -top-5 -right-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3 w-64"
                >
                  <div className="flex items-start">
                    <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center mr-3 flex-shrink-0">
                      <Heart className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">Yeni Danışan Randevusu</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Ahmet B. ile görüşmeniz 15 dk sonra başlayacak</div>
                  </div>
                </div>
              </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -30, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.7, delay: 1.3 }}
                  className="absolute -bottom-5 -left-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3 w-64"
                >
                  <div className="flex items-start">
                    <div className="h-9 w-9 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center mr-3 flex-shrink-0">
                      <Award className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">Danışman İlerlemesi</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Bu hafta 12 danışan görüşmesi tamamladınız</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section - Hero'dan hemen sonra */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Blog
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Psikolojik danışmanlık ve klinik yönetimi hakkında en güncel ve faydalı bilgileri paylaşıyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {blogPosts.map((post) => (
                <motion.div 
                  key={post.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 group hover:shadow-xl transition-all duration-300"
              >
                <Link to={`/blog/${post.slug}`} className="block h-48 overflow-hidden">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    crossOrigin="anonymous"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/images/blog-placeholder.jpg';
                      // Eğer yerel görsel de yüklenmezse logo_2.png'yi kullan
                      target.onerror = () => {
                        target.src = '/assets/images/logo_2.png';
                        target.onerror = null;
                      };
                    }}
                  />
                </Link>
                <div className="p-6">
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
                    <span className="px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium mr-2">{post.category}</span>
                    <span className="flex items-center text-slate-400 dark:text-slate-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatBlogDate(post.published_at)}
                    </span>
                  </div>
                  
                  <Link to={`/blog/${post.slug}`}>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                      <User className="h-4 w-4 mr-1.5" />
                      {post.author}
                    </div>
                    
                    <Link
                      to={`/blog/${post.slug}`}
                      className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium group"
                    >
                      <span>Devamını Oku</span>
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
              </div>

          <div className="text-center">
            <Link
              to="/blog"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Tüm Yazıları Görüntüle
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Özellikler - Tamamen Yenilendi */}
      <section className="py-24 bg-slate-50/70 dark:bg-slate-800/30 relative overflow-hidden backdrop-blur-sm">
        {/* Arka Plan Efekti */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-100 dark:bg-primary-900/20 blur-3xl opacity-70 dark:opacity-30"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-100 dark:bg-indigo-900/20 blur-3xl opacity-70 dark:opacity-30"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center justify-center mb-4"
            >
              <span className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-sm font-medium border border-primary-200 dark:border-primary-800/50">
                Ruh Sağlığı Profesyonelleri İçin
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight"
            >
              Çalışma Şeklinizi <span className="text-primary-600 dark:text-primary-400">Dönüştüren</span> Özellikler
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-4 text-lg text-slate-600 dark:text-slate-400"
            >
              Danışan yönetiminden randevu planlamaya, terapi notlarından ödeme takibine kadar ihtiyacınız olan her şey tek bir platformda.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: <Calendar className="h-6 w-6 text-white" />, 
                color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
                title: 'Akıllı Randevu Yönetimi', 
                description: 'AI destekli randevu planlama, zaman çakışmalarını önleme ve danışanlarınıza otomatik hatırlatmalar gönderme.',
                features: ['Online/Yüz yüze senkronizasyon', 'Video görüşme entegrasyonu', 'Otomatik hatırlatmalar']
              },
              { 
                icon: <Users className="h-6 w-6 text-white" />, 
                color: "bg-gradient-to-br from-blue-500 to-blue-600",
                title: 'Danışan Portali', 
                description: 'Danışanlarınıza özel erişim sağlayarak formları doldurma, randevu planlama ve iletişim kurma imkanı sunun.',
                features: ['Kişiselleştirilmiş erişim', 'Güvenli dosya paylaşımı', 'İlerleme takibi']
              },
              { 
                icon: <BrainCircuit className="h-6 w-6 text-white" />, 
                color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
                title: 'Terapi Asistanı AI', 
                description: 'Yapay zeka destekli not alma, analiz ve öneriler ile daha verimli terapi seansları gerçekleştirin.',
                features: ['Ses tanıma ile not tutma', 'Duygu analizi', 'Özelleştirilebilir öneri sistemleri']
              },
              { 
                icon: <Clock className="h-6 w-6 text-white" />, 
                color: "bg-gradient-to-br from-teal-500 to-teal-600",
                title: 'Erişilebilir Destek Sistemleri', 
                description: 'Danışanlarınıza 7/24 destek sağlayan ölçeklenebilir kaynak ve araçlara erişim imkanı sunun.',
                features: ['Kişiselleştirilmiş kaynaklar', 'Etkileşimli egzersizler', 'İlerleme ölçümleri']
              },
              { 
                icon: <MessageSquare className="h-6 w-6 text-white" />, 
                color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
                title: 'Güvenli İletişim Platformu', 
                description: 'KVKK ve GDPR uyumlu, uçtan uca şifreli güvenli mesajlaşma ve dosya paylaşım platformu.',
                features: ['Uçtan uca şifreleme', 'Dosya paylaşımı', 'Grup mesajlaşma']
              },
              { 
                icon: <BarChart className="h-6 w-6 text-white" />, 
                color: "bg-gradient-to-br from-green-500 to-green-600",
                title: 'Gelişmiş Analitik Paneller', 
                description: 'Danışanlarınızın ilerlemesini ve işletmenizin performansını görselleştiren özelleştirilebilir raporlar.',
                features: ['İnteraktif grafikler', 'Trend analizleri', 'Özelleştirilebilir raporlar']
              },
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 group relative"
              >
                {/* Üst Görsel Kısmı */}
                <div className={`p-6 ${feature.color}`}>
                  <div className="absolute top-0 right-0 p-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {feature.icon}
                </div>
                  </div>
                  <div className="h-12"></div>
                </div>
                
                {/* İçerik Kısmı */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-2 mb-4">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                        <div className="h-5 w-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-2 flex-shrink-0">
                          <svg className="h-3 w-3 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to="/feature-details"
                    className="inline-flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 group"
                  >
                    <span>Daha Fazla Bilgi</span>
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link
              to="/features"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium transition-all duration-300 hover:shadow-xl group"
            >
              <span>Tüm Özellikleri Keşfedin</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Modern Tasarım */}
      <section className="py-20 relative overflow-hidden">
        {/* Arka Plan Efektleri */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-indigo-50/50 dark:from-primary-950/20 dark:to-indigo-950/20"></div>
          
          {/* Morfik Şekiller */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              className="absolute -right-40 -top-40 w-96 h-96 rounded-full bg-primary-300/20 dark:bg-primary-700/10 blur-3xl"
              animate={{ 
                x: [0, 20, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute -left-20 top-1/2 w-72 h-72 rounded-full bg-indigo-300/30 dark:bg-indigo-700/10 blur-3xl"
              animate={{ 
                x: [0, -20, 0],
                y: [0, 20, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{ repeat: Infinity, duration: 12, ease: "easeInOut", delay: 2 }}
            />
            <motion.div 
              className="absolute -bottom-40 left-1/3 w-80 h-80 rounded-full bg-blue-300/20 dark:bg-blue-700/10 blur-3xl"
              animate={{ 
                x: [0, 30, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ repeat: Infinity, duration: 18, ease: "easeInOut", delay: 1 }}
            />
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* CTA İçerik */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
              className="w-full lg:w-3/5 text-center lg:text-left"
            >
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-sm font-medium border border-primary-200 dark:border-primary-800/50 mb-6">
                <Sparkles className="h-4 w-4 mr-2" />
                <span>Özel Teklif</span>
              </span>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                Profesyonel <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">danışmanlık süreçlerinizi</span> dönüştürmeye hazır mısınız?
              </h2>
              
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0">
                Bugün ücretsiz hesap oluşturun, PsikoRan'ın sunduğu avantajlarla işinizi büyütün ve danışanlarınıza daha iyi hizmet verin.
              </p>
              
              <div className="mt-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4 lg:justify-start sm:justify-center">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-primary-600 text-white font-medium shadow-lg shadow-primary-600/30 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/40 transition-all duration-300 text-center"
                >
                  <span>Hemen Ücretsiz Deneyin</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                
                <button 
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium border border-slate-300 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 text-center"
                  onClick={() => {
                    // Scroll to contact form or open a modal
                    document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>Bize Ulaşın</span>
                </button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700/50">
                <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                  <div className="flex items-center gap-1">
                    {Array(5).fill(0).map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                    ))}
              </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium text-slate-900 dark:text-white">4.9/5</span> ortalama puan, <span className="font-medium text-slate-900 dark:text-white">1000+</span> kullanıcı değerlendirmesi
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Tanıtım Kartları */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-full lg:w-2/5"
            >
              <div className="relative">
                {/* Ana Kart */}
                <div className="rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">PsikoRan Pro</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                        Popüler
                      </span>
                    </div>
                    
                    <div className="flex items-baseline mb-2">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">₺349</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">/ay</span>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Profesyoneller için tam kapasiteli platform
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <ul className="space-y-3">
                      {[
                        "Sınırsız danışan kaydı",
                        "Gelişmiş takvim entegrasyonu",
                        "AI destekli not alma asistanı",
                        "Özelleştirilmiş raporlar ve analizler",
                        "Online ödeme entegrasyonu",
                        "7/24 öncelikli destek"
                      ].map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <div className="h-5 w-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                            <svg className="h-3 w-3 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 text-sm">{feature}</span>
                    </li>
                      ))}
                  </ul>
                    
                    <div className="mt-6">
                      <Link
                        to="/register?plan=pro"
                        className="w-full flex items-center justify-center px-6 py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors text-center"
                      >
                        Ücretsiz 30 Gün Dene
                      </Link>
                      
                      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-3">
                        30 gün ücretsiz deneme, kredi kartı gerekmez, istediğiniz zaman iptal.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Arka Plan Dekoratif Kart */}
                <div className="absolute -bottom-3 -right-3 w-full h-full bg-primary-200/50 dark:bg-primary-900/20 rounded-2xl -z-10 blur-[1px]"></div>
                
                {/* Dekoratif Rozet */}
                <div className="absolute -top-5 -right-5 transform rotate-12">
                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg transform -rotate-12">
                    %30 İndirim
                </div>
              </div>
            </div>
          </motion.div>
          </div>
        </div>
      </section>
      
      {/* İstatistikler - Modern Tasarım */}
      <section className="py-24 bg-slate-50/80 dark:bg-slate-800/50 relative overflow-hidden">
        {/* Arka Plan Efektleri */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_50%_50%,rgba(120,119,198,0.05),transparent)] dark:bg-[radial-gradient(40%_40%_at_50%_50%,rgba(120,119,198,0.1),transparent)]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-10 sm:mt-16 max-w-3xl mx-auto text-center"
          >
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
              PsikoRan, psikologlar ve danışman asistanlarının iş süreçlerini kolaylaştırmak için tasarlanmış kullanıcı dostu bir platformdur. Her gün yüzlerce profesyonel, PsikoRan'ı tercih ediyor.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-4 sm:gap-8 text-center">
            {[
              { number: "1000+", label: "Aktif Kullanıcı" },
              { number: "50.000+", label: "Yönetilen Randevu" },
              { number: "10.000+", label: "Tamamlanan Test" },
              { number: "99.9%", label: "Hizmet Sürekliliği" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-700 rounded-xl"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-1 sm:mb-2">{stat.number}</div>
                <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-12">
            {/* Logo ve Hakkında */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="h-10 w-10 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 p-0.5">
                  <div className="h-full w-full rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-1">
                  <img 
                    src={logo2} 
                    alt="PsikoRan Logo" 
                    className="w-full h-full object-contain"
                  />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  PsikoRan
                </h2>
              </Link>
              
              <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm">
                Profesyonel danışmanlık süreçlerinizi dijitalleştiren, randevu yönetimi, danışan takibi ve gelişmiş AI araçları sunan modern platform.
              </p>
              
              <div className="mt-6 flex space-x-4">
                <motion.a 
                  href="https://twitter.com/psikoran" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:text-slate-400 dark:hover:text-primary-400 dark:hover:bg-slate-700 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Twitter'da takip et"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </motion.a>
                <motion.a 
                  href="https://www.facebook.com/people/PsikoRan/61574169219677/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:text-slate-400 dark:hover:text-primary-400 dark:hover:bg-slate-700 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Facebook'ta takip et"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </motion.a>
                <motion.a 
                  href="https://instagram.com/psikoran" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:text-slate-400 dark:hover:text-primary-400 dark:hover:bg-slate-700 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Instagram'da takip et"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </motion.a>
                <motion.a 
                  href="https://www.linkedin.com/company/psikoran" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:text-slate-400 dark:hover:text-primary-400 dark:hover:bg-slate-700 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="LinkedIn'de takip et"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </motion.a>
              </div>
            </div>
            
            {/* Footer Menü Sütunları */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* Hızlı Bağlantılar */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Hızlı Bağlantılar
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/features" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Özellikler
                    </Link>
                  </li>
                  <li>
                    <Link to="/pricing" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Fiyatlandırma
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Giriş Yap
                    </Link>
                  </li>
                  <li>
                    <Link to="/create-assistant" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Asistan Hesabı Oluştur
                    </Link>
                  </li>
                  <li>
                    <Link to="/forgot-password" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Şifremi Unuttum
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Yasal Bilgiler */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Yasal Bilgiler
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/privacy" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Gizlilik Politikası
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Kullanım Şartları
                    </Link>
                  </li>
                  <li>
                    <Link to="/kvkk" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      KVKK
                    </Link>
                  </li>
                  <li>
                    <Link to="/cookies" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Çerez Politikası
                    </Link>
                  </li>
                </ul>
              </div>

              {/* İletişim */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  İletişim
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="text-slate-500 dark:text-slate-400 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">info@psikoran.com</span>
                  </li>
                  <li>
                    <Link to="/blog" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link to="/help" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      Yardım Merkezi
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm transition-colors">
                      İletişim Formu
                    </Link>
                  </li>
                </ul>
                
                <Link 
                  to="/contact" 
                  className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium mt-4 transition-colors"
                >
                  <span>Bize Ulaşın</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Alt Footer */}
          <div className="border-t border-slate-200 dark:border-slate-800 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} PsikoRan. Tüm hakları saklıdır.
              </p>
              <div className="flex mt-4 md:mt-0 flex-wrap justify-center gap-x-6 gap-y-2">
                <Link to="/help" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  Yardım Merkezi
                </Link>
                <Link to="/blog" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  Blog
                </Link>
                <a href="/assets/pages/sitemap.html" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  Site Haritası
                </a>
              </div>
            </div>
            
            {/* GDPR/KVKK Bilgilendirme */}
            <div className="mt-6 text-xs text-slate-500 dark:text-slate-400 text-center">
              <p>Bu web sitesini kullanarak, <Link to="/privacy" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline">Gizlilik Politikamızı</Link> ve <Link to="/terms" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline">Kullanım Şartlarımızı</Link> kabul etmiş olursunuz.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 