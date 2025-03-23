import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Calendar, 
  Clock, 
  Users, 
  BarChart, 
  MessageSquare, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  PlayCircle,
  Sun,
  Moon,
  LogIn,
  Menu,
  X
} from 'lucide-react';

import logo2 from '../assets/logo/logo_2.png';

export function Demo() {
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

  // Demo sekmeleri için state
  const [activeTab, setActiveTab] = useState('randevu');

  useEffect(() => {
    document.title = "Ürün Demosu - PsikoRan";
    window.scrollTo(0, 0);
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

  // Demo içeriği
  const demoTabs = [
    {
      id: 'randevu',
      title: 'Randevu Yönetimi',
      icon: <Calendar className="h-5 w-5" />,
      description: 'Sürükle-bırak randevu sistemi ile zaman yönetimi artık çok kolay.',
      features: [
        'Sürükle-bırak kullanıcı arayüzü',
        'Tekrarlayan randevular',
        'Otomatik hatırlatmalar',
        'Çakışmaları önleme sistemi',
        'Danışan bazlı renk kodlaması'
      ],
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      image: '/assets/images/demo/randevu.png'
    },
    {
      id: 'danisan',
      title: 'Danışan Portali',
      icon: <Users className="h-5 w-5" />,
      description: 'Danışanlarınız kendi hesaplarıyla randevu oluşturabilir ve geçmiş kayıtlarını görüntüleyebilir.',
      features: [
        'Danışan hesap yönetimi',
        'Online randevu oluşturma',
        'Ödevlere erişim',
        'İlerleme raporları',
        'Güvenli mesajlaşma'
      ],
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      image: '/assets/images/demo/danisan.png'
    },
    {
      id: 'rapor',
      title: 'Analitik ve Raporlar',
      icon: <BarChart className="h-5 w-5" />,
      description: 'Danışan demografisi, gelir analizi ve büyüme raporları ile işinizi daha etkin yönetin.',
      features: [
        'Gelir analizleri',
        'Zaman kullanım raporları',
        'Danışan demografisi',
        'Otomatik raporlama',
        'Özelleştirilebilir grafikler'
      ],
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      image: '/assets/images/demo/analitik.png'
    },
    {
      id: 'mesajlasma',
      title: 'Güvenli Mesajlaşma',
      icon: <MessageSquare className="h-5 w-5" />,
      description: 'KVKK ve GDPR uyumlu, uçtan uca şifreli mesajlaşma sistemi.',
      features: [
        'Uçtan uca şifreleme',
        'Dosya paylaşımı',
        'Bildirim sistemi',
        'Danışan grupları',
        'Şablon mesajlar'
      ],
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      image: '/assets/images/demo/mesajlasma.png'
    },
    {
      id: 'dokuman',
      title: 'Doküman Yönetimi',
      icon: <FileText className="h-5 w-5" />,
      description: 'Tüm dokümanlarınızı ve formlarınızı tek bir yerde yönetin.',
      features: [
        'Şablon kütüphanesi',
        'Online form oluşturma',
        'PDF dönüştürme',
        'Otomatik arşivleme',
        'Gelişmiş arama'
      ],
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      image: '/assets/images/demo/dokuman.png'
    }
  ];

  // Şu anda aktif olan sekmeyi bul
  const activeTabContent = demoTabs.find(tab => tab.id === activeTab);

  // Önceki ve sonraki sekmelere geçiş için yardımcı fonksiyonlar
  const goToNextTab = () => {
    const currentIndex = demoTabs.findIndex(tab => tab.id === activeTab);
    const nextIndex = (currentIndex + 1) % demoTabs.length;
    setActiveTab(demoTabs[nextIndex].id);
  };

  const goToPrevTab = () => {
    const currentIndex = demoTabs.findIndex(tab => tab.id === activeTab);
    const prevIndex = (currentIndex - 1 + demoTabs.length) % demoTabs.length;
    setActiveTab(demoTabs[prevIndex].id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
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

      <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Bölümü */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              PsikoRan <span className="text-primary-600 dark:text-primary-400">Demo</span> Turu
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              PsikoRan'ın güçlü özelliklerini keşfedin ve platformun klinik süreçlerinizi nasıl dönüştürebileceğini görün.
            </p>
            <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm font-medium px-4 py-2 rounded-full">
              <Clock className="h-4 w-4 mr-1" />
              <span>Demo Süresi: ~5 dakika</span>
            </div>
          </motion.div>
        </section>

        {/* Demo Sekmeleri */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
          {demoTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center p-4 rounded-lg border transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 shadow-md'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md'
              }`}
            >
              <div className={`mr-3 p-2 rounded-lg ${
                activeTab === tab.id
                  ? 'bg-primary-100 dark:bg-primary-800/40 text-primary-700 dark:text-primary-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {tab.icon}
              </div>
              <span className={`font-medium ${
                activeTab === tab.id
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-slate-700 dark:text-slate-300'
              }`}>
                {tab.title}
              </span>
            </button>
          ))}
        </div>

        {/* Demo İçeriği */}
        {activeTabContent && (
          <motion.div
            key={activeTabContent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Sol Taraf - İçerik */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
                {activeTabContent.icon}
                <span className="ml-3">{activeTabContent.title}</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                {activeTabContent.description}
              </p>

              <div className="space-y-4 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white">Öne Çıkan Özellikler</h3>
                <ul className="space-y-3">
                  {activeTabContent.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <svg className="h-3 w-3 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={goToPrevTab}
                  className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Önceki
                </button>
                <button
                  onClick={goToNextTab}
                  className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  Sonraki
                  <ChevronRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            </div>

            {/* Sağ Taraf - Görsel veya Video */}
            <div className="relative rounded-xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 aspect-video">
              {/* Video veya görsel burada gösterilecek */}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 dark:bg-slate-900/40">
                <button className="p-4 rounded-full bg-primary-600/90 text-white hover:bg-primary-700 transition-colors duration-300">
                  <PlayCircle className="h-12 w-12" />
                </button>
              </div>
              {/* Görsel arka plan (istege bağlı) */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/20 dark:to-indigo-900/20 opacity-80 dark:opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400 text-center px-6">
                  [Demo içeriği burada görüntülenecek. Gerçek uygulamada bu alan
                  interaktif bir demo veya video içerecektir.]
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA Bölümü */}
        <section className="mt-20">
          <div className="bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 rounded-2xl p-8 md:p-12 border border-primary-100 dark:border-primary-800/30 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div 
                className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-primary-300/20 dark:bg-primary-500/10 blur-3xl"
                animate={{ 
                  x: [0, 10, 0],
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute -left-10 bottom-10 w-48 h-48 rounded-full bg-indigo-300/30 dark:bg-indigo-500/10 blur-3xl"
                animate={{ 
                  x: [0, -10, 0],
                  y: [0, 10, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
              />
            </div>
            
            <div className="relative z-10">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Ücretsiz Hesap Oluşturarak Deneyimlemeye Başlayın
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                  30 gün boyunca tüm premium özelliklere erişin, kredi kartı gerektirmez, istediğiniz zaman iptal edebilirsiniz.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/create-assistant"
                    className="px-6 py-3 rounded-lg bg-primary-600 text-white font-medium text-center shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 hover:bg-primary-700 transition-all duration-300 flex items-center justify-center"
                  >
                    <span>Şimdi Başlayın</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/pricing"
                    className="px-6 py-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-medium text-center hover:shadow-md transition-all duration-300"
                  >
                    <span>Fiyatlandırmayı Görüntüle</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-20">
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

export default Demo; 