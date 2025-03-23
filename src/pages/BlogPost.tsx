import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, Share2, ExternalLink, Twitter, Facebook, Linkedin, ChevronRight, ArrowRight, Moon, Sun, Clock, LogIn, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { BlogPost as BlogPostType, fetchBlogPostBySlug, formatBlogDate, processProfessionalNames, generateBlogJsonLd } from '../lib/blog';
import { Helmet } from 'react-helmet';

import logo2 from '../assets/logo/logo_2.png';

// ReadTime bileşeni - okuma süresini göstermek için tutarlı bir bileşen
interface ReadTimeProps {
  minutes: number;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

const ReadTime: React.FC<ReadTimeProps> = ({ 
  minutes, 
  className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
  iconClassName = "h-3 w-3 mr-1",
  textClassName = ""
}) => {
  const displayMinutes = minutes || 5;
  
  return (
    <span className={className}>
      <Clock className={iconClassName} />
      <span className={textClassName}>{displayMinutes} dk</span>
    </span>
  );
};

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
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

  useEffect(() => {
    async function loadBlogPost() {
      try {
        if (!slug) {
          setError('Blog yazısı bulunamadı');
          return;
        }

        setLoading(true);
        const blogPost = await fetchBlogPostBySlug(slug);
        
        if (blogPost) {
          setPost(blogPost);
          // Blog başlığını sayfa başlığı olarak ayarla
          document.title = `${blogPost.title} - PsikoRan Blog`;
          
          // İlgili yazıları yükle - daha sonra geliştirilecek
          // Şu an için boş bırakılıyor
          setRelatedPosts([]);
        } else {
          setError('Blog yazısı bulunamadı');
          document.title = 'Yazı Bulunamadı - PsikoRan Blog';
        }
      } catch (err) {
        console.error('Blog yazısı yüklenirken hata oluştu:', err);
        setError('Blog yazısı yüklenirken bir hata oluştu');
        document.title = 'Hata - PsikoRan Blog';
      } finally {
        setLoading(false);
      }
    }

    loadBlogPost();
    // Sayfa değiştiğinde başa dön
    window.scrollTo(0, 0);
  }, [slug]);

  // URL'yi kopyala
  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('URL kopyalanırken hata oluştu:', err);
      }
    );
  };

  // Twitter'da paylaş
  const shareOnTwitter = () => {
    if (!post) return;
    const text = `${post.title} - PsikoRan Blog`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  // Facebook'ta paylaş
  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  // LinkedIn'de paylaş
  const shareOnLinkedIn = () => {
    if (!post) return;
    const url = window.location.href;
    const title = post.title;
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
  };

  // Blog içeriğini HTML olarak render et
  const renderContent = (content: string) => {
    // Uzmanlara otomatik link ekle
    const processedContent = processProfessionalNames(content);
    return { __html: processedContent };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Blog Yazısı Bulunamadı</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Aradığınız blog yazısı bulunamadı veya kaldırılmış olabilir.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Tüm Blog Yazılarına Dön
          </Link>
        </div>
      </div>
    );
  }

  // Blog için yapılandırılmış veri
  const jsonLdScript = generateBlogJsonLd(post);
  const structuredData = { __html: jsonLdScript };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      <Helmet>
        <title>{post.title} - PsikoRan Blog | Psikolojik Danışmanlık Merkezi</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={`psikoloji, ${post.category.toLowerCase()}, ${post.tags.join(', ').toLowerCase()}, danışmanlık, terapi`} />
        <link rel="canonical" href={`https://psikoran.com/blog/${post.slug}`} />
        <meta property="og:title" content={`${post.title} - PsikoRan Blog`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={`https://psikoran.com/blog/${post.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={post.cover_image} />
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:author" content={post.author} />
        <meta property="article:section" content={post.category} />
        {post.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} - PsikoRan Blog`} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={post.cover_image} />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <div dangerouslySetInnerHTML={structuredData} />
      </Helmet>

      {/* Navigasyon - Modern Tasarım */}
      <header className="bg-white dark:bg-slate-900 sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 backdrop-blur-md transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo Bölümü */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 p-0.5 shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300"
                >
                  <div className="absolute inset-0 rounded-xl bg-white dark:bg-slate-900 p-1">
                    <img src={logo2} alt="PsikoRan Logo" className="h-full w-full object-contain" />
                  </div>
                </motion.div>
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 group-hover:from-primary-600 group-hover:to-primary-500 dark:group-hover:from-primary-400 dark:group-hover:to-primary-300 transition-all duration-300"
                >
                  PsikoRan
                </motion.span>
              </Link>
            </div>
            
            {/* Masaüstü Menü */}
            <div className="hidden md:flex items-center space-x-4">
              <nav className="flex items-center space-x-1">
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
              </nav>
              
              <div className="flex items-center pl-4 border-l border-slate-200 dark:border-slate-700">
                {/* Tema değiştirme butonu */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 mx-1"
                  aria-label={isDarkMode ? 'Açık moda geç' : 'Koyu moda geç'}
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-primary-600" />
                  )}
                </button>

                <Link
                  to="/login"
                  className="px-3 py-2 rounded-lg text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1.5 text-sm mx-1"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Giriş</span>
                </Link>
                  
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium transition-all duration-200 flex items-center space-x-1.5 text-sm mx-1"
                >
                  <span>Kayıt Ol</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            
            {/* Mobil Menü Butonları */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 mr-2"
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
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
                aria-label="Menüyü aç/kapat"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
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
              transition={{ duration: 0.2 }}
              className="md:hidden py-2 border-t border-slate-200 dark:border-slate-800"
            >
              <nav className="flex flex-col space-y-1 py-3">
                <Link 
                  to="/features" 
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Özellikler
                </Link>
                <Link 
                  to="/pricing" 
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Fiyatlandırma
                </Link>
                <Link 
                  to="/blog" 
                  className="px-4 py-2 text-primary-600 dark:text-primary-400 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link 
                  to="/contact" 
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  İletişim
                </Link>
              </nav>
              
              <div className="flex flex-col space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 font-medium flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  <span>Giriş Yap</span>
                </Link>
                <Link
                  to="/register"
                  className="mx-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Kayıt Ol</span>
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Blog Başlık Çubuğu */}
      <div className="bg-primary-600 dark:bg-primary-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link
                to="/blog"
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
                aria-label="Blog'a Dön"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <span className="text-sm font-medium text-white/80">Blog</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={copyToClipboard}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white flex items-center text-xs"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                {copied ? 'Kopyalandı!' : 'Paylaş'}
              </button>
              <button
                onClick={shareOnTwitter}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                aria-label="Twitter'da paylaş"
              >
                <Twitter className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={shareOnFacebook}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                aria-label="Facebook'ta paylaş"
              >
                <Facebook className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={shareOnLinkedIn}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                aria-label="LinkedIn'de paylaş"
              >
                <Linkedin className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ana İçerik Alanı */}
      <main className="bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <article className="max-w-4xl mx-auto">
            {/* İçerik başlık */}
            <motion.header 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-2 mb-6 text-sm text-slate-600 dark:text-slate-400">
                <Link 
                  to={`/blog?category=${post.category}`}
                  className="inline-flex items-center px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 rounded-full font-medium transition-colors hover:bg-primary-100 dark:hover:bg-primary-900/50"
                >
                  <Tag className="h-3.5 w-3.5 mr-1.5" />
                  {post.category}
                </Link>
                <span className="inline-flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-slate-400 dark:text-slate-500" />
                  {formatBlogDate(post.published_at)}
                </span>
                <span className="inline-flex items-center">
                  <User className="h-4 w-4 mr-1.5 text-slate-400 dark:text-slate-500" />
                  {post.author}
                </span>
                <ReadTime 
                  minutes={post.reading_time} 
                  className="inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs"
                  iconClassName="h-3.5 w-3.5 mr-1.5 text-slate-400 dark:text-slate-500"
                />
              </div>
              
              <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                {post.excerpt}
              </p>
            </motion.header>

            {/* Blog görseli */}
            <motion.figure 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-10 rounded-2xl overflow-hidden shadow-xl dark:shadow-primary-900/10"
            >
              <img 
                src={post.cover_image}
                alt={post.title}
                className="w-full object-cover h-64 sm:h-80 lg:h-96"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/images/blog-placeholder.jpg';
                  target.onerror = () => {
                    target.src = '/assets/images/logo_2.png';
                    target.onerror = null;
                  };
                }}
              />
            </motion.figure>

            {/* Blog içeriği */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="prose prose-lg dark:prose-invert prose-slate max-w-none mb-12
                prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed
                prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-lg
                prose-ul:text-slate-700 dark:prose-ul:text-slate-300
                prose-ol:text-slate-700 dark:prose-ol:text-slate-300
                prose-li:mb-1
                prose-blockquote:border-l-primary-500 dark:prose-blockquote:border-l-primary-500
                prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300
                prose-blockquote:bg-primary-50 dark:prose-blockquote:bg-primary-900/20 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4
                prose-strong:text-slate-900 dark:prose-strong:text-white
                prose-code:text-slate-900 dark:prose-code:text-slate-200
                prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-slate-800 dark:prose-pre:bg-slate-900 prose-pre:text-slate-200 dark:prose-pre:text-slate-200 prose-pre:shadow-lg"
            >
              <div dangerouslySetInnerHTML={renderContent(post.content)} />
            </motion.div>

            {/* Mobil paylaşım */}
            <div className="md:hidden flex justify-center mb-10 space-x-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 text-sm"
              >
                <ExternalLink className="h-4 w-4 mr-1.5" />
                {copied ? 'Kopyalandı!' : 'Paylaş'}
              </button>
              <button
                onClick={shareOnTwitter}
                className="p-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a94df] transition-colors duration-200"
              >
                <Twitter className="h-4 w-4" />
              </button>
              <button
                onClick={shareOnFacebook}
                className="p-2 bg-[#4267B2] text-white rounded-lg hover:bg-[#3b5c9f] transition-colors duration-200"
              >
                <Facebook className="h-4 w-4" />
              </button>
              <button
                onClick={shareOnLinkedIn}
                className="p-2 bg-[#0077B5] text-white rounded-lg hover:bg-[#006ba3] transition-colors duration-200"
              >
                <Linkedin className="h-4 w-4" />
              </button>
            </div>

            {/* Etiketler */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-10">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Etiketler</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Link
                      key={tag}
                      to={`/blog?tag=${tag}`}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Yazarla ilgili bilgi */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/80 rounded-xl p-6 mb-10 shadow-md border border-slate-200/70 dark:border-slate-700/30">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-12 w-12 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center text-white text-xl font-bold">
                    {post.author.charAt(0)}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{post.author}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                    PsikoRan platformunda profesyonel danışmanlık ve klinik yönetimi konularında uzman yazar.
                  </p>
                </div>
              </div>
            </div>
            
            {/* İlgili bağlantılar ve CTA */}
            <div className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-600 dark:to-primary-500 p-6 sm:p-8 text-white shadow-lg mb-10">
              <h3 className="text-xl sm:text-2xl font-bold mb-3">PsikoRan ile Tanışın</h3>
              <p className="mb-6 text-sm sm:text-base text-white/90">
                Profesyonel danışmanlık süreçlerinizi dijitalleştiren PsikoRan ile randevularınızı yönetin, 
                danışan takibini kolaylaştırın ve işinizi büyütün.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 bg-white text-primary-600 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-200 text-sm"
                >
                  Ücretsiz Başlayın
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
                <Link
                  to="/blog"
                  className="inline-flex items-center px-4 py-2 bg-primary-700/40 text-white font-medium rounded-lg hover:bg-primary-700/60 transition-colors duration-200 text-sm"
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Diğer Yazılar
                </Link>
              </div>
            </div>
          </article>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-12 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Logo ve Firma Bilgileri */}
            <div className="lg:col-span-2">
              <div className="flex items-center">
                <div className="flex items-center space-x-2">
                  <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 p-0.5 shadow-lg">
                    <div className="absolute inset-0 rounded-xl bg-white dark:bg-slate-900 p-1">
                      <img src={logo2} alt="PsikoRan Logo" className="h-full w-full object-contain" />
                    </div>
                  </div>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">PsikoRan</span>
                </div>
              </div>
              <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-md text-sm">
                Psikoloji uzmanları için tasarlanmış, randevu ve danışan yönetimini kolaylaştıran dijital platform. Danışanlarınızla bağlantıda kalın, işinizi büyütün.
              </p>
              <div className="mt-5 flex space-x-2">
                <a 
                  href="https://twitter.com/psikoran" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <Twitter size={16} />
                </a>
                <a 
                  href="https://facebook.com/psikoran" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
                <a 
                  href="https://instagram.com/psikoran" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line>
                  </svg>
                </a>
                <a 
                  href="https://linkedin.com/company/psikoran" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={16} />
                </a>
              </div>
            </div>
            
            {/* Bağlantılar */}
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {/* Hızlı Linkler */}
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                  Hızlı Linkler
                </h3>
                <ul className="space-y-2.5">
                  <li>
                    <Link to="/features" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                      Özellikler
                    </Link>
                  </li>
                  <li>
                    <Link to="/pricing" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                      Fiyatlandırma
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                      Giriş Yap
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                      Kayıt Ol
                    </Link>
                  </li>
                  <li>
                    <Link to="/help" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                      Yardım
                    </Link>
                  </li>
                </ul>
              </div>
              
              {/* Yasal Bilgiler */}
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                  Yasal
                </h3>
                <ul className="space-y-2.5">
                  <li>
                    <Link to="/privacy-policy" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                      Gizlilik Politikası
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                      Kullanım Koşulları
                    </Link>
                  </li>
                  <li>
                    <Link to="/kvkk" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                      KVKK
                    </Link>
                  </li>
                  <li>
                    <Link to="/cookie-policy" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                      Çerez Politikası
                    </Link>
                  </li>
                </ul>
              </div>
              
              {/* İletişim */}
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                  İletişim
                </h3>
                <ul className="space-y-2.5">
                  <li>
                    <a href="mailto:info@psikoran.com" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                      info@psikoran.com
                    </a>
                  </li>
                  <li>
                    <Link to="/blog" className="text-primary-600 dark:text-primary-400 font-medium transition-colors duration-200 text-sm">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 text-sm">
                      Bize Ulaşın
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Alt Kısım - Telif Hakkı ve Alt Linkler */}
          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-500">
                &copy; {new Date().getFullYear()} PsikoRan. Tüm hakları saklıdır.
              </p>
              <div className="mt-4 md:mt-0 flex space-x-6">
                <Link to="/help" className="text-xs text-slate-500 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                  Yardım
                </Link>
                <Link to="/blog" className="text-xs text-slate-500 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                  Blog
                </Link>
                <Link to="/sitemap" className="text-xs text-slate-500 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                  Site Haritası
                </Link>
              </div>
            </div>
          </div>
          
          {/* GDPR/KVKK Bildirimi */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-500 text-center">
              Bu web sitesini kullanarak, <Link to="/privacy-policy" className="text-primary-600 dark:text-primary-400 hover:underline">Gizlilik Politikamızı</Link> ve <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">Kullanım Koşullarımızı</Link> kabul etmiş olursunuz.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 