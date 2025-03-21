import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Filter, Search, Tag, User, Moon, Sun, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { BlogPost, fetchBlogPosts, formatBlogDate, slugifyName, generateBlogListJsonLd } from '../lib/blog';
import { Helmet } from 'react-helmet';

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
  const [darkMode, setDarkMode] = useState(() => {
    // localStorage veya sistem tercihine göre başlangıç değeri
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark' || 
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Tema değişikliği işlevi
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // HTML'de tema sınıfını güncelle
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
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
    async function loadBlogPosts() {
      try {
        setLoading(true);
        const fetchedPosts = await fetchBlogPosts();
        
        // Sadece yayımlanmış gönderileri göster
        const publishedPosts = fetchedPosts.filter(post => post.is_published);
        setPosts(publishedPosts);
        
        // Başlangıçta filtrelenmiş gönderiler, tüm gönderiler
        setFilteredPosts(publishedPosts);

        // Sayfa başlığı ayarla
        document.title = 'PsikoRan Blog | Psikoloji ve Danışmanlık Makaleleri';
      } catch (err) {
        console.error('Blog posts yüklenirken hata oluştu:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBlogPosts();
  }, []);

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

      {/* Sticky Header - Daha küçük boyut */}
      <div className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">PsikoRan Blog</h1>
            
            <div className="flex items-center space-x-3">
              {/* Dark/Light Tema Butonu */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors duration-200"
                aria-label={darkMode ? 'Aydınlık temaya geç' : 'Karanlık temaya geç'}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <Link
                to="/"
                className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 rounded-md text-white text-sm sm:text-base transition-colors hidden sm:inline-block"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>
      </div>

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
                      <Link 
                        to={`/professional/${slugifyName(post.author)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        {post.author}
                      </Link>
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
    </div>
  );
} 