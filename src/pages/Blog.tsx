import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Filter, Search, X, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchBlogPosts, formatBlogDate, generateBlogListJsonLd } from '../lib/blog';
import { Helmet } from 'react-helmet';
import { MainLayout } from '../components/layout/MainLayout';

// Blog post tipi tanımlayalım
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
  const [error, setError] = useState('');

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
    document.title = "Blog - PsikoRan";
    
    // Blog makalelerini yükle
    async function loadBlogPosts() {
      try {
        setLoading(true);
        const data = await fetchBlogPosts();
        setPosts(data);
        setFilteredPosts(data);
      } catch (err) {
        setError('Blog yazıları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        console.error('Blog posts loading error:', err);
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
    <MainLayout>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero bölümü */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Blog & Kaynaklar
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Ruh sağlığı, klinik psikoloji ve modern terapi yaklaşımları hakkında 
            uzman yazarlarımızın makalelerini keşfedin.
          </p>
          
          {/* Arama kutusu */}
          <div className="mt-8 max-w-lg mx-auto relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                placeholder="Makalelerde ara..."
                />
                {searchTerm && (
                  <button 
                    onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                  <X className="h-5 w-5 text-slate-400 hover:text-slate-500" />
                  </button>
                )}
          </div>
        </div>
      </div>

        {/* İçerik alanı */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Makaleler (Sol ve Orta) */}
          <div className="col-span-1 lg:col-span-2">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <p>Aramanızla eşleşen makale bulunamadı.</p>
              <button
                    onClick={clearFilter}
                  className="mt-4 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800/40 transition-colors"
              >
                  Filtreleri temizle
              </button>
          </div>
        ) : (
              <div className="space-y-8">
                {/* Blog post kartları */}
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
                        // Eğer yerel görsel de yüklenmezse logo_1.png'yi kullan
                        target.onerror = () => {
                          target.src = '/assets/images/logo_1.png';
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

          {/* Yan Panel (Sağ) */}
          <div className="col-span-1">
            {/* Kategoriler */}
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

            {/* Popüler Etiketler */}
            {tags.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Popüler Etiketler
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
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
          </div>
              </div>
            )}
          </div>
        </div>
    </div>
    </MainLayout>
  );
} 