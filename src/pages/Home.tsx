import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Calendar, Clipboard, Users, Clock, MessageSquare, BarChart, Award, Sun, Moon, LogIn, ArrowRight, Menu, X, ChevronRight, User } from 'lucide-react';
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
      {/* Navigasyon */}
      <nav className="bg-white/90 dark:bg-slate-800/90 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 backdrop-blur-sm z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <img src={logo2} alt="PsikoRan Logo" className="h-10 w-10" />
              </motion.div>
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="ml-2 text-xl font-bold text-slate-800 dark:text-white"
              >
                PsikoRan
              </motion.span>
            </div>
            
            {/* Masaüstü Menü */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Tema değiştirme butonu */}
              <button
                onClick={toggleDarkMode}
                className="p-3 rounded-lg bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 group border border-slate-200 dark:border-slate-700"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-amber-500 group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                  <Moon className="h-5 w-5 text-primary-600 group-hover:rotate-90 transition-transform duration-300" />
                )}
              </button>

              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium flex items-center space-x-1 transition-colors"
              >
                <LogIn className="h-4 w-4 mr-1" />
                <span>Giriş Yap</span>
              </Link>
              <Link
                to="/create-assistant"
                className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium transition-colors flex items-center space-x-1"
              >
                <span>Asistan Hesabı</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {/* Mobil Menü Butonları */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-300 group border border-slate-200 dark:border-slate-700 mr-2"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-amber-500 group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                  <Moon className="h-5 w-5 text-primary-600 group-hover:rotate-90 transition-transform duration-300" />
                )}
              </button>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                ) : (
                  <Menu className="h-6 w-6 text-slate-700 dark:text-slate-300" />
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
              transition={{ duration: 0.3 }}
              className="md:hidden py-3 border-t border-slate-200 dark:border-slate-700"
            >
              <div className="flex flex-col space-y-3 pt-2 pb-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium flex items-center justify-center space-x-1 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  <span>Giriş Yap</span>
                </Link>
                <Link
                  to="/create-assistant"
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium transition-colors flex items-center justify-center space-x-1 mx-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Asistan Hesabı</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-10 sm:py-16 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="w-full lg:w-1/2 lg:pr-12 text-center lg:text-left">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight"
              >
                Profesyonel<br />
                <span className="text-primary-600 dark:text-primary-400">Danışmanlık Merkezi</span>
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="mt-4 sm:mt-6 space-y-4 sm:space-y-6 text-base sm:text-lg text-slate-600 dark:text-slate-400"
              >
                <p>Danışanlarınızla olan tüm süreçlerinizi tek platformda yönetin.</p>
                <ul className="space-y-3 sm:space-y-4 mx-auto lg:mx-0 max-w-sm">
                  <li className="flex items-center space-x-3">
                    <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                      <svg className="h-4 w-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Online/Yüz yüze randevu yönetimi</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                      <svg className="h-4 w-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Güvenli ödeme takibi</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                      <svg className="h-4 w-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Danışan kayıtları ve notlar</span>
                  </li>
                </ul>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4"
              >
                <Link
                  to="/create-assistant"
                  className="px-6 sm:px-8 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium text-center transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Hemen Başlayın</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
            </div>
            <div className="w-full lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-md"
              >
                <div className="p-4 sm:p-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
                  <div className="text-3xl sm:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">%99.9</div>
                  <div className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">Hizmet Sürekliliği</div>
                </div>
                <div className="p-4 sm:p-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
                  <div className="text-3xl sm:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">7/24</div>
                  <div className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">Teknik Destek</div>
                </div>
                <div className="p-4 sm:p-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg sm:col-span-2">
                  <div className="relative h-36 sm:h-48 w-full rounded-lg bg-gradient-to-r from-primary-500 to-indigo-500 shadow-xl overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{ 
                        y: [0, -10, 0, 10, 0],
                        rotate: [0, 3, 0, -3, 0]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 6,
                        ease: "easeInOut" 
                      }}
                    >
                      <img 
                        src={logo2} 
                        alt="PsikoRan Banner" 
                        className="h-24 sm:h-32 w-24 sm:w-32 object-contain drop-shadow-2xl"
                      />
                    </motion.div>
                    <div className="absolute inset-x-0 bottom-0 h-16 sm:h-24 bg-gradient-to-t from-primary-600/80 to-transparent"></div>
                  </div>
                </div>
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

      {/* Özellikler */}
      <section className="py-16 md:py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-sm font-medium"
            >
              Neden PsikoRan?
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight"
            >
              Tüm İhtiyaçlarınız İçin <span className="text-primary-600 dark:text-primary-400">Kapsamlı Çözüm</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400"
            >
              Danışmanlık süreçlerinizi kolaylaştıran ve profesyonel yaklaşımınızı destekleyen özellikler ile tanışın.
            </motion.p>
          </div>

          <div className="mt-10 sm:mt-16 grid gap-6 sm:gap-x-8 sm:gap-y-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { 
                icon: <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-white" />, 
                color: "bg-indigo-500",
                title: 'Randevu Yönetimi', 
                description: 'Günlük, haftalık ve aylık görünümlerle randevularınızı kolayca planlayın ve takip edin.' 
              },
              { 
                icon: <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />, 
                color: "bg-blue-500",
                title: 'Danışan Yönetimi', 
                description: 'Danışanlarınıza ait tüm bilgileri güvenle saklayın, düzenleyin ve merkezi bir yerden yönetin.' 
              },
              { 
                icon: <Clipboard className="h-6 w-6 sm:h-8 sm:w-8 text-white" />, 
                color: "bg-cyan-500",
                title: 'Online Testler', 
                description: 'Psikolojik değerlendirme testlerini çevrimiçi olarak uygulayın ve sonuçları anında görüntüleyin.' 
              },
              { 
                icon: <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />, 
                color: "bg-teal-500",
                title: 'Otomatik Hatırlatmalar', 
                description: 'SMS ve e-posta bildirimleriyle randevularınızı ve önemli görevlerinizi asla kaçırmayın.' 
              },
              { 
                icon: <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-white" />, 
                color: "bg-emerald-500",
                title: 'Güvenli İletişim', 
                description: 'Danışanlarınızla güvenli bir şekilde iletişim kurun, dosya paylaşın ve görüşme notları tutun.' 
              },
              { 
                icon: <BarChart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />, 
                color: "bg-green-500",
                title: 'Raporlar ve Analizler', 
                description: 'Detaylı istatistiklerle iş süreçlerinizi optimize edin, gelirlerinizi takip edin.' 
              },
              { 
                icon: <Award className="h-6 w-6 sm:h-8 sm:w-8 text-white" />, 
                color: "bg-amber-500",
                title: 'Profesyonel Profil', 
                description: 'Uzmanlık alanlarınızı ve deneyimlerinizi öne çıkarın, danışanların sizi kolayca bulmasını sağlayın.' 
              },
              { 
                icon: <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />, 
                color: "bg-orange-500",
                title: 'Veri Güvenliği', 
                description: 'KVKK uyumlu güvenlik altyapısıyla verileriniz her zaman güvende ve şifrelenmiş olarak saklanır.' 
              },
             
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 sm:p-6 border border-slate-200 dark:border-slate-700 transition-all duration-300 flex"
              >
                <div className={`rounded-xl ${feature.color} dark:opacity-90 p-2 sm:p-3 mr-3 sm:mr-4 h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center shrink-0`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-10 sm:mt-16 text-center"
          >
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium transition-all duration-300 hover:scale-105 text-base sm:text-lg group"
            >
              <span>Hemen Ücretsiz Deneyin</span>
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-700 dark:to-indigo-700 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="relative">
              <div className="absolute inset-0 opacity-10">
                <svg className="h-full w-full" viewBox="0 0 800 800">
                  <path d="M400 0C179.1 0 0 179.1 0 400s179.1 400 400 400 400-179.1 400-400S620.9 0 400 0zm0 650c-138.1 0-250-111.9-250-250S261.9 150 400 150s250 111.9 250 250-111.9 250-250 250z" fill="currentColor" />
                  <circle cx="400" cy="400" r="100" fill="currentColor" />
                </svg>
              </div>
              <div className="px-4 sm:px-6 py-10 sm:py-12 md:py-16 lg:flex lg:items-center lg:p-20 relative z-10">
                <div className="lg:w-0 lg:flex-1">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                    Profesyonel danışmanlık süreçlerinizi dijitalleştirmeye hazır mısınız?
                  </h2>
                  <p className="mt-3 sm:mt-4 max-w-3xl text-base sm:text-lg text-primary-100">
                    Bugün ücretsiz hesap oluşturun, PsikoRan'ın sunduğu avantajlarla işinizi büyütün, danışanlarınıza daha iyi hizmet verin.
                  </p>
                  <ul className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                    <li className="flex items-center text-white">
                      <svg className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm sm:text-base">30 gün ücretsiz deneme</span>
                    </li>
                    <li className="flex items-center text-white">
                      <svg className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm sm:text-base">Kredi kartı gerektirmez</span>
                    </li>
                    <li className="flex items-center text-white">
                      <svg className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm sm:text-base">İstediğiniz zaman iptal edin</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 lg:mt-0 lg:ml-8 lg:flex-1">
                  <div className="bg-white dark:bg-slate-800 py-6 sm:py-8 px-4 sm:px-6 md:px-10 shadow-xl rounded-xl">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 text-center">Şimdi Kaydolun</h3>
                    <div className="space-y-4">
                      <Link
                        to="/create-assistant"
                        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition-colors"
                      >
                        <span>Asistan Hesabı Oluştur</span>
                      </Link>
                      <p className="text-sm text-slate-600 dark:text-slate-400 text-center mt-4 sm:mt-6">
                        Zaten hesabınız var mı?{' '}
                        <Link
                          to="/login"
                          className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          Giriş yapın
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* İstatistikler */}
      <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <span className="inline-block px-3 py-1 text-sm font-semibold text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-3">Güvenilir Platform</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Rakamlarla PsikoRan
            </h2>
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
                <div className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          
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
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 py-8 sm:py-12">
            {/* Logo ve Hakkında */}
            <div className="col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-primary-600 dark:bg-primary-500">
                  <img 
                    src={logo2} 
                    alt="PsikoRan Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  PsikoRan
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Profesyonel danışmanlık süreçlerinizi dijitalleştirin, randevuları yönetin ve danışanlarınızı takip edin.
              </p>
              <div className="flex space-x-3 mb-8">
                <motion.a 
                  href="https://twitter.com/psikoran" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </motion.a>
                <motion.a 
                  href="https://www.facebook.com/people/PsikoRan/61574169219677/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </motion.a>
                <motion.a 
                  href="https://instagram.com/psikoran" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </motion.a>
              </div>
            </div>
            
            {/* Footer Nav */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              {/* Hızlı Bağlantılar */}
              <div className="col-span-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Hızlı Bağlantılar
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/login" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm">
                      Giriş Yap
                    </Link>
                  </li>
                  <li>
                    <Link to="/create-assistant" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm">
                      Asistan Hesabı Oluştur
                    </Link>
                  </li>
                  <li>
                    <Link to="/forgot-password" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm">
                      Şifremi Unuttum
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Yasal Bilgiler */}
              <div className="col-span-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Yasal Bilgiler
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/privacy" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm">
                      Gizlilik Politikası
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm">
                      Kullanım Şartları
                    </Link>
                  </li>
                  <li>
                    <Link to="/kvkk" className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm">
                      KVKK
                    </Link>
                  </li>
                </ul>
              </div>

              {/* İletişim */}
              <div className="col-span-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  İletişim
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="text-slate-500 dark:text-slate-400 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">info@psikoran.com</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="text-slate-500 dark:text-slate-400 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498.913a1 1 0 01.43.99l-.5 3a1 1 0 01-.68.837l-5 2a1 1 0 01-1.17-.375l-2.5-3A1 1 0 011 8.5V5a2 2 0 012-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6a2 2 0 012 2v3.5a1 1 0 01-.553.894l-2.5 1A1 1 0 0119 11l-1-5a1 1 0 01.553-.894l2-1A2 2 0 0121 3z" />
                    </svg>
                  </li>
                  <li className="flex items-start">
                    <svg className="text-slate-500 dark:text-slate-400 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    
                  </li>
                </ul>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium mt-4"
                >
                  <span>Bize Ulaşın</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Alt Footer */}
          <div className="border-t border-slate-200 dark:border-slate-800 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} PsikoRan. Tüm hakları saklıdır.
              </p>
              <div className="flex mt-4 md:mt-0 flex-wrap justify-center gap-x-6 gap-y-2">
                <Link to="/help" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  Yardım Merkezi
                </Link>
                <Link to="/blog" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  Blog
                </Link>
                <a href="/assets/pages/sitemap.html" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  Site Haritası
                </a>
              </div>
            </div>
            
            {/* GDPR/KVKK Bilgilendirme */}
            <div className="mt-4 sm:mt-6 text-xs text-slate-500 dark:text-slate-400 text-center md:text-left">
              <p>Bu web sitesini kullanarak, <Link to="/privacy" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">Gizlilik Politikamızı</Link> ve <Link to="/terms" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">Kullanım Şartlarımızı</Link> kabul etmiş olursunuz.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 