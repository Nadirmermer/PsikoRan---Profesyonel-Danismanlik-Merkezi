import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, Share2, ExternalLink, Twitter, Facebook, Linkedin, ChevronRight, ArrowRight, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { BlogPost as BlogPostType, fetchBlogPostBySlug, formatBlogDate, processProfessionalNames, generateBlogJsonLd } from '../lib/blog';
import { Helmet } from 'react-helmet';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
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

      {/* Üst başlık - Sticky - Boyut ve görünüm düzeltildi */}
      <div className="sticky top-0 z-40 w-full bg-primary-600/95 dark:bg-primary-800/95 backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/blog')}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors duration-200 text-white"
                aria-label="Blog'a Dön"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="ml-3 text-lg sm:text-xl font-bold text-white truncate max-w-xs sm:max-w-md md:max-w-lg">
                {post.title}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Dark/Light Tema Butonu */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-primary-700/50 hover:bg-primary-800/70 text-white transition-colors duration-200"
                aria-label={darkMode ? 'Aydınlık temaya geç' : 'Karanlık temaya geç'}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <div className="hidden sm:flex items-center space-x-1">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-2 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  {copied ? 'Kopyalandı!' : 'Paylaş'}
                </button>
                <button
                  onClick={shareOnTwitter}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                  aria-label="Twitter'da paylaş"
                >
                  <Twitter className="h-4 w-4" />
                </button>
                <button
                  onClick={shareOnFacebook}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                  aria-label="Facebook'ta paylaş"
                >
                  <Facebook className="h-4 w-4" />
                </button>
                <button
                  onClick={shareOnLinkedIn}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                  aria-label="LinkedIn'de paylaş"
                >
                  <Linkedin className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ana içerik */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="max-w-3xl mx-auto">
          {/* İçerik başlık */}
          <motion.header 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-slate-600 dark:text-slate-400">
              <Link 
                to={`/blog?category=${post.category}`}
                className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full font-medium"
              >
                <Tag className="h-3.5 w-3.5 mr-1.5" />
                {post.category}
              </Link>
              <span className="px-1">•</span>
              <span className="inline-flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                {formatBlogDate(post.published_at)}
              </span>
              <span className="px-1">•</span>
              <span className="inline-flex items-center">
                <User className="h-4 w-4 mr-1.5" />
                <Link 
                  to={`/uzman/${post.author.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[üÜ]/g, 'u')
                    .replace(/[çÇ]/g, 'c')
                    .replace(/[şŞ]/g, 's')
                    .replace(/[ıİ]/g, 'i')
                    .replace(/[ğĞ]/g, 'g')
                    .replace(/[öÖ]/g, 'o')
                    .replace(/[^a-z0-9-]/g, '')}`}
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {post.author}
                </Link>
              </span>
              <span className="px-1">•</span>
              <span>{post.reading_time} dk okuma</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
              {post.title}
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              {post.excerpt}
            </p>
          </motion.header>

          {/* Blog görseli */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8 rounded-xl overflow-hidden shadow-2xl"
          >
            <img 
              src={post.cover_image}
              alt={post.title}
              className="w-full object-cover h-64 sm:h-96"
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
          </motion.div>

          {/* Blog içeriği */}
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="prose prose-lg dark:prose-invert prose-slate max-w-none mb-12 blog-content
            prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
            prose-p:text-slate-600 dark:prose-p:text-slate-300
            prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:font-medium
            prose-img:rounded-lg prose-img:shadow-lg
            prose-ul:text-slate-600 dark:prose-ul:text-slate-300
            prose-ol:text-slate-600 dark:prose-ol:text-slate-300
            prose-li:mb-1
            prose-blockquote:border-l-primary-600 dark:prose-blockquote:border-l-primary-400
            prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-200
            prose-blockquote:bg-primary-50 dark:prose-blockquote:bg-primary-900/20 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:pl-4 prose-blockquote:pr-2"
            dangerouslySetInnerHTML={renderContent(post.content)}
          />

          {/* Mobil paylaşım */}
          <div className="flex sm:hidden justify-center mb-8 space-x-3">
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-1.5" />
              {copied ? 'Kopyalandı!' : 'Bağlantıyı Kopyala'}
            </button>
            <button
              onClick={shareOnTwitter}
              className="p-2 bg-[#1DA1F2] text-white rounded-md hover:bg-[#1a94df] transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </button>
            <button
              onClick={shareOnFacebook}
              className="p-2 bg-[#4267B2] text-white rounded-md hover:bg-[#3b5c9f] transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </button>
            <button
              onClick={shareOnLinkedIn}
              className="p-2 bg-[#0077B5] text-white rounded-md hover:bg-[#006ba3] transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </button>
          </div>

          {/* Etiketler */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-8 sm:mb-10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Etiketler</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Link
                    key={tag}
                    to={`/blog?tag=${tag}`}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Yazarla ilgili bilgi */}
          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800 rounded-xl p-6 mb-10 shadow-lg border border-slate-200/50 dark:border-slate-700/30">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="h-12 w-12 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center text-white text-xl font-bold drop-shadow-md">
                  {post.author.charAt(0)}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{post.author}</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  PsikoRan platformunda profesyonel danışmanlık ve klinik yönetimi konularında uzman yazar.
                </p>
              </div>
            </div>
          </div>
          
          {/* İlgili bağlantılar ve CTA */}
          <div className="rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-700 dark:to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
            <h3 className="text-xl sm:text-2xl font-bold mb-4">PsikoRan'ı Keşfedin</h3>
            <p className="mb-6 text-sm sm:text-base">
              Profesyonel danışmanlık süreçlerinizi dijitalleştiren PsikoRan ile randevularınızı yönetin, 
              danışan takibini kolaylaştırın ve işinizi büyütün.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center px-4 py-2 bg-white text-primary-700 font-medium rounded-md hover:bg-primary-50 transition-colors"
              >
                Ücretsiz Başlayın
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center px-4 py-2 bg-primary-700/30 text-white font-medium rounded-md hover:bg-primary-700/50 transition-colors"
              >
                <ArrowLeft className="ml-1.5 h-4 w-4" />
                Diğer Yazılar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 