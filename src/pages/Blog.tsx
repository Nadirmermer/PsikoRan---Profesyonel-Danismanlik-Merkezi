import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Filter, Search, Tag, User, Moon, Sun, X, LogIn, Menu, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { BlogPost, fetchBlogPosts, formatBlogDate, slugifyName, generateBlogListJsonLd } from '../lib/blog';
import { Helmet } from 'react-helmet';

import logo2 from '../assets/logo/logo_2.png';

const categoryColors: Record<string, string> = {
  'Psikoloji': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  'Terapiler': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'Kişisel Gelişim': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  'Aile İlişkileri': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  'İş Hayatı': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'Danışmanlık': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
};

const getCategoryColor = (category: string): string => {
  return categoryColors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
};

export function Blog() {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  // Tema değişikliği işlevi
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('app_theme', !isDarkMode ? 'dark' : 'light');
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // URL parametrelerinden kategori ve etiket filtreleme
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const tagParam = params.get('tag');
    
    if (categoryParam) {
      setActiveFilter(`category:${categoryParam}`);
    } else if (tagParam) {
      setActiveFilter(`tag:${tagParam}`);
    } else {
      setActiveFilter(null);
    }
  }, [location.search]);

  useEffect(() => {
    document.title = "PsikoRan Blog | Psikoloji ve Danışmanlık Makaleleri";
    window.scrollTo(0, 0);
    
    async function loadBlogPosts() {
      try {
        setLoading(true);
        const fetchedPosts = await fetchBlogPosts();
        
        // Sadece yayımlanmış gönderileri göster
        const publishedPosts = fetchedPosts.filter(post => post.is_published);
        setPosts(publishedPosts);
        
        // Başlangıçta filtrelenmiş gönderiler, tüm gönderiler
        setFilteredPosts(publishedPosts);
      } catch (err) {
        console.error('Blog posts yüklenirken hata oluştu:', err);
      } finally {
        setLoading(false);
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

  // Gönderi arama ve filtreleme
  useEffect(() => {
    let result = [...posts];
    
    // Aktif filtreye göre filtrele
    if (activeFilter) {
      const [type, value] = activeFilter.split(':');
      if (type === 'category') {
        result = result.filter(post => post.category === value);
      } else if (type === 'tag') {
        result = result.filter(post => post.tags && post.tags.includes(value));
      }
    }
    
    // Arama terimine göre filtrele
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        post => 
          post.title.toLowerCase().includes(term) || 
          post.excerpt.toLowerCase().includes(term) ||
          post.content.toLowerCase().includes(term) ||
          post.category.toLowerCase().includes(term) ||
          (post.tags && post.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    setFilteredPosts(result);
  }, [posts, searchTerm, activeFilter]);

  // Arama işlevi
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Arama sıfırlama
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Filtre sıfırlama
  const clearFilter = () => {
    setActiveFilter(null);
    navigate('/blog');
  };

  // Benzersiz kategorileri topla
  const categories = [...new Set(posts.map(post => post.category))];

  // Tüm etiketleri topla ve benzersiz hale getir
  const allTags = posts.reduce((acc: string[], post) => {
    if (post.tags) {
      return [...acc, ...post.tags];
    }
    return acc;
  }, []);
  const tags = [...new Set(allTags)];

  // Blog listesi için yapılandırılmış veri oluştur
  const jsonLdScript = generateBlogListJsonLd(filteredPosts);
  const structuredData = { __html: jsonLdScript };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      <Helmet>
        <title>PsikoRan Blog | Psikolojik Danışmanlık Makaleleri ve Rehberler</title>
        <meta name="description" content="Psikoloji, terapi, danışmanlık ve kişisel gelişim hakkında uzman makaleler, rehberler ve öneriler. Profesyonel danışmanlık hizmetleri için en güncel bilgiler." />
        <meta name="keywords" content="psikoloji, terapi, danışmanlık, kişisel gelişim, ruh sağlığı, çevrimiçi terapi, aile ilişkileri, iş hayatı, randevu sistemi" />
        <link rel="canonical" href="https://psikoran.com/blog" />
        <meta property="og:title" content="PsikoRan Blog | Psikolojik Danışmanlık İçerikleri" />
        <meta property="og:description" content="Psikoloji, terapi ve danışmanlık konularında profesyonel içerikler. Kişisel gelişiminize katkı sağlayacak uzman makaleler." />
        <meta property="og:url" content="https://psikoran.com/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="PsikoRan" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PsikoRan Blog | Psikolojik Danışmanlık İçerikleri" />
        <meta name="twitter:description" content="Psikoloji, terapi ve danışmanlık konularında profesyonel içerikler. Kişisel gelişiminize katkı sağlayacak uzman makaleler." />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <div dangerouslySetInnerHTML={structuredData} />
      </Helmet>

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
                  className="px-3 py-2 rounded-lg text-primary-600 dark:text-primary-400 font-medium transition-colors bg-slate-100/70 dark:bg-slate-800/70 text-sm"
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
                  className="block px-4 py-2.5 rounded-lg text-primary-600 dark:text-primary-400 font-medium transition-colors bg-slate-100 dark:bg-slate-800"
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

      {/* Hero Banner - Daha kısa ve öz */}
      <div className="bg-gradient-to-b from-primary-600 to-indigo-700 dark:from-primary-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 md:mb-6"
            >
              Profesyonel Danışmanlık Blogumuz
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-3xl mx-auto text-base sm:text-lg text-indigo-100 mb-6 md:mb-8"
            >
              Psikoloji, terapi yöntemleri ve kişisel gelişim hakkında uzman makaleler, rehberler ve danışmanlık ipuçları
            </motion.p>
            
            {/* Arama Kutusu */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-2xl mx-auto relative mb-2"
            >
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/30 overflow-hidden shadow-xl">
                <div className="flex-shrink-0 pl-4">
                  <Search className="h-5 w-5 text-white/70" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Makale ara..."
                  className="w-full py-3 px-3 bg-transparent text-white placeholder-white/60 focus:outline-none"
                />
                {searchTerm && (
                  <button 
                    onClick={clearSearch}
                    className="flex-shrink-0 pr-4"
                  >
                    <X className="h-5 w-5 text-white/70 hover:text-white" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtreler */}
        {posts.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-md font-medium">
                <Filter className="h-4 w-4 mr-1.5" />
                <span>Kategoriler:</span>
              </div>

              {categories.map(category => (
              <button
                key={category}
                  onClick={() => navigate(`/blog?category=${category}`)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeFilter === `category:${category}` 
                      ? getCategoryColor(category)
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {category}
              </button>
            ))}
            </div>
            
            {activeFilter && (
              <div className="flex items-center mb-6">
                <span className="text-slate-500 dark:text-slate-400 mr-2">Aktif filtre:</span>
                <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-full px-3 py-1 text-sm font-medium flex items-center">
                  {activeFilter.startsWith('category:') ? 'Kategori: ' : 'Etiket: '}
                  {activeFilter.split(':')[1]}
              <button
                    onClick={clearFilter}
                    className="ml-1.5 p-0.5 text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200"
              >
                    <X className="h-3.5 w-3.5" />
              </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Blog Gönderileri */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz blog yazısı bulunmuyor'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchTerm 
                ? 'Farklı bir arama terimi deneyin veya filtreleri temizleyin.'
                : 'Daha sonra tekrar kontrol edin, yakında içerikler eklenecek.'}
            </p>
            {searchTerm && (
            <button
                onClick={clearSearch}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Aramayı Temizle
            </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-slate-800/60 rounded-xl overflow-hidden shadow-lg hover:shadow-xl dark:shadow-slate-900/40 transition-all duration-300 hover:translate-y-[-4px] border border-slate-100 dark:border-slate-700/60"
              >
                <Link to={`/blog/${post.slug}`} className="block">
                  <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
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
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                </div>
                  </div>
                </Link>
                  
                <div className="p-5">
                  <Link to={`/blog/${post.slug}`} className="block group">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {post.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">{post.excerpt}</p>
                  </Link>

                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-3">
                    <span className="flex items-center mr-4">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {formatBlogDate(post.published_at)}
                    </span>
                    <span className="flex items-center">
                      <User className="h-3.5 w-3.5 mr-1" />
                      {post.author}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-1">
                      {post.tags && post.tags.slice(0, 2).map(tag => (
                        <button
                          key={tag}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/blog?tag=${tag}`);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md text-xs text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                      {post.tags && post.tags.length > 2 && (
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-xs text-slate-600 dark:text-slate-400">
                          +{post.tags.length - 2}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors"
                    >
                      Devamını Oku
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

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
                    <span className="text-slate-600 dark:text-slate-400 text-sm">destek@psikoran.com</span>
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